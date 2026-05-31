/** 카테고리 칩 — 사진 스토리 카드용. 절제된 외곽선 스타일. */
export default function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue/40 bg-blue/10 px-2.5 py-0.5 text-xs font-medium text-mist">
      {label}
    </span>
  )
}
