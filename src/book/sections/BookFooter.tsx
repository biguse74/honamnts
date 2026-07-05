import { bookFooter } from '../content'
import Reveal from '../../components/ui/Reveal'

export default function BookFooter() {
  return (
    <footer className="relative w-full bg-navy py-20 sm:py-24">
      <div className="container-content relative z-10 text-center">
        <Reveal>
          <p className="text-lg font-bold text-ink">{bookFooter.publisher}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mist/65">
            {bookFooter.note}
          </p>
          <a
            href={`sms:${bookFooter.contactTel.replace(/-/g, '')}`}
            className="mt-4 inline-block text-sm font-medium text-mist/70 transition-colors hover:text-gold"
          >
            {bookFooter.contact}
          </a>
        </Reveal>
      </div>
    </footer>
  )
}
