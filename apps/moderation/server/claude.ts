import { spawn } from 'node:child_process'
import path from 'node:path'
import { createInterface } from 'node:readline'

// One headless Claude Code run (`claude -p`) held to a JSON schema.
//
// What it reads was written by anonymous strangers, so it runs boxed in: --restricted confines the
// file tools to the case folder and drops every tool that runs code, --safe-mode keeps this repo's
// CLAUDE.md, skills and hooks out of it, and the only tools left are the three that look things up.
// Whatever it concludes is a draft a person approves.

const tools = 'Read,WebFetch,WebSearch'

export type ClaudeResult = { output: unknown; sessionId: string; costUsd?: number }

type StreamEvent = {
  type: string
  session_id?: string
  is_error?: boolean
  result?: string
  structured_output?: unknown
  total_cost_usd?: number
  message?: { content?: Array<{ type: string; text?: string; name?: string; input?: ToolInput }> }
}
type ToolInput = { file_path?: string; url?: string; query?: string }

export function runClaude({
  cwd,
  prompt,
  schema,
  resume,
  signal,
  onActivity,
}: {
  cwd: string
  prompt: string
  schema: unknown
  resume?: string
  signal: AbortSignal
  onActivity: (line: string) => void
}): Promise<ClaudeResult> {
  const model = process.env.MODERATION_MODEL
  const args = [
    '-p',
    prompt,
    '--output-format',
    'stream-json',
    '--verbose',
    '--restricted',
    '--safe-mode',
    '--strict-mcp-config',
    '--permission-mode',
    'dontAsk',
    `--tools=${tools}`,
    `--allowedTools=${tools}`,
    '--json-schema',
    JSON.stringify(schema),
    ...(resume ? ['--resume', resume] : []),
    ...(model ? ['--model', model] : []),
  ]

  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { cwd, signal, stdio: ['ignore', 'pipe', 'pipe'] })
    let result: StreamEvent | undefined
    let stderr = ''
    child.stderr.on('data', (chunk: Buffer) => {
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
function parseEvent(line: string): StreamEvent | undefined {
  if (!line.startsWith('{')) return undefined
  try {
    return JSON.parse(line) as StreamEvent
  } catch {
    return undefined
  }
}

// What the moderator watches while a run is under way: each lookup, and what Claude says between them.
function describe(event: StreamEvent): string[] {
  if (event.type !== 'assistant') return []
  return (event.message?.content ?? []).flatMap((block) => {
    if (block.type === 'text' && block.text?.trim()) return [block.text.trim()]
    if (block.type !== 'tool_use') return []
    const input = block.input ?? {}
    if (block.name === 'Read') return [`Reading ${path.basename(input.file_path ?? 'a file')}`]
    if (block.name === 'WebFetch') return [`Opening ${input.url}`]
    if (block.name === 'WebSearch') return [`Searching “${input.query}”`]
    if (block.name === 'StructuredOutput') return ['Writing up the proposal']
    return []
  })
}
