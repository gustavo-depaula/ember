import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The page only. `wrangler dev` serves what this builds, beside the Worker; run `vite` next to it
// when working on the page itself.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:4210' } },
})
