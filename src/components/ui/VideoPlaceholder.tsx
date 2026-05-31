interface VideoPlaceholderProps {
  /** 슬롯 라벨 — 예) [히어로 영상 자리 — 광주 야경/신호탄] */
  label: string
  className?: string
}

/**
 * 교체형 영상 더미.
 * 실제 영상 도착 시: 이 div를 아래 형태로 교체.
 *   <video autoPlay muted loop playsInline poster="..." className="...">
 *     <source src="/assets/hero.mp4" type="video/mp4" />
 *   </video>
 * 지금은 잔잔히 흐르는 네이비 그라데이션 CSS 애니메이션으로 대체. (assets/manifest.md 참조)
 */
export default function VideoPlaceholder({ label, className = '' }: VideoPlaceholderProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-navy bg-hero-placeholder ${className}`}
      aria-hidden="true"
    >
      {/* 미세한 광주 야경 점광 느낌 — 하단에 낮게 깔아 깊이감만 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(1.5px 1.5px at 20% 80%, rgba(198,144,38,0.5) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 70% 75%, rgba(226,232,240,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 45% 85%, rgba(43,108,176,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 85% 82%, rgba(226,232,240,0.35) 50%, transparent 51%)',
        }}
      />
      {/* 가장자리 비네트 — 중앙으로 시선 모으기 */}
      <div className="absolute inset-0 bg-hero-vignette" />

      {/* 슬롯 라벨 — 감정선을 깨지 않도록 화면에는 숨기고 스크린리더에만 노출 */}
      <span className="sr-only">{label}</span>
    </div>
  )
}
