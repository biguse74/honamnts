/**
 * 신호탄 모티프 — 수직으로 쏘아 올라가는 골드 빛줄기.
 * 영상이 들어오기 전 가벼운 CSS/SVG 구현. 과하지 않게 은은한 pulse.
 */
export default function SignalBeam({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-end justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-full w-full max-w-[18rem] sm:max-w-[28rem]">
        {/* 발사 지점의 부드러운 골드 광원 */}
        <div className="absolute bottom-[-9rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl animate-beam" />
        {/* 부드러운 외광(glow) */}
        <div
          className="absolute bottom-0 left-1/2 h-[70%] w-10 -translate-x-1/2 origin-bottom animate-beam blur-md"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(198,144,38,0.35) 0%, rgba(198,144,38,0) 100%)',
          }}
        />
        {/* 본 빛줄기 — 2px + glow로 신호탄 모티프가 읽히게 */}
        <div
          className="absolute bottom-0 left-1/2 h-[72svh] w-[2px] -translate-x-1/2 origin-bottom animate-beam shadow-signal"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(198,144,38,0.95) 0%, rgba(198,144,38,0.5) 42%, rgba(198,144,38,0) 100%)',
          }}
        />
      </div>
    </div>
  )
}
