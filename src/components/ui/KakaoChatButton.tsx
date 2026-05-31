import { kakaoChatUrl } from '../../data/content'

/** 카카오톡 말풍선 아이콘 */
export function KakaoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.4.3-.2 3-2 3.7-2.5.6.1 1.3.1 1.9.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
    </svg>
  )
}

interface KakaoChatButtonProps {
  /** 버튼 라벨 */
  label: string
  /** 크기·모양·너비 등 추가 클래스 (padding/rounded/width 는 여기서 지정) */
  className?: string
}

/**
 * 카카오톡 채널 1:1 채팅을 새 창으로 여는 버튼.
 * 채널 공개ID(content.ts kakao.channelPublicId)가 비어 있으면 렌더하지 않는다.
 */
export default function KakaoChatButton({ label, className = '' }: KakaoChatButtonProps) {
  if (!kakaoChatUrl) return null
  return (
    <a
      href={kakaoChatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-[#FEE500] font-bold text-[#191600] transition-opacity hover:opacity-90 ${className}`}
    >
      <KakaoIcon className="h-5 w-5" />
      {label}
    </a>
  )
}
