"""Carry DECISIONS.md D27 into glossary.md. Run once; idempotent; reads and writes in one step.

    python3.13 research/psalterium/ps009/glossary_d27.py
"""

from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'glossary.md'
lines = path.read_text(encoding='utf-8').splitlines()


def note(line, text):
    return line.rstrip().rstrip('|').rstrip() + f' **{text}** |'


settle = {
    '| in sǽculum sǽculi |': 'D27: settled — the plural is how the phrase lives in Portuguese; number is grammar (D2).',
    '| irritáre |': 'D27: settled for God as object — one Greek verb (παροξύνω) with exacerbáre, 9:25 and 9:34.',
    '| exacerbáre |': 'D27: provocar settled where alone, as irritáre (one Greek verb); a verse with both decides locally.',
    '| *Úsquequo, Dómine, … in finem?*': 'D27: settled as a formula.',
    '| *Elóquia Dómini … igne examináta*': 'D27: settled — outside Ps 118 the psalm decides (D26); 17:31 follows.',
}
done = []
for i, line in enumerate(lines):
    if 'D27' in line:
        continue
    for head, text in settle.items():
        if line.startswith(head):
            cells = line.split(' | ')
            cells[2] = 'settled (D27)'
            lines[i] = note(' | '.join(cells), text)
            done.append(head)
    if line.startswith('| in finem |'):
        cells = line.split(' | ')
        cells[1] = 'para sempre where it says perpetuity (each psalm decides)'
        cells[2] = 'working (D27)'
        lines[i] = note(' | '.join(cells), 'D27: NOT merged with in ætérnum — mostly another Greek phrase (εἰς τέλος), and 48:9 has both side by side. The wordings of Pss 9 and 12 stand.')
        done.append('in finem')
    if line.startswith('| inops / pauper / egénus |'):
        lines[i] = note(line, 'D27: húmilis → humilde settled beside pauper → pobre; inops stays open (indigente was unknown to the blind reader twice).')
        done.append('inops')
    if line.startswith('| *de* via (períre de) |'):
        lines[i] = note(line, 'D27: only in períre de via; 9:37 peribítis de terra → perecereis da terra (fora da terra was heard as dying outside it).')
        done.append('de via')
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('glossary: D27 carried:', ', '.join(done))
