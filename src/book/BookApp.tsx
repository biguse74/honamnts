import BookHero from './sections/BookHero'
import BookIntro from './sections/BookIntro'
import BookPreview from './sections/BookPreview'
import BookInfo from './sections/BookInfo'
import BookAuthors from './sections/BookAuthors'
import OrderForm from './sections/OrderForm'
import BookFooter from './sections/BookFooter'

export default function BookApp() {
  return (
    <main className="min-h-screen w-full bg-navy text-mist">
      {/* 1. 히어로 (표지 + 제목 + 예약하기) */}
      <BookHero />
      {/* 2. 책소개 (4단락) */}
      <BookIntro />
      {/* 3. 미리보기 (지도 무제판 + 목차 요약) */}
      <BookPreview />
      {/* 4. 책정보 */}
      <BookInfo />
      {/* 5. 지은이 */}
      <BookAuthors />
      {/* 6. 예약 주문 폼 */}
      <OrderForm />
      {/* 6. 푸터 */}
      <BookFooter />
    </main>
  )
}
