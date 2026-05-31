import { resilience, backgrounds } from '../../data/content'
import SectionBackground from '../ui/SectionBackground'
import Reveal from '../ui/Reveal'

export default function ResilienceSection() {
  return (
    <section className="relative w-full overflow-hidden bg-navy py-28 sm:py-36">
      <SectionBackground
        {...backgrounds.resilience}
        overlayClassName="bg-gradient-to-b from-navy/82 via-navy/74 to-navy/90"
      />
      <div className="container-content relative z-10">
        <div className="mx-auto max-w-3xl">
          {resilience.lines.map((line, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="mb-4 text-xl font-medium leading-relaxed text-mist sm:text-2xl">
                {line}
              </p>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <p className="mt-10 border-l-2 border-gold pl-5 text-2xl font-extrabold leading-snug text-gold sm:text-3xl">
              {resilience.goldLine}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
