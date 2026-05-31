import { AnimatePresence, motion } from 'framer-motion'
import { hero, cta } from '../../data/content'
import { useRotatingWord } from '../../hooks/useRotatingWord'
import VideoPlaceholder from '../ui/VideoPlaceholder'
import SignalBeam from '../ui/SignalBeam'
import KakaoChatButton from '../ui/KakaoChatButton'

// 메인 헤드라인에서 '첫 신호탄'만 분리해 골드로 강조 (카피 자체는 변경하지 않음)
const headlineLead = hero.headline.replace(' 첫 신호탄', '')

export default function Hero() {
  const wordIndex = useRotatingWord(hero.rotatingWords, 3200)

  return (
    <section className="relative flex min-h-[100svh] w-full items-end justify-start overflow-hidden sm:items-center sm:justify-center">
      {/* 배경 영상 더미 (풀블리드) */}
      <VideoPlaceholder label="[히어로 영상 자리 — 광주 야경/신호탄]" />

      {/* 어두운 오버레이 — 하단(모바일 텍스트) 가독성 */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-navy/10" />

      {/* 신호탄 빛줄기 */}
      <SignalBeam />

      {/* 콘텐츠 — 모바일 하단 좌측, 데스크톱 중앙 */}
      <div className="container-content relative z-10 flex flex-col items-start pb-28 text-left sm:items-center sm:pb-0 sm:text-center">
        {/* 회전 도입부: 호남에서 [ ___ ] 시작합니다 — H1보다 낮은 위계 */}
        <div className="mb-5 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-base font-medium text-mist/80 sm:justify-center sm:text-lg">
          <span>{hero.rotatingPrefix}</span>
          <span className="relative inline-flex h-[1.4em] min-w-[5.5em] items-center justify-start overflow-hidden sm:justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="absolute whitespace-nowrap font-bold text-ink"
                initial={{ opacity: 0, y: '0.5em' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '-0.5em' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {hero.rotatingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span>{hero.rotatingSuffix}</span>
        </div>

        {/* 고정 메인 헤드라인 — 첫 장면의 주인공 */}
        <motion.h1
          className="text-[clamp(3.4rem,15vw,5rem)] font-black leading-[0.98] tracking-normal text-ink sm:max-w-5xl sm:text-[clamp(5rem,8vw,7.5rem)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="block">{headlineLead}</span>
          <span className="block text-gold">첫 신호탄</span>
        </motion.h1>

        {/* 서브 — 골드는 H1이 가져가므로 mist 계열로 */}
        <motion.p
          className="mt-6 text-lg font-semibold text-mist sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          {hero.sub}
        </motion.p>

        {/* 바로 신청 / 문의 — 첫 화면에서 후원 액션 */}
        <motion.div
          className="mt-8 flex w-full flex-col items-start gap-4 sm:w-auto sm:items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
        >
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={`#${hero.ctaTargetId}`}
              className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-bold text-navy shadow-signal transition-transform hover:-translate-y-0.5 sm:text-lg"
            >
              {hero.primaryCta}
            </a>
            <KakaoChatButton
              label={hero.kakaoInquiry}
              className="w-full rounded-full px-7 py-4 text-base sm:w-auto sm:text-lg"
            />
          </div>
          {/* 전화 문의 — 보조 텍스트 링크 */}
          <a
            href={`tel:${cta.confirmPhone.replace(/-/g, '')}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist/70 transition-colors hover:text-gold"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {hero.phoneInquiry} {cta.confirmPhone}
          </a>
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 — 메시지보다 먼저 띄지 않게 절제 */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-mist/45">
          <span className="sr-only sm:not-sr-only sm:text-xs sm:tracking-widest">
            {hero.scrollHint}
          </span>
          <svg
            className="h-5 w-5 animate-bounceArrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
