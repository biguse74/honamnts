# `/api/order` 운영 서버

프런트는 정적 `/book/` 페이지에서 `POST /api/order`를 호출합니다. 이 폴더의 `order-api.mjs`는 같은 도메인에서 `/api/order`를 받아 Apps Script Web App으로 안전하게 프록시합니다.

## 환경 변수

- `APPS_SCRIPT_WEB_APP_URL`: Apps Script Web App URL
- `APPS_SCRIPT_API_SECRET`: Apps Script 스크립트 속성 `ORDER_API_SECRET`와 같은 값. 비워두면 secret 없이 호출합니다.
- `PORT`: API 서버 포트. 기본값 `8787`

## 실행

```bash
npm run api
```

## Nginx 예시

정적 사이트는 기존처럼 제공하고, 주문 API만 Node 서버로 프록시합니다.

```nginx
location = /api/order {
  proxy_pass http://127.0.0.1:8787/api/order;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 처리 책임

`order-api.mjs`:

- `Content-Type: application/json` 확인
- 클라이언트가 `orderNo`, `createdAt`, `amount`, `payStatus`를 보내면 거부
- 필수값, `phone`, `qty`, `agree`, enum 값 재검증
- Apps Script 장애/응답 형식 오류를 `{ message }` JSON으로 변환
- 원문 payload 로그 금지

Apps Script:

- LockService로 `HB-0001` 증가 발급
- `amount = 29000 * qty + 배송비 5000원` 최종 계산
- `createdAt`, `payStatus="대기"` 생성
- 계약 컬럼 순서로 Google Sheet append
