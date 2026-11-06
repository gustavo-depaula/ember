// Differential test: every Mass title of the Graduale, and every title in
// DO's own LiturgicalColor.t, coloured by both the Perl `liturgical_color` and
// the port. Skipped when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { doColor, liturgicalColorOf } from './liturgicalColor'
import { doClone, hasFixtures, repoRoot } from './node/testFixtures'

const perlTests = join(doClone, 't', 'DivinumOfficium', 'LiturgicalColor.t')
const graduale = join(repoRoot, 'content', 'chant-books', 'graduale.json')

function titles(): string[] {
  const fromTests = [
    ...readFileSync(perlTests, 'utf-8').matchAll(/liturgical_color\((['"])(.*?)\1\)/g),
  ].map((m) => m[2].replace(/\\x\{e6\}/g, 'æ'))
  const book = JSON.parse(readFileSync(graduale, 'utf-8')) as {
    sections: { title: { la?: string } }[]
  }
  const fromBook = book.sections.flatMap((s) => (s.title.la ? [s.title.la] : []))
  return [...new Set([...fromTests, ...fromBook])]
}

describe.skipIf(!hasFixtures || !existsSync(perlTests) || !existsSync(graduale))(
  'liturgical colour',
  () => {
    it('colours every title as the Perl does', () => {
      const all = titles()
      const perl = spawnSync(
        'perl',
        [
          `-I${join(doClone, 'web', 'cgi-bin')}`,
          '-MDivinumOfficium::Main=liturgical_color',
          '-CSD',
          '-ne',
          'chomp; print liturgical_color($_), "\\n"',
        ],
        { input: `${all.join('\n')}\n`, encoding: 'utf-8' },
      )
      expect(perl.status, perl.stderr).toBe(0)
      const expected = perl.stdout.trimEnd().split('\n')
      expect(all.map(doColor)).toEqual(expected)
      expect(all.length).toBeGreaterThan(400)
    })

    it('reads the display colours as vestments', () => {
      expect(liturgicalColorOf('Dominica XXIII Post Pentecosten')).toBe('green')
      expect(liturgicalColorOf('In Assumptione Beatæ Mariæ Virginis')).toBe('white')
      expect(liturgicalColorOf('Feria Sexta in Passione et Morte Domini')).toBe('black')
      expect(liturgicalColorOf('Dominica III Adventus')).toBe('rose')
      expect(liturgicalColorOf('Dominica I Adventus')).toBe('violet')
    })
  },
)
