import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Metro lets `.sql` files be imported as strings. Vite/Rolldown doesn't, so
// app code that does `import migration from './x.sql'` blows up at parse
// time. Tiny plugin: load any `.sql` import as a default-exported string.
const sqlAsStringPlugin = {
  name: 'sql-as-string',
  enforce: 'pre' as const,
  load(id: string) {
    if (!id.endsWith('.sql')) return undefined
    const src = readFileSync(id, 'utf-8')
    return `export default ${JSON.stringify(src)}`
  },
}

export default defineConfig({
  plugins: [sqlAsStringPlugin],
  define: {
    __DEV__: 'true',
    'process.env.TAMAGUI_TARGET': '"web"',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'react-native': 'react-native-web',
    },
    conditions: ['browser', 'module', 'import', 'default'],
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // Above the 10s asyncUtilTimeout in src/test/setup.ts, so a stuck
    // `findBy*` reports testing-library's element-not-found (with a DOM
    // dump) rather than being killed first by vitest's generic timeout.
    testTimeout: 20_000,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: [/tamagui/, /@tamagui/, /moti/, /solito/, /expo/, /@expo/, /react-native/],
      },
    },
  },
})
