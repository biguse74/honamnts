import { workSection, backgrounds } from '../../data/content'
import SectionHeading from '../ui/SectionHeading'
import SectionBackground from '../ui/SectionBackground'
import Reveal from '../ui/Reveal'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import TagChip from '../ui/TagChip'

// TODO(사실 확인 후 추가): '목포시장 후보 검증' 카드.
//   사실 확인이 끝나기 전까지 화면에 노출하지 않는다. content.ts workSection.cards에 추가만 하면 렌더됨.

export default function WorkSection() {
  return (
    <section className="relative w-full overflow-hidden bg-navy py-24 sm:py-32">
      <SectionBackground {...backgrounds.work} overlayClassName="bg-navy/72" />
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={workSection.eyebrow}
          title={workSection.title}
          className="mb-12 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {workSection.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist/10 bg-navy-800 transition-colors hover:border-mist/20">
                <ImagePlaceholder
                  label={card.imageLabel}
                  aspect="aspect-[4/3]"
                  seed={`work-${i + 1}`}
                  className="rounded-none"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <TagChip key={tag} label={tag} />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-ink">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist/70">{card.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                    {workSection.more}
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
