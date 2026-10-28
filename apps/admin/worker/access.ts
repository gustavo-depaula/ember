import type { Env } from './env'

// Who is asking. The panel writes to the directory, so every address it answers on sits behind
// Cloudflare Access, and the Worker checks the token Access signs for each request it lets
// through: an address Access was never told about (or a policy someone loosened) then gets a
// refusal instead of the panel.

type Jwk = JsonWebKey & { kid: string }
const keys = new Map<string, { at: number; keys: Jwk[] }>()

async function signingKeys(team: string): Promise<Jwk[]> {
  const cached = keys.get(team)
  // Access rotates its keys every few weeks and publishes the next one ahead of time.
  if (cached && Date.now() - cached.at < 60 * 60 * 1000) return cached.keys
  const response = await fetch(`https://${team}/cdn-cgi/access/certs`)
  if (!response.ok) throw new Error(`Could not read the Access keys of ${team}.`)
  const fresh = ((await response.json()) as { keys: Jwk[] }).keys
  keys.set(team, { at: Date.now(), keys: fresh })
  return fresh
}

function decode(part: string): Uint8Array<ArrayBuffer> {
  const binary = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

// The email Access vouches for, or why the request is refused.
export async function identify(request: Request, env: Env): Promise<{ email: string } | string> {
  const team = env.ACCESS_TEAM_DOMAIN
  const audience = env.ACCESS_AUD
  if (!team || !audience) {
    // `wrangler dev` on this machine. A deployed Worker is never reached as localhost.
    const { hostname } = new URL(request.url)
    if (hostname === 'localhost' || hostname === '127.0.0.1') return { email: 'local' }
    return 'This panel has no Cloudflare Access application configured, so it answers nobody.'
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) return 'Open the panel through its Cloudflare Access login.'
  const [head, body, signature] = token.split('.')
  if (!head || !body || !signature) return 'The Access token is malformed.'
  const { kid, alg } = JSON.parse(text(decode(head))) as { kid?: string; alg?: string }
  const jwk = (await signingKeys(team)).find((key) => key.kid === kid)
  if (!jwk || alg !== 'RS256')
    return 'The Access token is signed with a key this team does not hold.'

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const signed = new TextEncoder().encode(`${head}.${body}`)
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(signature), signed))) {
    return 'The Access token has a bad signature.'
  }
  const claims = JSON.parse(text(decode(body))) as {
    aud?: string | string[]
    exp?: number
    iss?: string
    email?: string
  }
  if (![claims.aud].flat().includes(audience)) return 'The Access token is for another application.'
  if (claims.iss !== `https://${team}`) return 'The Access token is from another team.'
  if (!claims.exp || claims.exp * 1000 < Date.now()) return 'The Access login has expired.'
  if (!claims.email) return 'The Access token names nobody.'
  return { email: claims.email }
}
