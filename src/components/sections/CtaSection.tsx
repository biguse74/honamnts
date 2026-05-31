import { useState } from 'react'
import type { FormEvent } from 'react'
import { cta, backgrounds, kakaoChatUrl } from '../../data/content'
import SectionBackground from '../ui/SectionBackground'
import KakaoChatButton, { KakaoIcon } from '../ui/KakaoChatButton'
import Reveal from '../ui/Reveal'

/** 계좌 정보 복사 버튼 */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 클립보드 미지원 환경 — 무시 */
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-mist/10 py-3 last:border-0">
      <span className="text-sm text-mist/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">{value}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md border border-mist/20 px-2 py-0.5 text-xs text-mist/70 transition-colors hover:border-gold hover:text-gold"
        >
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
    </div>
  )
}

export default function CtaSection() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copiedAgain, setCopiedAgain] = useState(false)

  // 채팅창에 붙여넣을 신청 메시지
  const message = `${cta.form.messageTitle}\n성함: ${name}\n연락처: ${phone}\n${cta.form.pledgeLine}`

  const copyMessage = () => {
    navigator.clipboard?.writeText(message).catch(() => {})
  }

  // 제출: 신청 내용 복사 + 카카오 채널 채팅창 열기 (팝업 차단 회피를 위해 동기 실행)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    copyMessage()
    if (kakaoChatUrl) window.open(kakaoChatUrl, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

  const onCopyAgain = () => {
    copyMessage()
    setCopiedAgain(true)
    window.setTimeout(() => setCopiedAgain(false), 1600)
  }

  return (
    <section id="join" className="relative w-full overflow-hidden bg-navy-800 py-24 sm:py-32">
      <SectionBackground {...backgrounds.cta} overlayClassName="bg-navy/78" />
      <div className="container-content relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight text-ink sm:text-5xl">
              {cta.headline}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-mist sm:text-xl">{cta.lead}</p>
          </Reveal>

          {/* 발기인 번호 모티프 — 빈 No. 박스 */}
          <Reveal delay={0.1}>
            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-gold/40 bg-gold/5 px-6 py-3">
              <span className="text-sm font-semibold text-mist/80">{cta.numberMotif.prefix}</span>
              <span className="flex items-center gap-1">
                <span className="text-2xl font-extrabold tracking-widest text-gold">No.</span>
                <span className="inline-flex h-9 w-12 items-center justify-center rounded-md border-2 border-dashed border-gold/50 text-xl font-bold text-gold/70">
                  ?
                </span>
              </span>
              <span className="text-sm font-semibold text-mist/80">{cta.numberMotif.suffix}</span>
            </div>
          </Reveal>
        </div>

        {/* 계좌 안내 박스 */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
            <p className="mb-4 text-sm font-semibold tracking-[0.08em] text-gold">
              자동이체 계좌 안내
            </p>
            <div className="rounded-xl bg-navy-800 px-5 py-2">
              <CopyField label="은행" value={cta.account.bank} />
              <CopyField label="계좌번호" value={cta.account.number} />
              <CopyField label="예금주" value={cta.account.holder} />
            </div>

            <ul className="mt-5 space-y-2">
              {cta.notices.map((n, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-mist/75">
                  <span className="text-gold">·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-blue/30 bg-blue/10 px-4 py-3 text-center">
              <span className="text-sm text-mist/70">{cta.confirmLabel}</span>
              <a
                href={`tel:${cta.confirmPhone.replace(/-/g, '')}`}
                className="text-base font-bold text-ink hover:text-gold"
              >
                {cta.confirmPhone}
              </a>
            </div>
          </div>
        </Reveal>

        {/* 신청 폼 — 성함·연락처 입력 → 복사 + 카카오톡 채팅창 열기 */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-8 max-w-xl">
            {submitted ? (
              <div className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
                <p className="text-sm leading-relaxed text-mist">
                  {kakaoChatUrl ? cta.form.submittedMessage : cta.form.notReady}
                </p>
                {/* 복사된 신청 내용 미리보기 */}
                <pre className="mt-4 whitespace-pre-wrap break-keep rounded-lg bg-navy-800 p-4 font-sans text-sm leading-relaxed text-mist/90">
                  {message}
                </pre>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onCopyAgain}
                    className="rounded-lg border border-mist/20 px-5 py-3 text-sm font-semibold text-mist transition-colors hover:border-gold hover:text-gold"
                  >
                    {copiedAgain ? '복사됨' : cta.form.copyAgain}
                  </button>
                  <KakaoChatButton
                    label={cta.form.openChat}
                    className="flex-1 rounded-lg px-5 py-3 text-sm"
                  />
                </div>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-3 rounded-2xl border border-mist/10 bg-navy p-5 sm:flex-row"
              >
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={cta.form.namePlaceholder}
                  className="flex-1 rounded-lg border border-mist/15 bg-navy-800 px-4 py-3 text-ink placeholder-mist/40 outline-none focus:border-gold"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={cta.form.phonePlaceholder}
                  className="flex-1 rounded-lg border border-mist/15 bg-navy-800 px-4 py-3 text-ink placeholder-mist/40 outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FEE500] px-6 py-3 font-bold text-[#191600] transition-opacity hover:opacity-90"
                >
                  <KakaoIcon className="h-5 w-5" />
                  {cta.form.submit}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
