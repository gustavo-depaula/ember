import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { repoRoot } from '~/platform/paths'
import { escapeHtml } from './html'
import type { Locale } from './locale'

// One text, two places: the app's store listing is also what the site says of it.
export function listingHtml(locale: Locale): string {
  const text = readFileSync(
    resolve(repoRoot, `apps/app/store/android/${locale}/full_description.txt`),
    'utf-8',
  )
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const [first, ...rest] = block.split('\n')
      const heading = /^[^a-zà-ÿ]+$/.test(first) && first.length < 60
      const body = heading ? rest : [first, ...rest]
      const bullets = body.filter((line) => line.startsWith('•'))
      const lines = body.filter((line) => !line.startsWith('•'))
      return [
        heading ? `<h2>${escapeHtml(first.charAt(0) + first.slice(1).toLowerCase())}</h2>` : '',
        lines.length ? `<p>${escapeHtml(lines.join(' '))}</p>` : '',
        bullets.length
          ? `<ul>${bullets.map((b) => `<li>${escapeHtml(b.replace(/^•\s*/, ''))}</li>`).join('')}</ul>`
          : '',
      ].join('')
    })
    .join('')
    .replace(
      /github\.com\/gustavo-depaula\/ember/g,
      '<a href="https://github.com/gustavo-depaula/ember">github.com/gustavo-depaula/ember</a>',
    )
}

// The policy the store listings link to (apps/hearth/privacy.html) holds both languages.
export function policyHtml(locale: Locale): string {
  const html = readFileSync(resolve(repoRoot, 'apps/hearth/privacy.html'), 'utf-8')
  const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  const [english, portuguese] = body.split(/<hr>/)
  const part =
    locale === 'pt-BR'
      ? portuguese.replace(/<div id="pt"[^>]*>/, '').replace(/<\/div>\s*$/, '')
      : english
  return part
    .replace(/<p class="meta"><a href="#pt">[^<]*<\/a><\/p>/, '')
    .replace(/<h1>[^<]*<\/h1>/, '')
}
