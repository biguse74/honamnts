/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 브랜드 디자인 토큰 — 일관 사용
        navy: {
          DEFAULT: '#0D1B2A', // 기본 배경
          800: '#11233A',
          700: '#16304F',
        },
        gold: '#C69026', // 핵심 강조 (남발 금지)
        blue: '#2B6CB0', // 보조 강조
        ink: '#FFFFFF', // 본문 강
        mist: '#E2E8F0', // 본문 약
        light: '#F8F9FA', // 라이트 섹션
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Pretendard Variable',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '72rem',
      },
      backgroundImage: {
        // 히어로 더미 배경 — 하단 골드 발사광 + 블루 음영 + 네이비 깊이감
        'hero-placeholder':
          'radial-gradient(ellipse at 50% 100%, rgba(198,144,38,0.28) 0%, rgba(198,144,38,0.08) 26%, transparent 48%), radial-gradient(ellipse at 18% 32%, rgba(43,108,176,0.24) 0%, transparent 42%), linear-gradient(180deg, #07111D 0%, #0D1B2A 54%, #050A12 100%)',
        // 가장자리를 눌러 중앙으로 시선을 모으는 비네트
        'hero-vignette':
          'radial-gradient(circle at 50% 68%, transparent 0%, rgba(13,27,42,0.48) 62%, rgba(13,27,42,0.92) 100%)',
      },
      boxShadow: {
        signal: '0 0 32px rgba(198,144,38,0.35), 0 0 96px rgba(198,144,38,0.16)',
      },
      keyframes: {
        beam: {
          '0%, 100%': { opacity: '0.35', transform: 'scaleY(0.96)' },
          '50%': { opacity: '0.9', transform: 'scaleY(1)' },
        },
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceArrow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
      },
      animation: {
        beam: 'beam 3.4s ease-in-out infinite',
        flow: 'flow 12s ease-in-out infinite',
        bounceArrow: 'bounceArrow 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
