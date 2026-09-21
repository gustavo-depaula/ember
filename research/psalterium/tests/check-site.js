// The review site, checked without a browser: each generated page's scripts run against a stub DOM, which catches
// syntax and render-time errors, prints what the reader would see, and asserts the behaviours SITE-BRIEF.md names.
//
//   node research/psalterium/tests/check-site.js
//
// 1. builds tests/fixture/ (a three-verse psalm in the slot/decision/audit schema, a half-written folder, a partly
//    translated one) into a throwaway directory and checks slots, nesting, a multi-verse decision, presets, pointing,
//    comparison blocks, the layers view, the audit outcomes, the export, decisions.html, and the index's tolerance;
// 2. rebuilds the real site/ and checks that ps004.html reproduces review.html's psalm text for draft 2;
// 3. runs every option of every decision of every other psalm page that is there.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const project = path.resolve(__dirname, '..');
const fixtureSite = path.join(os.tmpdir(), 'psalterium-fixture-site');
let failed = 0;
const ok = (label, condition, detail = '') => { console.log(`${condition ? 'ok  ' : 'FAIL'} ${label}${condition ? '' : ` ${detail}`}`); if (!condition) failed++; };
const build = (...args) => console.log(execFileSync('python3.13', [path.join(project, 'site.py'), ...args], { encoding: 'utf8' }).trim());

function stubDom(jsonById) {
  const els = {};
  const el = (id) => (els[id] ??= { id, innerHTML: '', value: '', textContent: jsonById[id] ?? '', checked: false, dataset: {}, hidden: false, style: {}, addEventListener(type, fn) { (this.on ??= {})[type] = fn; }, focus() {}, select() {}, querySelector() { return null; } });
  const handlers = {};
  global.document = { getElementById: (id) => (id in jsonById || !id.endsWith('-data') ? el(id) : null), addEventListener(type, fn) { handlers[type] = fn; }, querySelectorAll: () => [], activeElement: null, documentElement: { clientWidth: 1200 } };
  const store = {};
  global.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => delete store[k] };
  global.window = global; global.scrollX = 0; global.scrollY = 0;
  global.navigator = {}; global.confirm = () => true; global.location = { reload() {} };
  return { els, handlers, store };
}

const textOf = (h) => h.replace(/<span class="num">\d+[a-z]?<\/span>/g, '').replace(/<\/span><span class="colon">/g, ' / ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const ptLines = (psalmHtml) => psalmHtml.split('<div class="verse"').slice(1).map((row) => textOf(row.split(/<div class="side pt"[^>]*>/)[1].split('<div class="cf"')[0]));
const unsound = (html) => /\{\w+\}/.test(textOf(html)) || /<a [^>]*>[^<]*<a /.test(html);
const readable = (html) => html.replace(/<\/div>|<\/details>|<\/summary>/g, '\n').replace(/<del>/g, '[-').replace(/<\/del>/g, '-]').replace(/<ins>/g, '[+').replace(/<\/ins>/g, '+]').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n');

function loadCompare(file) {
  if (!fs.existsSync(file)) return undefined;
  global.window = global;
  delete global.psalteriumCompare;
  (0, eval)(fs.readFileSync(file, 'utf8'));
  return global.psalteriumCompare;
}

function runPage(file, compare) {
  const html = fs.readFileSync(file, 'utf8');
  const json = Object.fromEntries([...html.matchAll(/<script type="application\/json" id="([\w-]+)">([\s\S]*?)<\/script>/g)].map((m) => [m[1], m[2]]));
  const dom = stubDom(json);
  delete global.psalteriumCompare;
  if (compare) global.psalteriumCompare = compare;
  const scripts = [...html.matchAll(/<script src="(assets\/[\w.]+)"><\/script>/g)].map((m) => fs.readFileSync(path.join(path.dirname(file), m[1]), 'utf8'));
  const api = (0, eval)(`(function () { ${scripts.join('\n')}\n; return { page: window.psalteriumPage, all: window.psalteriumDecisions, asMarkdown }; })()`);
  const fire = (name, value, extra = {}) => dom.handlers.change({ target: { name, value: String(value), type: 'radio', dataset: {}, ...extra } });
  const pick = (id, index) => fire(id, index, { dataset: { decision: id } });
  return { ...dom, api, fire, pick, html };
}

function runReview(file) {
  const html = fs.readFileSync(file, 'utf8');
  const dom = stubDom({});
  dom.els.pop = { hidden: true, dataset: {}, style: {} };
  delete global.psalteriumCompare;
  (0, eval)(`(function () { ${html.match(/<script>([\s\S]*)<\/script>/)[1]} })()`);
  return ptLines(dom.els.psalm.innerHTML);
}

function checkFixture(siteDir) {
  console.log('\n──────── the fixture psalm (new schema)');
  const compare = { psalm: 999, versions: [{ id: 'DRB', name: 'Douay-Rheims', lang: 'en', note: 'n' }, { id: 'MS32', name: 'Matos Soares 1932', lang: 'pt', note: 'n' }, { id: 'CNBB', name: 'CNBB', lang: 'pt', note: 'n' }],
    verses: { '999:1': { DRB: [[1, 'I cried to the Lord']] }, '999:2': { DRB: [[2, 'I sought his face']] }, '999:3': { DRB: [[3, null]] } },
    blocks: { MS32: [[null, 'SALMO 999\nClamei ao Senhor']], CNBB: [[1, 'um'], [2, 'dois']] } };
  const p = runPage(path.join(siteDir, 'ps999.html'), compare);
  const psalm = () => p.els.psalm.innerHTML;
  const show = (label) => { console.log(`\n== ${label}`); ptLines(psalm()).forEach((l) => console.log('   ' + l)); };

  ok('a first visit opens on the stylist’s wording', p.els['w-stylist'].checked === true && ptLines(psalm())[0].includes('me atendeu'), ptLines(psalm())[0]);
  ok('that default is not a choice of mine', p.api.page.state.mine === undefined);
  p.fire('preset', 'draft');
  show('draft, app pointing');
  ok('slots fill, nested included', ptLines(psalm())[1] === 'Busquei o rosto dele no dia da angústia:* / escutai-me, Senhor.', ptLines(psalm())[1]);
  ok('app pointing drops the flex', !psalm().includes('†'));
  ok('no link nests inside another', !unsound(psalm()));
  ok('a multi-verse decision stands in both verses', (psalm().match(/href="#d-exaudire"/g) || []).length === 2);
  ok('nested: the inner word keeps its own link', /href="#d-facies">rosto<\/a>/.test(psalm()) && /href="#d-ordo">Busquei o<\/a>/.test(psalm()));
  ok('the bar starts on the draft', p.els['w-draft'].checked === true);

  p.fire('pointing', 'full'); p.pick('facies', 1); p.pick('ordo', 1); p.pick('exaudire', 1);
  show('flexes; semblante, the Latin’s order, atender');
  ok('full pointing keeps the flex', psalm().includes('†'));
  ok('a nested choice shows inside the chosen order', ptLines(psalm())[1].startsWith('O semblante dele busquei†'), ptLines(psalm())[1]);
  ok('a multi-verse choice rewrites both verses', ptLines(psalm())[0].includes('me atendeu') && ptLines(psalm())[1].includes('atendei-me'));
  ok('gold wash on departures', /class="open changed" href="#d-exaudire"/.test(psalm()));
  ok('the bar says my choices', p.els['w-mine'].checked === true);
  ok('the decision list shows the nested word inside the order labels', p.els.decisions.innerHTML.includes('O semblante dele busquei'));
  p.els.pop.hidden = false; p.els.pop.dataset.decision = 'ordo'; p.api.page.renderAll();
  ok('popover radios: their own name, data-decision, no second #d- anchor', /name="pop-ordo" data-psalm="ps999" data-decision="ordo"/.test(p.els.pop.innerHTML) && !p.els.pop.innerHTML.includes('id="d-ordo"'));
  p.els.pop.hidden = true;

  p.fire('preset', 'stylist'); show('the stylist’s preset');
  ok('preset: the stylist’s option where there is one, the draft elsewhere', JSON.stringify(p.api.page.state.picks) === JSON.stringify({ exaudire: 1, clamavi: 0, ordo: 1, facies: 0 }), JSON.stringify(p.api.page.state.picks));
  ok('the bar says the stylist’s', p.els['w-stylist'].checked === true);
  p.fire('preset', 'draft');
  ok('preset draft clears the wording', ptLines(psalm())[0] === 'Clamei ao Senhor,* / e ele me escutou.', ptLines(psalm())[0]);
  p.fire('preset', 'mine');
  ok('my choices come back after a preset', ptLines(psalm())[1].startsWith('O semblante dele busquei'));

  p.fire('beside', 'all');
  ok('a per-verse psalter stands under its verse', /Douay-Rheims<\/span><sup>1<\/sup>I cried/.test(psalm()));
  ok('a missing verse stays visibly missing', psalm().includes('missing from the source consulted'));
  ok('block versions stand once, above', p.els.blocks.innerHTML.includes('class="raw">SALMO 999') && p.els.blocks.innerHTML.includes('<sup>2</sup>dois') && !psalm().includes('CNBB'));
  p.fire('beside', 'literal');
  ok('the literal tier beside', psalm().includes('Busquei a face dele'));

  p.fire('view', 'layers');
  const layers = psalm();
  console.log('\n== layers\n' + readable(layers));
  ok('layers: word diff between drafts', layers.includes('<del>Chamei</del> <ins>Clamei</ins>'));
  ok('layers: the critic’s remark hangs beside the change', /stylist · gpt-6-astra<\/span>.*Chamar is too weak/.test(layers));
  ok('layers: the audit clause that names the verse', layers.includes('999:1 chamei → Clamei after the stylist.'));
  ok('layers: my choices as a further layer', layers.includes('my choices') && layers.includes('<ins>atendeu.</ins>'));
  ok('layers: an untouched verse folds to one line', /<details class="verse layered" id="v-999-3">/.test(layers) && layers.includes('unchanged through 2 drafts'));
  p.fire('view', 'facing');

  const md = p.api.asMarkdown(p.api.page.data, p.api.page.state, '2026-09-21');
  console.log('\n' + md);
  ok('the export carries the choices and the chosen psalm', md.includes('**999:1 · 2 — exaudívit, exáudi**: atender') && md.includes('999:2 O semblante dele busquei † no dia da angústia: * atendei-me, Senhor.'));
  ok('state is saved under the psalm’s own key', JSON.parse(p.store['psalterium-ps999-v2']).picks.ordo === 1);

  const page = fs.readFileSync(path.join(siteDir, 'ps999.html'), 'utf8');
  ok('audit: a remark that was taken', /class="outcome taken">❧ taken/.test(page));
  ok('audit: a remark kept as an option, linked to its decision', /kept as an option — [^<]*<a href="#d-ordo">/.test(page));
  // ps133 stands in two lists (Sunday Compline and the Psalter), ps998 among the canticles
  ok('the index lists the half-written folders as incomplete', (fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8').match(/class="status incomplete"/g) || []).length === 3);

  const all = runPage(path.join(siteDir, 'decisions.html'));
  const count = () => (all.els.decisions.innerHTML.match(/<section class="decision"/g) || []).length;
  ok('decisions.html renders every open decision', count() === 4);
  all.fire('kind', 'glossary');
  ok('decisions.html filters by kind', count() === 1);
  all.fire('kind', 'all');
  all.fire('ps999--facies', 1, { dataset: { psalm: 'ps999', decision: 'facies' } });
  ok('a choice made on decisions.html lands in the psalm’s own storage', JSON.parse(all.store['psalterium-ps999-v2']).picks.facies === 1);
  ok('the all-psalms export', all.api.all.allMarkdown().includes('— decisions on draft 2') && all.api.all.allMarkdown().includes('semblante'));
}

function checkPilot(siteDir) {
  console.log('\n──────── Ps 4 against review.html');
  const review = runReview(path.join(project, 'review.html'));
  const p = runPage(path.join(siteDir, 'ps004.html'));
  ok('ps004.html opens on the stylist’s wording', p.els['w-stylist'].checked === true);
  p.fire('preset', 'draft');
  const site = ptLines(p.els.psalm.innerHTML);
  console.log('\n== site/ps004.html, draft 3'); site.forEach((l) => console.log('   ' + l));
  // draft 3 is draft 2 (which review.html still shows) with the rulings of DECISIONS.md D8 and nothing else
  const ruled = [['atendeu-me', 'escutou-me'], ['atendei', 'escutai'], ['me atenderá', 'me escutará'], ['até quando de coração pesado?', 'até quando tereis o coração pesado?'], ['azeite* / se multiplicaram', 'azeite* / eles se multiplicaram']];
  const expected = review.map((l) => ruled.reduce((line, [from, to]) => line.replace(from, to), l));
  ok('ps004.html is review.html’s draft 2 with the five D8 changes and nothing else', JSON.stringify(site) === JSON.stringify(expected), '\n' + expected.map((l, i) => (l === site[i] ? '' : `   expected: ${l}\n   site:     ${site[i]}`)).filter(Boolean).join('\n'));
  ok('no stale-file warning on the page', !p.html.includes('no longer reproduces'));
  ok('no link nests inside another (4:7 holds two decisions)', !unsound(p.els.psalm.innerHTML));
  ok('4:7: the word and the order are separate links', /href="#d-ordo">A luz<\/a>/.test(p.els.psalm.innerHTML) && /href="#d-signatum">marcada<\/a>/.test(p.els.psalm.innerHTML));
  p.fire('preset', 'stylist');
  console.log('\n== the stylist’s preset'); ptLines(p.els.psalm.innerHTML).forEach((l) => console.log('   ' + l));
  p.fire('preset', 'draft'); p.pick('ordo', 1); p.pick('signatum', 1);
  ok('4:7 in the Latin’s order, with assinalada', ptLines(p.els.psalm.innerHTML)[6].startsWith('Assinalada está sobre nós a luz do vosso rosto, Senhor:'), ptLines(p.els.psalm.innerHTML)[6]);
  ok('the standing question starts unanswered', !/name="governing"[^>]*checked/.test(p.els.decisions.innerHTML));

  const compare = loadCompare(path.join(project, 'consult/compare/ps004.js'));
  if (compare) {
    global.psalteriumCompare = compare;
    p.fire('beside', 'all');
    const verse = (id) => p.els.psalm.innerHTML.split(`id="${id}"`)[1].split('<div class="verse"')[0];
    ok('compare: the pilot’s hand alignment (4:6 covers Hebrew 6–7)', /Ave Maria<\/span><sup>6<\/sup>/.test(verse('v-4-6')) && /Douay-Rheims/.test(verse('v-4-6')));
    ok('compare: the Diurnal Monástico paired under 4:3, whole under 4:10, absent at 4:5', /Diurnal Monástico 1962<\/span><sup>3<\/sup>/.test(verse('v-4-3')) && /<sup>4–10<\/sup>/.test(verse('v-4-10')) && !verse('v-4-5').includes('Diurnal'));
    ok('compare: the switch is shown', p.els['beside-switch'].hidden === false && p.els['b-pt-wrap'].hidden === false);
    p.fire('beside', 'none');
  } else console.log('     (no consult/compare/ps004.js — run compare.py 4; the comparison was not exercised)');

  p.fire('view', 'layers');
  const layers = p.els.psalm.innerHTML;
  console.log('\n== layers, 4:6 and 4:9\n' + ['v-4-6', 'v-4-9'].map((id) => readable(layers.split(`id="${id}"`)[1].split('class="verse layered"')[0])).join('\n--\n'));
  ok('layers: draft 1 → 2 on real data', layers.includes('<ins>um</ins>') && layers.includes('<del>juntamente,</del>'));
  ok('layers: draft 2 → 3, the ruling on exaudíre', layers.includes('<del>atendei</del>') && layers.includes('<ins>escutai</ins>'));
  ok('layers: the interlinear gloss line (Ps 4 only)', layers.includes('word by word') && layers.includes('class="gl"'));
  ok('layers: the stylist’s remark beside 4:6, and not the remarks about words that did not move', /id="v-4-6"[\s\S]*?stylist · gpt-6-astra[\s\S]*?id="v-4-7"/.test(layers) && !/id="v-4-6"[\s\S]*?back-translate[\s\S]*?id="v-4-7"/.test(layers));
}

// a psalm as it arrives from a translator: every option of every decision must render
function checkArrival(siteDir, key) {
  console.log(`\n──────── ${key}`);
  const p = runPage(path.join(siteDir, `${key}.html`), loadCompare(path.join(project, `consult/compare/${key}.js`)));
  const { data } = p.api.page;
  console.log(`   draft ${data.version}: ${data.verses.length} verses, ${data.decisions.length} decisions, ${data.layers.drafts.length} draft(s) on disk${global.psalteriumCompare ? ', comparison file present' : ''}`);
  ok('every slot fills', !unsound(p.els.psalm.innerHTML));
  const broken = [];
  for (const d of data.decisions) {
    d.options.forEach((_, i) => { p.pick(d.id, i); if (unsound(p.els.psalm.innerHTML)) broken.push(`${d.id}[${i}]`); });
    p.pick(d.id, 0);
  }
  ok('every option of every decision renders: no unfilled slot, no nested link', !broken.length, broken.join(' '));
  const untouchable = data.decisions.filter((d) => (d.refs ?? []).length && !d.decided && !p.els.psalm.innerHTML.includes(`href="#d-${d.id}"`)).map((d) => d.id);
  ok('every open wording has a word to touch in the psalm', !untouchable.length, untouchable.join(', '));
  for (const beside of ['literal', 'all', 'none']) p.fire('beside', beside);
  p.fire('view', 'layers');
  ok('the layers render for every verse', (p.els.psalm.innerHTML.match(/class="verse layered"/g) || []).length === data.verses.length);
  ok('the export holds the whole psalm', data.verses.every((v) => p.api.asMarkdown(data, p.api.page.state, '2026-09-21').includes(`\n${v.id} `)));
}

build('--root', path.join(__dirname, 'fixture'), '--out', fixtureSite);
checkFixture(fixtureSite);
build();
const site = path.join(project, 'site');
checkPilot(site);
for (const file of fs.readdirSync(site).filter((name) => /^ps\d{3}\.html$/.test(name) && name !== 'ps004.html')) checkArrival(site, file.slice(0, -5));

console.log(failed ? `\n${failed} FAILED` : '\nall ok');
process.exit(failed ? 1 : 0);
