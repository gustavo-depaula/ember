// The recovery key, for whoever runs the relay.
//
//   node scripts/recovery.mjs new
//     Draws a key pair. The public half goes into the app's build as
//     EXPO_PUBLIC_SYNC_RECOVERY_KEY; the private half is kept offline and
//     nowhere near the relay. Without the public half the app makes no
//     recovery copies at all.
//
//   node scripts/recovery.mjs open <private key> <accounts.recovery value>
//     Opens one account's recovery copy and prints the account's secret,
//     which a new device can join with.
//
// Mirrors `sealFor` in apps/app/src/features/sync/keys.ts.
import { randomBytes } from 'node:crypto'
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js'
import { x25519 } from '@noble/curves/ed25519.js'
import { hkdf } from '@noble/hashes/hkdf.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'

const [command, privateKey, sealed] = process.argv.slice(2)

if (command === 'new') {
  const secretKey = new Uint8Array(randomBytes(32))
  console.log(`private (keep offline): ${bytesToHex(secretKey)}`)
  console.log(`public  (EXPO_PUBLIC_SYNC_RECOVERY_KEY): ${bytesToHex(x25519.getPublicKey(secretKey))}`)
} else if (command === 'open' && privateKey && sealed) {
  const secretKey = hexToBytes(privateKey)
  const [sender, body] = sealed.split('.')
  const shared = x25519.getSharedSecret(secretKey, hexToBytes(sender))
  const salt = hexToBytes(sender + bytesToHex(x25519.getPublicKey(secretKey)))
  const key = hkdf(sha256, shared, salt, utf8ToBytes('ember/pairing'), 36).subarray(0, 32)
  const bytes = new Uint8Array(Buffer.from(body, 'base64'))
  const plain = xchacha20poly1305(key, bytes.subarray(0, 24)).decrypt(bytes.subarray(24))
  console.log(new TextDecoder().decode(plain))
} else {
  console.error('usage: recovery.mjs new | open <private key> <sealed copy>')
  process.exit(1)
}
