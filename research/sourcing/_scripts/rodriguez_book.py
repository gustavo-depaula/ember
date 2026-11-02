import json
from pathlib import Path
B = Path("/Users/gustavo/Documents/prayer/content/books/alonso-rodriguez-opera-omnia/ejercicio-de-perfeccion")
IA = Path("/Users/gustavo/Documents/prayer/research/sourcing/alonso-rodriguez/ia")
toc = json.load(open(B / "toc.tmp.json"))
meta = {
 "id": "alonso-rodriguez-ejercicio-de-perfeccion",
 "cover": "quarter",
 "name": {"es-ES": "Ejercicio de perfección y virtudes cristianas", "en-US": "The Practice of Perfection and Christian Virtues", "pt-BR": "Exercício de perfeição e virtudes cristãs"},
 "author": {"es-ES": "P. Alonso Rodríguez, S.J.", "en-US": "Alonso Rodríguez, S.J.", "pt-BR": "Pe. Alonso Rodríguez, S.J."},
 "description": {
  "es-ES": "Clásico de la espiritualidad ascética del Siglo de Oro, escrito por el maestro de novicios de la Compañía de Jesús (Valladolid, 1538 – Sevilla, 1616; no el hermano coadjutor San Alonso Rodríguez): tres partes de ocho tratados cada una, sobre el aprovechamiento espiritual, la oración, la presencia de Dios, la conformidad con la voluntad divina, la mortificación, la humildad, las tentaciones, la Pasión y la Comunión, y sobre el estado religioso, los votos y la obediencia. Sevilla, 1609. Texto en edición digital modernizada (sin las autoridades latinas); en inglés, la traducción de Joseph Rickaby, S.J. (1929), capítulo por capítulo.",
  "en-US": "The classic of Golden Age ascetical spirituality by the Jesuit novice master Alonso Rodríguez (Valladolid, 1538 – Seville, 1616; not the lay brother St. Alphonsus Rodriguez): three parts of eight treatises each, on spiritual progress, prayer, the presence of God, conformity with the divine will, mortification, humility, temptations, the Passion and Communion, and on the religious state, the vows and obedience. Seville, 1609. Spanish in a modernised digital edition (without the Latin authorities); in English, Joseph Rickaby's translation (1929), chapter for chapter.",
  "pt-BR": "Clássico da espiritualidade ascética do Século de Ouro, escrito pelo mestre de noviços da Companhia de Jesus Alonso Rodríguez (Valladolid, 1538 – Sevilha, 1616; não o irmão coadjutor Santo Afonso Rodríguez): três partes de oito tratados cada uma, sobre o aproveitamento espiritual, a oração, a presença de Deus, a conformidade com a vontade divina, a mortificação, a humildade, as tentações, a Paixão e a Comunhão, e sobre o estado religioso, os votos e a obediência."},
 "composed": "1609",
 "languages": ["es-ES", "en-US"],
 "work": "alonso-rodriguez/ejercicio-de-perfeccion",
 "editions": {"es-ES": {"editor": "modern digital edition (Latin authorities omitted)", "year": 2010, "from": "Seville 1609"},
              "en-US": {"translator": "Joseph Rickaby, S.J.", "year": 1929}},
 "sources": [
  {"language": "es-ES", "url": "https://archive.org/details/ejercicio-de-perfeccion-y-virtudes-cristianas-primera-parte-alonso-rodriguez", "edition": "Ejercicio de perfección y virtudes cristianas, primera/segunda/tercera parte, modern digital edition in modern spelling (archive.org uploads; Parts II and III at the same URL pattern, ...-segunda-parte-... and ...-tercera-parte-...), text of Seville 1609.", "description": "The editor drops the Latin authorities, puts the author's untranslated citations in square brackets and modernises archaic forms. Bracketed Latin-free text kept as is; three of the editor's footnotes were left out.", "tier": "unverified"},
  {"language": "en-US", "url": "https://archive.org/details/practiceofperfec0001alph", "edition": "Alphonsus Rodriguez, Practice of Perfection and Christian Virtues, newly translated from the original Spanish by Joseph Rickaby, S.J., 3 vols, Chicago: Loyola University Press, 1929 (archive.org practiceofperfec0001alph, 0002alph, 0003alph).", "description": "OCR; chapters follow the Spanish one for one (377 chapters).", "tier": "A"}],
 "toc": toc,
}
(B / "book.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n")
(B / "toc.tmp.json").unlink()
for d, files, name in (("spanish-originals", [f"web1609p{p}.txt" for p in (1,2,3)], "ejercicio-de-perfeccion.txt"), ("english-originals", [f"practiceofperfec000{p}alph.txt" for p in (1,2,3)], "practice-of-perfection.txt")):
    (B / "sources" / d).mkdir(parents=True, exist_ok=True)
    (B / "sources" / d / name).write_text("\n---\n".join((IA / f).read_text(errors="replace") for f in files))
