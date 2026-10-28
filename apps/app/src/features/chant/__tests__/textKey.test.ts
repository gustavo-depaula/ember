import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { massPieces, pieceKey } from '../textKey'

// Written by `python3 scripts/chant_link.py` from the Missal in content/do: what
// the corpus build finds in a section is what the app must find in it too, or
// a proper's chant is filed under a key the app never asks for.
type Vector = { place: string; head: string; lines: string[]; pieces: [string, string][] }
const vectors: Vector[] = JSON.parse(
  readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../../scripts/chant-link-vectors.json',
    ),
    'utf8',
  ),
)

describe('massPieces', () => {
  it('finds in a section of the Missal the pieces and keys the corpus build files', () => {
    expect(vectors.length).toBeGreaterThan(50)
    for (const { place, head, lines, pieces } of vectors) {
      const found = massPieces(head, lines).map((piece) => [piece.genre, pieceKey(piece)])
      expect(found, place).toEqual(pieces)
    }
  })

  it('splits a Lenten Graduale into its gradual and its tract', () => {
    const pieces = massPieces('Graduale', [
      '!Ps 90:11-12',
      'Angelis suis Deus mandávit de te, ut custódiant te in ómnibus viis tuis.',
      'V. In mánibus portábunt te, ne umquam offéndas ad lápidem pedem tuum.',
      '_',
      '!Tractus',
      '!Ps 90:1-7',
      'Qui hábitat in adjutório Altíssimi, in protectióne Dei cœli commorántur.',
    ])
    expect(pieces.map((p) => [p.genre, pieceKey(p).slice(0, 12)])).toEqual([
      ['gr', 'angelissuisd'],
      ['tr', 'quihabitatin'],
    ])
  })
})
