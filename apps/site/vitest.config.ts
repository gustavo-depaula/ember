import { defineConfig } from 'vitest/config'
import { platformSeam, rruleEsm } from './seam.mjs'

export default defineConfig({
  plugins: [platformSeam()],
  define: { __DEV__: 'false' },
  resolve: { alias: { rrule: rruleEsm } },
  test: { include: ['src/**/*.test.ts'], testTimeout: 60_000 },
})
