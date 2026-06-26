'use client'

import { motion } from 'motion/react'

const STEPS = [
  { num: 1, label: 'İşletme Bilgileri' },
  { num: 2, label: 'Hizmetler' },
  { num: 3, label: 'Çalışanlar' },
  { num: 4, label: 'Masa Düzeni' },
  { num: 5, label: 'Tamamlandı' },
]

export function StepIndicator({ currentStep }: { currentStep: number; slug?: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const isCompleted = currentStep > s.num
          const isCurrent   = currentStep === s.num
          const isFuture    = currentStep < s.num

          return (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#E53935' : isCurrent ? '#D4A373' : '#374151',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? 'shadow-lg shadow-red-500/30' : ''
                  } ${isCurrent ? 'ring-2 ring-[#D4A373] ring-offset-2 ring-offset-[#2B1B17]' : ''}`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-white">{s.num}</span>
                  )}
                </motion.div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${
                  isCurrent ? 'text-[#D4A373] font-semibold' : isCompleted ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  {s.label}
                </span>
              </div>

              {/* Progress line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-1.5rem]">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-[#E53935]' : 'bg-stone-700'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
