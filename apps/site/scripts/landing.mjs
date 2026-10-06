// The landing page (apps/hearth/index.html) stands at the domain's root until
// the website is published. Then the website takes the root and the landing
// moves to `/app/`: its links into the website are written in where it marks
// them (`<!-- web:nav -->`, `<!-- web:hero -->`), and its own files, which it
// names relative to the root, are named from the root.
//   node scripts/landing.mjs <index.html> <app/index.html>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

// One anchor per language: each leads into that language's pages.
const pair = (cls, en, pt) =>
  `<a${cls} lang="en" href="/">${en}</a><a${cls} lang="pt-BR" href="/pt/">${pt}</a>`

const links = {
  nav: pair(' class="link"', 'Pray today', 'Rezar hoje'),
  hero: pair('', 'Pray on the web', 'Rezar na web'),
}

export function asAppPage(html) {
  return html
    .replace(/<!-- web:(nav|hero) -->/g, (_, slot) => links[slot])
    .replace(/((?:href|src)="|url\()(?=site\/|privacy\.html)/g, '$1/')
}

const [from, to] = process.argv.slice(2)
if (from && to) {
  mkdirSync(dirname(to), { recursive: true })
  writeFileSync(to, asAppPage(readFileSync(from, 'utf-8')))
}
