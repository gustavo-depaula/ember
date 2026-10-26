// The portal's prose is written in both languages side by side, `l(english, portuguese)`, so a
// sentence cannot be added in one and forgotten in the other.
import type { Locale } from '~/lib/locale'
import { escapeHtml } from './json'

export function chooser(locale: Locale) {
  return (en: string, pt: string) => (locale === 'pt-BR' ? pt : en)
}

/** Prose kept in strings, with its few marks: `code`, **bold** and [label](url). */
export function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="xref" href="$2">$1</a>')
}
