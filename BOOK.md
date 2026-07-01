# 『불의 고리』 예약판매 페이지 (`/book/`)

강진구·박대용 신간 『불의 고리』 예약판매용 반응형 1페이지. 호남뉴탐사 발기인 랜딩과
**같은 저장소·같은 디자인 시스템**(Vite + React + TS + Tailwind, navy/gold 토큰, Framer Motion,
`Reveal`·`SectionBackground`·`ImagePlaceholder` 등)을 재활용합니다.

- 배포 경로: **`honamnts.org/book`** (멀티 엔트리 — 랜딩 `/` + 책 `/book/`)
- 섹션: 히어로(표지+제목+예약하기) · 책소개(4단락) · 미리보기(지도 무제판+목차) · 책정보 · 주문 폼 · 푸터

## 로컬 실행 / 빌드
```bash
npm install
npm run dev       # http://localhost:5173/book/  (책 페이지)
npm run build     # dist/index.html + dist/book/index.html
npm run preview
```

## 디렉터리 (프런트 소유)
```
book/index.html               책 페이지 Vite 엔트리
src/book/
├─ main.tsx · BookApp.tsx      섹션 6개 조립
├─ content.ts                  편집 카피 단일 출처 (아래 '콘텐츠 교체' 참고)
├─ lib/daumPostcode.ts         다음(카카오) 우편번호 로더
└─ sections/                   BookHero · BookIntro · BookPreview · BookInfo · OrderForm · BookFooter
```

## 주문 계약(경계) — 코덱스 소유, import만
프런트는 **값 전달·UX만** 담당하고, `orderNo`·`amount`·서버 재검증은 백엔드 몫입니다.

- `src/data/orderContract.ts` — 스키마·타입·검증·금액계산·상수(단일 기준). **수정 금지.**
- `src/lib/submitOrder.ts` — `submitOrder(payload) → { ok, orderNo } | throws { message }`.
  - **전송 방식 자동 감지**: `window.google.script.run` 있으면 **Apps Script**, 없으면 **HTTP `POST /api/order`**.
  - 프런트/HTML 변경 없이 백엔드만 바꿔 끼울 수 있습니다.
- 로컬 개발에서는 실서버가 없으므로 `vite.config.ts`의 **dev 전용 mock**이 `POST /api/order`에
  `{ ok:true, orderNo:"HB-000N" }`을 돌려줍니다. `apply:'serve'`라 **프로덕션 빌드에는 미포함**입니다.

## 상수 (확정 필요 항목) — `orderContract.ts`
| 항목 | 현재 값 | 비고 |
|---|---|---|
| 단가 | 30,000원 | 확정 |
| 배송비 | 기본 3,000원 / **3권 이상 무료** | `delivery.fee`, `delivery.freeFromQty` |
| 입금 계좌 | **미지정 (`needsConfirmation: true`)** | 확정 시 `bank.{bank,number,holder}` 채우고 `needsConfirmation` 제거 → 성공 화면·안내에 자동 반영 |

> 계좌·배송비·주문 스키마는 계약서(`orderContract.ts`) 소유자가 갱신합니다.
> 프런트는 이 값을 화면에 표시만 합니다. `amount`는 서버가 최종 계산합니다.

## 콘텐츠 — `src/book/content.ts`
카피·목차·표지는 **호남백서 조판 소스**(`D:\호남백서\03_조판`)의 실제 원고 기준으로 반영 완료.
- `bookIntro.paragraphs` — 발간사(vA.tex) 근거 4단락
- `bookPreview.toc` — 실제 목차(TOC.tex): 여는 글·프롤로그·제1~8부·부록 8종 요약
- 책정보(`bookInfo`) — 제목/부제/판형/분량/정가/지은이/펴낸곳

### 표지·지도 이미지 (PDF → PNG)
표지·지도는 소스의 PDF를 PNG로 렌더해 `public/assets/`에 둠. 원고 갱신 시 재생성:
```bash
# PyMuPDF 사용. 소스 img 폴더에서 실행
python -c "import fitz; d=fitz.open('honam_ring.pdf'); d[0].get_pixmap(matrix=fitz.Matrix(3,3)).save(r'D:\HNNTS\public\assets\book-cover.png')"
python -c "import fitz; d=fitz.open('honam_ring_notitle.pdf'); d[0].get_pixmap(matrix=fitz.Matrix(2.6,2.6)).save(r'D:\HNNTS\public\assets\honam-ring-map.png')"
```
- `book-cover.png` ← `honam_ring.pdf` (제목판) · `honam-ring-map.png` ← `honam_ring_notitle.pdf` (무제판)
- 코덱스가 둔 `public/assets/ring-of-fire-book.png`(임시 목업)는 미사용.

## 환경변수 / 배포
- 빌드 타임 환경변수 **없음**. 전송 방식은 런타임 자동 감지(위 참고).
- GitHub Pages 자동 배포(`.github/workflows/deploy.yml`)가 `main` 푸시 시 `dist/` 전체를 올립니다 →
  랜딩 `/`, 책 `/book/`가 함께 게시됩니다.
- 커스텀 도메인은 `public/CNAME`. `honamnts.org`로 서비스하려면 CNAME/DNS를 그에 맞게 설정하세요.
- Apps Script로 운영할 경우: 폼은 링크/런타임 감지 방식이라 HTML 배포 위치와 무관하게 동작합니다.
