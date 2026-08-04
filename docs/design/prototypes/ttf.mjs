// Minimal TTF metrics reader: head(unitsPerEm), hhea(numberOfHMetrics),
// hmtx(advances), cmap(format 4) — enough to compute advance widths in pure
// JS with no font library. Tests whether a React Native renderer could know
// text widths without a measurement API.
import fs from 'node:fs';

export function readFontMetrics(path) {
  const b = fs.readFileSync(path);
  const u16 = (o) => b.readUInt16BE(o);
  const i16 = (o) => b.readInt16BE(o);
  const u32 = (o) => b.readUInt32BE(o);

  const numTables = u16(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[b.toString('ascii', o, o + 4)] = { off: u32(o + 8), len: u32(o + 12) };
  }

  const unitsPerEm = u16(tables.head.off + 18);
  const numHMetrics = u16(tables.hhea.off + 34);

  const advanceByGlyph = [];
  for (let i = 0; i < numHMetrics; i++) advanceByGlyph.push(u16(tables.hmtx.off + i * 4));

  // cmap format 4 (BMP, the only one we need for Latin + accented Latin)
  const cm = tables.cmap.off;
  // Prefer format 4 (BMP) but accept format 12 (full Unicode); EB Garamond
  // ships both and lists 12 last.
  let sub4 = 0, sub12 = 0;
  for (let i = 0, n = u16(cm + 2); i < n; i++) {
    const rec = cm + 4 + i * 8;
    const pid = u16(rec), eid = u16(rec + 2), off = u32(rec + 4);
    if (!((pid === 3 && (eid === 1 || eid === 10)) || pid === 0)) continue;
    const fmt = u16(cm + off);
    if (fmt === 4) sub4 = cm + off;
    else if (fmt === 12) sub12 = cm + off;
  }
  if (!sub4 && !sub12) throw new Error('no usable unicode cmap');

  const lookup4 = (sub, cp) => {
    const segX2 = u16(sub + 6), seg = segX2 / 2;
    const endO = sub + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
    for (let i = 0; i < seg; i++) {
      if (u16(endO + i * 2) < cp) continue;
      const start = u16(startO + i * 2);
      if (start > cp) return 0;
      const ro = u16(rangeO + i * 2);
      if (ro === 0) return (cp + i16(deltaO + i * 2)) & 0xffff;
      const gi = u16(rangeO + i * 2 + ro + (cp - start) * 2);
      return gi === 0 ? 0 : (gi + i16(deltaO + i * 2)) & 0xffff;
    }
    return 0;
  };

  const lookup12 = (sub, cp) => {
    const n = u32(sub + 12);
    let lo = 0, hi = n - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, g = sub + 16 + mid * 12;
      const s = u32(g), e = u32(g + 4);
      if (cp < s) hi = mid - 1;
      else if (cp > e) lo = mid + 1;
      else return u32(g + 8) + (cp - s);
    }
    return 0;
  };

  const glyphFor = (cp) => {
    if (sub4 && cp <= 0xffff) { const g = lookup4(sub4, cp); if (g) return g; }
    return sub12 ? lookup12(sub12, cp) : 0;
  };

  const cache = new Map();
  const advanceUnits = (cp) => {
    let a = cache.get(cp);
    if (a === undefined) {
      const g = glyphFor(cp);
      a = advanceByGlyph[Math.min(g, advanceByGlyph.length - 1)] ?? 0;
      cache.set(cp, a);
    }
    return a;
  };

  return {
    unitsPerEm,
    // Width of a string at a given px size, ignoring kerning and ligatures.
    width(text, fontSizePx) {
      let u = 0;
      for (const ch of text) u += advanceUnits(ch.codePointAt(0));
      return (u * fontSizePx) / unitsPerEm;
    },
  };
}
