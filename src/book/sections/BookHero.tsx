import { motion } from 'framer-motion'
import { bookHero } from '../content'

export default function BookHero() {
  return (
    <section className="relative flex min-h-[100svh] w-full items-center overflow-hidden">
      {/* 배경 — 표지의 붉은 링과 어울리는 깊은 네이비 + 하단 발광 */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 72% 42%, rgba(193,18,31,0.22) 0%, rgba(193,18,31,0.06) 30%, transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(198,144,38,0.16) 0%, transparent 45%), linear-gradient(180deg, #07111D 0%, #0D1B2A 55%, #050A12 100%)',
        }}
      />
      {/* 가장자리 비네트 */}
      <div className="absolute inset-0 z-0 bg-hero-vignette" aria-hidden="true" />

      <div className="container-content relative z-10 grid items-center gap-10 py-24 sm:py-28 lg:grid-cols-2 lg:gap-16">
        {/* 표지 제목판 */}
        <motion.div
          className="order-1 flex justify-center lg:order-2"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={bookHero.coverImage}
            alt={bookHero.coverAlt}
            className="w-full max-w-md rounded-xl shadow-signal"
          />
        </motion.div>

        {/* 제목 + 예약하기 */}
        <div className="order-2 flex flex-col items-start text-left lg:order-1">
          <motion.p
            className="mb-4 text-sm font-semibold tracking-[0.12em] text-gold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {bookHero.eyebrow}
          </motion.p>

          <motion.h1
            className="text-[clamp(3.4rem,13vw,6rem)] font-black leading-[0.95] text-ink"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            {bookHero.title}
          </motion.h1>

          <motion.p
            className="mt-5 text-lg font-semibold text-mist sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            {bookHero.authors}
          </motion.p>

          <motion.p
            className="mt-4 max-w-md text-base leading-relaxed text-mist/80 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            {bookHero.tagline}
          </motion.p>

          <motion.div
            className="mt-8 flex w-full flex-col items-start gap-4 sm:w-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <a
              href={`#${bookHero.ctaTargetId}`}
              className="inline-flex items-center justify-center rounded-full bg-gold px-10 py-4 text-lg font-bold text-navy shadow-signal transition-transform hover:-translate-y-0.5"
            >
              {bookHero.primaryCta}
            </a>
            <p className="text-sm font-medium text-mist/60">{bookHero.priceLine}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
