import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin, ViteDevServer } from 'vite'

// Hearth v2: source content lives at <monoRoot>/content/{practices,prayers,books,chapters,collections}/...
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monoRoot = path.resolve(__dirname, '../../../..')
const contentRoot = path.join(monoRoot, 'content')

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

function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, '\t')}\n`)
}

function listDirEntries(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
}

/**
 * Reject manifests that still carry the legacy flat `items[]` shape or are
 * missing the required `sections[]`. Also enforce the depth-2 nesting cap so
 * the renderer never has to handle Section → Sub-section → Sub-sub-section.
 */
function validateCollectionShape(parsed: Record<string, unknown>): string | undefined {
  if ('items' in parsed) {
    return 'Legacy `items[]` is no longer accepted — use `sections[]`.'
  }
  if (!Array.isArray(parsed.sections)) {
    return '`sections[]` is required.'
  }
  type AnyBlock = { kind?: unknown; blocks?: unknown[] }
  function checkSection(s: unknown, depth: number): string | undefined {
    if (!s || typeof s !== 'object') return 'Each section must be an object.'
    const blocks = (s as { blocks?: unknown[] }).blocks
    if (!Array.isArray(blocks)) return 'Each section must have a `blocks[]` array.'
    for (const b of blocks as AnyBlock[]) {
      if (b?.kind === 'section') {
        if (depth >= 1) return 'Sections may nest at most one level deep.'
        const err = checkSection(b, depth + 1)
        if (err) return err
      }
    }
    return undefined
  }
  for (const s of parsed.sections) {
    const err = checkSection(s, 0)
    if (err) return err
  }
  return undefined
}

export function contentApiPlugin(): Plugin {
  return {
    name: 'workshop-content-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const route = url.replace(/\?.*$/, '')

        handleRoute(route, req, res).catch((err) => {
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
) {
  const method = req.method ?? 'GET'

  // ── Practices ──

  // GET /api/practices — list all practice manifests
  if (route === '/api/practices' && method === 'GET') {
    const practicesRoot = path.join(contentRoot, 'practices')
    const manifests: unknown[] = []
    for (const id of listDirEntries(practicesRoot)) {
      const m = safeReadJson(path.join(practicesRoot, id, 'manifest.json'))
      if (m) manifests.push(m)
    }
    return jsonResponse(res, manifests)
  }

  // POST /api/practices — create new practice (body: {id, fromPractice?, ...overrides})
  if (route === '/api/practices' && method === 'POST') {
    const body = await readBody(req)
    const { id, fromPractice, ...overrides } = JSON.parse(body) as {
      id: string
      fromPractice?: string
      [key: string]: unknown
    }
    if (!id) return errorResponse(res, 'id is required', 400)
    const practiceDir = path.join(contentRoot, 'practices', id)
    if (fs.existsSync(practiceDir)) {
      return errorResponse(res, 'Practice already exists', 409)
    }
    fs.mkdirSync(practiceDir, { recursive: true })

    if (fromPractice) {
      const sourceDir = path.join(contentRoot, 'practices', fromPractice)
      const sourceManifest = safeReadJson(path.join(sourceDir, 'manifest.json')) as
        | Record<string, unknown>
        | undefined
      const sourceFlow = safeReadJson(path.join(sourceDir, 'flow.json'))
      const manifest = { ...sourceManifest, id, ...overrides }
      writeJsonFile(path.join(practiceDir, 'manifest.json'), manifest)
      writeJsonFile(path.join(practiceDir, 'flow.json'), sourceFlow ?? { sections: [] })
    } else {
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
      writeJsonFile(path.join(practiceDir, 'manifest.json'), manifest)
      writeJsonFile(path.join(practiceDir, 'flow.json'), { sections: [] })
    }

    return jsonResponse(res, { ok: true, id }, 201)
  }

  // GET /api/practices/:id/manifest
  const manifestMatch = route.match(/^\/api\/practices\/([^/]+)\/manifest$/)
  if (manifestMatch && method === 'GET') {
    const [, practiceId = ''] = manifestMatch
    const data = safeReadJson(path.join(contentRoot, 'practices', practiceId, 'manifest.json'))
    if (!data) return errorResponse(res, 'Manifest not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/practices/:id/manifest
  if (manifestMatch && method === 'PUT') {
    const [, practiceId = ''] = manifestMatch
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    writeJsonFile(path.join(contentRoot, 'practices', practiceId, 'manifest.json'), parsed)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/practices/:id/flow
  const flowMatch = route.match(/^\/api\/practices\/([^/]+)\/flow$/)
  if (flowMatch && method === 'GET') {
    const [, practiceId = ''] = flowMatch
    const data = safeReadJson(path.join(contentRoot, 'practices', practiceId, 'flow.json'))
    if (!data) return errorResponse(res, 'Flow not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/practices/:id/flow
  if (flowMatch && method === 'PUT') {
    const [, practiceId = ''] = flowMatch
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    writeJsonFile(path.join(contentRoot, 'practices', practiceId, 'flow.json'), parsed)
    return jsonResponse(res, { ok: true })
  }

  // GET /api/practices/:id/data/:dataFile
  const dataMatch = route.match(/^\/api\/practices\/([^/]+)\/data\/([^/]+)$/)
  if (dataMatch && method === 'GET') {
    const [, practiceId = '', dataFile = ''] = dataMatch
    const data = safeReadJson(path.join(contentRoot, 'practices', practiceId, `${dataFile}.json`))
    if (!data) return errorResponse(res, 'Data file not found', 404)
    return jsonResponse(res, data)
  }

  // GET /api/practices/:id/tracks
  const tracksMatch = route.match(/^\/api\/practices\/([^/]+)\/tracks$/)
  if (tracksMatch && method === 'GET') {
    const [, practiceId = ''] = tracksMatch
    const data = safeReadJson(path.join(contentRoot, 'practices', practiceId, 'tracks.json'))
    if (!data) return errorResponse(res, 'Tracks not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/practices/:id/tracks
  if (tracksMatch && method === 'PUT') {
    const [, practiceId = ''] = tracksMatch
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    writeJsonFile(path.join(contentRoot, 'practices', practiceId, 'tracks.json'), parsed)
    return jsonResponse(res, { ok: true })
  }

  // ── Prayers ──

  // GET /api/prayers — list all prayers (id + parsed json)
  if (route === '/api/prayers' && method === 'GET') {
    const prayersRoot = path.join(contentRoot, 'prayers')
    const prayers: unknown[] = []
    for (const f of listJsonFiles(prayersRoot)) {
      const id = f.replace(/\.json$/, '')
      const p = safeReadJson(path.join(prayersRoot, f))
      if (p) prayers.push({ id, ...(p as object) })
    }
    return jsonResponse(res, prayers)
  }

  // POST /api/prayers — create new prayer
  if (route === '/api/prayers' && method === 'POST') {
    const body = await readBody(req)
    const { id, ...prayerData } = JSON.parse(body) as { id: string; [key: string]: unknown }
    if (!id) return errorResponse(res, 'id is required', 400)
    const filePath = path.join(contentRoot, 'prayers', `${id}.json`)
    if (fs.existsSync(filePath)) {
      return errorResponse(res, 'Prayer already exists', 409)
    }
    const prayer =
      Object.keys(prayerData).length > 0
        ? prayerData
        : {
            title: { 'en-US': '', 'pt-BR': '' },
            body: [{ type: 'prayer', inline: { 'en-US': '', 'pt-BR': '' } }],
          }
    writeJsonFile(filePath, prayer)
    return jsonResponse(res, { ok: true, id }, 201)
  }

  // GET /api/prayers/:id
  const prayerMatch = route.match(/^\/api\/prayers\/([^/]+)$/)
  if (prayerMatch && method === 'GET') {
    const [, prayerId = ''] = prayerMatch
    const data = safeReadJson(path.join(contentRoot, 'prayers', `${prayerId}.json`))
    if (!data) return errorResponse(res, 'Prayer not found', 404)
    return jsonResponse(res, { id: prayerId, ...(data as object) })
  }

  // PUT /api/prayers/:id
  if (prayerMatch && method === 'PUT') {
    const [, prayerId = ''] = prayerMatch
    const body = await readBody(req)
    const parsed = JSON.parse(body)
    const { id: _id, ...rest } = parsed as Record<string, unknown>
    writeJsonFile(path.join(contentRoot, 'prayers', `${prayerId}.json`), rest)
    return jsonResponse(res, { ok: true })
  }

  // ── Books ──

  // GET /api/books — list all books
  if (route === '/api/books' && method === 'GET') {
    const booksRoot = path.join(contentRoot, 'books')
    const books: unknown[] = []
    for (const id of listDirEntries(booksRoot)) {
      const b = safeReadJson(path.join(booksRoot, id, 'book.json'))
      if (b) books.push(b)
    }
    return jsonResponse(res, books)
  }

  // GET /api/books/:id — book.json
  const bookMatch = route.match(/^\/api\/books\/([^/]+)$/)
  if (bookMatch && method === 'GET') {
    const [, bookId = ''] = bookMatch
    const data = safeReadJson(path.join(contentRoot, 'books', bookId, 'book.json'))
    if (!data) return errorResponse(res, 'Book not found', 404)
    return jsonResponse(res, data)
  }

  // GET /api/books/:bookId/chapters/:chapterId/:lang — chapter prose text
  const bookChapterMatch = route.match(/^\/api\/books\/([^/]+)\/chapters\/([^/]+)\/([^/]+)$/)
  if (bookChapterMatch && method === 'GET') {
    const [, bookId = '', chapterId = '', lang = ''] = bookChapterMatch
    for (const ext of ['.md', '.html']) {
      const filePath = path.join(contentRoot, 'books', bookId, lang, `${chapterId}${ext}`)
      const text = safeReadText(filePath)
      if (text !== undefined) return jsonResponse(res, { text, format: ext.slice(1) })
    }
    return errorResponse(res, 'Chapter not found', 404)
  }

  // ── Chapters (standalone) ──

  // GET /api/chapters — list all standalone chapters
  if (route === '/api/chapters' && method === 'GET') {
    const chaptersRoot = path.join(contentRoot, 'chapters')
    const chapters: unknown[] = []
    for (const id of listDirEntries(chaptersRoot)) {
      const c = safeReadJson(path.join(chaptersRoot, id, 'chapter.json'))
      if (c) chapters.push(c)
    }
    return jsonResponse(res, chapters)
  }

  // GET /api/chapters/:id — chapter.json
  const chapterMatch = route.match(/^\/api\/chapters\/([^/]+)$/)
  if (chapterMatch && method === 'GET') {
    const [, chapterId = ''] = chapterMatch
    const data = safeReadJson(path.join(contentRoot, 'chapters', chapterId, 'chapter.json'))
    if (!data) return errorResponse(res, 'Chapter not found', 404)
    return jsonResponse(res, data)
  }

  // ── Collections ──

  // GET /api/collections — list all collection manifests
  if (route === '/api/collections' && method === 'GET') {
    const collectionsRoot = path.join(contentRoot, 'collections')
    const collections: unknown[] = []
    for (const f of listJsonFiles(collectionsRoot)) {
      const c = safeReadJson(path.join(collectionsRoot, f))
      if (c) collections.push(c)
    }
    return jsonResponse(res, collections)
  }

  // POST /api/collections — create new collection
  if (route === '/api/collections' && method === 'POST') {
    const body = await readBody(req)
    const { id, ...overrides } = JSON.parse(body) as { id: string; [key: string]: unknown }
    if (!id) return errorResponse(res, 'id is required', 400)
    const filePath = path.join(contentRoot, 'collections', `${id}.json`)
    if (fs.existsSync(filePath)) {
      return errorResponse(res, 'Collection already exists', 409)
    }
    const manifest = {
      id: `collection/${id}`,
      version: '1.0.0',
      name: { 'en-US': '', 'pt-BR': '' },
      description: { 'en-US': '', 'pt-BR': '' },
      languages: ['en-US', 'pt-BR'],
      tags: [],
      sections: [
        {
          id: 'main',
          title: { 'en-US': 'Items', 'pt-BR': 'Itens' },
          blocks: [],
        },
      ],
      ...overrides,
    }
    writeJsonFile(filePath, manifest)
    return jsonResponse(res, { ok: true, id }, 201)
  }

  // GET /api/collections/:id
  const collectionMatch = route.match(/^\/api\/collections\/([^/]+)$/)
  if (collectionMatch && method === 'GET') {
    const [, collectionId = ''] = collectionMatch
    const data = safeReadJson(path.join(contentRoot, 'collections', `${collectionId}.json`))
    if (!data) return errorResponse(res, 'Collection not found', 404)
    return jsonResponse(res, data)
  }

  // PUT /api/collections/:id
  if (collectionMatch && method === 'PUT') {
    const [, collectionId = ''] = collectionMatch
    const body = await readBody(req)
    const parsed = JSON.parse(body) as Record<string, unknown>
    const validationError = validateCollectionShape(parsed)
    if (validationError) return errorResponse(res, validationError, 400)
    writeJsonFile(path.join(contentRoot, 'collections', `${collectionId}.json`), parsed)
    return jsonResponse(res, { ok: true })
  }

  errorResponse(res, `Not found: ${route}`, 404)
}
