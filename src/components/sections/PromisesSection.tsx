import { promises, backgrounds } from '../../data/content'
import SectionHeading from '../ui/SectionHeading'
import SectionBackground from '../ui/SectionBackground'
import Reveal from '../ui/Reveal'

export default function PromisesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-navy-800 py-24 sm:py-32">
      <SectionBackground {...backgrounds.promises} overlayClassName="bg-navy/74" />
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={promises.eyebrow}
          title={promises.title}
          className="mb-12 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-mist/10 bg-mist/10 sm:grid-cols-2">
          {promises.items.map((item, i) => (
            <Reveal key={item.no} delay={i * 0.06}>
              <div className="flex h-full flex-col bg-navy-800 p-7 sm:p-8">
                <span className="text-sm font-bold tracking-widest text-gold">{item.no}</span>
                <h3 className="mt-3 text-xl font-extrabold leading-snug text-ink sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-mist/80">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
