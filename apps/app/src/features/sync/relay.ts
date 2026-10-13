import type {
  AccountView,
  AnalyticsBatch,
  Gone,
  Pairing,
  PairingState,
  Profile,
  Pulled,
  SealedEvent,
} from '@ember/relay'
import { logFormat } from '@ember/relay'

// Overridable so a dev build can point at `wrangler dev` while relay changes are unreleased.
const baseUrl = process.env.EXPO_PUBLIC_RELAY_URL ?? 'https://ember-relay.dpgu.workers.dev'

/** A refusal from the relay. `status` 0: it could not be reached at all. */
export type RelayError = Error & { status: number; gone?: Gone['gone'] }

export function isRelayError(err: unknown): err is RelayError {
  return err instanceof Error && typeof (err as RelayError).status === 'number'
}

async function call<T>(method: string, path: string, token?: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Log-Format': String(logFormat),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch((err: unknown) => {
    throw Object.assign(new Error(`relay unreachable: ${String(err)}`), { status: 0 })
  })
  if (res.ok) return (await res.json()) as T
  const told = res.status === 410 ? ((await res.json()) as Gone) : undefined
  throw Object.assign(new Error(`relay ${method} ${path.split('/')[1]} → ${res.status}`), {
    status: res.status,
    gone: told?.gone,
  })
}

type Device = { id: string; token: string }

export const relay = {
  createAccount: (account: string, auth: string, device: Device) =>
    call('POST', '/accounts', undefined, { account, auth, format: logFormat, device }),
  addDevice: (account: string, auth: string, device: Device) =>
    call('POST', `/accounts/${account}/devices`, auth, device),
  view: (account: string, token: string) =>
    call<AccountView>('GET', `/accounts/${account}/view`, token),
  saveProfile: (account: string, token: string, profile: Profile & { recovery: string | null }) =>
    call('PUT', `/accounts/${account}/profile`, token, profile),
  push: (account: string, token: string, events: SealedEvent[]) =>
    call<{ stored: number }>('POST', `/accounts/${account}/events`, token, { events }),
  pull: (account: string, token: string, after: number) =>
    call<Pulled>('GET', `/accounts/${account}/events?after=${after}`, token),
  removeDevice: (account: string, token: string, device: string) =>
    call('DELETE', `/accounts/${account}/devices/${device}`, token),
  deleteAccount: (account: string, token: string) => call('DELETE', `/accounts/${account}`, token),

  askToPair: (key: string) => call<Pairing>('POST', '/pairings', undefined, { key }),
  pairingByCode: (code: string) =>
    call<{ id: string; key: string }>('GET', `/pairings/code/${code}`),
  answerPairing: (id: string, answerKey: string, sealed?: string) =>
    call('PUT', `/pairings/${id}`, undefined, { answerKey, sealed }),
  pairingState: (id: string) => call<PairingState>('GET', `/pairings/${id}`),

  sendUsage: (batch: AnalyticsBatch) => call('POST', '/analytics', undefined, batch),
}
