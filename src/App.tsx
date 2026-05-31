import Hero from './components/sections/Hero'
import MissionStatement from './components/sections/MissionStatement'
import WorkSection from './components/sections/WorkSection'
import PromisesSection from './components/sections/PromisesSection'
import ResilienceSection from './components/sections/ResilienceSection'
import CtaSection from './components/sections/CtaSection'
import FooterSection from './components/sections/FooterSection'

export default function App() {
  return (
    <main className="min-h-screen w-full bg-navy text-mist">
      {/* 1. 히어로 (풀블리드) */}
      <Hero />
      {/* 2. 미션 타이포 모먼트 */}
      <MissionStatement />
      {/* 3. 호남에서 해온 일 */}
      <WorkSection />
      {/* 5. 호남 시민과의 4가지 약속 */}
      <PromisesSection />
      {/* 6. 흔들리지 않는다 */}
      <ResilienceSection />
      {/* 7. 발기인 모집 CTA */}
      <CtaSection />
      {/* 8. 마무리 / 푸터 */}
      <FooterSection />
    </main>
  )
}
