import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  accountKeys,
  fileKey,
  newPairingKeys,
  newSecret,
  open,
  pairingBond,
  seal,
  sealFor,
} from '../keys'

describe('account keys', () => {
  it('seals an event only the account can open', () => {
    const mine = accountKeys(newSecret())
    const sealed = seal(mine.seal, '{"type":"ItemSaved","note":"São José"}')
    expect(sealed).not.toContain('ItemSaved')
    expect(open(mine.seal, sealed)).toBe('{"type":"ItemSaved","note":"São José"}')
    expect(() => open(accountKeys(newSecret()).seal, sealed)).toThrow()
  })

  it('files an event under the same key on every device, and shows the relay nothing of its id', () => {
    const secret = newSecret()
    const id = '1760000000000-0000-abcdefgh'
    expect(fileKey(accountKeys(secret), id)).toBe(fileKey(accountKeys(secret), id))
    expect(fileKey(accountKeys(secret), id)).not.toContain('1760000000000')
    expect(fileKey(accountKeys(newSecret()), id)).not.toBe(fileKey(accountKeys(secret), id))
  })
})

describe('pairing', () => {
  it('gives both devices one bond, and a stranger another', () => {
    const asker = newPairingKeys()
    const answerer = newPairingKeys()
    const asked = pairingBond(asker, answerer.publicKey, asker.publicKey)
    const answered = pairingBond(answerer, asker.publicKey, asker.publicKey)
    expect(answered.check).toBe(asked.check)
    expect(open(asked.key, seal(answered.key, 'secret'))).toBe('secret')

    const stranger = pairingBond(newPairingKeys(), asker.publicKey, asker.publicKey)
    expect(() => open(asked.key, seal(stranger.key, 'secret'))).toThrow()
  })
})

describe('a recovery copy', () => {
  it("opens with the relay keeper's script and private key", () => {
    const script = path.resolve(process.cwd(), '../relay/scripts/recovery.mjs')
    const drawn = execFileSync('node', [script, 'new'], { encoding: 'utf8' })
    const [privateKey, publicKey] = [...drawn.matchAll(/: ([0-9a-f]{64})/g)].map((m) => m[1])
    const secret = newSecret()
    const copy = sealFor(publicKey, secret)
    expect(copy).not.toContain(secret)
    const opened = execFileSync('node', [script, 'open', privateKey, copy], { encoding: 'utf8' })
    expect(opened.trim()).toBe(secret)
  })
})
