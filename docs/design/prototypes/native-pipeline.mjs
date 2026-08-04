// End-to-end proof that justif can drive a React Native renderer on iOS:
//   TTF metrics (pure JS, no measurement API)
//     -> justif/core buildItems/breakParagraph/layoutLines
//     -> per-line word-space + tracking values RN can actually express
//
// Emits JSON the RN-primitives renderer consumes. No DOM anywhere in here.
import { readFontMetrics } from './ttf.mjs';
import {
  buildItems, breakParagraph, layoutLines,
  defaultBuildOptions, defaultBreakOptions, ItemType,
} from './jt/package/dist/core.js';
import { createHyphenator } from './jt/package/dist/hyphenate/liang.js';
import fs from 'node:fs';

const FONT = 'site/fonts/EBGaramond_400Regular.ttf';
const F = readFontMetrics(FONT);

// Ligature-aware advance model — without this, "afflict" is 2.5px wrong.
const ligs = [['ffl', 'ﬄ'], ['ffi', 'ﬃ'], ['ff', 'ﬀ'], ['fi', 'ﬁ'], ['fl', 'ﬂ']];
const sub = (s) => { let o = s; for (const [a, b] of ligs) o = o.split(a).join(b); return o; };

export function makeMeasure(fontSizePx) {
  return {
    width: (text) => F.width(sub(text), fontSizePx),
    charAdvance: (ch) => F.width(ch, fontSizePx),
  };
}

export function justifyParagraph(text, { fontSizePx, measureWidthPx, hyphenate }) {
  const M = makeMeasure(fontSizePx);
  const spaceW = M.width(' ');

  const run = {
    fontKey: `ebg-${fontSizePx}`,
    // TeX's default interword glue: stretch 1/2, shrink 1/3 of the space.
    space: { width: spaceW, stretch: spaceW * 0.5, shrink: spaceW / 3 },
    hyphenWidth: M.width('-'),
    ratioAtMax: 1, ratioAtMin: 1,   // static font: no wdth axis
    familyKey: 'ebg',
  };

  const opts = {
    ...defaultBuildOptions,
    hyphenate,
    protrusion: false,   // RN can do this with negative margins; off for the A/B
    expansion: false,    // no variable font
    tracking: { max: 0.03, shrink: 0.03 },  // RN: letterSpacing on word runs
  };

  const para = buildItems([{ text, run: 0 }], [run], opts, M);
  const breaks = breakParagraph(para, measureWidthPx, { ...defaultBreakOptions });
  const lines = layoutLines(para, breaks, measureWidthPx, opts);

  // Turn each Line into something an RN renderer can emit directly:
  // the words on that line, and the exact px width of each space.
  return lines.map((L) => {
    const words = [];
    let cur = '';
    for (let i = L.start; i < L.end; i++) {
      const it = para.items[i];
      if (it.type === ItemType.Box) cur += it.text ?? '';
      else if (it.type === ItemType.Glue) { if (cur) words.push(cur); cur = ''; }
    }
    if (cur) words.push(cur);

    const flex = L.glueRatio >= 0 ? run.space.stretch : run.space.shrink;
    const spaceWidthPx = run.space.width + L.glueRatio * flex;

    return {
      words,
      spaceWidthPx: +spaceWidthPx.toFixed(3),
      extraPerSpacePx: +(spaceWidthPx - run.space.width).toFixed(3),
      // RN letterSpacing is px; trackRatio scales the ±3% letterfit budget.
      letterSpacingPx: +((L.trackRatio ?? 0) * 0.03 * fontSizePx).toFixed(4),
      trackRatio: +(L.trackRatio ?? 0).toFixed(3),
      hyphenated: !!L.hyphenated,
      ratio: +(L.ratio ?? 0).toFixed(3),
      overfull: !!L.overfull,
    };
  });
}

if (process.argv[1].endsWith('native-pipeline.mjs')) {
  const P = JSON.parse(fs.readFileSync('site/prayers.json', 'utf8'));
  const la = JSON.parse(fs.readFileSync('site/la-liturgic.json', 'utf8'));
  const hyLa = createHyphenator(la);

  // The real bilingual side-by-side column: 170.5px at 22px EB Garamond.
  const out = {};
  out.latin170 = justifyParagraph(P.prose.la.split('\n')[0], {
    fontSizePx: 22, measureWidthPx: 170.5, hyphenate: hyLa,
  });
  fs.writeFileSync('native-lines.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify({
    lines: out.latin170.length,
    sample: out.latin170.slice(0, 6),
    anyOverfull: out.latin170.some((l) => l.overfull),
  }, null, 2));
}
