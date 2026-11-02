import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cuervo import *
L = vol(3)
KW = ("MEMORIAL", "OBRAS DE", "VARIANTES")
front = [("dedicatoria", "A la serenísima infanta doña María", 491, 521), ("prologo", "Prólogo al cristiano lector", 521, 911)]
tail = [("t7-oracion-1", "Oración primera sobre el Pater noster", 27351, 27684), ("t7-meditacion-2", "Segunda meditación sobre el Pater noster", 27684, 27954), ("t7-meditacion-3", "Tercera meditación sobre el Pater noster", 27954, 28233)]
secs, subs, log = assemble(L, front, 914, 27351, tail, KW, bumps={10974: 5})
if __name__ == "__main__":
    report(secs); print(subs); print(log[:30])
