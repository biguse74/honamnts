import { bookIntro } from '../content'
import SectionHeading from '../../components/ui/SectionHeading'
import Reveal from '../../components/ui/Reveal'

export default function BookIntro() {
  return (
    <section className="relative w-full bg-navy py-24 sm:py-32">
      <div className="container-content relative z-10">
        <SectionHeading eyebrow={bookIntro.eyebrow} title={bookIntro.title} className="max-w-2xl" />

        <div className="mx-auto mt-12 max-w-2xl space-y-6">
          {bookIntro.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="text-lg leading-relaxed text-mist/85">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
