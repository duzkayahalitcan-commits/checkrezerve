/**
 * Ses seçimi özelliği — paylaşımlı ses kataloğu (S4: voice settings).
 * ElevenLabs ses ID'leri tek kaynakta tanımlanır.
 */

export type VoiceKey = 'yunus' | 'mert' | 'lisa' | 'gulsu'

export interface VoiceOption {
  key: VoiceKey
  label: string
  gender: 'erkek' | 'kadın'
  elevenLabsId: string
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { key: 'yunus', label: 'Yunus', gender: 'erkek', elevenLabsId: '5nr6ATQepuidiLb6OT3B' },
  { key: 'mert',  label: 'Mert',  gender: 'erkek', elevenLabsId: '01p4omegjS2n3rSDCM5u' },
  { key: 'lisa',  label: 'Lisa',  gender: 'kadın', elevenLabsId: 'q5GI4RAWrMYEY5xaGcma' },
  { key: 'gulsu', label: 'Gülsu', gender: 'kadın', elevenLabsId: 'jbJMQWv1eS4YjQ6PCcn6' },
]

export const DEFAULT_VOICE_KEY: VoiceKey = 'gulsu'

export function getVoice(key: string | null | undefined): VoiceOption {
  const found = VOICE_OPTIONS.find(v => v.key === key)
  return found ?? VOICE_OPTIONS.find(v => v.key === DEFAULT_VOICE_KEY)!
}

export function isValidVoiceKey(key: string | null | undefined): key is VoiceKey {
  return !!key && VOICE_OPTIONS.some(v => v.key === key)
}
