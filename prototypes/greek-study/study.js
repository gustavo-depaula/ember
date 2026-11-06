// Shared machinery for the word-study prototypes: the phone, the theme, the
// half-page sheet (word study and verse pane) and the marks in the text.
// Each page calls Study.mount({ controls, renderText }) with its own layout.

const Study = (() => {
  const data = JSON.parse(document.getElementById('data').textContent)
  const params = new URLSearchParams(location.search)
  const windowH = 844
  const halfH = Math.round(windowH * 0.46) // paneFraction in VersePaneContent.tsx
  const icon = {
    down: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
  }
  const svg = (name, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${icon[name]}</svg>`
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const fmt = (n) => n.toLocaleString('en-US')
  const lemmaOf = (w) => data.lemmas[w.s]
  // Berean marks words it supplies in [brackets]: set them lighter, not bracketed.
  const glossHtml = (g) =>
    g === '-' || !g
      ? '<span class="implied">—</span>'
      : esc(g).replace(/\[([^\]]+)\]/g, '<span class="implied">$1</span>')

  // ---------- theme ----------

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ember-proto-theme', theme)
    for (const b of document.querySelectorAll('.theme-toggle button'))
      b.setAttribute('aria-pressed', String(b.dataset.theme === theme))
  }
  setTheme(params.get('theme') ?? localStorage.getItem('ember-proto-theme') ?? 'light')
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.theme-toggle button')
    if (b) setTheme(b.dataset.theme)
  })

  // ---------- the phone ----------

  const phone = document.getElementById('phone')
  phone.innerHTML = `
    <div class="screen" id="screen">
      <div class="status">
        <span>9:41</span><span class="island"></span>
        <span style="display:flex;gap:6px;align-items:center">
          <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.3 10.3 0 0 0 8 .4 10.3 10.3 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4a6.7 6.7 0 0 0-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.4l1.3-1.5c-.3-.3-.8-.5-1.3-.5Z"/></svg>
          <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".4"/></svg>
        </span>
      </div>
      <div class="page" id="page"></div>
      <div class="scrim" id="scrim"></div>
      <div class="sheet" id="sheet" role="dialog" aria-modal="false">
        <div class="grab" data-drag></div>
        <div class="sheet-body" id="sheet-body"></div>
      </div>
      <div class="hint gone" id="hint"></div>
      <div class="home-indicator"></div>
    </div>`
  const screen = document.getElementById('screen')
  const page = document.getElementById('page')
  const sheet = document.getElementById('sheet')
  const body = document.getElementById('sheet-body')
  const screenH = () => screen.clientHeight
  const fullH = () => screenH() - 58

  // ---------- the sheet ----------

  // `visible` is how much of it stands above the foot of the screen; none, closed.
  let visible = 0
  function place(px, animate = true) {
    sheet.classList.toggle('dragging', !animate)
    const h = fullH()
    sheet.style.setProperty('--sheet-h', `${h}px`)
    sheet.style.transform = px > 0 ? `translateY(${h - px}px)` : 'translateY(100%)'
  }
  function setVisible(px) {
    visible = px
    place(px)
    if (px > 0) sheet.style.setProperty('--visible', `${px}px`)
    document.getElementById('scrim').classList.toggle('on', px > halfH + 40)
    const foot = page.querySelector('.page-foot')
    if (foot) foot.style.height = `${px > 0 ? halfH + 24 : 60}px`
  }
  document.getElementById('scrim').addEventListener('click', () => setVisible(halfH))

  // Drawn by its grabber or bar: up to the full page, down to half, away.
  let drag
  sheet.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('[data-drag]') || e.target.closest('button')) return
    drag = { y: e.clientY, from: visible, t: performance.now() }
    sheet.setPointerCapture(e.pointerId)
  })
  sheet.addEventListener('pointermove', (e) => {
    if (!drag) return
    const px = Math.max(80, Math.min(fullH(), drag.from - (e.clientY - drag.y)))
    drag.px = px
    place(px, false)
  })
  sheet.addEventListener('pointerup', (e) => {
    if (!drag) return
    const moved = drag.from - (drag.px ?? drag.from)
    const v = (drag.y - e.clientY) / Math.max(1, performance.now() - drag.t)
    const px = drag.px ?? drag.from
    drag = undefined
    if (Math.abs(moved) < 4) return place(visible)
    if (v < -0.8 || px < halfH * 0.7) return clear()
    if (v > 0.8) return setVisible(fullH())
    setVisible(Math.abs(px - halfH) < Math.abs(px - fullH()) ? halfH : fullH())
  })

  function showSheet(html) {
    body.innerHTML = `<div class="sheet-content">${html}</div>`
    body.scrollTop = 0
    if (visible === 0) setVisible(params.get('detent') === 'full' ? fullH() : halfH)
  }

  // ---------- selection and the marks it leaves ----------

  // What the sheet is open on: a word, a verse, or nothing.
  let sel
  let from // the verse a word was opened from, to go back to
  const listeners = []

  function mark() {
    for (const el of page.querySelectorAll('.selected,.kin,.marked'))
      el.classList.remove('selected', 'kin', 'marked')
    if (sel?.word !== undefined) {
      const w = data.verses[sel.verse - 1].words[sel.word]
      for (const el of page.querySelectorAll(`.w[data-s="${w.s}"]`)) el.classList.add('kin')
      for (const el of page.querySelectorAll(`.w[data-v="${sel.verse}"][data-i="${sel.word}"]`)) {
        el.classList.remove('kin')
        el.classList.add('selected')
      }
    }
    if (sel && sel.word === undefined) {
      for (const el of page.querySelectorAll(`[data-verse="${sel.verse}"]`)) el.classList.add('marked')
      for (const el of page.querySelectorAll(`.vn[data-v="${sel.verse}"]`)) el.classList.add('marked')
    }
    for (const f of listeners) f(sel)
  }

  // Bring what was tapped clear of the sheet, with a line above it in view.
  function reveal(el) {
    if (!el) return
    const r = el.getBoundingClientRect()
    const s = screen.getBoundingClientRect()
    const top = r.top - s.top
    const limit = screenH() - halfH - 24
    if (r.bottom - s.top > limit || top < 60) page.scrollBy({ top: top - 130 })
  }

  function selectWord(verse, word, opts = {}) {
    if (!opts.keep && sel?.verse === verse && sel?.word === word) return clear()
    from = opts.from
    sel = { verse, word }
    showSheet(wordStudy(verse, word))
    wireKinds()
    mark()
    if (!opts.noReveal) reveal(page.querySelector(`.w[data-v="${verse}"][data-i="${word}"]`))
  }

  function selectVerse(verse) {
    if (sel?.verse === verse && sel.word === undefined) return clear()
    from = undefined
    sel = { verse }
    showSheet(versePane(verse))
    wireKinds()
    mark()
    reveal(page.querySelector(`[data-verse="${verse}"]`))
  }

  function clear() {
    sel = undefined
    from = undefined
    setVisible(0)
    mark()
  }

  // ---------- the word study ----------

  let lexKind = params.get('tab') ?? 'dodson'
  let paneKind = params.get('kind') ?? 'words'

  function wordStudy(v, i) {
    const w = data.verses[v - 1].words[i]
    const L = lemmaOf(w)
    const verseWords = data.verses[v - 1].words
    const first = v === 1 && i === 0
    const last = v === data.verses.length && i === verseWords.length - 1
    const kinds = [
      ['dodson', 'Dodson'],
      ['abbott', 'Abbott-Smith'],
      ['liddell', 'Liddell'],
      ['occurrences', 'Occurrences', fmt(L.count)],
    ]
    return `
      <div class="pane-bar" data-drag>
        <span class="section-title">John 1:${v}</span>
        <span class="tools">
          <button class="icon-btn" data-step="-1" ${first ? 'disabled' : ''} aria-label="Previous word">${svg('left')}</button>
          <button class="icon-btn" data-step="1" ${last ? 'disabled' : ''} aria-label="Next word">${svg('right')}</button>
          <button class="icon-btn" data-close aria-label="Close">${svg('x')}</button>
        </span>
      </div>
      ${from ? `<button class="back-row" data-back>${svg('left', 16)}John 1:${from}</button>` : ''}
      <div class="lemma-head" data-drag>
        <div class="lemma-line"><span class="lemma" lang="grc">${esc(L.lemma)}</span><span class="translit">${esc(L.translit)}</span></div>
        <div class="gloss">${esc(L.gloss)}</div>
        <div class="parsing"><span class="pos">${esc(L.pos)}</span>${esc(w.parse || 'indeclinable')}</div>
        <div class="facts">${[
          `<span lang="grc">${esc(w.t)}</span>, “${glossHtml(w.g).replace(/<[^>]+>/g, '')}”`,
          `Strong’s ${w.s}`,
          `<button class="link" data-kind="occurrences">${fmt(L.count)}× in the NT</button>`,
        ]
          .map((f) => `<span class="fact">${f}</span>`)
          .join('&nbsp;· ')}</div>
      </div>
      ${kindsLine(kinds, lexKind, 'lex')}
      <div class="kind-page" id="kind-page">${lexPage(L, lexKind)}</div>`
  }

  function kindsLine(kinds, current, group) {
    return `<div class="kinds"><div class="kinds-line" role="tablist" data-group="${group}">
      ${kinds
        .map(
          ([id, label, count]) =>
            `<button class="kind" role="tab" data-kind="${id}" aria-selected="${id === current}">${label}${count ? `<span class="count">${count}</span>` : ''}</button>`,
        )
        .join('')}
      <span class="kind-underline"></span></div></div>`
  }

  const expanded = new Set()

  function lexPage(L, kind) {
    if (kind === 'dodson') {
      return `<div class="entry"><div class="entry-head" lang="grc">${esc(L.orth)}</div>
        <div>${esc(L.dodson || L.gloss)}</div></div>
        <div class="source-note">John Jeffrey Dodson, A Greek Lexicon of the New Testament (2010) · public domain</div>`
    }
    if (kind === 'abbott') {
      const a = L.abbott
      if (!a) return '<p class="quiet">Not in Abbott-Smith.</p>'
      const all = expanded.has(`a${L.lemma}`)
      let used = 0
      const senses = []
      for (const s of a.senses) {
        if (!all && used > 900 && senses.length) break
        senses.push(s)
        used += s.replace(/<[^>]+>/g, '').length
      }
      const cut = senses.length < a.senses.length || (!all && used > 1600)
      const shown = all ? a.senses : senses
      return `<div class="entry"><div class="entry-head">${a.form}</div>
        ${a.lxx ? `<div class="lxx">${a.lxx}</div>` : ''}
        <div class="${cut && !all ? 'clip' : ''}">${shown.join('')}</div></div>
        ${cut && !all ? `<button class="read-on" data-expand="a${esc(L.lemma)}">Read the whole entry</button>` : ''}
        <div class="source-note">G. Abbott-Smith, A Manual Greek Lexicon of the New Testament (1922)</div>`
    }
    if (kind === 'liddell') {
      const m = L.liddell
      if (!m) return '<p class="quiet">The Middle Liddell has no entry for this name: it is a lexicon of classical Greek.</p>'
      const all = expanded.has(`l${L.lemma}`)
      const shown = all ? m.senses : m.senses.slice(0, 5)
      return `<div class="entry"><div class="entry-head" lang="grc">${esc(m.head)}</div>
        ${shown.map((s) => `<div class="ml-sense" data-level="${s.level}">${s.n && s.level ? `<span class="sn">${esc(s.n)}.</span> ` : ''}${s.html}</div>`).join('')}</div>
        ${shown.length < m.senses.length ? `<button class="read-on" data-expand="l${esc(L.lemma)}">Read the whole entry</button>` : ''}
        <div class="source-note">Liddell &amp; Scott, An Intermediate Greek-English Lexicon (1889)</div>`
    }
    return `<div class="occ-intro">${fmt(L.count)} times in the New Testament, ${fmt(L.inJohn)} of them in St John.</div>
      ${L.samples
        .map(
          (s) => `<div class="occ"><button class="ref">${esc(s.ref)}</button>
          <div class="gk-line" lang="grc">${esc(s.before)} <span class="hit">${esc(s.word)}</span> ${esc(s.after)}</div>
          <div class="en">${esc(s.drb)}</div></div>`,
        )
        .join('')}
      <div class="source-note">Greek: Nestle 1904 · English: Douay-Rheims</div>`
  }

  // ---------- the verse pane ----------

  function versePane(v) {
    const words = data.verses[v - 1].words
    const kinds = [
      ['words', 'Words', words.length],
      ['translations', 'Translations'],
      ['commentary', 'Aquinas'],
      ['catechism', 'Catechism'],
      ['mass', 'Mass'],
    ]
    return `
      <div class="pane-bar" data-drag>
        <span class="section-title">John 1:${v}</span>
        <span class="tools"><button class="icon-btn" data-close aria-label="Close">${svg('x')}</button></span>
      </div>
      ${kindsLine(kinds, paneKind, 'pane')}
      <div class="kind-page" id="kind-page">${panePage(v, paneKind)}</div>`
  }

  function panePage(v, kind) {
    if (kind === 'words') {
      return data.verses[v - 1].words
        .map(
          (w, i) => `<button class="word-row" data-word="${i}">
          <span><span class="form" lang="grc">${esc(w.t)}</span><span class="lem" lang="grc">${esc(lemmaOf(w).lemma)}</span></span>
          <span><span class="gl">${glossHtml(w.g)}</span><span class="pc">${esc(w.code)}</span></span></button>`,
        )
        .join('')
    }
    if (kind === 'translations') {
      return Object.values(data.translations)
        .map(
          (t) => `<div class="translation-block"><span class="label">${t.name}</span>${esc(t.verses[v])}</div>`,
        )
        .join('')
    }
    return '<p class="quiet">As in the reader today: this kind is unchanged by the Greek edition.</p>'
  }

  // ---------- wiring the sheet ----------

  function placeUnderline(line) {
    const current = line.querySelector('[aria-selected="true"]')
    const bar = line.querySelector('.kind-underline')
    if (!current || !bar) return
    bar.style.left = `${current.offsetLeft}px`
    bar.style.width = `${current.offsetWidth}px`
    const inView =
      current.offsetLeft >= line.scrollLeft && current.offsetLeft + current.offsetWidth <= line.scrollLeft + line.clientWidth
    if (!inView) line.scrollTo({ left: Math.max(0, current.offsetLeft - 72), behavior: 'smooth' })
  }

  function wireKinds() {
    const line = body.querySelector('.kinds-line')
    if (line) requestAnimationFrame(() => placeUnderline(line))
  }

  function turnKind(id) {
    const line = body.querySelector('.kinds-line')
    const group = line.dataset.group
    const ids = [...line.querySelectorAll('.kind')].map((b) => b.dataset.kind)
    const before = group === 'lex' ? lexKind : paneKind
    if (group === 'lex') lexKind = id
    else paneKind = id
    for (const b of line.querySelectorAll('.kind')) b.setAttribute('aria-selected', String(b.dataset.kind === id))
    placeUnderline(line)
    const pageEl = document.getElementById('kind-page')
    pageEl.innerHTML =
      group === 'lex'
        ? lexPage(lemmaOf(data.verses[sel.verse - 1].words[sel.word]), id)
        : panePage(sel.verse, id)
    pageEl.className = `kind-page ${ids.indexOf(id) > ids.indexOf(before) ? 'enter-right' : 'enter-left'}`
    const kinds = body.querySelector('.kinds')
    if (body.scrollTop > kinds.offsetTop) body.scrollTop = kinds.offsetTop
  }

  body.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest('[data-close]')) return clear()
    if (t.closest('[data-back]')) return selectVerse(from)
    const kind = t.closest('[data-kind]')
    if (kind) return turnKind(kind.dataset.kind)
    const step = t.closest('[data-step]')
    if (step) {
      const n = Number(step.dataset.step)
      let { verse, word } = sel
      word += n
      if (word < 0) word = data.verses[--verse - 1].words.length - 1
      else if (word >= data.verses[verse - 1].words.length) {
        verse += 1
        word = 0
      }
      return selectWord(verse, word, { keep: true, from })
    }
    const row = t.closest('[data-word]')
    if (row) return selectWord(sel.verse, Number(row.dataset.word), { from: sel.verse, keep: true })
    const more = t.closest('[data-expand]')
    if (more) {
      expanded.add(more.dataset.expand)
      document.getElementById('kind-page').innerHTML = lexPage(
        lemmaOf(data.verses[sel.verse - 1].words[sel.word]),
        lexKind,
      )
    }
  })

  // ---------- taps in the text ----------

  // A word is tapped to study it; held, it opens its verse instead. The verse
  // number (its hit area enlarged) always opens the verse.
  let press
  page.addEventListener('pointerdown', (e) => {
    const w = e.target.closest('.w')
    if (!w) return
    w.classList.add('pressed')
    press = {
      el: w,
      x: e.clientX,
      y: e.clientY,
      timer: setTimeout(() => {
        w.classList.remove('pressed')
        press.long = true
        selectVerse(Number(w.dataset.v))
      }, 480),
    }
  })
  const cancelPress = () => {
    if (!press) return
    clearTimeout(press.timer)
    press.el.classList.remove('pressed')
  }
  page.addEventListener('pointermove', (e) => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) {
      cancelPress()
      press = undefined
    }
  })
  page.addEventListener('pointerup', (e) => {
    if (!press) return
    cancelPress()
    const { el, long } = press
    press = undefined
    if (long) return
    if (e.target.closest('.w') !== el) return
    dismissHint()
    selectWord(Number(el.dataset.v), Number(el.dataset.i))
  })
  page.addEventListener('click', (e) => {
    const vn = e.target.closest('[data-open-verse]')
    if (vn) {
      dismissHint()
      selectVerse(Number(vn.dataset.openVerse))
    }
  })
  page.addEventListener('contextmenu', (e) => e.preventDefault())

  // ---------- hint ----------

  const hint = document.getElementById('hint')
  function showHint(text) {
    if (params.has('word') || params.has('verse') || params.has('nohint')) return
    hint.textContent = text
    setTimeout(() => hint.classList.remove('gone'), 600)
    setTimeout(dismissHint, 6000)
  }
  function dismissHint() {
    hint.classList.add('gone')
  }

  // ---------- rendering helpers for the pages ----------

  /** A verse's words as tappable runs, with their punctuation and spaces. */
  function wordsHtml(v) {
    return data.verses[v - 1].words
      .map(
        (w, i) =>
          `${esc(w.lead)}<span class="w" data-v="${v}" data-i="${i}" data-s="${w.s}">${esc(w.t)}</span>${esc(w.p)}`,
      )
      .join(' ')
  }

  const verseNumber = (v) =>
    `<span class="vn" data-v="${v}" data-open-verse="${v}" role="button" aria-label="Verse ${v}">${v}</span>`

  function readerTop(controls = '') {
    return `
      <div class="reader-header">
        <span class="book">John ${svg('down')}</span>
        <span class="chapter">1</span>
      </div>
      ${controls}
      <div class="chapter-head">
        <span class="label book-label">John</span>
        <span class="label chapter-label">Chapter 1</span>
      </div>`
  }

  const readerFoot = `<div class="fleuron-rule" style="width:120px;margin:26px auto 0">❦</div>
    <p class="quiet" style="text-align:center;font-size:15px;margin:10px 24px 0">The prototype carries the Prologue, verses 1–14.</p>
    <div class="page-foot"></div>`

  function mount({ render, hintText }) {
    function draw() {
      page.innerHTML = render()
      mark()
      setVisible(visible)
    }
    draw()
    const word = params.get('word')
    if (word) {
      const [v, i] = word.split('.').map(Number)
      selectWord(v, i)
      if (params.get('detent') === 'full') setVisible(fullH())
    }
    const verse = params.get('verse')
    if (verse) selectVerse(Number(verse))
    if (hintText) showHint(hintText)
    return { redraw: draw }
  }

  return {
    data,
    params,
    esc,
    svg,
    glossHtml,
    lemmaOf,
    wordsHtml,
    verseNumber,
    readerTop,
    readerFoot,
    mount,
    selectVerse,
    remark: mark,
    onSelect: (f) => listeners.push(f),
    reveal,
    page,
    screen,
  }
})()
