import type { AppEvent } from '@/db/events/types'

export const CHANNEL_NAME = 'ember-db'
export const LOCK_NAME = 'ember-db-leader'

/**
 * Domain-level cross-tab payload. Mutating call sites optionally attach one of
 * these so other tabs can update local in-memory state (Zustand, React Query)
 * after the leader's DB write succeeds.
 */
export type CrossTabPayload =
  | { kind: 'event'; event: AppEvent }
  | { kind: 'event-batch'; events: AppEvent[] }
  | { kind: 'invalidate'; tags: string[] }

export type SqlBindValue = string | number | boolean | null | Uint8Array
export type SqlBindParams = SqlBindValue[]

export type Statement = { sql: string; params?: SqlBindParams }

/**
 * Wire-level messages on the shared BroadcastChannel.
 *
 * - `request` / `response` carries SQL ops between followers and the leader.
 * - `broadcast` announces a state change after a successful write. Originating
 *   tab is identified by `originId` so the originator can skip its own message.
 * - `leader-ready` is posted once when a tab becomes leader (after migrations).
 * - `leader-probe` is sent by tabs that just opened to ask the current leader
 *   to re-announce itself.
 */
export type WireMessage =
  | RequestMessage
  | ResponseMessage
  | { type: 'broadcast'; originId: string; payload: CrossTabPayload }
  | { type: 'leader-ready'; leaderId: string }
  | { type: 'leader-probe' }

export type RequestBody =
  | { method: 'exec'; sql: string }
  | { method: 'run'; sql: string; params: SqlBindParams }
  | { method: 'getAll'; sql: string; params: SqlBindParams }
  | { method: 'getFirst'; sql: string; params: SqlBindParams }
  | { method: 'runBatchInTx'; statements: Statement[] }

export type RequestMessage = { type: 'request'; id: string } & RequestBody

export type ResponseMessage =
  | { type: 'response'; id: string; ok: true; result: unknown }
  | { type: 'response'; id: string; ok: false; error: string }

/**
 * Platform-agnostic DB API used by the app. Native wraps `SQLiteDatabase`;
 * web routes through the leader manager.
 *
 * Departure from `SQLiteDatabase`: `withTransactionAsync(fn)` is replaced by
 * `runBatchInTx(statements)` so the web proxy can send a transaction as a
 * single message instead of holding a remote transaction open across round
 * trips. The only existing caller (`emitBatch`) doesn't use intermediate
 * results inside the transaction.
 */
export type EmberDb = {
  execAsync(sql: string): Promise<void>
  runAsync(
    sql: string,
    params?: SqlBindParams,
  ): Promise<{ lastInsertRowId: number; changes: number }>
  getAllAsync<T>(sql: string, params?: SqlBindParams): Promise<T[]>
  getFirstAsync<T>(sql: string, params?: SqlBindParams): Promise<T | null>
  runBatchInTx(statements: Statement[]): Promise<void>
  closeAsync(): Promise<void>
}
