import react from '@vitejs/plugin-react'
import { createServer } from 'vite'
import { deskApi } from './api'
import { createD1 } from './d1'
import { createDesk } from './desk'
import { appRoot } from './paths'

// `pnpm moderation` — the Mass-times moderation desk, on this machine only. It reads and writes the
// production D1 through your wrangler login; pass --local to work on the `wrangler dev` database.

const target = process.argv.includes('--local') ? 'local' : 'remote'
const desk = createDesk(createD1(target))

const server = await createServer({
  root: appRoot,
  configFile: false,
  plugins: [react(), deskApi(desk)],
  server: { host: '127.0.0.1', port: Number(process.env.PORT ?? 4210), strictPort: true },
})
await server.listen()
process.stdout.write(`\n  Mass times desk (${target} D1)\n`)
server.printUrls()
