import sys

sys.path.insert(0, 'research/psalterium')
import diurnal

numbers = sorted({n for n, _ in diurnal.sections()})
for n in numbers:
    data = diurnal.extract(n)
    verses = sum(len(r['ids']) for r in data['runs'])
    paired = sum(len(r['ids']) for r in data['runs'] if r['paired'])
    print(f"{n:>3}: runs {len(data['runs']):>2}  verses {verses:>3}  paired {paired:>3}  missing {len(data['missing']):>3} {data['missing'][:4]}")
