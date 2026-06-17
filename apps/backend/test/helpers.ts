import { env } from 'cloudflare:test'

// DELETE the given tables in order (pass children before parents for FK; FTS triggers keep
// church_fts in sync on church deletes). Each suite passes only the tables it touches.
export async function resetTables(...tables: string[]) {
  for (const table of tables) {
    await env.DB.prepare(`DELETE FROM ${table}`).run()
  }
}
