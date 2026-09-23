# Canticle 232 (the Magnificat, Luke 1:46–55, Vulgate) — Brazilian circulation

Checked 2026-09-23 on the web; nothing here is from memory. Where a source is only secondary, it says so.

## Liturgia das Horas (CNBB) — Vespers, every day

The Paulus pages used for 221 and 231 print Lauds only, so the Vespers text was taken from *Liturgia das Horas Online* (liturgiadashoras.online), which reproduces the Brazilian Liturgia das Horas. Two Vespers pages were read and agree word for word: the Presentation of the Lord, and the memorial of St Cecilia. Both are saved in `consult/ps232/` (gitignored). The site is not the publisher, so this is a secondary witness of the CNBB text; the same site's Latin page (`consult/ps232/lh-online-magnificat.html`) prints this Latin.

Heading: **Cântico evangélico (Magnificat) Lc 1,46-55 — A alegria da alma no Senhor.**

Points of contact and departure, in short fragments only:

| DO | CNBB LH (fragment) |
| --- | --- |
| 1:46 | *A minha alma engrandece ao Senhor* (asterisk after *Senhor*: the LH joins 46 and 47 in one strophe) |
| 1:47 | *e se alegrou o meu espírito* · *em Deus, meu Salvador* |
| 1:48 | *ele viu a pequenez de sua serva* · *hão de chamar-me de bendita* |
| 1:49 | *O Poderoso fez por mim maravilhas* · *e Santo é o seu nome* |
| 1:50 | *Seu amor, de geração em geração* · *chega a todos que o respeitam* |
| 1:51 | *demonstrou o poder de seu braço* · *dispersou os orgulhosos* |
| 1:52 | *derrubou os poderosos de seus tronos* · *e os humildes exaltou* |
| 1:53 | *De bens saciou os famintos* · *despediu, sem nada, os ricos* |
| 1:54 | *Acolheu Israel, seu servidor* · *fiel ao seu amor* |
| 1:55 | *aos nossos pais* · *em favor de Abraão e de seus filhos, para sempre* |

Like the Benedictus of the same book (see `ps231/circulation.md`), it is a metrical paraphrase from the Greek and the Nova Vulgata, not from this Latin. It pairs the verses in strophes (46+47 in one, and so on), so its asterisks do not fall where DO's do. Its departures:

- **Words changed.** *misericórdia* becomes *amor* (1:50, 1:54); *timéntibus* becomes *respeitam*; *beátam* becomes *bendita*; *supérbos* becomes *orgulhosos*; *magna* becomes *maravilhas*.
- **Images and phrases dropped.** *mente cordis sui* is gone (1:51), and *recordátus misericórdiæ* becomes *fiel ao seu amor* (1:54). *sémini* becomes *filhos*.
- **Order.** It inverts the verb and subject (*e se alegrou o meu espírito*; *e os humildes exaltou*).

## Lectionary (Brazilian Lecionário, the Gospel of 22 December and of the Visitation)

Source: the Comunidade Católica Nova Aliança page for 22 December 2025, which prints the Gospel Lc 1,46-56 from the Lectionary. It was first saved for canticle 223 (whose Hannah canticle is that day's psalm) and is copied to `consult/ps232/lect-novaalianca-2025-12-22.html` (gitignored). This is the CNBB Bible's prose, not the LH's verse:

| DO | Lectionary (fragment) |
| --- | --- |
| 1:46 | *A minha alma engrandece o Senhor* |
| 1:47 | *e o meu espírito se alegra em Deus, meu Salvador* |
| 1:48 | *olhou para a humildade de sua serva* · *Doravante todas as gerações* |
| 1:49 | *o Todo-poderoso fez grandes coisas em meu favor* · *O seu nome é santo* |
| 1:50 | *se estende, de geração em geração* |
| 1:51 | *mostrou a força de seu braço* · *dispersou os soberbos de coração* |
| 1:52 | *Derrubou do trono os poderosos e elevou os humildes* |
| 1:53 | *Encheu de bens os famintos* · *despediu os ricos de mãos vazias* |
| 1:54 | *Socorreu Israel, seu servo, lembrando-se de sua misericórdia* |
| 1:55 | *em favor de Abraão e de sua descendência, para sempre* |

## Older Brazilian witnesses (consult/parallels/ps232.md)

- **Matos Soares 1932**, translated from this Vulgate:
  - *A minha alma glorifica o Senhor* · *exulta (de alegria)* · *a baixeza da sua serva*
  - *fez em mim grandes coisas aquele que é poderoso* · *dissipou aqueles que se orgulhavam nos pensamentos do seu coração*
  - *Depôs do trono os poderosos* · *despediu vazios os ricos* · *lembrado da sua misericórdia* · *e à sua posteridade para sempre*
- **Diurnal Monástico 1962**, Sunday Vespers; the text that DO's Portuguese copies:
  - it points the first verse *Minha alma * engrandece ao Senhor*, so the mediant falls after the subject
  - *pôs os olhos na sua humilde escrava* · *Derrubou do trono os poderosos* · *deixou aos ricos vazios*

## What this means for the translation

Brazilians say the LH's lines every evening and hear the Lectionary's at Mass. The draft keeps the familiar wording wherever it is also this Latin's sense:

- *A minha alma engrandece o Senhor*: the Lectionary word for word (the LH has *ao Senhor*). The mediant falls after *A minha alma*, as in the Diurnal.
- *em Deus, meu Salvador*: both books.
- *olhou para a humildade da sua serva*: the Lectionary. The LH's *pequenez* is an option.
- *grandes coisas* and *de geração em geração*: the Lectionary.
- *Encheu de bens os famintos*: the Lectionary.
- *seu servo*, *lembrando-se da sua misericórdia*, *aos nossos pais*, *a Abraão*: the Lectionary.
- *Derrubou do trono os poderosos* (v2): the Lectionary, the LH and the Diurnal, after the ambiguity reader did not know *Depôs*.
- *fez em mim* (after the gate): MS1932 and the Diurnal.

Where both books depart from this Latin, the Latin rules (rule 1). The familiar form is recorded as an option in `prayed.json`:

- the perfect *exultou* stays, against the present *se alegra*;
- *misericórdia* stays, against the LH's *amor*;
- *os que o temem* stays, against *respeitam*;
- *mente cordis sui* stays, against *de coração*;
- *descendência* stays, against *filhos*;
- *pelos séculos* follows D43, against *para sempre*.
