import { bookIntro } from '../content'
import SectionHeading from '../../components/ui/SectionHeading'
import SectionBackground from '../../components/ui/SectionBackground'
import Reveal from '../../components/ui/Reveal'

export default function BookIntro() {
  return (
    <section className="relative w-full overflow-hidden bg-navy py-24 sm:py-32">
      {/* 현장 사진(듀오톤)을 배경에 은은하게 — 네이비 스크림으로 본문 가독성 유지 */}
      <SectionBackground
        label={bookIntro.bgAlt}
        src={bookIntro.bgImage}
        overlayClassName="bg-gradient-to-b from-navy from-40% via-navy/95 to-navy/80"
        position="object-bottom"
      />
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
