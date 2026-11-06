// Shared machinery for the Hebrew prototypes: the phone, the theme, the marks
// control, the half-page sheet (word study and verse pane) and the marks the
// selection leaves in the text. Each page calls Heb.mount({ render }).

const Heb = (() => {
  const data = JSON.parse(document.getElementById('data').textContent)
  const params = new URLSearchParams(location.search)
  const windowH = 844
  const halfH = Math.round(windowH * 0.5)
  const icon = {
    down: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
  }
  const svg = (name, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${icon[name]}</svg>`
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const fmt = (n) => n.toLocaleString('en-US')

  // ---------- marks: Letters · Vowels · Chant ----------

  // Chant: everything. Vowels: no cantillation (U+0591–U+05AF) and no meteg
  // (U+05BD). Letters: the consonants alone — no vowels, dagesh, shin/sin
  // dots, rafe or the upper and lower dots.
  const strip = {
    chant: null,
    vowels: /[\u0591-\u05AF\u05BD]/g,
    letters: /[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g,
  }
  let marks = params.get('marks') ?? localStorage.getItem('heb-marks') ?? 'vowels'
  const show = (s) => (strip[marks] ? s.replace(strip[marks], '') : s)

  // ---------- theme ----------

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ember-proto-theme', theme)
    for (const b of document.querySelectorAll('.theme-toggle [data-theme]'))
      b.setAttribute('aria-pressed', String(b.dataset.theme === theme))
  }
  setTheme(params.get('theme') ?? localStorage.getItem('ember-proto-theme') ?? 'light')
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.theme-toggle [data-theme]')
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

  // ---------- the passage on the page ----------

  let pid = params.get('p') ?? window.hebDefault ?? 'gen1'
  const passage = () => data.passages[pid]
  const verseAt = (v) => passage().verses[v]
  const wordAt = (v, i) => verseAt(v).words[i]
  const ref = (v) => {
    const P = passage()
    const short = { Genesis: 'Gen', Psalms: 'Ps', Isaias: 'Is' }[P.heading.book]
    const chapter = P.heading.chapter.replace(/\D+/g, '')
    return `${short} ${P.heading.vul ? `${chapter} (${P.heading.vul.replace(/\D+/g, '')})` : chapter}:${verseAt(v).n}`
  }

  // ---------- selection ----------

  let sel
  let from
  function mark() {
    for (const el of page.querySelectorAll('.selected,.kin,.marked')) el.classList.remove('selected', 'kin', 'marked')
    if (sel?.word !== undefined) {
      const w = wordAt(sel.verse, sel.word)
      for (const el of page.querySelectorAll(`.w[data-k="${w.k}"]`)) el.classList.add('kin')
      for (const el of page.querySelectorAll(`.w[data-v="${sel.verse}"][data-i="${sel.word}"]`)) {
        el.classList.remove('kin')
        el.classList.add('selected')
      }
    }
    if (sel && sel.word === undefined) {
      for (const el of page.querySelectorAll(`[data-verse="${sel.verse}"]`)) el.classList.add('marked')
      for (const el of page.querySelectorAll(`.vn[data-v="${sel.verse}"]`)) el.classList.add('marked')
    }
  }

  function reveal(el) {
    if (!el) return
    const r = el.getBoundingClientRect()
    const s = screen.getBoundingClientRect()
    const top = r.top - s.top
    const limit = screenH() - halfH - 24
    if (r.bottom - s.top > limit || top < 60) page.scrollBy({ top: top - 140 })
  }

  function selectWord(verse, word, opts = {}) {
    if (!opts.keep && sel?.verse === verse && sel?.word === word) return clear()
    from = opts.from
    piece = opts.piece ?? wordAt(verse, word).mi
    sel = { verse, word }
    if (opts.kind) lexKind = opts.kind
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

  let lexKind = params.get('tab') ?? 'family'
  let paneKind = params.get('kind') ?? 'words'
  let piece = 0

  // TAHOT writes the stressed syllable with a capital: "be./re.Shit".
  function sound(x) {
    // "/" joins the pieces of a word, "." its syllables: "ve./L/o" is ve·lo.
    return x
      .replace(/\/\s*/g, '')
      .split('.')
      .filter(Boolean)
      .map((s) => (/[A-Z]/.test(s) ? `<b>${esc(s.toLowerCase())}</b>` : esc(s)))
      .join('<span class="dot">·</span>')
  }

  // Brackets mark English the Hebrew implies: lighter, not bracketed.
  const glossHtml = (g) =>
    !g ? '<span class="implied">—</span>' : esc(g).replace(/[[<]([^\]>]+)[\]>]/g, '<span class="implied">$1</span>')

  // TEHMC: "Function=Verb ; Stem=Hiphil (hence Action=Causative/declarative; Voice=Active); Form=..."
  function grammar(code) {
    const raw = data.grammar[code] ?? ''
    const parts = {}
    for (const m of raw.matchAll(/(\w+)=([^;()]+(?:\([^)]*\))?)/g)) parts[m[1]] = m[2].trim()
    const fn = parts.Function ?? ''
    const out = []
    const plain = (s) => (s ?? '').replace(/\s*\(hence[^)]*\)/, '').trim()
    if (parts.Stem) {
      const hence = parts.Stem.match(/hence ([^)]*)/)?.[1] ?? ''
      const action = hence.match(/Action=([^;]+)/)?.[1]?.toLowerCase()
      const voice = hence.match(/Voice=([^;]+)/)?.[1]?.toLowerCase()
      out.push(`<b>${esc(plain(parts.Stem))}</b>${action ? ` <span class="why">${esc(action)}${voice ? `, ${esc(voice)}` : ''}</span>` : ''}`)
    }
    if (parts.Form) {
      const tense = parts.Form.match(/Tense=([^;)]+)/)?.[1]?.toLowerCase()
      out.push(`${esc(plain(parts.Form).toLowerCase())}${tense ? ` <span class="why">${esc(tense)}</span>` : ''}`)
    }
    const pgn = [parts.Person, parts.Gender, parts.Number].filter(Boolean).map((s) => s.toLowerCase())
    if (pgn.length) out.push(esc(pgn.join(' ').replace('third', '3rd').replace('second', '2nd').replace('first', '1st')))
    if (parts.State) out.push(esc(parts.State.toLowerCase()))
    return { pos: fn.toLowerCase(), text: out.join(' · '), aramaic: code.startsWith('A'), terms: terms(parts) }
  }

  /** The grammar in the grammarians' own terms: binyan and conjugation,
   * person-gender-number, state — from TEHMC's expansion of the code. */
  function terms(parts) {
    const plain = (s) => (s ?? '').replace(/\s*\(hence[^)]*\)/, '').trim()
    const form = plain(parts.Form)
    const mood = (parts.Form ?? '').match(/Mood=([^;)]+)/)?.[1] ?? ''
    const pgn = [
      { First: '1', Second: '2', Third: '3' }[parts.Person] ?? '',
      { Masculine: 'm', Feminine: 'f', 'Either gender': 'c', Common: 'c', Both: 'c' }[parts.Gender] ?? '',
      { Singular: 's', Plural: 'p', Dual: 'd' }[parts.Number] ?? '',
    ].join('')
    const state = { Absolute: 'absolute', Construct: 'construct', Determined: 'determined' }[parts.State] ?? ''
    if (parts.Function === 'Verb') {
      const conj = (() => {
        if (form === 'Perfect') return 'qatal'
        if (form === 'Consecutive Perfect') return 'weqatal'
        if (form === 'Consecutive Imperfect') return 'wayyiqtol'
        if (form === 'Imperfect' || form === 'Conjunction+Imperfect') {
          if (/^Cohortative$/.test(mood)) return 'cohortative (yiqtol)'
          if (/^Jussive$/.test(mood)) return 'jussive (yiqtol)'
          return form === 'Conjunction+Imperfect' ? 'weyiqtol' : 'yiqtol'
        }
        if (form === 'Imperative') return 'imperative'
        if (form === 'Infinitive') return state === 'construct' ? 'infinitive construct' : state === 'absolute' ? 'infinitive absolute' : 'infinitive'
        if (form === 'Participle') return 'participle (active)'
        if (form === 'Participle passive') return 'participle (passive)'
        return form.toLowerCase()
      })()
      const stem = plain(parts.Stem)
      const isInf = /infinitive/.test(conj)
      return `<b>${esc(stem)}</b> <i>${esc(conj)}</i>${pgn ? ` ${esc(pgn)}` : ''}${state && !isInf ? ` ${esc(state)}` : ''}`
    }
    if (parts.Function === 'Noun' || parts.Function === 'Adjective') {
      return `${esc(parts.Function.toLowerCase())}${pgn ? ` ${esc(pgn)}` : ''}${state ? ` ${esc(state)}` : ''}`
    }
    return ''
  }

  /** The word's accent: which, disjunctive or conjunctive, its rank, pause. */
  function accentLine(w) {
    const a = w.acc
    if (!a) return ''
    const system = passage().poetry ? 'poetic accents (Psalms, Proverbs, Job)' : 'prose accents'
    if (a.kind === 'bound') return `<div class="accent"><span class="acc-label">Accent</span><span class="why">${esc(a.note)}</span></div>`
    if (!a.name) return `<div class="accent"><span class="acc-label">Accent</span><span class="why">none written</span></div>`
    const rank = a.rank ? ` · rank ${a.rank} <span class="why">(${esc(a.title)})</span>` : ''
    return `<div class="accent"><span class="acc-label">Accent</span><b>${esc(a.name)}</b> · ${esc(a.kind)}${rank}${a.pause ? ' · <b>in pause</b>' : ''}
      <div class="acc-note">${a.note ? `${esc(a.note)} · ` : ''}${system}; names and ranks after Gesenius §15</div></div>`
  }

  function wordStudy(v, i) {
    const w = wordAt(v, i)
    const p = w.p[piece] ?? w.p[w.mi]
    const L = data.lex[p.s] ?? {}
    const root = L.root ? data.roots[L.root] : undefined
    const g = grammar(p.m)
    const first = v === 0 && i === 0
    const last = v === passage().verses.length - 1 && i === verseAt(v).words.length - 1
    const name = !!L.name
    const nameSaid = w.name ? Object.values(data.lex).find((x) => x.name && w.p.some((q) => q.s === x.k))?.name : undefined
    const kinds = [
      ...(root && !name ? [['family', 'Family', root.members.length]] : []),
      ['brief', 'Meaning'],
      ...(L.bdb ? [['bdb', 'BDB']] : []),
      ...(L.strong ? [['strong', 'Strong’s']] : []),
      ['occurrences', 'Occurrences', fmt(L.count ?? 0)],
    ]
    if (!kinds.some(([id]) => id === lexKind)) lexKind = kinds[0][0]

    const chips = w.p
      .map(
        (q, j) => `<button class="chip ${j === piece ? 'on' : ''} ${j === w.mi ? 'main' : ''}" data-piece="${j}">
          <span class="chip-he" lang="he">${esc(show(q.h))}</span>
          <span class="chip-gl">${glossHtml(q.g)}</span></button>`,
      )
      .join('<span class="joint" aria-hidden="true"></span>')

    const q = w.q
    const qere = q
      ? `<div class="qere-box">
          <div class="qrow"><span class="tag">Written</span><span lang="he" class="he">${esc(q.written)}</span>${q.kg ? `<span class="qg">“${glossHtml(q.kg.replace(/\//g, ''))}”</span>` : ''}</div>
          <div class="qrow"><span class="tag">Read</span><span lang="he" class="he">${esc(q.read)}</span><span class="qg">“${glossHtml(w.p.map((x) => x.g).join(' '))}”</span></div>
          <p>${q.printed ? 'The page prints the written letters with the vowels of the word read aloud, as the codex does; the ° marks it. ' : ''}${q.sense ? 'Here the two differ in sense.' : ''}${q.follows ? ` The Vulgate follows the written form (“${esc(q.follows.vul)}”), and the Douay after it: “${esc(q.follows.drb)}”` : ''}</p>
        </div>`
      : ''

    const nameBox = name
      ? `<div class="name-box">
          <div class="name-he" lang="he">יהוה</div>
          <p>The Name God revealed to Moses (Ex 3:14–15). In Catholic reading it is not pronounced: <i>Adonai</i>, “the Lord”, is said instead — as the Septuagint wrote <span lang="grc">Κύριος</span> and the Vulgate <i>Dominus</i> (Congregation for Divine Worship, letter of 29 June 2008).</p>
        </div>`
      : ''

    return `
      <div class="pane-bar" data-drag>
        <span class="section-title">${esc(ref(v))}</span>
        <span class="tools">
          <button class="icon-btn" data-step="-1" ${first ? 'disabled' : ''} aria-label="Previous word">${svg('right')}</button>
          <button class="icon-btn" data-step="1" ${last ? 'disabled' : ''} aria-label="Next word">${svg('left')}</button>
          <button class="icon-btn" data-close aria-label="Close">${svg('x')}</button>
        </span>
      </div>
      ${from !== undefined ? `<button class="back-row" data-back>${svg('left', 16)}${esc(ref(from))}</button>` : ''}
      <div class="lemma-head" data-drag>
        <div class="chips" dir="rtl">${chips}</div>
        <div class="word-sound">${nameSaid ? `<b class="yhwh">YHWH</b> <span class="why">· read</span> ${esc(nameSaid.read)} <span class="why">(${esc(nameSaid.as)})</span>` : sound(w.x)}</div>
        ${qere}
        <div class="lemma-line">
          <span class="lemma he-lemma" lang="he">${esc(L.lemma || p.h)}</span>
          <span class="translit">${esc(L.x ?? '')}</span>
        </div>
        <div class="gloss">${esc((L.gloss ?? '').replace(/^.*?:\s*/, '') || p.g)}</div>
        <div class="parsing"><span class="pos">${esc(g.aramaic ? `Aramaic ${g.pos}` : g.pos)}</span>${g.text}</div>
        ${g.terms ? `<div class="terms">${g.terms}<span class="raw">${esc(p.m)}</span></div>` : `<div class="terms"><span class="raw">${esc(p.m)}</span></div>`}
        ${accentLine(w)}
        ${root && !name
          ? `<button class="root-line" data-kind="family"><span class="root-label">Root</span><span class="root-letters" lang="he">${(root.letters.normalize('NFD').replace(/[\u0591-\u05BD\u05BF\u05C7]/g, '').match(/\p{L}\p{M}*/gu) ?? []).join(' · ')}</span><span class="root-count">${root.members.length} word${root.members.length === 1 ? '' : 's'} in the family</span></button>`
          : ''}
        ${nameBox}
        <div class="facts">${[
          `Strong’s ${esc(p.s.replace(/^H0*/, '').replace(/[A-Z]$/, ''))}`,
          `<button class="link" data-kind="occurrences">${fmt(L.count ?? 0)}× in the Hebrew Bible</button>`,
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
    if (kind === 'family') {
      const root = data.roots[L.root]
      return `<div class="occ-intro">Words built on the root <span lang="he" class="he">${esc(root.letters)}</span>, as Brown–Driver–Briggs files them, with how often each occurs.</div>
        ${root.members
          .map(
            (m) => `<div class="fam ${m.li === L.li ? 'here' : ''}">
              <span class="fam-he" lang="he">${esc(m.w)}</span>
              <span class="fam-mid"><span class="fam-x">${esc(m.x)}</span><span class="fam-def">${esc(m.def)}</span></span>
              <span class="fam-n">${fmt(m.count)}</span></div>`,
          )
          .join('')}
        <div class="source-note">Brown, Driver &amp; Briggs (1906) · lexical index by Open Scriptures</div>`
    }
    if (kind === 'brief') {
      return `<div class="entry"><div class="entry-head" lang="he">${esc(L.lemma)}</div>
        <div class="tbesh">${L.tbesh || esc(L.gloss)}</div></div>
        <div class="source-note">STEP Bible, TBESH, Tyndale House Cambridge · CC BY 4.0</div>`
    }
    if (kind === 'bdb') {
      const all = expanded.has(`b${L.k}`)
      const long = L.bdb.length > 1400
      return `${L.name ? `<p class="name-note">Quoted as its author wrote it; in Catholic reading the Name is not pronounced, and <i>Adonai</i>, ‘the Lord’, is said instead.</p>` : ''}<div class="entry bdb ${long && !all ? 'clip' : ''}">${L.bdb}</div>
        ${long && !all ? `<button class="read-on" data-expand="b${esc(L.k)}">Read the whole entry</button>` : ''}
        <div class="source-note">Brown, Driver &amp; Briggs, A Hebrew and English Lexicon of the Old Testament (1906)</div>`
    }
    if (kind === 'strong') {
      const s = L.strong
      return `${L.name ? `<p class="name-note">Quoted as its author wrote it; in Catholic reading the Name is not pronounced, and <i>Adonai</i>, ‘the Lord’, is said instead.</p>` : ''}<div class="entry"><div class="entry-head"><span lang="he">${esc(s.head)}</span> <i class="pron">${esc(s.xlit)} · ${esc(s.pron)}</i></div>${s.html}</div>
        <div class="source-note">James Strong, Dictionary of the Hebrew Bible (1890)</div>`
    }
    return `<div class="occ-intro">${fmt(L.count ?? 0)} times in the Hebrew Bible. The first few:</div>
      ${(L.samples ?? [])
        .map(
          (s) => `<div class="occ"><button class="ref">${esc(s.ref)}</button>
          <div class="he-line" lang="he" dir="rtl">${s.he.before ? '… ' : ''}${s.he.words.map((x) => (x.hit ? `<span class="hit">${esc(show(x.t))}</span>` : esc(show(x.t)))).join(' ')}${s.he.after ? ' …' : ''}</div>
          <div class="en">${esc(s.drb)}</div></div>`,
        )
        .join('')}
      <div class="source-note">Hebrew: Leningrad Codex (TAHOT) · English: Douay-Rheims</div>`
  }

  // ---------- the verse pane ----------

  function versePane(v) {
    const V = verseAt(v)
    const kinds = [
      ['words', 'Words', V.words.length],
      ['translations', 'Translations'],
      ['commentary', 'Haydock'],
      ['catechism', 'Catechism'],
    ]
    return `
      <div class="pane-bar" data-drag>
        <span class="section-title">${esc(ref(v))}</span>
        <span class="tools"><button class="icon-btn" data-close aria-label="Close">${svg('x')}</button></span>
      </div>
      ${kindsLine(kinds, paneKind, 'pane')}
      <div class="kind-page" id="kind-page">${panePage(v, paneKind)}</div>`
  }

  function panePage(v, kind) {
    const V = verseAt(v)
    if (kind === 'words') {
      return V.words
        .map(
          (w, i) => `<button class="word-row" data-word="${i}">
          <span class="he-row" lang="he" dir="rtl">${esc(show(w.t))}</span>
          <span><span class="gl">${w.p.map((q) => glossHtml(q.g)).join(' ')}</span><span class="pc">${esc(w.x.replace(/\//g, '.'))}</span></span></button>`,
        )
        .join('')
    }
    if (kind === 'translations') {
      return [
        V.lxx && ['Septuagint', V.lxx, 'grc'],
        V.vul && ['Vulgate', V.vul, ''],
        V.drb && ['Douay-Rheims', V.drb, 'en'],
      ]
        .filter(Boolean)
        .map(([n, t, l]) => `<div class="translation-block"><span class="label">${n}</span><span lang="${l}">${esc(t)}</span></div>`)
        .join('')
    }
    return '<p class="quiet">As in the reader today: the commentary and Catechism kinds read the verse at its shared address, whichever edition is open.</p>'
  }

  // ---------- wiring the sheet ----------

  function placeUnderline(line) {
    const current = line.querySelector('[aria-selected="true"]')
    const bar = line.querySelector('.kind-underline')
    if (!current || !bar) return
    bar.style.left = `${current.offsetLeft}px`
    bar.style.width = `${current.offsetWidth}px`
  }
  function wireKinds() {
    const line = body.querySelector('.kinds-line')
    if (line) requestAnimationFrame(() => placeUnderline(line))
  }

  function currentLex() {
    const w = wordAt(sel.verse, sel.word)
    return data.lex[(w.p[piece] ?? w.p[w.mi]).s] ?? {}
  }

  function turnKind(id) {
    const line = body.querySelector('.kinds-line')
    const group = line.dataset.group
    const ids = [...line.querySelectorAll('.kind')].map((b) => b.dataset.kind)
    if (!ids.includes(id)) return
    const before = group === 'lex' ? lexKind : paneKind
    if (group === 'lex') lexKind = id
    else paneKind = id
    for (const b of line.querySelectorAll('.kind')) b.setAttribute('aria-selected', String(b.dataset.kind === id))
    placeUnderline(line)
    const pageEl = document.getElementById('kind-page')
    pageEl.innerHTML = group === 'lex' ? lexPage(currentLex(), id) : panePage(sel.verse, id)
    pageEl.className = `kind-page ${ids.indexOf(id) > ids.indexOf(before) ? 'enter-right' : 'enter-left'}`
    const kinds = body.querySelector('.kinds')
    if (body.scrollTop > kinds.offsetTop) body.scrollTop = kinds.offsetTop
  }

  body.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest('[data-close]')) return clear()
    if (t.closest('[data-back]')) return selectVerse(from)
    const chip = t.closest('[data-piece]')
    if (chip) return selectWord(sel.verse, sel.word, { keep: true, from, piece: Number(chip.dataset.piece), noReveal: true })
    const kind = t.closest('[data-kind]')
    if (kind) return turnKind(kind.dataset.kind)
    const step = t.closest('[data-step]')
    if (step) {
      let { verse, word } = sel
      word += Number(step.dataset.step)
      if (word < 0) word = verseAt(--verse).words.length - 1
      else if (word >= verseAt(verse).words.length) {
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
      document.getElementById('kind-page').innerHTML = lexPage(currentLex(), lexKind)
    }
  })

  // ---------- taps in the text ----------

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
    const m = e.target.closest('[data-marks]')
    if (m) {
      marks = m.dataset.marks
      localStorage.setItem('heb-marks', marks)
      redraw?.()
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

  /** One word as a tappable run, with what follows it: a maqaf binds it to the next. */
  function wordHtml(v, i) {
    const w = wordAt(v, i)
    const cls = `w${w.q ? ' qere' : ''}${w.name ? ' name' : ''}`
    let out = `<span class="${cls}" data-v="${v}" data-i="${i}" data-k="${esc(w.k)}">${esc(show(w.t))}</span>`
    if (w.mq) out += '<span class="mq">\u05BE</span>'
    if (w.pq) out += ' <span class="pq">\u05C0</span>'
    if (w.end) out += '<span class="sof">\u05C3</span>'
    return out
  }

  function wordsHtml(v, from = 0, to) {
    const ws = verseAt(v).words
    const end = to ?? ws.length
    let out = ''
    for (let i = from; i < end; i++) {
      out += wordHtml(v, i)
      if (i < end - 1 && !ws[i].mq) out += ' '
    }
    return out
  }

  /** The Vulgate's number for a verse, where it is not the Hebrew's. */
  function vulgateNumber(v) {
    const V = verseAt(v)
    if (!V.vulRef) return ''
    const P = passage()
    const [c, n] = V.vulRef
    const chapter = Number((P.heading.vul ?? '').replace(/\D+/g, '')) || P.chapter
    if (c !== chapter) return `${c}:${n}`
    return n !== V.n ? String(n) : ''
  }

  const verseNumber = (v) => {
    const vul = vulgateNumber(v)
    return `<span class="vn" data-v="${v}" data-open-verse="${v}" role="button" aria-label="Verse ${verseAt(v).n}${vul ? `, Vulgate ${vul}` : ''}">${verseAt(v).n}${vul ? `<span class="vul-n"> · Vulg. ${vul}</span>` : ''}</span>`
  }

  /** Where a poetic verse breaks into its lines: after the word carrying
   * oleh weyored (U+05AB, its yored the merkha U+05A5 on the same or the
   * next word), and after the word carrying atnach (U+0591). A half still
   * longer than five words is cut again after its revia (U+0597), the next
   * divider down. */
  function lineBreaks(v) {
    const ws = verseAt(v).words
    const cuts = new Set()
    ws.forEach((w, i) => {
      if (w.t.includes('\u05AB')) cuts.add(!w.t.includes('\u05A5') && ws[i + 1]?.t.includes('\u05A5') ? i + 1 : i)
      if (w.t.includes('\u0591')) cuts.add(i)
    })
    const main = [...cuts].filter((i) => i < ws.length - 1).sort((a, b) => a - b)
    const bounds = [-1, ...main, ws.length - 1]
    for (let j = 0; j < bounds.length - 1; j++) {
      const [a, b] = [bounds[j] + 1, bounds[j + 1]]
      if (b - a + 1 <= 5) continue
      for (let i = b - 1; i > a; i--) {
        if (ws[i].t.includes('\u0597')) {
          cuts.add(i)
          break
        }
      }
    }
    return [...cuts].filter((i) => i < ws.length - 1).sort((a, b) => a - b)
  }

  function marksControl() {
    const stops = [
      ['letters', 'Letters'],
      ['vowels', 'Vowels'],
      ['chant', 'Chant'],
    ]
    return `<div class="marks" role="radiogroup" aria-label="Marks">
      ${stops
        .map(
          ([id, label]) =>
            `<button class="stop" role="radio" data-marks="${id}" aria-checked="${marks === id}"><span class="dot"></span><span class="stop-label">${label}</span></button>`,
        )
        .join('')}
      <span class="track" aria-hidden="true"></span>
    </div>`
  }

  function tabs(current) {
    const t = [
      ['text', 'Text', 'page.html'],
      ['interlinear', 'Interlinear', 'interlinear.html'],
      ['parallel', 'Parallel', 'parallel.html'],
    ]
    return `<div class="tabline">${t
      .map(([id, label, href]) => `<a class="tab" href="${href}?p=${pid}" aria-selected="${id === current}">${label}</a>`)
      .join('')}</div>`
  }

  function readerTop(controls = '') {
    const H = passage().heading
    return `
      <div class="reader-header">
        <span class="book">${esc(H.book)} ${svg('down')}</span>
        <span class="chapter">${esc(H.chapter.replace(/\D+/g, ''))}</span>
      </div>
      ${controls}
      <div class="chapter-head">
        <span class="label book-label">${esc(H.book)}</span>
        <span class="he-name"><span lang="he">${esc(H.he)}</span> · <i>${esc(H.heX)}</i></span>
        <span class="label chapter-label">${esc(H.chapter)}${H.vul ? `<span class="vul"> · ${esc(H.vul)}</span>` : ''}</span>
      </div>`
  }

  const readerFoot = (note) => `<div class="fleuron-rule" style="width:120px;margin:26px auto 0">❦</div>
    <p class="quiet" style="text-align:center;font-size:15px;margin:10px 24px 0">${note}</p>
    <div class="page-foot"></div>`

  let redraw
  function mount({ render, hintText }) {
    function draw() {
      const top = page.scrollTop
      page.innerHTML = render()
      page.scrollTop = top
      mark()
      setVisible(visible)
      if (sel?.word !== undefined) {
        body.querySelector('#kind-page') && (document.getElementById('kind-page').innerHTML = lexPage(currentLex(), lexKind))
      }
    }
    redraw = draw
    draw()
    const word = params.get('word')
    if (word) {
      const [v, i, pc] = word.split('.').map(Number)
      selectWord(v, i, { piece: Number.isNaN(pc) ? undefined : pc })
      if (params.get('detent') === 'full') setVisible(fullH())
    }
    const verse = params.get('verse')
    if (verse) selectVerse(Number(verse))
    if (hintText) showHint(hintText)
    return { redraw: draw }
  }

  const remember = {
    get: (k, fallback) => {
      const v = localStorage.getItem(`heb-${k}`)
      return v === null ? fallback : JSON.parse(v)
    },
    set: (k, v) => localStorage.setItem(`heb-${k}`, JSON.stringify(v)),
  }

  return {
    remember,
    data,
    params,
    esc,
    show,
    passage,
    verseAt,
    wordAt,
    wordHtml,
    wordsHtml,
    verseNumber,
    lineBreaks,
    marksControl,
    vulgateNumber,
    tabs,
    readerTop,
    readerFoot,
    glossHtml,
    sound,
    mount,
    page,
    get pid() {
      return pid
    },
  }
})()
