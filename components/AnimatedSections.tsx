// KURAL: Hero ve above-the-fold bileşenler whileInView KULLANMAZ. Scroll trigger sadece sayfanın alt yarısındaki section'lar için. Image wrapper'da opacity animasyonu yasak.

'use client'
import { motion } from 'motion/react'
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

export function AnimatedSectors({ sectors }: { sectors: Sector[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sectors.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -50px 0px' }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
          className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 hover:border-red-100 transition-all duration-200"
          style={{ willChange: 'transform' }}
        >
          {(() => {
            const Icon = ICON_MAP[s.iconName]
            return (
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                {Icon ? <Icon className="w-5 h-5 text-red-600" /> : null}
              </div>
            )
          })()}
          <h3 className="text-base font-bold text-zinc-900 mb-2">{s.title}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function AnimatedHowSteps({ steps }: { steps: HowStep[] }) {
  return (
    <div className="grid sm:grid-cols-3 gap-8 mb-16">
      {steps.map((step, i) => (
        <motion.div
          key={step.num}
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -50px 0px' }}
          transition={{ duration: 0.6, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-red-200"
            whileInView={{ scale: [0.5, 1.1, 1] }}
            viewport={{ once: true, margin: '0px 0px -50px 0px' }}
            transition={{ duration: 0.5, delay: i * 0.12 + 0.2 }}
          >
            {step.num}
          </motion.div>
          <h3 className="text-base font-bold text-zinc-900 mb-2">{step.title}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

export function AnimatedTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {testimonials.map((tm, i) => (
        <motion.div
          key={tm.name}
          className="bg-white rounded-2xl border border-zinc-100 p-7 hover:border-red-100 hover:shadow-md transition-all duration-200 flex flex-col"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -50px 0px' }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
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
    </div>
  )
}
