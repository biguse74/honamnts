# 에셋 교체 가이드 (manifest)

실제 사진·영상이 도착하면 아래 표대로 파일을 끼워 넣으면 더미가 교체됩니다.
모든 더미는 **라벨이 화면에 표시**되어 있어 어느 자리인지 바로 식별됩니다.

## 폴더 규약
- 이미지·영상 파일은 `public/assets/` 에 두는 것을 권장합니다. (Vite는 `public/`을 정적 루트로 서빙)
- 코드에서 경로는 `/assets/파일명` 으로 참조합니다.

## 교체 슬롯 목록

| # | 슬롯 라벨 | 컴포넌트 | 권장 파일명 | 권장 비율 / 해상도 | 용도 |
|---|-----------|----------|-------------|--------------------|------|
| 1 | `[히어로 영상 자리 — 광주 야경/신호탄]` | `Hero.tsx` → `VideoPlaceholder` | `hero.mp4` (+ `hero-poster.jpg`) | 16:9 가로, 1920×1080 이상, 10–20초 루프, 음소거 | 풀블리드 배경 영상. 광주 야경 위 빛줄기가 수직으로 쏘아 올라가는 톤 |
| 2 | `[보도 카드 이미지 1 — 공천 보도]` | `WorkSection.tsx` → `ImagePlaceholder` | `work-1.jpg` | 4:3 가로, 800×600 이상 | 민주당 호남 공천재난 연속 보도 카드 썸네일 |
| 3 | `[보도 카드 이미지 2 — 돈봉투 보도]` | `WorkSection.tsx` → `ImagePlaceholder` | `work-2.jpg` | 4:3 가로, 800×600 이상 | 장세일 광주시장 후보 돈봉투 보도 카드 썸네일 |
| 4 | `[보도 카드 이미지 3 — 현장 이동 데스크]` | `WorkSection.tsx` → `ImagePlaceholder` | `work-3.jpg` | 4:3 가로, 800×600 이상 | 호남 현장 이동 데스크 3회 카드 썸네일 |
| 5 | (OG 공유 카드) | `index.html` `og:image` | `og-card.jpg` | 1.91:1, 1200×630 | 문자/SNS 공유 시 미리보기 카드 |

## 섹션 배경 이미지 슬롯 (사진을 "많이 까는" 용도)

각 섹션 뒤에 깔리는 풀블리드 배경 이미지입니다. 텍스트 가독성을 위해 위에 네이비 스크림이 덮입니다.
설정은 전부 `src/data/content.ts` 의 `backgrounds` 객체 한 곳에서 합니다.

| 슬롯 키 | 라벨 | 적용 섹션 | 권장 파일명 | 권장 해상도 |
|---------|------|-----------|-------------|-------------|
| `mission` | `[배경 이미지 — 호남 풍경/하늘]` | 미션 타이포 | `bg-mission.jpg` | 1600×1000+ 가로 |
| `data` | `[배경 이미지 — 뉴스룸/데이터]` | 데이터 | `bg-data.jpg` | 1600×1000+ |
| `work` | `[배경 이미지 — 현장 취재]` | 해온 일 | `bg-work.jpg` | 1600×1000+ |
| `promises` | `[배경 이미지 — 광주 베이스캠프]` | 4가지 약속 | `bg-promises.jpg` | 1600×1000+ |
| `resilience` | `[배경 이미지 — 결의/연대]` | 흔들리지 않는다 | `bg-resilience.jpg` | 1600×1000+ |
| `cta` | `[배경 이미지 — 시민과 함께]` | 발기인 모집 | `bg-cta.jpg` | 1600×1000+ |
| `footer` | `[배경 이미지 — 호남의 길]` | 마무리/푸터 | `bg-footer.jpg` | 1600×1000+ |

### 실제 배경 이미지 넣는 법
1. 파일을 `public/assets/` 에 둔다. (예: `public/assets/bg-mission.jpg`)
2. `src/data/content.ts` 의 해당 슬롯 `src` 를 채운다:
   ```ts
   mission: { label: '...', src: '/assets/bg-mission.jpg', seed: '...' },
   ```
   → 그 슬롯만 실제 이미지로 바뀝니다. 나머지는 그대로.

### 미리보기 토글
`src/data/content.ts` 의 `PREVIEW_BG_IMAGES` 값:
- `true`  → `src` 가 빈 슬롯은 `picsum` 임시 사진으로 "사진 많이 깐" 느낌을 미리 볼 수 있음(네트워크 필요).
- `false` → 임시 사진 없이 네이비 더미 배경(슬롯 라벨만 표시). **실제 납품 시 false 권장**(또는 모든 src 채우기).

### 스크림(가독성) 조절
사진을 더 진하게 보이고 싶으면 각 섹션의 `overlayClassName` 투명도를 낮추세요.
(예: `bg-navy/85` → `bg-navy/60`) — 단, 너무 낮추면 본문 텍스트 가독성이 떨어집니다.

## 교체 방법

### 1) 히어로 영상 (`Hero.tsx`)
`<VideoPlaceholder ... />` 를 아래로 교체:

```tsx
<video
  className="absolute inset-0 h-full w-full object-cover"
  autoPlay
  muted
  loop
  playsInline
  poster="/assets/hero-poster.jpg"
>
  <source src="/assets/hero.mp4" type="video/mp4" />
</video>
```
> 오버레이(`bg-gradient...`)와 `SignalBeam`은 그대로 두면 신호탄 톤이 유지됩니다.
> 영상에 이미 빛줄기가 있다면 `<SignalBeam />` 한 줄만 제거하세요.

### 2) 보도 카드 이미지 (`WorkSection.tsx` / `ImagePlaceholder.tsx`)
가장 간단한 방법은 `ImagePlaceholder`에 `usePicsum` 대신 실제 경로를 쓰도록 바꾸는 것입니다.
`content.ts`의 각 카드에 `image: '/assets/work-1.jpg'` 같은 필드를 추가하고,
`ImagePlaceholder` 자리를 `<img src={card.image} alt={card.title} className="aspect-[4/3] w-full object-cover" />` 로 교체하면 됩니다.

### 3) 시각 확인용 임시 이미지
실제 이미지 전에 분위기만 보고 싶다면 `ImagePlaceholder`에 `usePicsum` prop을 주면
`picsum.photos` 임시 이미지가 들어갑니다. (네트워크 필요)

## 카피·수치 교체
이미지가 아닌 **문구·수치·계좌·연락처**는 전부 `src/data/content.ts` 한 파일에서 수정합니다.
