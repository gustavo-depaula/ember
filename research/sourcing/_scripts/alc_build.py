"""Assemble content/books/peter-of-alcantara-opera-omnia/tratado-oracion-meditacion from /tmp/alc/{es,en}."""
import json, re, shutil, sys
from pathlib import Path

ROOT = Path("/Users/gustavo/Documents/prayer")
B = ROOT / "content/books/peter-of-alcantara-opera-omnia/tratado-oracion-meditacion"
days_es = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
days_en = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
DES = {"lunes": "lunes", "martes": "martes", "miercoles": "miércoles", "jueves": "jueves", "viernes": "viernes", "sabado": "sábado", "domingo": "domingo"}
ROM = "I II III IV V VI VII VIII IX X XI XII".split()
es_t = {}
for l in open("/tmp/alc/es_titles.tsv", encoding="utf-8"):
    i, t, _ = l.rstrip("\n").split("\t"); es_t[i] = t
en_p1 = ["Of the fruit to be derived from prayer and meditation", "Of the subject-matter of meditation", "Of the time and fruit of these meditations",
         "Of the seven other meditations on the Sacred Passion, and of the way in which we have to meditate", "Six things which may help in the exercise of prayer",
         "Of the previous preparation", "Of the reading", "Of meditation", "Of the thanksgiving", "Of the offering of ourselves", "Of petition",
         "Of certain counsels which should be observed in this holy exercise"]
en_p2 = ["What is devotion", "Nine means of help to attain devotion", "Ten hindrances to devotion",
         "The temptations which most commonly assail those who give themselves to meditation, and their remedies", "Of certain necessary counsels for those who give themselves to prayer"]
en_t = {}
for n, t in enumerate(en_p1, 1): en_t["p1-c%d" % n] = "Chapter %s. %s" % (ROM[n - 1], t)
for n, t in enumerate(en_p2, 1): en_t["p2-c%d" % n] = "Chapter %s. %s" % (ROM[n - 1], t)
for g in ("c2", "c4"):
    for d in days_en: en_t["p1-%s-%s" % (g, d)] = "Meditation for " + d.capitalize()
en_map = lambda cid: cid.replace("monday", "lunes").replace("tuesday", "martes").replace("wednesday", "miercoles").replace("thursday", "jueves").replace("friday", "viernes").replace("saturday", "sabado").replace("sunday", "domingo")

for lang, src in (("es-ES", "/tmp/alc/es"), ("en-US", "/tmp/alc/en")):
    d = B / lang
    d.mkdir(parents=True, exist_ok=True)
    for f in sorted(Path(src).glob("*.md")):
        cid = f.stem
        body = f.read_text(encoding="utf-8").split("\n", 1)[1]
        if lang == "en-US":
            title = en_t[cid]; out = en_map(cid)
        else:
            title = es_t[cid]; out = cid
        (d / (out + ".md")).write_text("# %s\n%s" % (title, body), encoding="utf-8")

def leaf(cid):
    return {"id": cid, "title": {"es-ES": es_t[cid], "en-US": en_t.get(cid.replace("lunes", "monday").replace("martes", "tuesday").replace("miercoles", "wednesday").replace("jueves", "thursday").replace("viernes", "friday").replace("sabado", "saturday").replace("domingo", "sunday"))}}
def lf(cid):
    n = leaf(cid)
    if n["title"]["en-US"] is None: del n["title"]["en-US"]
    return n
def group(gid, es, en, kids): return {"id": gid, "title": {"es-ES": es, "en-US": en}, "children": kids}
def chs(part, rng): return [lf("p%d-c%d" % (part, n)) for n in rng]
p1 = [lf("p1-c1"), lf("p1-c2"), group("p1-c2-dias", "Las siete meditaciones de la semana", "The seven meditations for the days of the week", [lf("p1-c2-" + d) for d in days_es]),
      lf("p1-c3"), lf("p1-c4"), group("p1-c4-dias", "Las siete meditaciones de la pasión", "The seven meditations on the Sacred Passion", [lf("p1-c4-" + d) for d in days_es])] + chs(1, range(5, 13))
toc = [lf("prologo"), group("parte-1", "Primera parte", "The First Part", p1), group("parte-2", "Segunda parte: de la devoción", "The Second Part: Of Devotion", chs(2, range(1, 6)))]
toc[0]["title"]["es-ES"] = "Prólogo"
json.dump(toc, open("/tmp/alc/toc.json", "w"), ensure_ascii=False, indent=1)
