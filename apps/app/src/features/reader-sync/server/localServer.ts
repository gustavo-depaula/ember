// A tiny HTTP/1.1 server over react-native-tcp-socket. CrossPoint's OPDS client
// only ever issues plain GETs, so we hand-parse the request line, route through
// handleOpdsRequest, and write back a Connection: close response. Native only —
// the reader and the phone must share a Wi-Fi LAN, and the iOS server lives only
// while the app is foregrounded (see useReaderSync).

import * as Network from 'expo-network'
import { Platform } from 'react-native'
import { buildRegistry, clearEpubCache, handleOpdsRequest } from '../opds/routes'
import type { ServerHandle, SyncDocument } from '../types'

const textEncoder = new TextEncoder()

// iOS Personal Hotspot always puts the host phone at this fixed gateway. When the
// phone itself is the hotspot, its Wi-Fi interface has no DHCP lease, so
// getIpAddressAsync returns a useless self-assigned link-local 169.254.x.x — but
// clients (the reader) reach us at 172.20.10.1. Advertise that instead so the
// screen shows an address that actually works.
const iosHotspotGateway = '172.20.10.1'

async function resolveAdvertisedIp(): Promise<string> {
  const ip = await Network.getIpAddressAsync()
  const unusable = !ip || ip === '0.0.0.0' || ip.startsWith('169.254.')
  if (unusable && Platform.OS === 'ios') return iosHotspotGateway
  return ip
}

// Lazy-required inside startReaderSync so merely importing this module (e.g. when
// Expo Router eagerly loads the route, or on web/tests) never touches the native
// binding — it loads only when the user actually starts syncing.
type TcpSocketApi = typeof import('react-native-tcp-socket').default
// The connected-socket type, derived from createServer's listener so we don't
// depend on the package's (unexported-from-root) Socket type. Erased at runtime.
type Socket = Parameters<NonNullable<Parameters<TcpSocketApi['createServer']>[1]>>[0]

const PORT = 8943

const statusText: Record<number, string> = {
  200: 'OK',
  404: 'Not Found',
  405: 'Method Not Allowed',
  500: 'Internal Server Error',
}

function writeResponse(
  socket: Socket,
  status: number,
  contentType: string,
  body: Uint8Array,
): void {
  const head =
    `HTTP/1.1 ${status} ${statusText[status] ?? 'OK'}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Length: ${body.length}\r\n` +
    'Access-Control-Allow-Origin: *\r\n' +
    'Connection: close\r\n\r\n'
  // Send the head and body as a single buffer and close ONLY after it has
  // flushed. The previous fire-and-forget `write(head); write(body); end()`
  // could close the socket before a large body (a multi-KB EPUB) finished
  // sending, truncating the zip. The reader then opens the book from the early
  // zip entries but fails on every chapter, since chapter XHTML and the central
  // directory are written later in the file.
  const headBytes = textEncoder.encode(head)
  const response = new Uint8Array(headBytes.length + body.length)
  response.set(headBytes, 0)
  response.set(body, headBytes.length)
  socket.write(response, undefined, () => socket.end())
}

export async function startReaderSync(opts: { documents: SyncDocument[] }): Promise<ServerHandle> {
  const mod = require('react-native-tcp-socket')
  const TcpSocket: TcpSocketApi = mod.default ?? mod
  // Fresh session → drop any EPUBs cached for a prior day so the cache stays
  // bounded to this session's documents.
  clearEpubCache()
  const registry = buildRegistry(opts.documents)
  const ip = await resolveAdvertisedIp()

  const server = TcpSocket.createServer((socket) => {
    let buffer = ''
    let handled = false
    socket.on('data', (data) => {
      if (handled) return
      buffer += typeof data === 'string' ? data : data.toString('utf8')
      if (!buffer.includes('\r\n\r\n')) return
      handled = true
      const requestLine = buffer.slice(0, buffer.indexOf('\r\n'))
      const [method, path] = requestLine.split(' ')
      if (method !== 'GET') {
        writeResponse(socket, 405, 'text/plain', textEncoder.encode('Method Not Allowed'))
        return
      }
      handleOpdsRequest(path ?? '/', registry)
        .then((res) => writeResponse(socket, res.status, res.contentType, res.body))
        .catch((err) => {
          console.warn('[reader-sync] request failed:', err)
          writeResponse(socket, 500, 'text/plain', textEncoder.encode(String(err)))
        })
    })
    socket.on('error', (err) => console.warn('[reader-sync] socket error:', err))
  })

  await new Promise<void>((resolve, reject) => {
    server.on('error', reject)
    server.listen({ port: PORT, host: '0.0.0.0' }, () => resolve())
  })

  return {
    url: `http://${ip}:${PORT}/opds`,
    ip,
    port: PORT,
    stop: () =>
      new Promise<void>((resolve) => {
        try {
          server.close()
        } catch (err) {
          console.warn('[reader-sync] close failed:', err)
        }
        resolve()
      }),
  }
}
