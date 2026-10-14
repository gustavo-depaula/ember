// The relay makes its own tables on first use, so a deploy is the whole of
// setting it up. Every statement is safe to run again.
export const tables = [
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    auth_hash TEXT NOT NULL,
    format INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    bytes INTEGER NOT NULL DEFAULT 0,
    name TEXT, email TEXT, phone TEXT, birthday TEXT,
    news INTEGER NOT NULL DEFAULT 0,
    recovery TEXT,
    deleted_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS devices (
    account TEXT NOT NULL,
    id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    seen_at INTEGER NOT NULL,
    removed_at INTEGER,
    PRIMARY KEY (account, id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_devices_token ON devices (account, token_hash)',
  `CREATE TABLE IF NOT EXISTS events (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    account TEXT NOT NULL,
    key TEXT NOT NULL,
    device TEXT NOT NULL,
    body TEXT NOT NULL,
    UNIQUE (account, key)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_events_account ON events (account, seq)',
  `CREATE TABLE IF NOT EXISTS pairings (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    key TEXT NOT NULL,
    answer_key TEXT,
    sealed TEXT,
    expires_at INTEGER NOT NULL
  )`,
  // Usage counts. Nothing here names an account or a device of one.
  `CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    install TEXT NOT NULL,
    platform TEXT NOT NULL,
    version TEXT NOT NULL,
    language TEXT NOT NULL,
    name TEXT NOT NULL,
    props TEXT,
    hour INTEGER,
    build TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS idx_analytics_day ON analytics (day, name)',
  'CREATE INDEX IF NOT EXISTS idx_analytics_install ON analytics (install, day)',
]

// Columns added after a table was first made. SQLite has no ADD COLUMN IF NOT
// EXISTS, so each is added only where pragma_table_info lacks it.
const added = [
  ['analytics', 'hour', 'INTEGER'],
  ['analytics', 'build', 'TEXT'],
]

async function addColumns(db: D1Database): Promise<void> {
  for (const [table, column, type] of added) {
    const has = await db
      .prepare('SELECT 1 FROM pragma_table_info(?) WHERE name = ?')
      .bind(table, column)
      .first()
    if (!has) await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run()
  }
}

let made: Promise<unknown> | undefined

export function ensureSchema(db: D1Database): Promise<unknown> {
  made ??= db
    .batch(tables.map((sql) => db.prepare(sql)))
    .then(() => addColumns(db))
    .catch((err) => {
      made = undefined
      throw err
    })
  return made
}
