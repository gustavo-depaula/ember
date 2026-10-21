"""Write content/collections/denis-the-carthusian.json: every work in the catalogue, by part of the edition.

    .venv/bin/python collection.py

Keeps the collection's prologue and description as they stand in the file, and
rebuilds its sections from catalogue.py, so a new work only needs adding there.
"""

import json

from assemble import repo
from catalogue import areopagite, front, masters, minora, scripture, sermons, theology


def t(la: str, en: str, pt: str) -> dict:
    return {"la": la, "en-US": en, "pt-BR": pt}


def items(works: list, slugs: list[str] | None = None) -> list:
    picked = [w for w in works if slugs is None or w[0] in slugs]
    return [{"kind": "item", "ref": f"book/denis-{w[0]}"} for w in picked]


def sub(id: str, title: dict, blocks: list) -> dict:
    return {"kind": "section", "id": id, "title": title, "blocks": blocks}


def missing(la: str, en: str, pt: str) -> dict:
    return {"kind": "todo", "title": t(la, en, pt),
            "notes": {"en-US": "Scans reachable only from the United States; not yet obtained.",
                      "pt-BR": "Digitalizações acessíveis só dos Estados Unidos; ainda não obtidas."},
            "proposedKind": "book", "priority": "low"}


def slugs_between(works: list, first: str, last: str) -> list[str]:
    names = [w[0] for w in works]
    return names[names.index(first):names.index(last) + 1]


def by_tomus(works: list, tomus: int) -> list[str]:
    return [w[0] for w in works if any(t == tomus for t, _ in w[-1])]


def main() -> None:
    path = repo / "content" / "collections" / "denis-the-carthusian.json"
    collection = json.loads(path.read_text())
    genesis = {"kind": "item", "ref": "book/denis-enarratio-in-genesim"}
    draft_note = {
        "en-US": "Genesis has been proofread against the scans. The other works are the OCR text as it came off the scans, still to be proofread: expect a misread word here and there.",
        "pt-BR": "O Gênesis foi revisto contra as digitalizações. As demais obras são o texto do OCR tal como saiu das digitalizações, ainda por rever: espere uma ou outra palavra mal lida.",
    }
    collection["sections"] = [
        {"id": "scripture", "title": t("Enarrationes in Sacram Scripturam", "Commentaries on Holy Scripture", "Comentários à Sagrada Escritura"),
         "description": {"body": {
             "en-US": "Denis commented on every book of the Bible, article by article, giving the literal sense and then the mystical. The commentaries fill the first fourteen tomes of the Montreuil edition. " + draft_note["en-US"],
             "pt-BR": "Dionísio comentou todos os livros da Bíblia, artigo por artigo, dando o sentido literal e depois o místico. Os comentários ocupam os catorze primeiros tomos da edição de Montreuil. " + draft_note["pt-BR"]}},
         "blocks": [
             sub("pentateuch", t("Pentateuchus", "The Pentateuch", "O Pentateuco"),
                 [genesis] + items(scripture, slugs_between(scripture, "enarratio-in-exodum", "epilogatio-in-pentateuchum"))),
             sub("historical", t("Libri historici", "The Historical Books", "Os livros históricos"),
                 items(scripture, slugs_between(scripture, "enarratio-in-josue", "enarratio-in-ii-machabaeorum"))),
             sub("wisdom", t("Psalmi et libri sapientiales", "The Psalms and the Wisdom Books", "Os Salmos e os livros sapienciais"),
                 items(scripture, slugs_between(scripture, "commentaria-in-psalmos", "enarratio-in-ecclesiasticum"))),
             sub("prophets", t("Prophetæ", "The Prophets", "Os Profetas"),
                 items(scripture, slugs_between(scripture, "enarratio-in-isaiam", "enarratio-in-malachiam"))),
             sub("gospels", t("Evangelia", "The Gospels", "Os Evangelhos"),
                 items(scripture, slugs_between(scripture, "enarratio-in-matthaeum", "enarratio-in-joannem"))),
             sub("epistles", t("Epistolæ, Actus, Apocalypsis", "The Epistles, Acts and the Apocalypse", "As Epístolas, os Atos e o Apocalipse"),
                 items(scripture, slugs_between(scripture, "enarratio-in-romanos", "enarratio-in-apocalypsim"))),
             sub("scripture-varia", t("Varia in Scripturam", "On Scripture as a Whole", "Sobre a Escritura em conjunto"),
                 items(scripture, slugs_between(scripture, "enarratio-in-psalmum-poenitentialem", "epitome-sacrae-scripturae"))
                 + [missing("Tomus XIV bis", "Supplementary tome to the commentaries", "Tomo suplementar aos comentários")]),
         ]},
        {"id": "areopagite", "title": t("In opera S. Dionysii Areopagitæ", "On the Works of Dionysius the Areopagite", "Sobre as obras de Dionísio Areopagita"),
         "description": {"body": {
             "en-US": "Denis's commentaries on the Celestial and Ecclesiastical Hierarchy, the Divine Names, the Mystical Theology and the letters, printed beside the Latin versions of Eriugena, Sarracenus, Ambrogio Traversari and Ficino and the paraphrase of Thomas Gallus.",
             "pt-BR": "Os comentários de Dionísio à Hierarquia Celeste e à Eclesiástica, aos Nomes Divinos, à Teologia Mística e às cartas, impressos ao lado das versões latinas de Erígena, Sarraceno, Ambrósio Traversari e Ficino e da paráfrase de Tomás Galo."}},
         "blocks": items(areopagite)},
        {"id": "theology", "title": t("Opera theologica", "Theological Works", "Obras teológicas"),
         "description": {"body": {
             "en-US": "The summa of the faith Denis drew from St Thomas, a dialogue on the Catholic faith, and his commentary on the four books of Peter Lombard's Sentences.",
             "pt-BR": "A suma da fé que Dionísio tirou de Santo Tomás, um diálogo sobre a fé católica e o seu comentário aos quatro livros das Sentenças de Pedro Lombardo."}},
         "blocks": items(theology)},
        {"id": "masters", "title": t("In Boetium, Cassianum, Climacum", "On Boethius, Cassian and Climacus", "Sobre Boécio, Cassiano e Clímaco"),
         "description": {"body": {"en-US": "Commentaries on three classics of the monastic library.",
                                  "pt-BR": "Comentários a três clássicos da biblioteca monástica."}},
         "blocks": items(masters)},
        {"id": "sermons", "title": t("Sermones", "Sermons", "Sermões"),
         "description": {"body": {
             "en-US": "Sermons for the Sundays and feasts of the whole year, many in two series, for lay people and for religious, with a commentary on each Sunday's epistle and gospel; and the Passion harmonized from the four Gospels.",
             "pt-BR": "Sermões para os domingos e festas de todo o ano, muitos em duas séries, para leigos e para religiosos, com um comentário à epístola e ao evangelho de cada domingo; e a Paixão harmonizada dos quatro Evangelhos."}},
         "blocks": items(sermons)},
        {"id": "opera-minora", "title": t("Opera minora", "Minor Works", "Obras menores"),
         "description": {"body": {
             "en-US": "Treatises, dialogues and letters on philosophy, God, the Mass, Our Lady, the states of life, the vices and virtues, prayer and contemplation, and the last things, tome by tome.",
             "pt-BR": "Tratados, diálogos e cartas sobre a filosofia, Deus, a Missa, Nossa Senhora, os estados de vida, os vícios e as virtudes, a oração e a contemplação, e os novíssimos, tomo por tomo."}},
         "blocks": [
             sub("t33", t("De philosophia et theologia", "Philosophy and Theology", "Filosofia e teologia"), items(minora, by_tomus(minora, 33))),
             sub("t34", t("De Deo et creaturis", "God and His Creatures", "Deus e as criaturas"), items(minora, by_tomus(minora, 34))),
             sub("t35", t("De hymnis, de Spiritu Sancto, de Missa, de B. Virgine", "Hymns, the Holy Spirit, the Mass, Our Lady", "Hinos, o Espírito Santo, a Missa, Nossa Senhora"), items(minora, by_tomus(minora, 35))),
             sub("t36", t("De B. Virgine, de cultu, contra Mahometum, de Ecclesia", "Our Lady, Worship, Islam, the Church", "Nossa Senhora, o culto, o islã, a Igreja"), items(minora, by_tomus(minora, 36))),
             sub("t37", t("Tomus XXXVII", "Tome XXXVII", "Tomo XXXVII"), [missing("Tomus XXXVII", "Tome XXXVII of the minor works", "Tomo XXXVII das obras menores")]),
             sub("t38", t("De statibus vitæ et de vita religiosa", "The States of Life and the Religious Life", "Os estados de vida e a vida religiosa"), items(minora, by_tomus(minora, 38))),
             sub("t39", t("De vitiis et virtutibus", "Vices and Virtues", "Vícios e virtudes"), items(minora, by_tomus(minora, 39))),
             sub("t40", t("Tomus XL", "Tome XL", "Tomo XL"), [missing("Tomus XL", "Tome XL of the minor works", "Tomo XL das obras menores")]),
             sub("t41", t("De oratione, contemplatione et novissimis", "Prayer, Contemplation and the Last Things", "Oração, contemplação e novíssimos"), items(minora, by_tomus(minora, 41))),
         ]},
        {"id": "vita", "title": t("De vita auctoris", "His Life", "A sua vida"),
         "blocks": items(front)},
    ]
    path.write_text(json.dumps(collection, ensure_ascii=False, indent="\t") + "\n")


if __name__ == "__main__":
    main()
