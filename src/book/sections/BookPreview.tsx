import { bookPreview } from '../content'
import SectionHeading from '../../components/ui/SectionHeading'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import Reveal from '../../components/ui/Reveal'

export default function BookPreview() {
  return (
    <section className="relative w-full bg-navy-800 py-24 sm:py-32">
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={bookPreview.eyebrow}
          title={bookPreview.title}
          className="max-w-2xl"
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* 지도 무제판 */}
          <Reveal>
            <figure>
              <ImagePlaceholder label={bookPreview.mapLabel} aspect="aspect-[4/3]" />
              <figcaption className="mt-3 text-sm leading-relaxed text-mist/55">
                {bookPreview.mapCaption}
              </figcaption>
            </figure>
          </Reveal>

          {/* 목차 요약 */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gold">{bookPreview.tocTitle}</h3>
              <ul className="mt-5 divide-y divide-mist/10">
                {bookPreview.toc.map((item, i) => (
                  <li key={i} className="flex items-baseline gap-4 py-3">
                    <span className="w-14 shrink-0 text-sm font-semibold text-mist/50">
                      {item.part}
                    </span>
                    <span className="text-base font-medium text-ink">{item.title}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-mist/40">{bookPreview.tocNote}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
