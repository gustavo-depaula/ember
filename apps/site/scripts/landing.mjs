// The landing page (apps/hearth/index.html) stands at the domain's root until
// the website is published. Then the website takes the root and the landing
// moves to `/app/` and `/pt/app/`: its links into the website are written in
// where it marks them (`<!-- web:nav -->`, `<!-- web:hero -->`), its head
// (`<!-- head -->`) is written for the language it opens in, and its own files,
// which it names relative to the root, are named from the root.
//   node scripts/landing.mjs <index.html> <site dir>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const site = process.env.EMBER_SITE_URL ?? 'https://ember.dpgu.me'
const analyticsToken = process.env.EMBER_SITE_ANALYTICS_TOKEN

/** Where each language's copy is published. */
export const landingPaths = { en: '/app/', pt: '/pt/app/' }

// One anchor per language: each leads into that language's pages.
const pair = (cls, en, pt) =>
  `<a${cls} lang="en" href="/">${en}</a><a${cls} lang="pt-BR" href="/pt/">${pt}</a>`

const links = {
  nav: pair(' class="link"', 'Pray today', 'Rezar hoje'),
  hero: pair('', 'Pray on the web', 'Rezar na web'),
}

const heads = {
  en: {
    lang: 'en',
    locale: 'en_US',
    title: 'Ember — Catholic prayer',
    description:
      'Pray the Rosary, the Mass and the Hours. Keep a plan of life. Read the saints. A Catholic prayer app in English and Brazilian Portuguese.',
    card: 'Pray the Rosary, the Mass and the Hours. Keep a plan of life. Read the saints. Free on iPhone and Android.',
  },
  pt: {
    lang: 'pt-BR',
    locale: 'pt_BR',
    title: 'Ember — Oração católica',
    description:
      'Reze o Terço, a Missa e a Liturgia das Horas. Guarde um plano de vida. Leia os santos. Um aplicativo de oração católica em português e inglês.',
    card: 'Reze o Terço, a Missa e a Liturgia das Horas. Guarde um plano de vida. Leia os santos. Grátis no iPhone e no Android.',
  },
}

// A chat reads these to unfold the link: the card is drawn by the website's
// build (src/pages/share/[lang]/app.astro), 1200×630 so it shows full width.
function head(lang) {
  const h = heads[lang]
  const url = site + landingPaths[lang]
  const image = `${site}/share/${lang}/app.jpg`
  return [
    `<title>${h.title}</title>`,
    `<meta name="description" content="${h.description}">`,
    `<link rel="canonical" href="${url}">`,
    ...Object.entries(landingPaths).map(
      ([l, path]) => `<link rel="alternate" hreflang="${heads[l].lang}" href="${site}${path}">`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${site}${landingPaths.en}">`,
    '<meta property="og:site_name" content="Ember">',
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${h.title}">`,
    `<meta property="og:description" content="${h.card}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:locale" content="${h.locale}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    ...(analyticsToken
      ? [
          `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${analyticsToken}"}'></script>`,
        ]
      : []),
  ]
    .map((tag) => `  ${tag}`)
    .join('\n')
}

export function asAppPage(html, lang = 'en') {
  return html
    .replace(/<!-- web:(nav|hero) -->/g, (_, slot) => links[slot])
    .replace(/ {2}<!-- head -->[\s\S]*?<!-- \/head -->/, head(lang))
    .replace(/<html lang="en" data-lang="en">/, `<html lang="${heads[lang].lang}" data-lang="${lang}">`)
    .replace(/((?:href|src)="|url\()(?=site\/|privacy\.html|support\.html)/g, '$1/')
}

const [from, to] = process.argv.slice(2)
if (from && to) {
  const html = readFileSync(from, 'utf-8')
  for (const [lang, path] of Object.entries(landingPaths)) {
    mkdirSync(join(to, path), { recursive: true })
    writeFileSync(join(to, path, 'index.html'), asAppPage(html, lang))
  }
}
