import type { LocalizedText } from '@/types/content'

export function loc(text: LocalizedText | string | undefined, maxLen?: number): string {
  if (!text) return ''
  const v =
    typeof text === 'string'
      ? text
      : (text['en-US'] ?? text['pt-BR'] ?? Object.values(text)[0] ?? '')
  if (maxLen && v.length > maxLen) return `${v.slice(0, maxLen)}...`
  return v
}

export function locIn(text: LocalizedText | string | undefined, lang: string | undefined): string {
  if (!text) return ''
  if (typeof text === 'string') return text
  if (lang && text[lang]) return text[lang] as string
  return loc(text)
}
