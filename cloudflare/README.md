# Cloudflare 처음 쓰는 배포 순서

목표:

- GitHub Pages가 `/book/` 정적 페이지를 제공한다.
- Cloudflare Worker가 같은 도메인의 `/api/order`를 받는다.
- Worker는 Apps Script Web App으로 주문을 넘긴다.
- Apps Script가 Google Sheet에 주문을 저장한다.

```text
방문자
  -> https://honamnts.org/book/
  -> POST https://honamnts.org/api/order
  -> Cloudflare Worker
  -> Apps Script Web App
  -> Google Sheet Orders
```

## 0. 준비물

- GitHub Pages로 배포된 프런트 주소
- Cloudflare 계정
- 운영 도메인 `honamnts.org`
- Apps Script Web App URL
- Apps Script 스크립트 속성 `ORDER_API_SECRET`

`ORDER_API_SECRET`는 직접 만든 긴 임의 문자열입니다. 예: 비밀번호 관리자에서 32자 이상 생성.

## 1. Cloudflare에 도메인 추가

1. Cloudflare 로그인
2. 왼쪽/상단의 `Add a domain` 또는 `Add site`
3. `honamnts.org` 입력
4. Free 플랜 선택
5. Cloudflare가 기존 DNS 레코드를 스캔하면 확인
6. Cloudflare가 안내하는 nameserver 2개를 복사
7. 도메인 등록기관에서 nameserver를 Cloudflare 값으로 변경
8. Cloudflare 대시보드에서 도메인 상태가 `Active`가 될 때까지 대기

## 2. GitHub Pages DNS 유지

Cloudflare DNS에서 GitHub Pages 레코드를 둡니다.

루트 도메인으로 쓸 때:

- Type: `CNAME`
- Name: `@`
- Target: `<github-username>.github.io`
- Proxy status: `Proxied`

서브도메인으로 쓸 때:

- Type: `CNAME`
- Name: 예: `www`
- Target: `<github-username>.github.io`
- Proxy status: `Proxied`

GitHub 저장소의 Pages 설정에서도 Custom domain을 `honamnts.org`로 맞춥니다.

## 3. Worker 만들기

대시보드 방식:

1. Cloudflare 대시보드 왼쪽에서 `Workers & Pages`
2. `Create`
3. `Create Worker`
4. 이름 예: `honam-book-order`
5. 생성 후 `Edit code`
6. 이 저장소의 [order-worker.js](./order-worker.js) 내용을 그대로 붙여넣기
7. `Save and deploy`

## 4. Worker 환경 변수 설정

Worker 상세 화면에서:

1. `Settings`
2. `Variables`
3. 아래 변수 추가

필수:

- `APPS_SCRIPT_WEB_APP_URL`
  - Apps Script 배포 URL

secret 권장:

- `APPS_SCRIPT_API_SECRET`
  - Apps Script의 `ORDER_API_SECRET`와 같은 값
  - Cloudflare에서는 가능하면 Secret으로 저장

저장 후 다시 배포합니다.

## 5. `/api/order` 경로 연결

Worker 상세 화면에서:

1. `Settings`
2. `Triggers`
3. `Routes`
4. `Add route`
5. Route 입력:

```text
honamnts.org/api/order
```

또는 www를 쓰면:

```text
www.honamnts.org/api/order
```

6. Zone은 `honamnts.org` 선택
7. 저장

이제 프런트의 `fetch('/api/order')`가 Worker로 갑니다.

## 6. Apps Script 설정

Apps Script 프로젝트에서:

1. `Project Settings`
2. `Script properties`
3. 아래 추가

- `ORDER_SPREADSHEET_ID`: 주문 저장 스프레드시트 ID
- `ORDER_SHEET_NAME`: 보통 `Orders`
- `ORDER_API_SECRET`: Cloudflare의 `APPS_SCRIPT_API_SECRET`와 같은 값

배포:

1. `Deploy`
2. `New deployment`
3. Type: `Web app`
4. Execute as: `Me`
5. Who has access: 운영 정책에 맞게 설정. Worker secret을 쓰므로 URL 노출 위험을 낮출 수 있음
6. Web app URL을 Cloudflare 변수 `APPS_SCRIPT_WEB_APP_URL`에 넣기

## 7. 테스트

브라우저에서:

1. `https://honamnts.org/book/` 열기
2. 테스트 주문 입력
3. 성공 화면에서 `HB-0001` 같은 주문번호 확인
4. Google Sheet `Orders`에 행이 생겼는지 확인

문제가 있으면 Cloudflare Worker 화면의 `Logs` 또는 `Observability`에서 에러를 확인합니다.

## 8. 운영 체크리스트

- 입금계좌 확정 후 [orderContract.ts](../src/data/orderContract.ts)의 `bank` 값 반영
- 테스트 주문 1건 접수
- 테스트 주문 입금 대사
- `배송명단` 생성 확인
- 실주문 시작 전 테스트 행 삭제 또는 `취소` 처리

## 9. 자주 막히는 지점

- `404 Not found`: Worker Route가 `honamnts.org/api/order`에 붙었는지 확인
- `주문 서버 설정이 완료되지 않았습니다`: `APPS_SCRIPT_WEB_APP_URL` 누락
- `주문 API 인증에 실패했습니다`: Cloudflare `APPS_SCRIPT_API_SECRET`와 Apps Script `ORDER_API_SECRET` 불일치
- 프런트는 열리는데 주문만 실패: GitHub Pages는 정상이고 Worker/Apps Script 설정 문제일 가능성이 큼
