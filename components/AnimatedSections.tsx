// KURAL: Hero ve above-the-fold bileşenler whileInView KULLANMAZ. Scroll trigger sadece sayfanın alt yarısındaki section'lar için. Image wrapper'da opacity animasyonu yasak.
// Tek orkestrasyonlu giriş: tek bir whileInView konteyner + staggerChildren. Bounce keyframe yok. prefers-reduced-motion desteği var.

'use client'
import { motion, useReducedMotion } from 'motion/react'
import { UtensilsCrossed, Scissors, Sparkles, BedDouble, CalendarRange, Dumbbell, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Scissors,
  Sparkles,
  BedDouble,
  CalendarRange,
  Dumbbell,
}

interface Sector {
  iconName: string
  title: string
  desc: string
}

interface Testimonial {
  quote: string
  name: string
  business: string
  type: string
  initials: string
}

interface HowStep {
  num: string
  title: string
  desc: string
}

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

// Orchestrated container + child variants — one whileInView on the container.
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

function Orchestrator({ children, className }: { children: React.ReactNode; className: string }) {
  const reduced = useReducedMotion()
  // Reduced motion: render statically — no scroll-triggered animation.
  if (reduced) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedSectors({ sectors }: { sectors: Sector[] }) {
  return (
    <Orchestrator className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sectors.map((s) => {
        const Icon = ICON_MAP[s.iconName]
        return (
          <motion.div
            key={s.title}
            variants={itemVariants}
            className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 hover:border-red-100"
            style={{ willChange: 'transform' }}
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              {Icon ? <Icon className="w-5 h-5 text-red-600" /> : null}
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">{s.title}</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
          </motion.div>
        )
      })}
    </Orchestrator>
  )
}

export function AnimatedHowSteps({ steps }: { steps: HowStep[] }) {
  return (
    <Orchestrator className="grid sm:grid-cols-3 gap-8 mb-16">
      {steps.map((step) => (
        <motion.div key={step.num} variants={itemVariants} className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-red-200">
            {step.num}
          </div>
          <h3 className="text-base font-bold text-zinc-900 mb-2">{step.title}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </Orchestrator>
  )
}

export function AnimatedTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Orchestrator className="grid sm:grid-cols-3 gap-6">
      {testimonials.map((tm) => (
        <motion.div
          key={tm.name}
          variants={itemVariants}
          className="bg-white rounded-2xl border border-zinc-100 p-7 hover:border-red-100 hover:shadow-md transition-all duration-200 flex flex-col"
        >
          <div className="flex-1">
            <div className="text-red-500 text-2xl mb-4 leading-none">&ldquo;</div>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">{tm.quote}</p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 text-xs font-extrabold flex items-center justify-center shrink-0">
              {tm.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{tm.name}</p>
              <p className="text-xs text-zinc-400">{tm.business} · {tm.type}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </Orchestrator>
  )
}
