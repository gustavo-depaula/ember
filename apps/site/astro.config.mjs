// Liturgical dates are local dates; a build is the same wherever it runs.
process.env.TZ ??= 'America/Sao_Paulo'

import { defineConfig } from 'astro/config'
import { devCorpus, platformSeam, rruleEsm } from './seam.mjs'

export default defineConfig({
  site: process.env.EMBER_SITE_URL ?? 'https://ember.dpgu.me',
  compressHTML: true,
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: {
    plugins: [platformSeam(), devCorpus()],
    define: {
      __DEV__: 'false',
      // Read by the account code the browser runs (features/sync); unset means production.
      'process.env.EXPO_PUBLIC_RELAY_URL': process.env.EMBER_RELAY_URL
        ? JSON.stringify(process.env.EMBER_RELAY_URL)
        : 'undefined',
      'process.env.EXPO_PUBLIC_SYNC_RECOVERY_KEY': 'undefined',
    },
    resolve: { alias: { rrule: rruleEsm } },
  },
})
