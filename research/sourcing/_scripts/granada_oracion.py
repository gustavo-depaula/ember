import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cuervo import *
L = vol(2)
KW = ("LIBRO DE LA ORACI", "LIBRO DK", "LIBKO", "LIBRO DE", "OBRAS DE GRANADA", "PARTE,", "MAÑANA", "MANANA", "NOCHE", "VARIANTES", "FIN DE", "CAPÍTULO", "CAPITULO", "CAP.TULO", "ORACIÓN Y MEDIT", "TRATADO")
days = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
specs = [("epistola", "Epístola del autor", 299, 378), ("prologo", None, 378, 576)]
specs += [("p1-cap1", "Primera parte, capítulo I", 592, None), ("p1-cap2", "Primera parte, capítulo II", 811, None), ("p1-cap3", "Primera parte, capítulo III", 951, 1000)]
mstart = [1005, 1597, 2034, 2550, 2976, 3538, 4070]
for d, s in zip(days, mstart):
    specs.append(("p1-m%d-manana" % (days.index(d) + 1), "Meditación del %s por la mañana" % d, s, None))
nstart = [4504, 5240, 6319, 7350, 8229, 8973, 9637]
tstart = [4662, 5389, 6497, 7544, 8379, 9123, 9759]
rom = ["primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo"]
for k in range(7):
    specs.append(("p1-m%d-noche" % (k + 1), "Meditación del %s en la noche" % days[k], nstart[k], None))
    specs.append(("p1-tratado%d" % (k + 1), "Tratado %s" % rom[k], tstart[k], None))
caps = [("p1-cap4", "Primera parte, capítulo IV", 10387), ("p1-cap5", "Primera parte, capítulo V", 10465), ("p1-cap6", "Primera parte, capítulo VI", 10659), ("p1-cap7", "Primera parte, capítulo VII", 10707), ("p1-cap8", "Primera parte, capítulo VIII", 10756), ("p1-cap9", "Primera parte, capítulo IX", 10794), ("p1-cap10", "Primera parte, capítulo X", 11123), ("p1-cap11", "Primera parte, capítulo último", 11740)]
for c in caps: specs.append((c[0], c[1], c[2], None))
specs.append(("p1-fin", "-", 12532, 12532))
for k, s in enumerate([12546, 12832, 14564, 16337, 18462]):
    specs.append(("p2-cap%d" % (k + 1), "Segunda parte, capítulo %s" % ["I", "II", "III", "IV", "V"][k], s, None))
specs += [("p2-conclusion", "Conclusión de la segunda parte", 19663, 19724), ("p3-intro", "Tercera parte: al lector", 19746, 19788)]
for k, s in enumerate([19788, 20966, 21574]):
    specs.append(("p3-sermon%d" % (k + 1), "Sermón %s" % rom[k], s, 20966 if k == 0 else (21574 if k == 1 else 22176)))
specs += [("t3-prologo", "Tres breves tratados: prólogo", 25342, 25678), ("t3-oracion", "Tratado primero, de la oración", 25678, 26054), ("t3-ayuno", "Tratado segundo, del ayuno", 26054, 27555), ("t3-limosna", "Tratado tercero, de la limosna", 27555, 29036)]
specs = [s for s in specs if s[0] != "p1-fin"]
specs.sort(key=lambda s: s[2])
# explicit ends so that omitted stretches (Variantes) don't leak
fixed = []
for k, (cid, lab, st, en) in enumerate(specs):
    if en is None:
        en = specs[k + 1][2] if k + 1 < len(specs) else len(L)
    fixed.append((cid, lab, st, en))
specs = fixed
# last chapter of part I ends before "FIN DE LA PRIMERA PARTE"; p2-cap5 ends at conclusion (included in cap5 range up to 19663)
log = []
secs = build(L, specs, KW, log)
import re
OV = [("epistola", r"^Epístola del autor\s+\S+\s+hallé", "Sólo hallé"), ("p1-cap10", r"^Y principales", "Las principales"), ("p1-cap9", r"^Desta ", "Esta es "),
      ("p2-cap2", r"^Iicho", "Dicho"), ("p2-cap3", r"^Icho", "Dicho"), ("p3-intro", r"^Tal LECTOR \^ARA", "Para"), ("p1-cap2", r"^Vigora", "Agora"),
      ("p1-cap11", r"^Principal materia de la meditación es la sacratísi- Salvador", "La principal materia de la meditación es la sacratísima pasión del Salvador"),
      ("p1-cap4", r"pue- W ejercitar", "pueden ejercitar"), ("p2-cap5", r"per- 'f, sonas", "personas")]
DAY = r"^\S{0,4}\s*(lunes|martes|miércoles|jueves|viernes|sábado|domingo)"
fixed = []
for cid, t, paras in secs:
    paras = list(paras)
    if re.match(r"p1-m\d-(manana|noche)", cid):
        paras[0] = re.sub(DAY, lambda m: "El " + m.group(1).lower(), paras[0], flags=re.I)
        paras[0] = re.sub(r"(?: [^\w\s]?\(?[a-z@]{1,2}\)| \w\))(?= [a-z])", "", paras[0])
    if re.match(r"p1-tratado\d", cid):
        paras[0] = re.sub(r"^\S+ el \S+ se declara más por extenso la \S+ pasada\.", "En el cual se declara más por extenso la meditación pasada.", paras[0])
    paras[0] = re.sub(r" (?:@\w|\(\w{1,2}\)|\w\))(?= [a-záéíóú])", "", paras[0], count=3)
    for oid, rx, rep in OV:
        if oid == cid:
            paras[0] = re.sub(rx, rep, paras[0])
    fixed.append((cid, t, paras))
secs = fixed
if __name__ == "__main__":
    report(secs)
    print(log[:40])

def emit():
    from granada_lib import BASE
    D = BASE / "libro-de-la-oracion"
    tot = write_sections(D, "es-ES", secs)
    return tot
