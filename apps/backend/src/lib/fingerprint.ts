// Fingerprint for abuse control + verify dedup — NOT identity. Hash of the request IP plus an
// optional client-supplied stable id (§7.1 leaves the exact mechanism open; this supports both).
export async function computeFingerprint(
  ip: string | undefined,
  clientId: string | undefined,
): Promise<string> {
  const data = new TextEncoder().encode(`${ip ?? 'unknown'}:${clientId ?? ''}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}
