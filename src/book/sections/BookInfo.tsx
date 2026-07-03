import { bookInfo, bookHero } from '../content'
import SectionHeading from '../../components/ui/SectionHeading'
import Reveal from '../../components/ui/Reveal'

export default function BookInfo() {
  return (
    <section className="relative w-full bg-navy py-24 sm:py-32">
      <div className="container-content relative z-10">
        <SectionHeading eyebrow={bookInfo.eyebrow} title={bookInfo.title} className="max-w-2xl" />

        <Reveal>
          <dl className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl border border-gold/20 bg-navy-800">
            {bookInfo.specs.map((spec) => {
              const isPrice = spec.label === '정가'
              return (
                <div
                  key={spec.label}
                  className={`flex items-center gap-4 border-b border-mist/10 px-6 py-4 last:border-0 sm:px-8 ${
                    isPrice ? 'bg-gold/10' : ''
                  }`}
                >
                  <dt className="w-24 shrink-0 text-sm font-semibold tracking-[0.04em] text-gold/80">
                    {spec.label}
                  </dt>
                  {isPrice ? (
                    <dd className="text-xl font-extrabold text-gold">{spec.value}</dd>
                  ) : (
                    <dd className="text-base font-medium text-ink">{spec.value}</dd>
                  )}
                </div>
              )
            })}
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 flex max-w-2xl justify-center">
            <a
              href={`#${bookHero.ctaTargetId}`}
              className="inline-flex items-center justify-center rounded-full bg-gold px-10 py-4 text-lg font-bold text-navy shadow-signal transition-transform hover:-translate-y-0.5"
            >
              {bookHero.primaryCta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
