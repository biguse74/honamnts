import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { dataSection, backgrounds } from '../../data/content'
import { useCountUp } from '../../hooks/useCountUp'
import SectionHeading from '../ui/SectionHeading'
import SectionBackground from '../ui/SectionBackground'
import Reveal from '../ui/Reveal'

type Card = (typeof dataSection.cards)[number]

function DataCard({ card, index }: { card: Card; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // 수치형(value) vs 순위 텍스트형(text) 분기
  const hasValue = 'value' in card && typeof card.value === 'number'
  const counted = useCountUp({
    target: hasValue ? (card as { value: number }).value : 0,
    decimals: hasValue ? ((card as { decimals?: number }).decimals ?? 0) : 0,
    start: inView,
  })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col rounded-2xl border border-mist/10 bg-navy-800 p-6 sm:p-7"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
    >
      <div className="mb-3 flex items-baseline gap-1 text-gold">
        {hasValue ? (
          <>
            <span className="text-2xl font-bold sm:text-3xl">
              {(card as { prefix?: string }).prefix}
            </span>
            <span className="text-4xl font-extrabold tabular-nums sm:text-5xl">{counted}</span>
            <span className="text-2xl font-bold sm:text-3xl">
              {(card as { suffix?: string }).suffix}
            </span>
          </>
        ) : (
          <span className="text-4xl font-extrabold sm:text-5xl">
            {(card as { text: string }).text}
          </span>
        )}
      </div>
      <p className="text-base font-bold text-ink">{card.label}</p>
      <p className="mt-1 text-sm leading-relaxed text-mist/70">{card.note}</p>
    </motion.div>
  )
}

export default function DataSection() {
  return (
    <section className="relative w-full overflow-hidden bg-navy py-24 sm:py-32">
      <SectionBackground {...backgrounds.data} overlayClassName="bg-navy/72" />
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={dataSection.eyebrow}
          title={dataSection.title}
          className="mb-12 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataSection.cards.map((card, i) => (
            <DataCard key={card.label} card={card} index={i} />
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-xs text-mist/50">{dataSection.caption}</p>
        </Reveal>
      </div>
    </section>
  )
}
