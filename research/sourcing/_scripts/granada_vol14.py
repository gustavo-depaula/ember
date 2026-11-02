import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
from cuervo import *
L = vol(14)
KW = ("DOCTRINA ESPIRITUAL", "VIDA DE", "CARTAS", "BARTOLOM", "OBRAS DE", "ENCARNACI", "SERMÓN", "TRATADO", "REDENCI", "PASIÓN")
SRC14 = lambda desc: cuervo_source(14, "Text of the editions listed by Cuervo for each piece.", desc)
COPY = [(Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia/obrascue14luisuoft.txt"), "spanish-originals", "obras-cuervo-14.txt")]
def sec(cid, title, a, b):
    return (cid, title, clean(L[a:b], run_kw=KW))
def tidy(secs):
    return [(c, t, p) for c, t, p in secs if sum(len(x.split()) for x in p) > 12]

# --- Doctrina espiritual
ds = [sec("al-lector", "Al lector", 1105, 1261), sec("t1-noches", "Tratado I: de la oración mental. Las meditaciones de las noches", 1261, 2377),
      sec("t1-pasion", "Tratado I: de la oración mental. Las meditaciones de la sagrada Pasión", 2377, 3800), sec("t1-metodo", "Tratado I: de la oración mental. De la preparación, la lición, la meditación y la petición", 3800, 5035),
      sec("t2-vocal", "Tratado II: de la oración vocal", 5035, 6014), sec("t3", "Tratado III: instrucción sobre la confesión", 6014, 6379), sec("t4", "Tratado IV: instrucción para vivir cristianamente", 6379, 7862),
      sec("t5-comunion", "Tratado V: de la comunión", 7862, 8315), sec("t6-virtudes", "Tratado último: de las tres principales virtudes", 8315, 8336)]
# --- Discursos
dc = [sec("encarnacion-lector", "Discurso de la Encarnación: al curioso lector", 8379, 8550), sec("encarnacion", "Discurso devoto del misterio de la Encarnación del Hijo de Dios", 8550, 9947),
      sec("redencion", "Discurso de la Pasión y redención del Salvador", 9947, 10540), sec("caidas", "Sermón en que se da aviso de las caídas públicas", 24004, 26140)]
# --- Vidas
vd = [sec("juan-de-avila", "Vida del Beato Maestro Juan de Ávila", 10543, 15413), sec("bartolome", "Vida de Fray Bartolomé de los Mártires", 15413, 17358),
      sec("enrique", "Vida del cardenal Don Enrique, rey de Portugal", 17358, 18766), sec("ana-de-la-concepcion", "Vida de la madre sor Ana de la Concepción", 18766, 19190),
      sec("elvira", "Vida de doña Elvira de Mendoza", 19190, 19711), sec("melicia", "Vida de Melicia Hernández", 19711, 20252)]
# --- Cartas
def std_roman(t):
    rm = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}
    if not re.fullmatch(r"[IVXLC]+", t): return None
    v = 0
    for a_, b_ in zip(t, t[1:] + " "):
        v += -rm[a_] if rm.get(b_, 0) > rm[a_] else rm[a_]
    return v
starts = []; last = 0
for i in range(20252, 24004):
    s_ = re.sub(r"\s+", " ", L[i]).strip()
    m = re.fullmatch(r"([IVXLC!1l]{1,8})[.,]?", s_)
    if not m: continue
    t = m.group(1).replace("!", "I").replace("1", "I").replace("l", "I")
    cands = {std_roman(t), roman_val(t)}
    ok = [c for c in cands if c and last < c <= last + 3]
    if ok:
        last = min(ok)
        j = i + 1
        while j < i + 4 and not L[j].strip(): j += 1
        starts.append((i, j, last))
cartas = []
for k, (i, j, num) in enumerate(starts):
    end = starts[k + 1][0] if k + 1 < len(starts) else 24004
    rec = re.sub(r"\s+", " ", L[j]).strip().rstrip(".:")
    rec = re.sub(r"\s*\(\s*[\diIl]\s*\)\s*$", "", rec)
    has = bool(re.match(r"^[AÁ]l? ", rec)) and len(rec) < 100
    cartas.append(("c%02d" % num, "Carta %d%s" % (num, (". " + rec) if has else ""), clean(L[(j + 1) if has else i + 1:end], run_kw=KW)))
if __name__ == "__main__":
    for name, ss in (("ds", ds), ("dc", dc), ("vd", vd), ("cartas", cartas)):
        print(name, len(ss), sum(sum(len(x.split()) for x in p) for _, _, p in ss))
    print([t for _, t, _ in cartas][:6], [t for _, t, _ in cartas][-3:])
