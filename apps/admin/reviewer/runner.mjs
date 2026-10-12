// The reviewer's whole program: it takes review jobs from the admin Worker, runs each as one
// headless Claude Code session (`claude -p`) held to a JSON schema, and tells the Worker what the
// run is doing and how it ended. Plain Node with no dependencies, so the image is Node, the CLI
// and this file.
//
// It holds no database and no credential. DESK_URL is a name that only resolves inside the
// Worker's outbound handlers, and so does the token Claude Code's calls to Anthropic end up with
// (see worker/reviewer.ts).
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const { DESK_URL, WORK_DIR = '/work', PORT = '8080', HOME } = process.env
const here = path.dirname(fileURLToPath(import.meta.url))
const concurrent = 3
// A run with nothing new to say still reports this often, so the desk can tell it from a dead one.
const reportEveryMs = 2_000
const heartbeatMs = 30_000

const tools = 'Read,WebFetch,WebSearch'
const waiting = []
const aborts = new Map()
let active = 0

async function tell(id, what, body) {
  const response = await fetch(`${DESK_URL}/runs/${id}/${what}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.status
}

function pump() {
  while (active < concurrent && waiting.length > 0) {
    const job = waiting.shift()
    active++
    work(job).finally(() => {
      active--
      pump()
    })
  }
}

// A church id or a file name from the desk, as one path segment.
const safeName = (name) => encodeURIComponent(name).replace(/\./g, '%2E')

// Claude Code keeps a session's transcript under the project it ran in; it can only be resumed
// while that file is still on this box's disk.
async function holdsSession(sessionId) {
  const projects = path.join(HOME ?? '/root', '.claude', 'projects')
  if (!existsSync(projects)) return false
  const dirs = await readdir(projects)
  return dirs.some((dir) => existsSync(path.join(projects, dir, `${sessionId}.jsonl`)))
}

async function work(job) {
  const abort = new AbortController()
  aborts.set(job.id, abort)
  let pending = []
  let lastReport = 0
  let reporting = Promise.resolve()
  // Activity goes out in batches; a 410 means the desk no longer wants this run.
  const report = () => {
    const lines = pending
    pending = []
    lastReport = Date.now()
    reporting = reporting
      .then(() => tell(job.id, 'activity', { lines }))
      .then((status) => {
        if (status === 410) abort.abort()
      })
      .catch((error) => console.error(`report failed: ${error.message}`))
  }
  const timer = setInterval(() => {
    if (pending.length > 0 || Date.now() - lastReport > heartbeatMs) report()
  }, reportEveryMs)

  try {
    report()
    const dir = path.join(WORK_DIR, safeName(job.churchId))
    await rm(dir, { recursive: true, force: true })
    await mkdir(dir, { recursive: true })
    for (const file of job.files) {
      const data = file.base64 === undefined ? file.text : Buffer.from(file.base64, 'base64')
      await writeFile(path.join(dir, path.basename(file.name)), data)
    }
    const resume = job.resume && (await holdsSession(job.resume.sessionId)) ? job.resume : undefined
    const result = await runClaude({
      cwd: dir,
      prompt: resume ? resume.prompt : job.prompt,
      resume: resume?.sessionId,
      schema: job.schema,
      model: job.model,
      runId: job.id,
      signal: abort.signal,
      onActivity: (line) => pending.push(line),
    })
    clearInterval(timer)
    if (pending.length > 0) report()
    await reporting
    await tell(job.id, 'done', result)
  } catch (error) {
    clearInterval(timer)
    await reporting
    if (!abort.signal.aborted) await tell(job.id, 'done', { error: error.message })
  } finally {
    clearInterval(timer)
    aborts.delete(job.id)
  }
}

// One headless run. --restricted confines the file tools to the case folder, drops every tool
// that runs code and ignores this box's settings; skills are switched off; and the only tools left
// are the three that look things up, plus the directory search (directory-mcp.mjs). --safe-mode
// would be the simpler box, but it discards that MCP server too. Whatever the run concludes is a
// draft a person approves.
function runClaude({ cwd, prompt, resume, schema, model, runId, signal, onActivity }) {
  const mcp = {
    directory: {
      command: 'node',
      args: [path.join(here, 'directory-mcp.mjs')],
      env: { DESK_URL, RUN_ID: runId },
    },
  }
  const args = [
    '-p',
    prompt,
    '--output-format',
    'stream-json',
    '--verbose',
    '--restricted',
    '--disable-slash-commands',
    '--strict-mcp-config',
    '--permission-mode',
    'dontAsk',
    `--tools=${tools}`,
    `--allowedTools=${tools},mcp__directory`,
    '--mcp-config',
    JSON.stringify({ mcpServers: mcp }),
    '--json-schema',
    JSON.stringify(schema),
    ...(resume ? ['--resume', resume] : []),
    ...(model ? ['--model', model] : []),
  ]

  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { cwd, signal, stdio: ['ignore', 'pipe', 'pipe'] })
    let result
    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    createInterface({ input: child.stdout }).on('line', (line) => {
      const event = parseEvent(line)
      if (!event) return
      if (event.type === 'result') result = event
      for (const activity of describe(event)) onActivity(activity)
    })
    child.on('error', (error) =>
      reject(
        signal.aborted
          ? new Error('Stopped.')
          : new Error(`Could not run the claude CLI: ${error.message}`),
      ),
    )
    child.on('close', (code) => {
      if (signal.aborted) return reject(new Error('Stopped.'))
      if (!result || result.is_error || !result.session_id) {
        return reject(new Error(result?.result || stderr.trim() || `claude exited with ${code}`))
      }
      if (result.structured_output === undefined) {
        return reject(new Error(`Claude returned no proposal: ${result.result ?? ''}`))
      }
      resolve({
        output: result.structured_output,
        sessionId: result.session_id,
        costUsd: result.total_cost_usd,
      })
    })
  })
}

// stdout is one JSON event per line; anything else on it is noise.
function parseEvent(line) {
  if (!line.startsWith('{')) return undefined
  try {
    return JSON.parse(line)
  } catch {
    return undefined
  }
}

// What the moderator watches while a run is under way: each lookup, and what Claude says between them.
function describe(event) {
  if (event.type !== 'assistant') return []
  return (event.message?.content ?? []).flatMap((block) => {
    if (block.type === 'text' && block.text?.trim()) return [block.text.trim()]
    if (block.type !== 'tool_use') return []
    const input = block.input ?? {}
    if (block.name === 'Read') return [`Reading ${path.basename(input.file_path ?? 'a file')}`]
    if (block.name === 'WebFetch') return [`Opening ${input.url}`]
    if (block.name === 'WebSearch') return [`Searching “${input.query}”`]
    if (block.name === 'StructuredOutput') return ['Writing up the proposal']
    if (block.name?.startsWith('mcp__')) return [`Searching the directory for “${input.query}”`]
    return []
  })
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString())
}

createServer(async (req, res) => {
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
  try {
    const stopping = /^\/runs\/([^/]+)$/.exec(req.url ?? '')
    if (req.method === 'POST' && req.url === '/runs') {
      waiting.push(await readJson(req))
      pump()
      return send(202, { ok: true })
    }
    if (req.method === 'DELETE' && stopping) {
      const queued = waiting.findIndex((job) => job.id === stopping[1])
      if (queued >= 0) waiting.splice(queued, 1)
      aborts.get(stopping[1])?.abort()
      return send(200, { ok: true })
    }
    // The Worker's readiness check, and its way of keeping this box awake.
    send(200, { active, waiting: waiting.length })
  } catch (error) {
    send(500, { error: error.message })
  }
}).listen(Number(PORT), '0.0.0.0')
