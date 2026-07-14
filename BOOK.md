# 『불의 고리』 예약판매 페이지 (`/book/`)

강진구·박대용 신간 『불의 고리』 예약판매용 반응형 1페이지. 호남뉴탐사 발기인 랜딩과
**같은 저장소·같은 디자인 시스템**(Vite + React + TS + Tailwind, navy/gold 토큰, Framer Motion,
`Reveal`·`SectionBackground`·`ImagePlaceholder` 등)을 재활용합니다.

- 배포 경로: **`honamnts.org/book`** (멀티 엔트리 — 랜딩 `/` + 책 `/book/`)
- 섹션: 히어로(표지+제목+주문하기) · 책소개(4단락) · 미리보기(지도 무제판+목차) · 책정보 · 지은이 · 주문 폼 · 푸터
- 초판 출간 완료(2026-07 기준) → 사이트 문구는 "예약" 제거, "주문/판매 중"

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
| 단가 | 29,000원 | 확정 (1권 합계 34,000원) |
| 배송비 | 우체국택배 5,000원 / 무료배송 없음 | `delivery.fee`, `delivery.freeFromQty=999` |
| 입금 계좌 | **우리은행 1005-704-736089 / 주식회사 시민언론뉴탐사** | `needsConfirmation:false` (확정) |
| 반송 | 주소 오류 반송 시 재발송 택배비 5,000원 | 주문 폼 배송지 안내 |

> ⚠️ 서버(코덱스 `apps-script/Code.gs`)의 `UNIT_PRICE`/`DELIVERY_FEE`/`FREE_DELIVERY_FROM_QTY`도
> 29000·5000·999로 맞춰야 구글 시트 금액·입금 대사가 일치. **Apps Script 편집기에서 재배포** 필요.

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

### 재활용 사진 (호남뉴탐사 후원 랜딩 → 네이비 톤 처리)
기존 사이트 사진(`D:\NTS_website\hnn_donors_system\public-landing\images`)을 날것 대신
**네이비 톤 모노크롬**으로 가공해 사이트와 통일했다(붉은기 배제).
방송 워터마크·자막은 크롭 제거. (Pillow `ImageOps.colorize`, black=(13,27,42) mid=(120,120,126) white=(236,233,226), midpoint 118)
- `author-duotone.jpg` ← `park_kang` : 지은이(강진구·박대용) 소개 블록
- `scene-harbor-duotone.jpg` ← `field1`(신안 가거도 방파제) : 책소개 배경(하단 그라데이션 스크림)

## 환경변수 / 배포
- 빌드 타임 환경변수 **없음**. 전송 방식은 런타임 자동 감지(위 참고).
- GitHub Pages 자동 배포(`.github/workflows/deploy.yml`)가 `main` 푸시 시 `dist/` 전체를 올립니다 →
  랜딩 `/`, 책 `/book/`가 함께 게시됩니다.
- 커스텀 도메인은 `public/CNAME`. `honamnts.org`로 서비스하려면 CNAME/DNS를 그에 맞게 설정하세요.
- Apps Script로 운영할 경우: 폼은 링크/런타임 감지 방식이라 HTML 배포 위치와 무관하게 동작합니다.

## 새 기기(macOS)에서 이어서 작업하기
저장소가 GitHub(`github.com/biguse74/honamnts`)에 전부 올라가 있어 **클론만 하면 그대로 이어집니다.**

**1) 도구 설치**
```bash
xcode-select --install                      # git 등 커맨드라인 도구
# Homebrew 없으면: https://brew.sh 설치 스크립트 실행
brew install node@20                         # Node 20 (GitHub Actions와 동일 버전)
npm install -g @anthropic-ai/claude-code     # Claude Code CLI  → 실행: claude
brew install python && pip3 install pymupdf pillow   # (선택) 표지·지도·OG 이미지 재생성용
```

**2) 인증 + 클론**
```bash
gh auth login                               # 또는 SSH 키 등록. 계정: biguse74
git clone https://github.com/biguse74/honamnts.git
cd honamnts && npm install
git config user.email "biguse@newtamsa.org"
npm run dev                                 # http://localhost:5173/book/
```

**3) 배포**
- `main`에 push하면 GitHub Pages가 자동 빌드·배포합니다(랜딩 `/`, 책 `/book/`).
- 지금까지 모든 작업을 `main`에 반영해 왔으므로, 맥에서는 `main`에서 작업 후 `git push`만 하면 됩니다.

**4) Claude Code로 맥락 이어가기**
- 이전 대화 세션은 기기 종속이라 자동 이전되지 않습니다. 클론 폴더에서 `claude` 실행 후
  "이 저장소 `BOOK.md`와 `git log`를 읽고 이어서 작업" 이라고 하면 맥락이 복구됩니다.

**5) 로컬 전용(깃에 없는) 원본 파일 — 필요 시 복사**
아래는 이 Windows PC에만 있고 저장소엔 없습니다. **이미지를 재생성할 때만** 맥으로 복사(클라우드/USB):
- 표지 원본: `불의고리_표지_벡터변환2(인쇄본).ai`, `honam_ring.pdf`, `honam_ring_notitle.pdf` (`D:\호남백서\03_조판\...`)
- 재활용 사진 원본: `D:\NTS_website\hnn_donors_system\public-landing\images`
- 인쇄 견적서 등
> 웹에 실제 쓰이는 결과물(`public/assets/*.png|jpg`)은 이미 저장소에 있어 재생성 없이 그대로 씁니다.

**6) 백엔드(Apps Script)**
- `apps-script/Code.gs`·`server/`는 저장소에 있으나, **실제 구동 코드는 script.google.com**(구글 계정)에 있습니다. 맥 설치와 무관하며 코덱스/담당자 소관입니다.
