import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { inlineParams } from '@ember/backend/src/lib/import'
import { getTableColumns, type InferSelectModel } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { backendDir } from './paths'

// The desk's only road to the database is the operator's own wrangler login: the Worker exposes no
// admin routes and holds no admin secret. `local` is the D1 that `wrangler dev` keeps under
// apps/backend/.wrangler.

const run = promisify(execFile)
const database = 'ember-mass-times'

export type Target = 'remote' | 'local'
export type Row = Record<string, unknown>
export type D1 = ReturnType<typeof createD1>

// wrangler takes SQL text with no bound parameters, so every value is inlined as a literal.
export function lit(value: unknown): string {
  return inlineParams('?', [value])
}

// A raw D1 row (snake_case, JSON as text) as the model Drizzle would have returned.
export function fromRow<T extends SQLiteTable>(table: T, row: Row): InferSelectModel<T> {
  return Object.fromEntries(
    Object.entries(getTableColumns(table)).map(([key, column]) => {
      const value = row[column.name]
      return [key, value === null || value === undefined ? null : column.mapFromDriverValue(value)]
    }),
  ) as InferSelectModel<T>
}

export function createD1(target: Target) {
  async function wrangler(args: string[]): Promise<Row[][]> {
    const { stdout } = await run(
      'pnpm',
      ['exec', 'wrangler', 'd1', 'execute', database, `--${target}`, '--json', ...args],
      { cwd: backendDir, maxBuffer: 256 * 1024 * 1024 },
    ).catch((error: { stdout?: string; stderr?: string; message: string }) => {
      throw new Error(wranglerError(error.stdout) ?? error.stderr?.trim() ?? error.message)
    })
    const parsed = JSON.parse(stdout) as Array<{ results?: Row[] }>
    return parsed.map((statement) => statement.results ?? [])
  }

  // One result set per statement; statements sent together run as one batch.
  function query(...statements: string[]): Promise<Row[][]> {
    return wrangler(['--command', statements.join(';\n')])
  }

  async function execute(statements: string[]): Promise<void> {
    const sql = statements.join(';\n')
    // A whole church row can outgrow what fits in one argv entry (128 kB on Linux); wrangler reads
    // the long ones from a file.
    if (Buffer.byteLength(sql) < 60_000) {
      await wrangler(['--command', sql])
      return
    }
    const dir = await mkdtemp(path.join(os.tmpdir(), 'ember-desk-'))
    try {
      const file = path.join(dir, 'apply.sql')
      await writeFile(file, `${sql};\n`)
      await wrangler(['--yes', '--file', file])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }

  return { target, query, execute }
}

// With --json wrangler reports a failure as `{ "error": { "text" } }` on stdout.
function wranglerError(stdout: string | undefined): string | undefined {
  if (!stdout) return undefined
  try {
    return (JSON.parse(stdout) as { error?: { text?: string } }).error?.text
  } catch {
    return stdout.trim() || undefined
  }
}
