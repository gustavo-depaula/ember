// A one-tool MCP server handed to each headless review: `search_churches`, a name search over the
// whole directory. It holds no database access of its own. It asks the desk that started the
// review (DESK_URL), which also adds whatever is found to the case (CHURCH_ID), so a church Claude
// turns up this way can be changed like any other.
//
// Plain Node on purpose: Claude Code starts it with `node`, with no TypeScript loader. MCP over
// stdio is one JSON-RPC message per line.
import { createInterface } from 'node:readline'

const { DESK_URL, CHURCH_ID } = process.env

const tool = {
  name: 'search_churches',
  description:
    "Search the whole Mass-times directory by church name. Results come nearest-first from the church under review, however far away they are. Use it for a chapel or community named in the evidence that is not among case.json's otherChurches, before concluding the directory lacks it. Search by the distinctive part of the name (the saint or title), without words like Capela, Comunidade or Paróquia.",
  inputSchema: {
    type: 'object',
    properties: { query: { type: 'string', description: 'Name, or part of it' } },
    required: ['query'],
  },
}

async function search(query) {
  const response = await fetch(`${DESK_URL}/api/cases/${encodeURIComponent(CHURCH_ID)}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? response.statusText)
  return data.matches.map(({ church, distanceKm, sameParish }) => ({
    id: church.id,
    name: church.name,
    longName: church.longName,
    address: church.address,
    city: church.city,
    distanceKm,
    sameParish,
    parishId: church.parishId,
    services: church.services,
    texts: church.texts,
  }))
}

async function answer({ method, params }) {
  if (method === 'initialize') {
    return {
      protocolVersion: params.protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: 'ember-directory', version: '1' },
    }
  }
  if (method === 'tools/list') return { tools: [tool] }
  if (method === 'tools/call') {
    // A failed search is something for the model to read and work around, not a protocol error.
    try {
      const matches = await search(String(params.arguments?.query ?? ''))
      return { content: [{ type: 'text', text: JSON.stringify(matches, undefined, 1) }] }
    } catch (error) {
      return { content: [{ type: 'text', text: `Search failed: ${error.message}` }], isError: true }
    }
  }
  if (method === 'ping') return {}
  throw new Error(`Unsupported method ${method}`)
}

createInterface({ input: process.stdin }).on('line', async (line) => {
  const message = JSON.parse(line)
  // Notifications carry no id and want no reply.
  if (message.id === undefined) return
  const reply = await answer(message).then(
    (result) => ({ result }),
    (error) => ({ error: { code: -32601, message: error.message } }),
  )
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message.id, ...reply })}\n`)
})
