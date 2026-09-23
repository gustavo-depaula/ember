"""Insert the canticle 210 row into PROGRESS.md after Ps 150, before 211 (re-reads the file at run time)."""
from pathlib import Path

f = Path(__file__).parent.parent / 'PROGRESS.md'
lines = f.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 210 ') for l in lines)
i = [k for k, l in enumerate(lines) if l.startswith('| 150 |')]
assert len(i) == 1
row = "| 210 (Benedícite — Dan 3:57–88, 56, Sunday Lauds I) | 20 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors held as options (3:61 *sopros*, 3:64 *gelos*), and the gate itself asked for no change. **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | latinist ×2 (v1: 1 minor, *ventos* → *sopros*, taken; v2: 2 minors, kept), stylist (6 remarks: 4 taken — 3:61 *sopros*, commas at 3:69/3:73, 3:75 *a ele louvemos e exaltemos*; *para sempre* refused under D43; *gelo e neves* kept as an option), ambiguity (16 items + 4 unknown words; the 3:73 grouping settled by dropping the commas; *sumamente* unknown, for Gustavo) | 11 | DO's ids are Daniel's (3:57–3:75, then 3:56). DO compresses Dan 3:57–88 to two invocations per verse, and its 3:75 is the breviary doxology. The shared scripts worked unchanged. The heading line is left out (D7). The litany keeps the Latin order *Bendizei, X, ao Senhor* (102:1). The refrain is identical in every place, with only the person changing. Brazilian circulation (CNBB LH, Lectionary, DM1962) is in `ps210/circulation.md`. |"
lines.insert(i[0] + 1, row)
f.write_text('\n'.join(lines), encoding='utf-8')
print('inserted')
