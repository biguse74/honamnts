# 『불의 고리』 주문 운영 매뉴얼

`Code.gs`는 주문 데이터 계약서의 컬럼 순서와 검증 규칙을 기준으로 동작하는 Google Apps Script 백엔드입니다.

실무자가 매일 볼 간단한 사용 설명서는 Apps Script가 구글 시트의 `사용설명서` 탭으로 만들어 줍니다.

## 1. 최초 설정

Apps Script 프로젝트의 **스크립트 속성**에 아래 값을 둡니다.

- `ORDER_SPREADSHEET_ID`: 주문 저장 스프레드시트 ID
- `ORDER_SHEET_NAME`: 주문 시트명. 생략 시 `Orders`
- `ORDER_API_SECRET`: HTTP Web App 보호용 선택값. 운영 서버의 `APPS_SCRIPT_API_SECRET`와 같은 값

주문 시트 헤더는 `Code.gs`의 `ORDER_COLUMNS`와 정확히 같아야 합니다. 빈 시트면 첫 주문 전에 자동으로 헤더를 만듭니다.

스프레드시트를 새로고침하면 상단에 **불의 고리 주문** 메뉴가 생깁니다.

처음 한 번:

1. `불의 고리 주문 → 1. 운영 시트 초기 세팅`
2. `불의 고리 주문 → 6. 주문 시트 권한 보호`

초기 세팅은 아래 시트를 만듭니다.

- `Orders`: 예약자 원장
- `사용설명서`: 실무자용 시트 사용 설명서
- `예약자명단`: 실무자용 한국어 헤더 예약자 보기
- `운영대시보드`: 전체 주문·입금확인·수량·금액 요약
- `입금CSV붙여넣기`: 은행 CSV 붙여넣기 작업 공간
- `입금대사결과`: 매칭/확인필요 결과
- `배송명단`: 입금확인 주문 배송용 목록

## 2. 매일 보는 화면

실무자는 `예약자명단` 시트를 보면 됩니다. 이 시트는 `주문번호`, `주문시각`, `입금상태`처럼 한국어 헤더로 표시됩니다.

`Orders` 시트는 시스템 계약 원장이므로 영어 키와 컬럼 순서를 유지합니다. 직접 편집하지 말고, 상태 변경은 메뉴를 사용합니다.

- `payStatus = 대기`: 아직 입금 확인 전
- `payStatus = 입금확인`: 배송 준비 대상
- `payStatus = 취소`: 취소 주문

현황만 다시 보고 싶으면 `불의 고리 주문 → 2. 주문 현황 새로고침` 또는 `불의 고리 주문 → 예약자 명단 새로고침`을 누릅니다.

가격·배송비 정책 변경 뒤 기존 주문 금액을 다시 계산해야 하면 `불의 고리 주문 → 기존 주문 금액 재계산`을 누릅니다.

개별 주문을 수동 처리해야 하면 `예약자명단`, `Orders`, 또는 `입금대사결과`에서 해당 주문 행을 선택한 뒤:

- `불의 고리 주문 → 선택 주문 입금확인`
- `불의 고리 주문 → 선택 주문 취소`

## 3. 입금 확인 업무

1. 은행에서 거래내역 CSV를 내려받습니다.
2. `입금CSV붙여넣기` 시트에 붙여넣습니다.
   - 방법 A: A1부터 표 형태로 붙여넣기
   - 방법 B: A2 한 셀에 CSV 원문 전체 붙여넣기
3. `불의 고리 주문 → 3. 입금 CSV 대사 미리보기`
4. `입금대사결과` 시트에서 `확인필요` 행을 검토합니다.
5. 문제가 없으면 `불의 고리 주문 → 4. 매칭분 입금확인 반영`

매칭 기준:

- CSV 적요/메모/입금자명 중 `HB-0001` 형식 주문번호가 있어야 합니다.
- CSV 금액이 주문 `amount`와 같아야 합니다.
- CSV 입금자명/메모에 주문 `payer`가 포함되어야 합니다.

## 4. 배송 명단 만들기

입금 확인 후 `불의 고리 주문 → 5. 배송 명단 생성`을 누릅니다.

`배송명단` 시트에는 `입금확인` 주문만 들어갑니다. 배송업체 전달용으로 필요한 최소 항목만 뽑습니다.

## 5. 공개 함수

- `submitOrder(payload)`: 계약 검증, 서버 금액 계산, `HB-0001` 형식 주문번호 발급, 시트 append, `{ ok:true, orderNo }` 반환
- `doPost(e)`: HTTP 웹앱 진입점. 실패 시 `{ message }` JSON 반환
- `setupOrderWorkbook()`: 운영 시트 초기 세팅
- `refreshOperatorGuideSheet()`: 구글 시트 안에 실무자용 `사용설명서` 생성/갱신
- `refreshOrderDashboard()`: 운영대시보드 갱신
- `refreshOperatorOrderView()`: 한국어 헤더 `예약자명단` 갱신
- `recalculateOrderAmounts()`: 현재 가격/배송비 상수 기준으로 기존 주문 `amount` 재계산
- `markSelectedOrderPaid()`: 현재 선택 행의 주문을 입금확인 처리
- `cancelSelectedOrder()`: 현재 선택 행의 주문을 취소 처리
- `previewBankCsvMatches()`: 시트에 붙여넣은 은행 CSV 대사 미리보기
- `applyBankCsvMatchesFromSheet()`: 시트에 붙여넣은 은행 CSV 매칭분 입금확인 반영
- `generateDeliveryExport()`: 배송명단 생성
- `matchBankTransfers(csvText)`: 은행 CSV와 주문 시트를 대조만 하고 결과 반환
- `applyBankTransferMatches(csvText)`: 매칭 성공 주문의 `payStatus`를 `입금확인`으로 갱신
- `updatePayStatus(orderNo, payStatus)`: 관리자 수동 상태 갱신
- `protectOrderSheet()`: 주문 시트를 실행 계정 중심으로 보호

## 6. 개인정보 보호

- payload 원문을 로그에 남기지 않습니다. 실패 로그는 이름·연락처·이메일을 마스킹합니다.
- 시트는 운영에 필요한 최소 계정만 Editor 권한을 줍니다.
- CSV 대사 결과는 운영자 도구에서만 사용하고 외부 공개 화면에 노출하지 않습니다.
- 배송업체 전달 후 내려받은 로컬 파일은 보관 기간을 정하고 삭제합니다.

## 7. 프런트 연결

Apps Script HTML Service 안에서 쓰면 `google.script.run.submitOrder(payload)`를 사용합니다.

정적 사이트에서 HTTP로 연결할 경우 같은 출처의 `/api/order` 프록시를 두거나, 배포 환경의 서버리스 함수가 `Code.gs`와 동일한 계약으로 처리해야 합니다. Apps Script Web App을 브라우저에서 직접 cross-origin POST하는 구성은 CORS 제약을 먼저 확인해야 합니다.

이 저장소에는 `/api/order`용 Node 프록시가 [server/order-api.mjs](../server/order-api.mjs)에 있습니다. 정적 `/book/` 배포라면 브라우저가 Apps Script URL을 직접 호출하지 않게 하고, 운영 도메인에서 `/api/order`만 노출하는 구성을 권장합니다.
