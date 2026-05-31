interface ImagePlaceholderProps {
  /** 화면/매니페스트에 노출할 슬롯 라벨 — 예) [보도 카드 이미지 1] */
  label: string
  /** aspect-ratio 클래스 (예: 'aspect-[4/3]') */
  aspect?: string
  /** picsum 임시 이미지 사용 여부 (시각 확인용). 기본 false = 네이비 단색 블록 */
  usePicsum?: boolean
  /** picsum seed (고정 이미지) */
  seed?: string
  className?: string
}

/**
 * 교체형 이미지 더미.
 * 실제 이미지 도착 시: 이 컴포넌트를 <img src=.../> 로 교체하거나
 * usePicsum→실제 경로로 바꾸면 된다. (assets/manifest.md 참조)
 */
export default function ImagePlaceholder({
  label,
  aspect = 'aspect-[4/3]',
  usePicsum = false,
  seed = '1',
  className = '',
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-navy-700 ${aspect} ${className}`}
    >
      {usePicsum && (
        <img
          src={`https://picsum.photos/seed/${seed}/800/600`}
          alt={label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      )}
      {/* 라벨 오버레이 — 교체 슬롯임을 명시 */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="rounded-full border border-mist/25 bg-navy/60 px-3 py-1 text-center text-xs font-medium tracking-wide text-mist/80 backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  )
}
