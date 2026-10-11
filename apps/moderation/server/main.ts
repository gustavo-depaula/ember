import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { createServer, type Plugin } from 'vite'
import { deskApi } from './api'
import { createD1 } from './d1'
import { createDesk } from './desk'
import { appRoot, dataDir } from './paths'
import { openStore } from './store'

// `pnpm moderation` — the Mass-times moderation desk, on this machine only. It reads and writes the
// production D1 through your wrangler login; pass --local to work on the `wrangler dev` database,
// and --lan to reach the desk from another device on your network (a phone).

const target = process.argv.includes('--local') ? 'local' : 'remote'
const lan = process.argv.includes('--lan')
const port = Number(process.env.PORT ?? 4210)
openStore(target)
const desk = createDesk(createD1(target), `http://127.0.0.1:${port}`)

// The desk writes to the database with no login of its own, which is fine while only this machine
// can reach it. On the network every request from another device has to carry the desk's key: it
// arrives once in the link printed below and stays in a cookie. The key is made on first use and
// kept in .data, so a restart doesn't strand a phone that already has the link.
function lanGate(key: string): Plugin {
  return {
    name: 'ember-desk-lan-gate',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const from = req.socket.remoteAddress ?? ''
        if (['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(from)) return next()
        if (req.headers.cookie?.split(/;\s*/).includes(`desk_key=${key}`)) return next()

        const url = new URL(req.url ?? '/', 'http://desk')
        if (url.searchParams.get('key') !== key) {
          res.writeHead(401, { 'Content-Type': 'text/plain' })
          res.end('Open the desk with the link printed in the terminal that started it.')
          return
        }
        res.writeHead(302, {
          'Set-Cookie': `desk_key=${key}; Path=/; HttpOnly; SameSite=Strict`,
          Location: url.pathname,
        })
        res.end()
      })
    },
  }
}

const keyFile = path.join(dataDir, 'lan-key')
if (lan && !existsSync(keyFile)) {
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(keyFile, randomBytes(12).toString('base64url'), { mode: 0o600 })
}
const key = lan ? readFileSync(keyFile, 'utf8').trim() : ''
const server = await createServer({
  root: appRoot,
  configFile: false,
  plugins: [...(lan ? [lanGate(key)] : []), react(), deskApi(desk)],
  server: { host: lan ? '0.0.0.0' : '127.0.0.1', port, strictPort: true },
})
await server.listen()

process.stdout.write(`\n  Mass times desk (${target} D1)\n  ➜  http://127.0.0.1:${port}/\n`)
if (lan) {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address?.family === 'IPv4' && !address.internal)
  for (const address of addresses) {
    process.stdout.write(`  ➜  http://${address?.address}:${port}/?key=${key}\n`)
  }
}
