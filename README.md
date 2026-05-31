# 호남뉴탐사 발기인 모집 — 원페이지

> 호남에서 쏘아 올리는 첫 신호탄. 시민과 함께 시작합니다.

호남뉴탐사 창립 발기인 모집을 위한 모바일 우선 원페이지 홍보 사이트입니다.
외부 백엔드/DB 없는 **정적 사이트**로, Vercel·Netlify에 그대로 배포할 수 있습니다.

## 기술 스택
- Vite + React 18 + TypeScript
- Tailwind CSS (디자인 토큰은 `tailwind.config.js`)
- Framer Motion (회전 헤드라인 · 수치 카운트업 · 스크롤 등장)
- Pretendard (CDN, `index.html`)

## 로컬 실행
```bash
npm install
npm run dev
```
개발 서버 주소(기본 http://localhost:5173)를 브라우저에서 엽니다.

## 빌드 / 미리보기
```bash
npm run build     # dist/ 에 정적 산출물 생성
npm run preview   # 빌드 결과 로컬 미리보기
```

## 배포
- **Vercel**: 새 프로젝트로 이 폴더를 연결하면 자동 감지(Build `npm run build`, Output `dist`).
- **Netlify**: Build command `npm run build`, Publish directory `dist`.

## 콘텐츠 수정 (한 곳에서)
- **모든 문구·수치·계좌·연락처** → [`src/data/content.ts`](src/data/content.ts)
- 카피 톤·금지어·대외비 가드레일 주석이 파일 상단에 있습니다. 수정 시 반드시 확인하세요.

## 이미지·영상 교체
- 모든 미디어는 라벨이 표시된 **교체형 더미**입니다.
- 교체 슬롯 목록과 방법 → [`src/assets/manifest.md`](src/assets/manifest.md)
- 실제 파일은 `public/assets/` 에 두고 `/assets/파일명` 으로 참조합니다.

## 디렉터리 구조
```
src/
├─ App.tsx                  섹션 8개 조립
├─ data/content.ts          단일 콘텐츠 출처
├─ hooks/                   useRotatingWord · useCountUp
├─ components/ui/           ImagePlaceholder · VideoPlaceholder · SignalBeam · TagChip · Reveal · SectionHeading
└─ components/sections/     Hero · Mission · Data · Work · Promises · Resilience · Cta · Footer
```

## 주의 (대외비)
화면에는 본사 내부 정보·절대 수치·폐지된 계좌가 노출되지 않습니다.
입금 계좌는 **광주은행 1107-021-985438 / (주)호남뉴탐사**, 확인 문자는 **010-9717-2340** 입니다.
