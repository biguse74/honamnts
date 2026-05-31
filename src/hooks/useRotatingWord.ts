import { useEffect, useState } from 'react'

/**
 * 단어 배열을 일정 간격으로 순환시킨다. (키네틱 회전 헤드라인용)
 * @param words   교체할 단어들
 * @param interval 교체 간격(ms) — 기본 2000ms
 * @returns 현재 표시할 단어의 인덱스
 */
export function useRotatingWord(words: string[], interval = 2000): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (words.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, interval)
    return () => window.clearInterval(id)
  }, [words.length, interval])

  return index
}
