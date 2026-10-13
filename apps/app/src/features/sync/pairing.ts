import { accountKeys, newPairingKeys, open, type PairingKeys, pairingBond, seal } from './keys'
import { isRelayError, relay } from './relay'
import { useSync } from './state'

// Bringing a new device into an account. The new device asks: it shows a QR
// code and a short code, and waits. A device of the account answers, by
// scanning the one or typing the other, and hands over the account's secret
// sealed so only the asking device can open it.
//
// A scanned code carries the asking device's key straight from its screen. A
// typed one fetches that key through the relay, so the two devices then show
// a number to compare: it matches only if they really hold each other's keys,
// which a mistyped code that happens to be someone else's would not give.

const qrPrefix = 'ember-pair:'

export type Asking = {
  id: string
  code: string
  qr: string
  expiresAt: number
  keys: PairingKeys
}

export async function askToJoin(): Promise<Asking> {
  const keys = newPairingKeys()
  const pairing = await relay.askToPair(keys.publicKey)
  return { ...pairing, keys, qr: `${qrPrefix}${pairing.id}:${keys.publicKey}` }
}

/**
 * Waits for a device of the account to answer. `onCheck` gets the number to
 * compare when the answer came by typed code. Resolves to the account's
 * secret, or undefined once `stopped()` says to give up or the code has lapsed.
 */
export async function waitForAnswer(
  asking: Asking,
  onCheck: (check: string) => void,
  stopped: () => boolean,
): Promise<string | undefined> {
  let shown = false
  while (!stopped() && Date.now() < asking.expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const state = await relay.pairingState(asking.id).catch((err: unknown) => {
      // Unreachable for a moment is not the end of a pairing; gone is.
      if (isRelayError(err) && err.status !== 404) return undefined
      throw err
    })
    if (!state?.answerKey) continue
    const bond = pairingBond(asking.keys, state.answerKey, asking.keys.publicKey)
    if (state.sealed) return open(bond.key, state.sealed)
    if (!shown) {
      shown = true
      onCheck(bond.check)
    }
  }
  return undefined
}

export type Answer = {
  /** The number the asking device shows too. Only a typed code needs it compared. */
  check: string
  /** Hands the account over. */
  confirm: () => Promise<void>
}

function answer(id: string, askerKey: string): { answerKey: string } & Answer {
  const { account } = useSync.getState()
  if (!account) throw new Error('This device has no account')
  // Deriving the keys checks the secret is whole before it is sent anywhere.
  accountKeys(account.secret)
  const keys = newPairingKeys()
  const bond = pairingBond(keys, askerKey, askerKey)
  return {
    answerKey: keys.publicKey,
    check: bond.check,
    confirm: async () => {
      await relay.answerPairing(id, keys.publicKey, seal(bond.key, account.secret))
    },
  }
}

/** What a scanned QR code asks for, if it is one of ours. */
export function readQr(text: string): { id: string; key: string } | undefined {
  if (!text.startsWith(qrPrefix)) return undefined
  const [id, key] = text.slice(qrPrefix.length).split(':')
  return id && key?.length === 64 ? { id, key } : undefined
}

/** Answers a scanned code at once: the key came from the other screen itself. */
export async function answerScanned(scanned: { id: string; key: string }): Promise<void> {
  await answer(scanned.id, scanned.key).confirm()
}

/** Answers a typed code as far as showing the number; `confirm` once the person says it matches. */
export async function answerTyped(code: string): Promise<Answer> {
  const found = await relay.pairingByCode(code.replace(/\D/g, ''))
  const { answerKey, ...rest } = answer(found.id, found.key)
  await relay.answerPairing(found.id, answerKey)
  return rest
}
