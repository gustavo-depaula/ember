/**
 * Cryptographic SHA-256 → lowercase hex. Uses expo-crypto so this works on
 * native (Hermes has no crypto.subtle) and web alike.
 */

import { CryptoDigestAlgorithm, CryptoEncoding, digestStringAsync } from 'expo-crypto'

export function sha256Hex(input: string): Promise<string> {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, input, {
    encoding: CryptoEncoding.HEX,
  })
}
