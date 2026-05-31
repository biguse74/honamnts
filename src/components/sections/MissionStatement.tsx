import { motion } from 'framer-motion'
import { mission, backgrounds } from '../../data/content'
import SectionBackground from '../ui/SectionBackground'

export default function MissionStatement() {
  return (
    <section className="relative w-full overflow-hidden py-28 sm:py-40">
      <SectionBackground
        {...backgrounds.mission}
        overlayClassName="bg-gradient-to-b from-navy/80 via-navy/72 to-navy/88"
      />
      <div className="container-content relative z-10">
        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ staggerChildren: 0.18 }}
        >
          {mission.lines.map((line) => {
            const isGold = line === mission.goldLine
            return (
              <motion.p
                key={line}
                className={`text-4xl font-extrabold leading-[1.2] sm:text-6xl ${
                  isGold ? 'text-gold' : 'text-ink'
                }`}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.p>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
