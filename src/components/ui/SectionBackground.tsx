import { PREVIEW_BG_IMAGES } from '../../data/content'

interface SectionBackgroundProps {
  /** 슬롯 라벨 — 더미일 때 화면에 옅게, 실제 이미지일 때 스크린리더용 */
  label: string
  /** 실제 이미지 경로 (예: '/assets/bg-mission.jpg'). 비어 있으면 더미/미리보기 */
  src?: string
  /** 미리보기(picsum)용 seed */
  seed?: string
  /** 가독성 스크림 — 섹션 텍스트가 잘 읽히도록. 사진을 더 보이려면 투명도를 낮춘다 */
  overlayClassName?: string
  /** 이미지 초점 위치 (object-position) */
  position?: string
}

/**
 * 교체형 섹션 배경 이미지 슬롯.
 *  - src 가 있으면 그 이미지를 깐다.
 *  - src 가 없고 PREVIEW_BG_IMAGES=true 면 picsum 임시 이미지로 미리보기.
 *  - 둘 다 아니면 네이비 깊이감 더미.
 * 항상 위에 스크림을 깔아 본문 텍스트 가독성을 지킨다. (assets/manifest.md 참조)
 */
export default function SectionBackground({
  label,
  src = '',
  seed = 'bg',
  overlayClassName = 'bg-navy/75',
  position = 'object-center',
}: SectionBackgroundProps) {
  const previewSrc = !src && PREVIEW_BG_IMAGES ? `https://picsum.photos/seed/${seed}/1600/1000` : ''
  const imageSrc = src || previewSrc
  const isDummy = !imageSrc

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover ${position}`}
        />
      ) : (
        // 네이비 깊이감 더미 배경
        <div className="absolute inset-0 bg-hero-placeholder" />
      )}

      {/* 가독성 스크림 */}
      <div className={`absolute inset-0 ${overlayClassName}`} />

      {/* 슬롯 라벨 — 더미일 때만 옅게 노출(어느 자리인지 식별용) */}
      {isDummy && (
        <span className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-mist/15 bg-navy/40 px-3 py-1 text-[11px] font-medium text-mist/45 backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  )
}
