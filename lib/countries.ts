export type CountryEntry = {
  code: string
  dial: string
  flag: string
  name: string
  placeholder: string
}

export const POPULAR_COUNTRIES: CountryEntry[] = [
  { code: 'TR', dial: '+90',  flag: '🇹🇷', name: 'Türkiye',       placeholder: '532 000 00 00' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Almanya',        placeholder: '151 000 0000' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'İngiltere',      placeholder: '7700 000000' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'Amerika',        placeholder: '(555) 000-0000' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Hollanda',       placeholder: '6 0000 0000' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'Fransa',         placeholder: '6 00 00 00 00' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'Birleşik Arap E.', placeholder: '50 000 0000' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Suudi Arabistan', placeholder: '50 000 0000' },
]

export const OTHER_COUNTRIES: CountryEntry[] = [
  { code: 'AT', dial: '+43',  flag: '🇦🇹', name: 'Avusturya',      placeholder: '660 000 0000' },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Avustralya',     placeholder: '400 000 000' },
  { code: 'AZ', dial: '+994', flag: '🇦🇿', name: 'Azerbaycan',     placeholder: '40 000 00 00' },
  { code: 'BE', dial: '+32',  flag: '🇧🇪', name: 'Belçika',        placeholder: '470 00 00 00' },
  { code: 'BG', dial: '+359', flag: '🇧🇬', name: 'Bulgaristan',    placeholder: '87 000 0000' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Kanada',         placeholder: '(416) 000-0000' },
  { code: 'CH', dial: '+41',  flag: '🇨🇭', name: 'İsviçre',        placeholder: '78 000 00 00' },
  { code: 'CY', dial: '+357', flag: '🇨🇾', name: 'Kıbrıs',         placeholder: '99 000000' },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Çek Cumhuriyeti', placeholder: '601 000 000' },
  { code: 'DK', dial: '+45',  flag: '🇩🇰', name: 'Danimarka',      placeholder: '20 00 00 00' },
  { code: 'EG', dial: '+20',  flag: '🇪🇬', name: 'Mısır',          placeholder: '100 000 0000' },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', name: 'İspanya',        placeholder: '600 000 000' },
  { code: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finlandiya',     placeholder: '40 000 0000' },
  { code: 'GR', dial: '+30',  flag: '🇬🇷', name: 'Yunanistan',     placeholder: '690 000 0000' },
  { code: 'HR', dial: '+385', flag: '🇭🇷', name: 'Hırvatistan',    placeholder: '91 000 0000' },
  { code: 'HU', dial: '+36',  flag: '🇭🇺', name: 'Macaristan',     placeholder: '20 000 0000' },
  { code: 'IL', dial: '+972', flag: '🇮🇱', name: 'İsrail',         placeholder: '50 000 0000' },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', name: 'İtalya',         placeholder: '320 000 0000' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japonya',        placeholder: '90 0000 0000' },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuveyt',         placeholder: '500 00000' },
  { code: 'NO', dial: '+47',  flag: '🇳🇴', name: 'Norveç',         placeholder: '400 00 000' },
  { code: 'PL', dial: '+48',  flag: '🇵🇱', name: 'Polonya',        placeholder: '512 000 000' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portekiz',       placeholder: '912 000 000' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Katar',          placeholder: '3300 0000' },
  { code: 'RO', dial: '+40',  flag: '🇷🇴', name: 'Romanya',        placeholder: '721 000 000' },
  { code: 'RU', dial: '+7',   flag: '🇷🇺', name: 'Rusya',          placeholder: '900 000-00-00' },
  { code: 'SE', dial: '+46',  flag: '🇸🇪', name: 'İsveç',          placeholder: '70 000 0000' },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapur',       placeholder: '8000 0000' },
  { code: 'SK', dial: '+421', flag: '🇸🇰', name: 'Slovakya',       placeholder: '900 000 000' },
  { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukrayna',        placeholder: '50 000 0000' },
]
