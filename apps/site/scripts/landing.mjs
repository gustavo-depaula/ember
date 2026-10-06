// The landing page (apps/hearth/index.html) and the website are published
// together. The landing marks where its links into the website go
// (`<!-- web:nav -->`, `<!-- web:hero -->`); they are written in only when the
// website is published beside it, so the landing alone never links to nothing.
//   node scripts/landing.mjs <index.html>   rewrites the file in place
import { readFileSync, writeFileSync } from 'node:fs'

// One anchor per language: each leads into that language's pages.
const pair = (cls, en, pt) =>
  `<a${cls} lang="en" href="today/">${en}</a><a${cls} lang="pt-BR" href="pt/hoje/">${pt}</a>`

const links = {
  nav: pair(' class="link"', 'Pray today', 'Rezar hoje'),
  hero: pair('', 'Pray on the web', 'Rezar na web'),
}

export function withWebLinks(html) {
  return html.replace(/<!-- web:(nav|hero) -->/g, (_, slot) => links[slot])
}

if (process.argv[2]) {
  writeFileSync(process.argv[2], withWebLinks(readFileSync(process.argv[2], 'utf-8')))
}
