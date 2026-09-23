# Canticle 231 (the Benedictus, Luke 1:68–79, Vulgate) — Brazilian circulation

Checked 2026-09-23 on the web; nothing here is from memory. Where a source is only secondary, it says so.

## Liturgia das Horas (CNBB) — Lauds, every day

Source: Paulus Editora, *Liturgia Diária das Horas*, the same Thursday page ps221 used (saved as `consult/ps231/lh-paulus-quinta.html`, gitignored). Paulus prints the CNBB text. The Gospel canticle of Lauds is the same every day, so one page is enough.

Heading: **Benedictus – Lc 1,68-79 – O Messias e seu Precursor.**

Points of contact and departure, in short fragments only (the full text is in the saved page):

| DO | CNBB LH (fragment) |
| --- | --- |
| 1:68 | *Bendito seja o Senhor Deus de Israel* · *a seu povo visitou e libertou* |
| 1:69 | *fez surgir um poderoso Salvador* · *na casa de Davi, seu servidor* |
| 1:70 | *desde os tempos mais antigos* |
| 1:71 | *para salvar-nos do poder dos inimigos* |
| 1:72 | *mostrou misericórdia a nossos pais* · *recordando a sua santa Aliança* |
| 1:73 | *o juramento a Abraão, o nosso pai* · *de conceder-nos que* |
| 1:74 | *libertos do inimigo* |
| 1:75 | *enquanto perdurarem nossos dias* |
| 1:76 | *Serás profeta do Altíssimo, ó menino* · *irás andando à frente do Senhor* · *aplainar e preparar* |
| 1:77 | *anunciando ao seu povo a salvação* · *na remissão de seus pecados* |
| 1:78 | *pela bondade e compaixão de nosso Deus* · *fará brilhar o Sol nascente* |
| 1:79 | *jazem entre as trevas* · *na sombra da morte estão sentados* · *dirigir os nossos passos* · *no caminho da paz* |

It is a metrical paraphrase, made from the Greek and the Nova Vulgata, not from this Latin. Its departures are of three kinds:

- **Tense.** In 1:78 it has a future, *fará brilhar*, which follows the Greek variant ἐπισκέψεται and the Nova Vulgata. Our Latin has the perfect *visitávit*.
- **Images dropped.** It removes the horn (*cornu*), the face (*ante fáciem*), the entrails (*víscera*, where it has *bondade e compaixão*), the feet (*pedes*, where it has *passos*), and the noun *redémptio* (it has *libertou*).
- **Words added.** It adds *aplainar*, *anunciando*, *guiando-os* and *poderoso*.

## Lectionary (Missal of Paul VI, Brazilian Lecionário)

Two web sources:

- Canção Nova's daily liturgy (CNBB ©), saved as `consult/ps231/cancaonova-3tc-sabado.html`, gitignored. It prints "Salmo Responsorial (Lc 1)" with the refrain *Bendito seja o Senhor Deus de Israel, porque a seu povo visitou e libertou!*
- The Arquidiocese de Goiânia's liturgy PDF, saved as `consult/ps231/arq-goiania-lc1.pdf`, gitignored. It prints Lc 1,69-70.71-72.73 e 75 (R. cf. 68) for Monday of the 29th week (odd years).

A web search also listed Saturday of the 3rd week (odd years); it was not opened. The Lectionary verses match the LH wording, so the two share one translation. The search summary also showed a refrain *que visitou e redimiu o seu povo*. That is probably Portugal's liturgy, it was not verified, and it is not Brazilian.

## Older Brazilian witnesses (consult/parallels/ps231.md)

- **Matos Soares 1932**, translated from this Vulgate:
  - *resgatou o seu povo* · *uma força para nos salvar*
  - *lembrar-se do seu santo pacto* · *irás adiante da face do Senhor*
  - *o conhecimento da salvação* · *pelas entranhas da misericórdia*
  - *do alto o Sol nascente* · *os que jazem nas trevas* · *no caminho da paz*
- **Diurnal Monástico 1962**, from the Latin, and the text DO's Portuguese copies:
  - *pois visitou e resgatou seu povo* · *uma fôrça salvadora*
  - *pela qual nos visitou a luz do alto*

## What this means for the translation

Brazilians pray this canticle every morning, so the CNBB's lines are the ones in their ears. Where they are also this Latin's sense, the draft keeps them:

- the head formula (its verbless form, D41);
- *na casa de Davi, seu servo*;
- *sua santa aliança*;
- *de nos conceder*;
- *Profeta do Altíssimo*;
- *remissão dos pecados*;
- *na sombra da morte … sentados*;
- *o caminho da paz*.

Where they depart from it, the Latin rules (rule 1). In each case below, the familiar form is listed as an option in prayed.json:

- the horn, the face and the entrails stay (rule 5);
- the perfect *visitou* stays in 1:78;
- *óriens* stays *Oriente*, not *Sol nascente* (decision `oriens`);
- *in viam* stays a motion *ao caminho*, not *no caminho* (decision `inviam`).
