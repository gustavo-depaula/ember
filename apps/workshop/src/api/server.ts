import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin, ViteDevServer } from 'vite'

// Resolve the content/libraries directory relative to the monorepo root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monoRoot = path.resolve(__dirname, '../../../..')
const defaultContentRoot = path.join(monoRoot, 'content', 'libraries')

function jsonResponse(res: import('node:http').ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function errorResponse(res: import('node:http').ServerResponse, message: string, status = 500) {
  jsonResponse(res, { error: message }, status)
}

async function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function safeReadJson(filePath: string): unknown | undefined {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function safeReadText(filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return undefined
  }
}

export function contentApiPlugin(): Plugin {
  return {
    name: 'workshop-content-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const route = url.replace(/\?.*$/, '')
        const contentRoot = defaultContentRoot

        handleRoute(route, req, res, contentRoot).catch((err) => {
          console.error('API error:', err)
          errorResponse(res, String(err))
        })
      })
    },
  }
}

async function handleRoute(
  route: string,
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse,
  contentRoot: string,
) {
  const method = req.method ?? 'GET'

  // GET /api/libraries — list all libraries
  if (route === '/api/libraries' && method === 'GET') {
    const entries = fs.readdirSync(contentRoot, { withFileTypes: true })
    const libraries = []
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const libJsonPath = path.join(contentRoot, entry.name, 'library.json')
      const manifest = safeReadJson(libJsonPath)
      if (manifest) {
        libraries.push(manifest)
      }
    }
    return jsonResponse(res, libraries)
  }

  // GET /api/libraries/:id — single library with full inventory
  const libMatch = route.match(/^\/api\/libraries\/([^/]+)$/)
  if (libMatch && method === 'GET') {
    const libId = libMatch[1] ?? ''
    const libDir = path.join(contentRoot, libId)
    const manifest = safeReadJson(path.join(libDir, 'library.json'))
    if (!manifest) return errorResponse(res, 'Library not found', 404)

    // Scan practices
    const practicesDir = path.join(libDir, 'practices')
    const practices: unknown[] = []
    if (fs.existsSync(practicesDir)) {
      for (const d of fs.readdirSync(practicesDir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue
        const m = safeReadJson(path.join(practicesDir, d.name, 'manifest.json'))
        if (m) practices.push(m)
      }
    }

    // Scan prayers
    const prayersDir = path.join(libDir, 'prayers')
    const prayers: unknown[] = []
    if (fs.existsSync(prayersDir)) {
      for (const f of fs.readdirSync(prayersDir)) {
        if (!f.endsWith('.json')) continue
        const p = safeReadJson(path.join(prayersDir, f))
        if (p) prayers.push({ id: f.replace('.json', ''), ...(p as object) })
      }
    }

    // Scan books
    const booksDir = path.join(libDir, 'books')
    const books: unknown[] = []
    if (fs.existsSync(booksDir)) {
      for (const d of fs.readdirSync(booksDir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue
        const b = safeReadJson(path.join(booksDir, d.name, 'book.json'))
        if (b) books.push(b)
      }
    }

    // Scan chapters
    const chaptersDir = path.join(libDir, 'chapters')
    const chapters: unknown[] = []
    if (fs.existsSync(chaptersDir)) {
      for (const d of fs.readdirSync(chaptersDir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue
        const c = safeReadJson(path.join(chaptersDir, d.name, 'chapter.json'))
        if (c) chapters.push(c)
      }
    }

    return jsonResponse(res, {
      ...(manifest as object),
      _practices: practices,
      _prayers: prayers,
      _books: books,
      _chapters: chapters,
    })
  }

  // GET /api/libraries/:libId/practices/:practiceId/manifest
  const manifestMatch = route.match(/^\/api\/libraries\/([^/]+)\/practices\/([^/]+)\/manifest$/)
  if (manifestMatch && method === 'GET') {
    const [, libId = '', practiceId = ''] = manifestMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'manifest.json')
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Manifest not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/libraries/:libId/practices/:practiceId/manifest
  if (manifestMatch && method === 'PUT') {
    const [, libId = '', practiceId = ''] = manifestMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'manifest.json')
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, '\t')}\n`)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/libraries/:libId/practices/:practiceId/flow
  const flowMatch = route.match(/^\/api\/libraries\/([^/]+)\/practices\/([^/]+)\/flow$/)
  if (flowMatch && method === 'GET') {
    const [, libId = '', practiceId = ''] = flowMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'flow.json')
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Flow not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/libraries/:libId/practices/:practiceId/flow
  if (flowMatch && method === 'PUT') {
    const [, libId = '', practiceId = ''] = flowMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'flow.json')
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, '\t')}\n`)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/libraries/:libId/prayers/:prayerId
  const prayerMatch = route.match(/^\/api\/libraries\/([^/]+)\/prayers\/([^/]+)$/)
  if (prayerMatch && method === 'GET') {
    const [, libId = '', prayerId = ''] = prayerMatch
    const filePath = path.join(contentRoot, libId, 'prayers', `${prayerId}.json`)
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Prayer not found', 404)
    return jsonResponse(res, { id: prayerId, ...(data as object) })
  }

  // PUT /api/libraries/:libId/prayers/:prayerId
  if (prayerMatch && method === 'PUT') {
    const [, libId = '', prayerId = ''] = prayerMatch
    const filePath = path.join(contentRoot, libId, 'prayers', `${prayerId}.json`)
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    const { id: _id, ...rest } = parsed as Record<string, unknown>
    fs.writeFileSync(filePath, `${JSON.stringify(rest, null, '\t')}\n`)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/libraries/:libId/books/:bookId
  const bookMatch = route.match(/^\/api\/libraries\/([^/]+)\/books\/([^/]+)$/)
  if (bookMatch && method === 'GET') {
    const [, libId = '', bookId = ''] = bookMatch
    const filePath = path.join(contentRoot, libId, 'books', bookId, 'book.json')
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Book not found', 404)
    return jsonResponse(res, data)
  }

  // GET /api/libraries/:libId/books/:bookId/chapters/:chapterId/:lang
  const bookChapterMatch = route.match(
    /^\/api\/libraries\/([^/]+)\/books\/([^/]+)\/chapters\/([^/]+)\/([^/]+)$/,
  )
  if (bookChapterMatch && method === 'GET') {
    const [, libId = '', bookId = '', chapterId = '', lang = ''] = bookChapterMatch
    // Try .md then .html
    for (const ext of ['.md', '.html']) {
      const filePath = path.join(contentRoot, libId, 'books', bookId, lang, `${chapterId}${ext}`)
      const text = safeReadText(filePath)
      if (text !== undefined) return jsonResponse(res, { text, format: ext.slice(1) })
    }
    return errorResponse(res, 'Chapter not found', 404)
  }

  // POST /api/libraries/:libId/practices — create new practice
  const createPracticeMatch = route.match(/^\/api\/libraries\/([^/]+)\/practices$/)
  if (createPracticeMatch && method === 'POST') {
    const [, libId = ''] = createPracticeMatch
    const body = await readBody(req)
    const { id, fromLibrary, fromPractice, ...overrides } = JSON.parse(body) as {
      id: string
      fromLibrary?: string
      fromPractice?: string
      [key: string]: unknown
    }

    const practiceDir = path.join(contentRoot, libId, 'practices', id)
    if (fs.existsSync(practiceDir)) {
      return errorResponse(res, 'Practice already exists', 409)
    }

    fs.mkdirSync(practiceDir, { recursive: true })

    if (fromLibrary && fromPractice) {
      // Clone from existing practice
      const sourceDir = path.join(contentRoot, fromLibrary, 'practices', fromPractice)
      const sourceManifest = safeReadJson(path.join(sourceDir, 'manifest.json')) as
        | Record<string, unknown>
        | undefined
      const sourceFlow = safeReadJson(path.join(sourceDir, 'flow.json'))

      const manifest = { ...sourceManifest, id, ...overrides }
      fs.writeFileSync(
        path.join(practiceDir, 'manifest.json'),
        `${JSON.stringify(manifest, null, '\t')}\n`,
      )
      fs.writeFileSync(
        path.join(practiceDir, 'flow.json'),
        `${JSON.stringify(sourceFlow ?? { sections: [] }, null, '\t')}\n`,
      )
    } else {
      // Blank template
      const manifest = {
        id,
        name: { 'en-US': '', 'pt-BR': '' },
        categories: [],
        estimatedMinutes: 5,
        description: { 'en-US': '', 'pt-BR': '' },
        history: { 'en-US': '', 'pt-BR': '' },
        howToPray: { 'en-US': '', 'pt-BR': '' },
        flowMode: 'scroll',
        completion: 'flow-end',
        flow: 'flow.json',
        tags: [],
        ...overrides,
      }
      const flow = { sections: [] }
      fs.writeFileSync(
        path.join(practiceDir, 'manifest.json'),
        `${JSON.stringify(manifest, null, '\t')}\n`,
      )
      fs.writeFileSync(path.join(practiceDir, 'flow.json'), `${JSON.stringify(flow, null, '\t')}\n`)
    }

    // Add to library.json practices array
    const libJsonPath = path.join(contentRoot, libId, 'library.json')
    const libManifest = safeReadJson(libJsonPath) as Record<string, unknown> | undefined
    if (libManifest) {
      const practices = (libManifest.practices as string[]) ?? []
      if (!practices.includes(id)) {
        practices.push(id)
        libManifest.practices = practices
        fs.writeFileSync(libJsonPath, `${JSON.stringify(libManifest, null, '\t')}\n`)
      }
    }

    return jsonResponse(res, { ok: true, id }, 201)
  }

  // POST /api/libraries/:libId/prayers — create new prayer
  const createPrayerMatch = route.match(/^\/api\/libraries\/([^/]+)\/prayers$/)
  if (createPrayerMatch && method === 'POST') {
    const [, libId = ''] = createPrayerMatch
    const body = await readBody(req)
    const { id, ...prayerData } = JSON.parse(body) as { id: string; [key: string]: unknown }
    const filePath = path.join(contentRoot, libId, 'prayers', `${id}.json`)

    if (fs.existsSync(filePath)) {
      return errorResponse(res, 'Prayer already exists', 409)
    }

    // Ensure prayers dir exists
    const prayersDir = path.join(contentRoot, libId, 'prayers')
    fs.mkdirSync(prayersDir, { recursive: true })

    const prayer =
      Object.keys(prayerData).length > 0
        ? prayerData
        : {
            title: { 'en-US': '', 'pt-BR': '' },
            body: [{ type: 'prayer', inline: { 'en-US': '', 'pt-BR': '' } }],
          }
    fs.writeFileSync(filePath, `${JSON.stringify(prayer, null, '\t')}\n`)

    // Add to library.json prayers array
    const libJsonPath = path.join(contentRoot, libId, 'library.json')
    const libManifest = safeReadJson(libJsonPath) as Record<string, unknown> | undefined
    if (libManifest) {
      const prayers = (libManifest.prayers as string[]) ?? []
      if (!prayers.includes(id)) {
        prayers.push(id)
        libManifest.prayers = prayers
        fs.writeFileSync(libJsonPath, `${JSON.stringify(libManifest, null, '\t')}\n`)
      }
    }

    return jsonResponse(res, { ok: true, id }, 201)
  }

  // PUT /api/libraries/:libId — update library.json
  const updateLibMatch = route.match(/^\/api\/libraries\/([^/]+)$/)
  if (updateLibMatch && method === 'PUT') {
    const [, libId = ''] = updateLibMatch
    const filePath = path.join(contentRoot, libId, 'library.json')
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, '\t')}\n`)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/libraries/:libId/practices/:practiceId/data/:dataFile
  const dataMatch = route.match(/^\/api\/libraries\/([^/]+)\/practices\/([^/]+)\/data\/([^/]+)$/)
  if (dataMatch && method === 'GET') {
    const [, libId = '', practiceId = '', dataFile = ''] = dataMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, `${dataFile}.json`)
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Data file not found', 404)
    return jsonResponse(res, data)
  }

  // GET /api/libraries/:libId/practices/:practiceId/tracks
  const tracksMatch = route.match(/^\/api\/libraries\/([^/]+)\/practices\/([^/]+)\/tracks$/)
  if (tracksMatch && method === 'GET') {
    const [, libId = '', practiceId = ''] = tracksMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'tracks.json')
    const data = safeReadJson(filePath)
    if (!data) return errorResponse(res, 'Tracks not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/libraries/:libId/practices/:practiceId/tracks
  if (tracksMatch && method === 'PUT') {
    const [, libId = '', practiceId = ''] = tracksMatch
    const filePath = path.join(contentRoot, libId, 'practices', practiceId, 'tracks.json')
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    fs.writeFileSync(filePath, `${JSON.stringify(parsed, null, '\t')}\n`)
    return jsonResponse(res, { ok: true })
  }

  // Catch-all
  errorResponse(res, `Not found: ${route}`, 404)
}
