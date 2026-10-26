// The developer portal's live parts: copy buttons, the API's try-it consoles, and the corpus
// explorer, which follows hashes and refs through the published corpus.
import { escapeHtml, highlightJson } from '~/lib/developers/json'

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? '')
      button.textContent = 'Copied'
    } catch {
      // A page without clipboard permission (an embedded preview) can still be copied by hand.
      button.textContent = 'Select and copy'
    }
    setTimeout(() => {
      button.textContent = 'Copy'
    }, 1600)
  })
}

const kb = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`)

function showResult(out: HTMLElement, meta: string, body: string, error = false) {
  out.hidden = false
  out.classList.toggle('error', error)
  out.innerHTML = `<p class="try-meta">${meta}</p><pre><code>${body}</code></pre>`
}

// ── Try it ──────────────────────────────────────────────────────────────

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-try]')) {
  const base = form.dataset.base ?? ''
  const template = form.dataset.path ?? ''
  const urlOut = form.querySelector<HTMLElement>('[data-url]')
  const out = form.querySelector<HTMLElement>('[data-result]')
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')
  if (!urlOut || !out || !button) continue

  const url = () => {
    const query = new URLSearchParams()
    let path = template
    for (const input of form.querySelectorAll<HTMLInputElement>('input[name]')) {
      const value = input.value.trim()
      if (input.dataset.in === 'path')
        path = path.replace(`{${input.name}}`, encodeURIComponent(value))
      else if (value) query.set(input.name, value)
    }
    const search = query.toString()
    return `${base}${path}${search ? `?${search}` : ''}`
  }

  form.addEventListener('input', () => {
    urlOut.textContent = url()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const target = url()
    button.disabled = true
    const started = performance.now()
    try {
      const res = await fetch(target)
      const text = await res.text()
      const ms = Math.round(performance.now() - started)
      const meta = `<span class="status s-${String(res.status)[0]}">${res.status}</span> ${ms} ms · ${kb(text.length)}`
      let body: string
      try {
        body = highlightJson(JSON.stringify(JSON.parse(text), null, 2))
      } catch {
        body = escapeHtml(text)
      }
      showResult(out, meta, body, !res.ok)
    } catch (err) {
      showResult(out, 'No response', escapeHtml(String(err)), true)
    } finally {
      button.disabled = false
    }
  })
}

// ── Corpus explorer ─────────────────────────────────────────────────────

const explorer = document.querySelector<HTMLElement>('[data-explorer]')
const explorerOut = explorer?.querySelector<HTMLElement>('[data-result]')

if (explorer && explorerOut) {
  const out = explorerOut
  // The published corpus, which allows any origin: in dev, Astro's router answers the
  // extensionless blob paths before the dev corpus can.
  const base = explorer.dataset.base ?? ''
  const form = explorer.querySelector<HTMLFormElement>('[data-explorer-form]')
  const input = form?.querySelector<HTMLInputElement>('input')
  const list = explorer.querySelector<HTMLDataListElement>('datalist')
  const trail = explorer.querySelector<HTMLOListElement>('[data-trail]')
  type Entry = { kind: string; hash: string; size: number }
  let catalog: Promise<Record<string, Entry>> | undefined
  const loadCatalog = () => {
    catalog ??= fetch(`${base}/catalog.json`).then(async (res) => {
      if (!res.ok) throw new Error(`catalog.json: HTTP ${res.status}`)
      const { items } = (await res.json()) as { items: Record<string, Entry> }
      if (list)
        list.innerHTML = Object.keys(items)
          .map((id) => `<option value="${escapeHtml(id)}">`)
          .join('')
      return items
    })
    return catalog
  }

  const blobPath = (hash: string) => `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`
  const isHash = (value: string) => /^[0-9a-f]{64}$/.test(value)
  const steps: string[] = []

  function renderTrail() {
    if (!trail) return
    trail.innerHTML = steps
      .map((step, i) => {
        const label = isHash(step) ? `${step.slice(0, 10)}…` : step
        return i === steps.length - 1
          ? `<li aria-current="step">${escapeHtml(label)}</li>`
          : `<li><button type="button" data-step="${i}">${escapeHtml(label)}</button></li>`
      })
      .join('')
  }

  // Hashes and catalog ids in a blob become links deeper into the corpus. A flow's bare
  // `ref` names a practice.
  const linker = (items: Record<string, Entry>) => (value: string, key?: string) => {
    const id = value.split('#')[0]
    const target = isHash(value)
      ? value
      : items[id]
        ? id
        : key === 'ref' && items[`practice/${id}`]
          ? `practice/${id}`
          : undefined
    if (!target) return undefined
    return `<button type="button" class="j-link" data-open="${escapeHtml(target)}">${escapeHtml(JSON.stringify(value))}</button>`
  }

  let imageUrl: string | undefined

  async function show(step: string) {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    imageUrl = undefined
    out.hidden = false
    out.classList.remove('error')
    out.innerHTML = '<p class="try-meta">Loading…</p>'
    try {
      const items = await loadCatalog()
      const entry = items[step]
      const hash = isHash(step) ? step : entry?.hash
      if (!hash) throw new Error(`No item has the id ${step}`)
      const url = `${base}/${blobPath(hash)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${blobPath(hash)}: HTTP ${res.status}`)
      const bytes = await res.arrayBuffer()
      const head = [...new Uint8Array(bytes.slice(0, 4))]
      const link = `<a class="xref" href="${escapeHtml(`${base}/${blobPath(hash)}`)}" rel="noopener">${escapeHtml(blobPath(hash))}</a>`
      const meta = `${entry ? `<code>${escapeHtml(entry.kind)}</code> · ` : ''}${kb(bytes.byteLength)} · ${link}`
      const image =
        head[0] === 0x89
          ? 'image/png'
          : head[0] === 0xff
            ? 'image/jpeg'
            : head[0] === 0x52
              ? 'image/webp'
              : undefined
      if (image) {
        imageUrl = URL.createObjectURL(new Blob([bytes], { type: image }))
        out.innerHTML = `<p class="try-meta">${meta}</p><img class="blob-image" src="${imageUrl}" alt="">`
        return
      }
      const text = new TextDecoder().decode(bytes)
      let body: string
      try {
        body = highlightJson(JSON.stringify(JSON.parse(text), null, 2), linker(items))
      } catch {
        body = escapeHtml(text)
      }
      showResult(out, meta, body)
    } catch (err) {
      showResult(
        out,
        'Not found',
        escapeHtml(err instanceof Error ? err.message : String(err)),
        true,
      )
    }
  }

  function open(step: string, fresh = false) {
    if (fresh) steps.length = 0
    steps.push(step)
    renderTrail()
    void show(step)
  }

  input?.addEventListener('focus', () => {
    loadCatalog().catch((err) => showResult(out, 'No catalog', escapeHtml(String(err)), true))
  })
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const value = input?.value.trim()
    if (value) open(value, true)
  })
  explorer.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-open], [data-step]')
    if (!target) return
    if (target.dataset.open) open(target.dataset.open)
    else {
      steps.length = Number(target.dataset.step) + 1
      renderTrail()
      void show(steps[steps.length - 1])
    }
  })
  for (const button of document.querySelectorAll<HTMLElement>('[data-explore]')) {
    button.addEventListener('click', () => {
      const id = button.dataset.explore ?? ''
      if (input) input.value = id
      open(id, true)
      explorer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}
