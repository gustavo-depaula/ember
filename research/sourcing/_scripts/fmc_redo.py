"""fmc_redo.py CFG [key=value ...]: patch integer keys (end, start) then re-run import + split fix + unknown report"""
import sys, json, subprocess, os
p = sys.argv[1]; c = json.load(open(p))
for kv in sys.argv[2:]:
    k, v = kv.split('=', 1); c[k] = int(v)
json.dump(c, open(p, 'w'), indent=1)
D = os.path.dirname(os.path.abspath(__file__)); bd = '/Users/gustavo/Documents/prayer/content/books/' + c['dir']
for s in (['fmc_import.py', p], ['fmc_fixsplit.py', bd], ['fmc_unknown.py', bd, '40']): subprocess.run([sys.executable, os.path.join(D, s[0])] + s[1:], check=True)
