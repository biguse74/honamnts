import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 로컬 개발 전용 mock — POST /api/order 에 { ok, orderNo } 를 돌려준다.
 * 실서버(코덱스 소유 백엔드)가 없는 개발 환경에서 주문 성공 UX 를 확인하기 위한 것.
 * apply:'serve' 라 프로덕션 빌드에는 포함되지 않는다. (submitOrder 계약은 건드리지 않음)
 */
function devOrderMock(): Plugin {
  let counter = 0
  return {
    name: 'dev-order-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/order', (req: any, res: any, _next: any) => {
        if (req.method !== 'POST') {
          _next()
          return
        }
        counter += 1
        const orderNo = `HB-${`0000${counter}`.slice(-4)}`
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true, orderNo }))
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devOrderMock()],
  build: {
    rollupOptions: {
      // 멀티 페이지: 발기인 랜딩(/) + 『불의 고리』 예약판매(/book/)
      input: {
        main: 'index.html',
        book: 'book/index.html',
      },
    },
  },
})
