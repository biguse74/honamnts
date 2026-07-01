import { bookAuthors } from '../content'
import SectionHeading from '../../components/ui/SectionHeading'
import Reveal from '../../components/ui/Reveal'

export default function BookAuthors() {
  return (
    <section className="relative w-full bg-navy-800 py-24 sm:py-32">
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={bookAuthors.eyebrow}
          title={bookAuthors.title}
          className="max-w-2xl"
        />

        <Reveal>
          <div className="mt-12 grid items-center gap-8 sm:grid-cols-[1.1fr_1fr] sm:gap-12">
            {/* 저자 사진 (듀오톤) */}
            <figure className="overflow-hidden rounded-2xl border border-mist/10">
              <img
                src={bookAuthors.photo}
                alt={bookAuthors.photoAlt}
                loading="lazy"
                className="block w-full object-cover"
              />
            </figure>

            {/* 소개 */}
            <div>
              <p className="text-2xl font-extrabold text-ink sm:text-3xl">{bookAuthors.names}</p>
              <p className="mt-2 text-sm font-semibold tracking-[0.06em] text-gold">
                {bookAuthors.role}
              </p>
              <p className="mt-5 text-base leading-relaxed text-mist/80">{bookAuthors.bio}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
