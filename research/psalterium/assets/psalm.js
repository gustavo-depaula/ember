/* Psalterium review page — generalised from review.html. The psalm arrives as JSON in <script id="psalm-data">;
   the reader's choices live in localStorage under data.storeKey. The functions above boot() take (data, state)
   so that decisions.html can use them for every psalm at once. */

const escapeHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const verseAnchor = (id) => `v-${id.replace(':', '-')}`;
// a standing question changes no word (no refs, no forms); it starts unanswered, where a wording starts on the draft
const isStanding = (d) => !(d.refs ?? []).length;
const isOpen = (d) => !d.decided;
const wordings = (data) => data.decisions.filter((d) => !isStanding(d) && isOpen(d));
const pickOf = (d, state) => (!isOpen(d) ? 0 : d.id in state.picks ? state.picks[d.id] : isStanding(d) ? -1 : 0);

const fromLabels = {
  draft: 'draft', stylist: 'the stylist’s fix', latinist: 'the Latinist’s fix', ambiguity: 'from the ambiguity reader',
  glossary: 'the glossary’s', checks: 'from the checks', MS1932: 'Matos Soares 1932', DRB: 'Douay-Rheims',
};

/* ───────── state ───────── */
function loadState(data, storage) {
  const read = (key) => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; } };
  // Ps 4 was first reviewed in review.html: bring those choices along once, if this page has none of its own
  const legacy = data.legacyStoreKey ? read(data.legacyStoreKey) : null;
  const saved = read(data.storeKey) ?? (legacy && { picks: legacy.picks, mine: legacy.mine, notes: legacy.notes, stumbles: legacy.stumbles, pointing: legacy.pointing });
  const state = { view: 'facing', pointing: 'app', beside: 'none', picks: {}, notes: {}, stumbles: '', ...(saved ?? {}) };
  if (!['facing', 'layers'].includes(state.view)) state.view = 'facing';
  const valid = (picks) => Object.fromEntries(Object.entries(picks ?? {}).filter(([id, i]) => data.decisions.some((d) => d.id === id && d.options[i])));
  state.picks = valid(state.picks);
  if (state.mine) state.mine = valid(state.mine);
  // a page opens on the stylist's wording (Gustavo: the stylist is the default); once only, so that choosing the
  // draft or one's own words afterwards is remembered and not overridden on the next visit
  const untouched = !state.mine && !wordings(data).some((d) => d.id in state.picks);
  if (!state.defaulted && untouched && (data.presets ?? []).some((preset) => preset.from === 'stylist' && !preset.same)) applyPreset(data, state, 'stylist');
  state.defaulted = true;
  return state;
}
const saveState = (data, state, storage) => storage.setItem(data.storeKey, JSON.stringify(state));

function choose(data, state, id, index) {
  state.picks[id] = index;
  // a choice made by hand is "mine", and comes back after trying a preset
  state.mine = Object.fromEntries(wordings(data).filter((d) => d.id in state.picks).map((d) => [d.id, state.picks[d.id]]));
}

function applyPreset(data, state, preset) {
  // presets touch only the wording; standing questions are left alone
  const standing = Object.fromEntries(data.decisions.filter((d) => isStanding(d) && d.id in state.picks).map((d) => [d.id, state.picks[d.id]]));
  if (preset === 'draft') state.picks = standing;
  else if (preset === 'mine') state.picks = { ...standing, ...(state.mine ?? {}) };
  else state.picks = { ...standing, ...Object.fromEntries(wordings(data).map((d) => [d.id, presetIndex(d, preset)])) };
}
const presetIndex = (d, from) => Math.max(0, d.options.findIndex((o, i) => i > 0 && o.from === from));

/* ───────── filling the slots ───────── */
// slot → the form now standing in it. Option 0 is the draft; a chosen option that leaves a slot unsaid keeps the draft's form.
function currentForms(data, state) {
  const forms = {};
  for (const d of data.decisions) {
    const index = Math.max(0, pickOf(d, state));
    for (const option of index ? [d.options[0], d.options[index]] : [d.options[0]]) {
      for (const [slot, form] of Object.entries(option.forms ?? {})) forms[slot] = { form, d, option, changed: index > 0 };
    }
  }
  return forms;
}

// A verse as runs of text, each knowing which decision owns it. A form may hold another {slot}: the inner word keeps its
// own owner, so no link ever nests inside another. An option may name a `mark` — the words of its form that carry the link.
function segments(text, forms, owner, depth = 0) {
  if (depth > 4) return [{ text, owner }];
  const parts = text.split(/\{(\w+)\}/);
  const handle = owner?.option.mark && parts.some((p, i) => i % 2 === 0 && p.includes(owner.option.mark)) ? owner.option.mark : undefined;
  let handled = false;
  return parts.flatMap((part, i) => {
    if (i % 2) {
      const filled = forms[part];
      if (!filled) return [{ text: `{${part}}`, owner }];
      const runs = segments(filled.form, forms, filled, depth + 1);
      // A form that is nothing but another slot (a verse's own question, following the psalm's term by default) has no
      // word of its own to touch: the words stay with the local question, which is the one this verse raises.
      return /^\{\w+\}$/.test(filled.form) ? runs.map((run) => ({ ...run, owner: filled })) : runs;
    }
    if (!part) return [];
    if (!handle) return [{ text: part, owner }];
    const at = handled ? -1 : part.indexOf(handle);
    if (at < 0) return [{ text: part }];
    handled = true;
    return [{ text: part.slice(0, at) }, { text: handle, owner }, { text: part.slice(at + handle.length) }].filter((s) => s.text);
  });
}
const filledText = (text, forms) => segments(text, forms).map((s) => s.text).join('');

/* ───────── pointing ───────── */
// Runs → cola. As Ember shows it (DO noflexa=1): ‡ becomes the mediant, the * after it and every † vanish.
function colons(runs, mode) {
  const out = [{ pieces: [], mark: '' }];
  let secondMediant = 'none';
  for (const run of runs) {
    run.text.split(/([†‡*+])/).forEach((part, i) => {
      if (i % 2 === 0) { if (part) out[out.length - 1].pieces.push({ ...run, text: part }); return; }
      let mark = part;
      if (mode === 'app') {
        if (mark === '†') return;
        if (mark === '‡' && secondMediant === 'none') { secondMediant = 'moved'; mark = '*'; }
        else if (mark === '*' && secondMediant === 'moved') { secondMediant = 'done'; return; }
      }
      out[out.length - 1].mark = mark;
      out.push({ pieces: [], mark: '' });
    });
  }
  return out.filter((c) => c.pieces.length || c.mark);
}

function pointedHtml(runs, mode) {
  return colons(runs, mode).map(({ pieces, mark }) => {
    const last = pieces.length - 1;
    const body = pieces.map((piece, i) => {
      const edged = i === 0 ? piece.text.trimStart() : piece.text;
      const text = i === last ? edged.trimEnd() : edged;
      const d = piece.owner?.d;
      if (!d || !isOpen(d) || !text.trim()) return escapeHtml(text);
      // the dotted rule runs under the words only, never under the space around them
      const [, lead, words, tail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      return `${lead}<a class="open${piece.owner.changed ? ' changed' : ''}" href="#d-${d.id}">${escapeHtml(words)}</a>${tail}`;
    }).join('');
    return `<span class="colon">${body}${mark ? `<span class="mark" aria-hidden="true">${mark}</span>` : ''}</span>`;
  }).join('');
}
const pointedInline = (text) => escapeHtml(text).replace(/\s*([†‡*+])/g, '<span class="mark" aria-hidden="true">$1</span>');
const pointedText = (text, mode) => colons([{ text }], mode).map((c) => c.pieces.map((p) => p.text).join('').replace(/\s+/g, ' ').trim() + (c.mark ? ` ${c.mark}` : '')).join(' ');

/* ───────── the psalm ───────── */
function psalmHtml(data, state, compare) {
  const forms = currentForms(data, state);
  return data.verses.map(({ id, la, pt }, index) => {
    const num = id.split(':')[1];
    return `<div class="verse" id="${verseAnchor(id)}">
      <div class="side la" translate="no"><span class="num">${num}</span>${pointedHtml([{ text: la }], state.pointing)}</div>
      <div class="side pt" lang="pt-BR"><span class="num">${num}</span>${pointedHtml(segments(pt, forms), state.pointing)}</div>
      ${besideHtml(data, state, compare, index)}
    </div>`;
  }).join('');
}

const versionRow = (v, parts) => `<p lang="${v.lang === 'pt' ? 'pt-BR' : 'en'}"><span class="vname" title="${escapeHtml(v.note)}">${escapeHtml(v.name)}</span>${parts}</p>`;
const numbered = (list) => list.map(([n, text]) => `${n === null || n === undefined ? '' : `<sup>${n}</sup>`}${text === null || text === undefined ? '<span class="absent">missing from the source consulted</span>' : escapeHtml(text)}`).join(' ');

// What stands beside one prayed verse: the literal tier under the Portuguese; other psalters under the column of their
// language, with their own verse numbers, because most of them divide the psalm as the Hebrew does, not as the Breviary.
function besideHtml(data, state, compare, index) {
  const { id, literal } = data.verses[index];
  if (state.beside === 'literal') return literal ? `<div></div><div class="cf"><p lang="pt-BR"><span class="vname">literal</span>${pointedInline(literal)}</p></div>` : '';
  if (!compare || state.beside === 'none') return '';
  const column = (lang) => {
    if (state.beside !== 'all' && state.beside !== lang) return '<div></div>';
    const rows = compare.versions.filter((v) => v.lang === lang).map((v) => {
      const here = compare.verses?.[id]?.[v.id];
      if (!here) return '';
      // the Breviary splits some verses (2a / 2b) and the Hebrew joins others: a version whose text is the same
      // for the next prayed verse is shown once, there, after the whole of what it covers
      const next = compare.verses?.[data.verses[index + 1]?.id]?.[v.id];
      if (next && JSON.stringify(next) === JSON.stringify(here)) return '';
      return versionRow(v, numbered(here));
    }).join('');
    return `<div class="cf">${rows}</div>`;
  };
  return column('en') + column('pt');
}

// Versions that cannot be set verse against verse (another verse division; OCR that will not split) stand once, above.
function blocksHtml(state, compare) {
  if (!compare?.blocks || !['pt', 'en', 'all'].includes(state.beside)) return '';
  const column = (lang) => {
    if (state.beside !== 'all' && state.beside !== lang) return '<div></div>';
    const rows = compare.versions.filter((v) => v.lang === lang && compare.blocks[v.id]).map((v) => {
      const block = compare.blocks[v.id];
      const raw = block.length === 1 && (block[0][0] === null || block[0][0] === undefined);
      return versionRow(v, raw ? `<span class="raw">${escapeHtml(block[0][1])}</span>` : numbered(block));
    }).join('');
    return `<div class="cf">${rows}</div>`;
  };
  const html = column('en') + column('pt');
  return /<p /.test(html) ? `<div class="verse">${html}</div>` : '';
}

/* ───────── the layers: the method's strata, verse by verse ───────── */
// Word-level difference between two drafts (longest common subsequence over whitespace-separated words).
function diffWords(before, after) {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { out.push({ kind: 'same', word: a[i] }); i++; j++; }
    // what left is shown before what came, so a replaced word reads old → new
    else if (i < a.length && (j === b.length || table[i + 1][j] >= table[i][j + 1])) { out.push({ kind: 'removed', word: a[i] }); i++; }
    else { out.push({ kind: 'added', word: b[j] }); j++; }
  }
  return out;
}

function diffHtml(before, after) {
  const tags = { same: ['', ''], removed: ['<del>', '</del>'], added: ['<ins>', '</ins>'] };
  const runs = [];
  for (const { kind, word } of diffWords(before, after)) {
    if (runs.length && runs[runs.length - 1].kind === kind) runs[runs.length - 1].words.push(word);
    else runs.push({ kind, words: [word] });
  }
  return runs.map(({ kind, words }) => `${tags[kind][0]}${pointedInline(words.join(' '))}${tags[kind][1]}`).join(' ');
}

function causeHtml(cause) {
  const who = `<span class="vname">${escapeHtml(cause.who)}</span>`;
  if (cause.note) return `<p>${who}${escapeHtml(cause.note)}</p>`;
  const quoted = cause.quoted ? `<span lang="pt-BR">“${escapeHtml(cause.quoted)}”</span> ` : '';
  const proposed = cause.proposed ? ` <span class="vname">proposed</span><span lang="pt-BR">${escapeHtml(cause.proposed)}</span>` : '';
  return `<p>${who}${quoted}${escapeHtml(cause.problem)}${proposed}</p>`;
}

// Latin → word-by-word gloss → literal tier → each kept draft, the changes between them marked and their causes hung
// beside → the reader's own choices where they differ. A verse no draft touched folds to one line.
function layersHtml(data, state) {
  const forms = currentForms(data, state);
  const { drafts, interlinear, causes } = data.layers;
  const shown = (text) => pointedText(text, state.pointing);
  const stratum = (kind, label, body, beside = '') => `<div class="stratum ${kind}"><span class="label">${label}</span><div class="text">${body}</div><div class="cause">${beside}</div></div>`;
  return data.verses.map(({ id, la, pt, literal }) => {
    const num = id.split(':')[1];
    const texts = drafts.map((d) => shown(d.verses[id] ?? ''));
    const mine = shown(filledText(pt, forms));
    const current = texts[texts.length - 1];
    const moved = texts.some((text, k) => k && text !== texts[k - 1]);
    const rows = [stratum('la', 'Latin', `<span translate="no">${pointedInline(shown(la))}</span>`)];
    if (interlinear?.[id]) {
      const gloss = interlinear[id].map(([form, meaning]) => (/^[†‡*+]$/.test(form)
        ? `<span class="gl"><span class="mark">${form}</span></span>`
        : `<span class="gl"><span translate="no">${escapeHtml(form)}</span><span lang="pt-BR">${escapeHtml(meaning)}</span></span>`)).join('');
      rows.push(stratum('gloss', 'word by word', gloss));
    }
    if (literal) rows.push(stratum('literal', 'literal', `<span lang="pt-BR">${pointedInline(shown(literal))}</span>`));
    texts.forEach((text, k) => {
      const label = `draft ${drafts[k].version}`;
      if (k && text === texts[k - 1]) rows.push(stratum('draft same', label, '<span class="tag">as it was</span>'));
      else rows.push(stratum('draft', label, `<span lang="pt-BR">${k ? diffHtml(texts[k - 1], text) : pointedInline(text)}</span>`, (causes?.[id]?.[drafts[k].version] ?? []).map(causeHtml).join('')));
    });
    if (mine !== current) {
      const chosen = wordings(data).filter((d) => pickOf(d, state) > 0 && d.refs.includes(id))
        .map((d) => causeHtml({ who: 'your choice', note: `${d.latin}: ${filledText(d.options[pickOf(d, state)].label, forms)}${state.notes[d.id] ? ` — ${state.notes[d.id]}` : ''}` })).join('');
      rows.push(stratum('draft mine', 'my choices', `<span lang="pt-BR">${diffHtml(current, mine)}</span>`, chosen));
    }
    // with a single draft on disk there is nothing to compare, so every verse stays open
    if (drafts.length > 1 && !moved && mine === current) {
      return `<details class="verse layered" id="${verseAnchor(id)}"><summary><span class="label">${num}</span><span lang="pt-BR">${pointedInline(current)}</span> <span class="tag">— unchanged through ${drafts.length} drafts</span></summary>${rows.join('')}</details>`;
    }
    return `<div class="verse layered" id="${verseAnchor(id)}"><span class="num">${num}</span>${rows.join('')}</div>`;
  }).join('');
}

/* ───────── decisions ───────── */
const shortRefs = (refs) => refs.map((ref, i) => (i && ref.split(':')[0] === refs[0].split(':')[0] ? ref.split(':')[1] : ref)).join(' · ');

function optionTags(option, index) {
  const label = option.from ? (fromLabels[option.from] ?? option.from) : '';
  const said = (option.note ?? '').toLowerCase();
  const redundant = !label || said.includes(String(option.from).toLowerCase()) || said.includes(label.toLowerCase()) || (option.from === 'draft' && index === 0 && said);
  return [option.note, redundant ? '' : label].filter(Boolean).join(' · ');
}

// prefix: '' for the list below the psalm (which owns the #d-… anchors); 'pop-' for the popover, which repeats a decision
// that is also in the list — so its radios need their own name and ids, and data-decision carries the real key.
function decisionHtml(data, state, d, prefix = '', refHref = '') {
  const forms = currentForms(data, state);
  const refs = isStanding(d) ? '' : shortRefs(d.refs);
  const refLink = refHref || (isStanding(d) ? '' : `#${verseAnchor(d.refs[0])}`);
  const title = d.title
    ? `${refHref ? `<span class="ref"><a href="${refHref}">${escapeHtml(data.title)}</a></span>` : ''}${escapeHtml(d.title)}`
    : `<span class="ref"><a href="${refLink}">${refHref ? `${escapeHtml(data.short)} ` : ''}${escapeHtml(refs)}</a></span><i translate="no">${escapeHtml(d.latin)}</i>${d.kind ? ` <span class="tag">— ${escapeHtml(d.kind)}</span>` : ''}`;
  const current = pickOf(d, state);
  const group = `${prefix}${d.id}`;
  const options = d.options.map((option, i) => {
    const tags = optionTags(option, i);
    // an option's label may show another decision's current word ({signatum} inside the two word orders of 4:7)
    const shown = `${escapeHtml(filledText(option.label, forms))}${tags ? ` <span class="tag${option.warn ? ' warn' : ''}" lang="en">— ${escapeHtml(tags)}</span>` : ''}`;
    if (!isOpen(d)) return `<li><input type="radio" disabled ${i === 0 ? 'checked' : ''} id="${group}-${i}"><label for="${group}-${i}" lang="pt-BR">${shown}</label></li>`;
    return `<li><input type="radio" name="${group}" data-psalm="${data.key}" data-decision="${d.id}" id="${group}-${i}" value="${i}" ${current === i ? 'checked' : ''}>
      <label for="${group}-${i}" lang="pt-BR">${shown}</label></li>`;
  }).join('');
  const settled = isOpen(d) ? '' : `<p class="why">Decided${d.decided === true ? '' : `: ${escapeHtml(d.decided)}`}.</p>`;
  return `<section class="decision" ${prefix ? '' : `id="d-${d.id}"`}>
    <h3>${title}</h3><p class="why">${escapeHtml(d.why)}</p>${settled}
    <ul class="options${isOpen(d) ? '' : ' settled'}">${options}</ul>
    ${isOpen(d) ? `<textarea data-psalm="${data.key}" data-note="${d.id}" placeholder="Your decision, and why" aria-label="Note on ${escapeHtml(d.latin || d.title)}">${escapeHtml(state.notes[d.id] ?? '')}</textarea>` : ''}
  </section>`;
}

/* ───────── handing it back ───────── */
function asMarkdown(data, state, today) {
  const forms = currentForms(data, state);
  const chosen = data.verses.map(({ id, pt }) => `${id} ${filledText(pt, forms)}`).join('\n');
  const line = (d) => {
    const head = d.title ?? `${shortRefs(d.refs)} — ${d.latin}`;
    const note = state.notes[d.id] ? `\n  Note: ${state.notes[d.id]}` : '';
    if (!isOpen(d)) return `- **${head}**: ${filledText(d.options[0].label, forms)} (decided)`;
    if (isStanding(d) && !(d.id in state.picks)) return `- **${head}**: not decided${note}`;
    const index = pickOf(d, state);
    const option = d.options[index];
    const standing = !(d.id in state.picks) ? ' (not touched)' : index === 0 && !isStanding(d) ? ` (draft ${data.version} kept)` : '';
    const tags = index ? optionTags(option, index) : '';
    return `- **${head}**: ${filledText(option.label, forms)}${standing}${tags ? ` — ${tags}` : ''}${note}`;
  };
  const standing = data.decisions.filter(isStanding);
  return [
    `# ${data.short} — decisions on draft ${data.version}, ${today}`,
    ...(standing.length ? ['', ...standing.map(line)] : []),
    '', '## Verse by verse', ...(data.decisions.filter((d) => !isStanding(d)).map(line)),
    '', '## Stumbles while praying', state.stumbles || '(none logged)',
    '', '## The psalm as chosen', '```', chosen, '```',
  ].join('\n');
}
const todayIso = () => new Date().toISOString().slice(0, 10);

async function handBack(text, status, box, copiedMessage) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = copiedMessage;
  } catch {
    box.hidden = false; box.value = text; box.select();
    status.textContent = 'Select all and copy the text below.';
  }
}

/* ───────── the page ───────── */
function boot() {
  const data = JSON.parse(document.getElementById('psalm-data').textContent);
  const state = loadState(data, localStorage);
  const compare = () => window.psalteriumCompare;
  const byId = (id) => document.getElementById(id);
  const pop = byId('pop');

  function renderPsalm() {
    const layered = state.view === 'layers';
    byId('blocks').innerHTML = layered ? '' : blocksHtml(state, compare());
    byId('psalm').innerHTML = layered ? layersHtml(data, state) : psalmHtml(data, state, compare());
    byId('legend').hidden = layered;
    byId('legend-layers').hidden = !layered;
  }
  function renderDecisions() {
    byId('decisions').innerHTML = data.decisions.length
      ? data.decisions.map((d) => decisionHtml(data, state, d)).join('')
      : '<p class="empty">No decision is open in this psalm.</p>';
  }
  function syncBar() {
    byId(`p-${state.pointing}`).checked = true;
    // without a literal tier or the consult/ file there is nothing to set beside the psalm
    const hasLiteral = data.verses.some((v) => v.literal);
    byId('b-literal-wrap').hidden = !hasLiteral;
    for (const id of ['b-pt-wrap', 'b-en-wrap', 'b-all-wrap']) byId(id).hidden = !compare();
    byId(`view-${state.view}`).checked = true;
    // the layers already hold the literal tier, and have no second column to set a psalter under
    byId('beside-switch').hidden = state.view === 'layers' || (!hasLiteral && !compare());
    if ((state.beside === 'literal' && !hasLiteral) || (['pt', 'en', 'all'].includes(state.beside) && !compare())) state.beside = 'none';
    byId(`b-${state.beside}`).checked = true;
    const open = wordings(data);
    byId('wording-switch').hidden = !open.length;
    const isDraft = open.every((d) => pickOf(d, state) === 0);
    const matched = isDraft ? undefined : data.presets.find((preset) => !preset.same && open.every((d) => pickOf(d, state) === presetIndex(d, preset.from)));
    byId(isDraft ? 'w-draft' : matched ? `w-${matched.from}` : 'w-mine').checked = true;
  }
  function renderAll() { renderPsalm(); renderDecisions(); syncBar(); placePop(); saveState(data, state, localStorage); }

  document.addEventListener('change', (e) => {
    const { name, value, type } = e.target;
    if (type !== 'radio') return;
    if (name === 'pointing') state.pointing = value;
    else if (name === 'view') { state.view = value; pop.hidden = true; }
    else if (name === 'beside') state.beside = value;
    else if (name === 'preset') applyPreset(data, state, value);
    else choose(data, state, e.target.dataset?.decision ?? name, Number(value));
    const at = document.activeElement?.id;
    renderAll();
    if (at) byId(at)?.focus({ preventScroll: true });
  });

  /* a decision opens where its word stands */
  const anchorsOf = (id) => [...document.querySelectorAll(`#psalm a[href="#d-${id}"]`)];
  function placePop() {
    if (pop.hidden) return;
    const d = data.decisions.find((x) => x.id === pop.dataset.decision);
    if (!d) { pop.hidden = true; return; }
    pop.innerHTML = decisionHtml(data, state, d, 'pop-') + '<button type="button" class="close">Done</button>';
    // one decision can stand in several verses (exaudire: 4:2a, 2b, 4) — stay by the occurrence that was touched
    const anchors = anchorsOf(d.id);
    const anchor = anchors[Number(pop.dataset.occurrence) || 0] ?? anchors[0];
    if (!anchor) return;
    const box = anchor.getBoundingClientRect();
    const width = pop.offsetWidth;
    const left = Math.max(12, Math.min(box.left, document.documentElement.clientWidth - width - 12));
    pop.style.left = `${left + window.scrollX}px`;
    // open below the word; above it when there is no room below and there is room above
    const height = pop.offsetHeight;
    const below = box.bottom + height + 10 <= window.innerHeight || box.top < height + 10;
    pop.style.top = `${(below ? box.bottom + 10 : box.top - height - 10) + window.scrollY}px`;
  }
  function closePop() {
    if (pop.hidden) return;
    const anchors = anchorsOf(pop.dataset.decision);
    pop.hidden = true;
    renderDecisions(); // the list below picks up a note typed in the popover
    (anchors[Number(pop.dataset.occurrence) || 0] ?? anchors[0])?.focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const word = e.target.closest?.('#psalm a.open');
    if (word) {
      e.preventDefault();
      const id = word.getAttribute('href').slice(3);
      pop.dataset.decision = id;
      pop.dataset.occurrence = anchorsOf(id).indexOf(word);
      pop.hidden = false;
      placePop();
      pop.querySelector('input:checked, input')?.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest?.('#pop .close') || !e.target.closest?.('#pop')) closePop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });
  document.addEventListener('input', (e) => {
    if (e.target.dataset?.note) state.notes[e.target.dataset.note] = e.target.value;
    else if (e.target.id === 'stumbles') state.stumbles = e.target.value;
    else return;
    saveState(data, state, localStorage);
  });

  byId('copy').addEventListener('click', () => handBack(asMarkdown(data, state, todayIso()), byId('copied'), byId('fallback'), `Copied. Paste it to Claude, or into ${data.key}/decisions.md.`));
  byId('reset').addEventListener('click', () => {
    if (!confirm('Clear every choice and note on this page?')) return;
    localStorage.removeItem(data.storeKey);
    // the choices once brought over from review.html must not come back after a reset
    if (data.legacyStoreKey) localStorage.setItem(data.storeKey, '{}');
    location.reload();
  });

  byId('stumbles').value = state.stumbles;
  renderAll();
  return { data, state, renderAll };
}

if (typeof document !== 'undefined' && document.getElementById('psalm-data')) window.psalteriumPage = boot();
