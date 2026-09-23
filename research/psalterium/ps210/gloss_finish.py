"""Targeted glossary edits for canticle 210 (Benedicite). Re-reads glossary.md at run time; each anchor must match one line."""
from pathlib import Path

f = Path(__file__).parent.parent / 'glossary.md'
lines = f.read_text(encoding='utf-8').split('\n')

def find(prefix):
    hits = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    assert len(hits) == 1, (prefix, hits)
    return hits[0]

def append(prefix, note):
    i = find(prefix)
    l = lines[i].rstrip()
    assert l.endswith('|') and 'Canticle 210' not in l, prefix
    lines[i] = l[:-1].rstrip() + ' ' + note + ' |'

append('| benedícere (man → God) |', "**Canticle 210 (Dan 3:57–74), the Benedicite litany: the dative *Dómino* 30 times → *Bendizei, X, ao Senhor*.** This is the Latin's order (verb, vocative, dative), as in 102:1 *Bendize, ó minha alma, ao Senhor*, so that every colon opens on *Bendizei* and closes on *ao Senhor*. The accusative jussives 3:66, 3:71 → *A terra / Israel bendiga o Senhor*, and 3:75 *Benedicámus Patrem* → *Bendigamos o Pai*. Options (decision `order`): the CNBB's *X, bendizei o Senhor* and DM1962's *Bendizei ao Senhor, X*. No reader remarked on the order.")
append('| virtus (δύναμις), *in virtúte tua* |', "**Canticle 210 (Dan 3:59) *omnes virtútes Dómini* → *todos os poderes do Senhor*** (= 148:2). The blind reader heard the Lord's own powers, the forces of nature and the angelic powers.")
append('| superexaltáre |', "**Canticle 210 (Dan 3, six times, always of God) → *sumamente* (*louvai-o e exaltai-o sumamente pelos séculos*; 3:56 *sumamente exaltado*).** It was tried again here because it is said of God, as in the Ato de Contrição (*sumamente bom*, fetched). The Latinist passed it twice and the stylist did not object to the word, but the blind reader did not know it: the second time, after 36:35. Options (decision `superexaltare`): *muito* (36:35), the CNBB's *exaltai-o* with the prefix dropped, and *acima de tudo*. **For Gustavo: 36:35 (of the wicked) and the Benedicite (of God) now differ; rule on one word or two.**")
append('| spíritus (wind and breath at once) |', "**Canticle 210 (Dan 3:61) *omnes spíritus Dei* → *todos os sopros de Deus*** (v2). v1 had *ventos* (148:8's word for weather); the Latinist and the stylist refused it independently, because it closes the wind/spirit sense. The v2 gate called *sopros* defensible. *ventos* and *espíritos* are options. 3:73 *spíritus, et ánimæ justórum* → *espíritos*.")
append('| béstiæ (θηρία) |', "Canticle 210 (Dan 3:70) *omnes béstiæ et pécora* → *todas as feras e o gado*, as 148:10.")
append('| glácies |', "**Canticle 210 (Dan 3:63–64): *pruína* → *geada*, *gelu* → *gelo* (new row), *glácies* beside the plural *nives* → *gelos*** (the CNBB's and DM1962's *Gelos e neves*). Number keeps *gelu* and *glácies* apart. The v1 stylist found *gelos* odd, and the v2 Latinist noted the shared root; both kept. *regelo … gelo* is the option.")
append('| *super cælos* where', "Canticle 210 (Dan 3:59) applied: *todas as águas acima dos céus*, as 148:4.")
append('| *Benedíctus es, Dómine* (118:12;', "**Canticle 210 (Dan 3:56) *Benedíctus es, Dómine, in firmaménto cæli* → *Bendito sois, Senhor, no firmamento do céu*** (the CNBB has *dos céus*; *firmamento* is the sky, D31). The blind reader did not know *firmamento*.")

new_terms = [
    "| gelu | gelo (*bendizei, gelo e frio, ao Senhor*) | open | **Canticle 210 (Dan 3:63)**; not a psalter word (concord). L&S 'frost, ice, icy coldness'; πάγος. The word descends directly into Portuguese. It is kept apart from *pruína → geada* in the verse before and from *glácies → gelos* in the verse after (see the row *glácies*). The CNBB and DM1962 have *geada e frio*, which would collide with *pruína*. *regelo* is the option. |",
    "| cete (κήτη) | baleias (*Bendizei, baleias e tudo o que se move nas águas, ao Senhor*) | open | **Canticle 210 (Dan 3:69)**; not a psalter word (concord). The great sea creatures. The CNBB has *Baleias e peixes*, and DM1962 has *cetáceos*. No reader remarked. The options are *monstros marinhos* and *cetáceos*. |",
]
i = find('| omnis spíritus (150:5) |')
lines[i + 1:i + 1] = new_terms

formula = "| *laudáte et superexaltáte eum in sǽcula* (Dan 3:57, 3:74; *laudet et superexáltet* 3:66, 3:71; *laudémus et superexaltémus* 3:75), the Benedicite refrain | *louvai-o e exaltai-o sumamente pelos séculos* · *louve-o e exalte-o sumamente pelos séculos* · *a ele louvemos e exaltemos sumamente pelos séculos* | open — canticle 210. The words are identical wherever the Latin is identical; only the person changes. 3:75 fronts *a ele* (v1 stylist: *louvemo-lo e exaltemo-lo* was bookish; decision `eum75`). *pelos séculos* follows D43. The CNBB sings *louvai-o e exaltai-o pelos séculos sem fim* (it drops *super-*). *sumamente* hangs on the row *superexaltáre*. |"
i = find('| *Benedíctus es, Dómine* (118:12;')
lines[i:i] = [formula]

f.write_text('\n'.join(lines), encoding='utf-8')
print('glossary: 8 rows extended, 2 term rows, 1 formula row')
