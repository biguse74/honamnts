import { useEffect, useRef, useState } from 'react'

interface Options {
  /** 목표 값 */
  target: number
  /** 애니메이션 길이(ms) */
  duration?: number
  /** 소수 자릿수 */
  decimals?: number
  /** 시작 트리거 (뷰포트 진입 시 true) */
  start: boolean
}

/**
 * 뷰포트 진입 시 0 → target까지 부드럽게 증가시키는 카운트업.
 * requestAnimationFrame + easeOutCubic. prefers-reduced-motion이면 즉시 목표값.
 */
export function useCountUp({ target, duration = 1400, decimals = 0, start }: Options): string {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!start || startedRef.current) return
    startedRef.current = true

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setValue(target)
      return
    }

    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValue(target * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [start, target, duration])

  return value.toFixed(decimals)
}
