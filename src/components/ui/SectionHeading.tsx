import Reveal from './Reveal'

interface SectionHeadingProps {
  /** 작은 라벨(아이브로) */
  eyebrow?: string
  /** 섹션 제목 */
  title: string
  className?: string
}

/** 섹션 상단 공통 헤딩 — 아이브로 + 제목. */
export default function SectionHeading({ eyebrow, title, className = '' }: SectionHeadingProps) {
  return (
    <Reveal className={className}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold tracking-[0.08em] text-gold">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{title}</h2>
    </Reveal>
  )
}
