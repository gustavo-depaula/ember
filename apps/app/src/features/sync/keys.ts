import { xchacha20poly1305 } from '@noble/ciphers/chacha.js'
import { x25519 } from '@noble/curves/ed25519.js'
import { hkdf } from '@noble/hashes/hkdf.js'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'
import { getRandomBytes } from 'expo-crypto'

// An account is one random secret. Everything a device presents to the relay
// and everything it locks the log with is derived from it, each for one
// purpose, so nothing the relay is shown lets it work out anything else.

export type AccountKeys = {
  /** What the relay knows the account by. */
  account: string
  /** Shown to the relay to add a device. */
  auth: string
  /** Seals each event. Never leaves the device. */
  seal: Uint8Array
  /** Turns an event id into the key the relay files it under. */
  file: Uint8Array
}

function derive(secret: Uint8Array, purpose: string, length = 32): Uint8Array {
  return hkdf(sha256, secret, undefined, utf8ToBytes(`ember/${purpose}`), length)
}

/** Hex of `count` random bytes. */
export function randomHex(count: number): string {
  return bytesToHex(getRandomBytes(count))
}

export function newSecret(): string {
  return randomHex(32)
}

export function accountKeys(secret: string): AccountKeys {
  const bytes = hexToBytes(secret)
  return {
    account: bytesToHex(derive(bytes, 'account', 16)),
    auth: bytesToHex(derive(bytes, 'auth')),
    seal: derive(bytes, 'log'),
    file: derive(bytes, 'file'),
  }
}

// Base64 by hand: Hermes has neither Buffer nor Uint8Array.toBase64.
function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

function fromBase64(text: string): Uint8Array {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** `text` locked with `key`, a fresh nonce in front. */
export function seal(key: Uint8Array, text: string): string {
  const nonce = getRandomBytes(24)
  return toBase64(concatBytes(nonce, xchacha20poly1305(key, nonce).encrypt(utf8ToBytes(text))))
}

/** Throws when `sealed` was not locked with `key`, or was altered since. */
export function open(key: Uint8Array, sealed: string): string {
  const bytes = fromBase64(sealed)
  const plain = xchacha20poly1305(key, bytes.subarray(0, 24)).decrypt(bytes.subarray(24))
  return new TextDecoder().decode(plain)
}

export function fileKey(keys: AccountKeys, eventId: string): string {
  return bytesToHex(hmac(sha256, keys.file, utf8ToBytes(eventId)))
}

// ── Pairing ───────────────────────────────────────────────────────────────
// Two devices each make a key pair for one pairing and swap the public halves
// through the relay. What they then share, the relay cannot compute.

export type PairingKeys = { secretKey: Uint8Array; publicKey: string }

export function newPairingKeys(): PairingKeys {
  const secretKey = getRandomBytes(32)
  return { secretKey, publicKey: bytesToHex(x25519.getPublicKey(secretKey)) }
}

export type PairingBond = {
  key: Uint8Array
  /** Four digits both devices can show, the same only if they hold the same bond. */
  check: string
}

/** The bond between the asking device's key and the answering one's, the same from either side. */
export function pairingBond(mine: PairingKeys, theirs: string, asker: string): PairingBond {
  const shared = x25519.getSharedSecret(mine.secretKey, hexToBytes(theirs))
  const answerer = asker === mine.publicKey ? theirs : mine.publicKey
  const salt = hexToBytes(asker + answerer)
  const material = hkdf(sha256, shared, salt, utf8ToBytes('ember/pairing'), 36)
  const number = new DataView(material.buffer, material.byteOffset + 32, 4).getUint32(0)
  return { key: material.subarray(0, 32), check: String(number % 10_000).padStart(4, '0') }
}

/** `text` locked so that only the holder of `recipient`'s secret half can open it. */
export function sealFor(recipient: string, text: string): string {
  const sender = newPairingKeys()
  const { key } = pairingBond(sender, recipient, sender.publicKey)
  return `${sender.publicKey}.${seal(key, text)}`
}
