import type { LirioRecord } from '@ember/backend/src/lib/lirio'

// His `horario_missa.zip`, read in the browser: every `uf/<UF>.json` in it, each a list of churches.
// A zip's central directory names each file and where its bytes start; the browser's own
// DecompressionStream inflates them, so the panel needs no zip library.

const centralEnd = 0x06054b50
const centralEntry = 0x02014b50

export async function readLirioZip(file: Blob): Promise<LirioRecord[]> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const end = (() => {
    // The end record sits in the last 22 bytes, or before a comment of up to 64 KiB.
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
      if (view.getUint32(i, true) === centralEnd) return i
    }
    throw new Error('That file is not a zip.')
  })()

  const names = new TextDecoder()
  const churches: LirioRecord[] = []
  let at = view.getUint32(end + 16, true)
  for (let n = view.getUint16(end + 10, true); n > 0; n--) {
    if (view.getUint32(at, true) !== centralEntry) throw new Error('The zip is damaged.')
    const method = view.getUint16(at + 10, true)
    const size = view.getUint32(at + 20, true)
    const nameLength = view.getUint16(at + 28, true)
    const local = view.getUint32(at + 42, true)
    const name = names.decode(bytes.subarray(at + 46, at + 46 + nameLength))
    at += 46 + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
    if (!/(^|\/)uf\/[A-Z]{2}\.json$/.test(name)) continue

    // The local header repeats the name and carries its own extra field before the data.
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
    const data = bytes.slice(start, start + size)
    const text = await (async () => {
      if (method === 0) return new TextDecoder().decode(data)
      if (method === 8) {
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
        return new Response(stream).text()
      }
      throw new Error(`${name} is packed in a way the panel can't read (method ${method}).`)
    })()
    churches.push(...(JSON.parse(text) as LirioRecord[]))
  }
  if (churches.length === 0) {
    throw new Error('No uf/<UF>.json in that zip. Is it his horario_missa.zip?')
  }
  return churches
}
