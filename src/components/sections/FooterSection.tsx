import { footer, backgrounds } from '../../data/content'
import SectionBackground from '../ui/SectionBackground'
import KakaoChatButton from '../ui/KakaoChatButton'
import Reveal from '../ui/Reveal'

export default function FooterSection() {
  return (
    <footer className="relative w-full overflow-hidden bg-navy py-24 sm:py-32">
      <SectionBackground {...backgrounds.footer} overlayClassName="bg-navy/80" />
      <div className="container-content relative z-10 text-center">
        <Reveal>
          {footer.closing.map((line, i) => (
            <p key={i} className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              {line}
            </p>
          ))}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-mist sm:text-xl">
            {footer.invite}
          </p>
          <div className="mt-8 flex justify-center">
            <KakaoChatButton
              label={footer.kakaoInquiry}
              className="rounded-full px-7 py-3.5 text-base"
            />
          </div>
        </Reveal>

        {/* 푸터 정보 */}
        <div className="mt-16 border-t border-mist/10 pt-8">
          <p className="text-base font-bold text-ink">{footer.org}</p>
          <p className="mt-1 text-sm text-mist/60">{footer.contact}</p>
          {/* 계보 — 옛 표기는 여기 한 줄로만 */}
          <p className="mt-3 text-xs text-mist/40">{footer.lineage}</p>
        </div>
      </div>
    </footer>
  )
}
