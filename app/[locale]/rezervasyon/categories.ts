export type SubCategory = {
  key: string
  icon: string
  label: string
  types: string[]
}

export type Category = {
  key: string
  labelKey: string
  icon: string
  types: string[]
  heroOverlay: string
  accentColor: string
  subCategories: SubCategory[]
}

export const CATEGORIES: Category[] = [
  {
    key: 'yeme-icme',
    labelKey: 'catFoodDrink',
    icon: '🍽️',
    types: ['restaurant'],
    heroOverlay: 'linear-gradient(135deg,rgba(146,64,14,0.93) 0%,rgba(180,83,9,0.80) 50%,rgba(217,119,6,0.70) 100%)',
    accentColor: '#D97706',
    subCategories: [
      { key: 'restoran', icon: '🍽️', label: 'Restoran & Kafe', types: ['restaurant'] },
    ],
  },
  {
    key: 'guzellik',
    labelKey: 'catBeauty',
    icon: '💆',
    types: ['barber', 'hairdresser', 'beauty_salon', 'spa'],
    heroOverlay: 'linear-gradient(135deg,rgba(157,23,77,0.93) 0%,rgba(190,24,93,0.80) 50%,rgba(219,39,119,0.70) 100%)',
    accentColor: '#DB2777',
    subCategories: [
      { key: 'berber',    icon: '✂️', label: 'Berber',      types: ['barber'] },
      { key: 'kuafor',    icon: '💇', label: 'Kuaför',      types: ['hairdresser', 'beauty_salon'] },
      { key: 'spa-masaj', icon: '💆', label: 'Spa & Masaj', types: ['spa'] },
    ],
  },
  {
    key: 'saglik',
    labelKey: 'catHealth',
    icon: '🏥',
    types: ['dentist', 'psychologist', 'veterinary', 'chiropractor'],
    heroOverlay: 'linear-gradient(135deg,rgba(6,95,70,0.93) 0%,rgba(4,120,87,0.80) 50%,rgba(5,150,105,0.70) 100%)',
    accentColor: '#059669',
    subCategories: [
      { key: 'psikoloji',    icon: '🧠', label: 'Psikoloji',    types: ['psychologist'] },
      { key: 'fizyoterapi',  icon: '🦴', label: 'Kayropraktik', types: ['chiropractor'] },
      { key: 'dis',          icon: '🦷', label: 'Diş Kliniği',  types: ['dentist'] },
      { key: 'veteriner',    icon: '🐾', label: 'Veteriner',    types: ['veterinary'] },
    ],
  },
  {
    key: 'spor',
    labelKey: 'catSports',
    icon: '🏋️',
    types: ['fitness', 'pilates'],
    heroOverlay: 'linear-gradient(135deg,rgba(185,28,28,0.93) 0%,rgba(220,38,38,0.80) 50%,rgba(234,88,12,0.70) 100%)',
    accentColor: '#EA580C',
    subCategories: [
      { key: 'spor-salonu',  icon: '🏋️', label: 'Spor Salonu',    types: ['fitness'] },
      { key: 'pilates-yoga', icon: '🧘', label: 'Pilates & Yoga',  types: ['pilates'] },
    ],
  },
]

/** Hem üst hem alt kategoriler için business_type'lara bak */
export function getTypesForKey(key: string): string[] | null {
  if (!key) return null
  const parent = CATEGORIES.find(c => c.key === key)
  if (parent) return parent.types
  for (const cat of CATEGORIES) {
    const sub = cat.subCategories.find(s => s.key === key)
    if (sub) return sub.types
  }
  return null
}

export function getCategoryForKey(key: string): Category | null {
  if (!key) return null
  return CATEGORIES.find(c => c.key === key)
    ?? CATEGORIES.find(c => c.subCategories.some(s => s.key === key))
    ?? null
}
