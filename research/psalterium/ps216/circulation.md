# Canticle 216 (Sirach / Ecclesiasticus 36:1–16, Vulgate) — liturgical use and Brazilian circulation

Checked 2026-09-23. Nothing here is from memory; each source says how it was seen.

## In the Latin books (DO, grep)

- DO files it as `Psalterium/Psalmorum/Psalm216.txt`. Its first line is the heading *(Canticum Ecclesiastici \* Sir 36:1-16)*, which is not a prayed verse. D7 applies, so it is not translated. Canticles 233, 211 and 213 did the same.
- `Psalterium/Psalmi/Psalmi major.txt`, `[Day6 Laudes1]`: Saturday Lauds, fourth place, with the antiphon ***Osténde nobis, Dómine, \* lucem miseratiónum tuárum***. `[DaymF Canticles]` gives the same antiphon with the range `216(1-13)`, which is the shorter form ending at DO 36:13.
- The wording agrees with the Clementine Vulgate of Sirach 36:1–16 (Bolls `VULG`, `consult/ps216/bolls-VULG-71-36.json`), apart from spelling (*hæreditabis*). DO's ids are the canticle's own line numbers. They drift from the Clementine verses: see the head of `consult/parallels/ps216.md`.

## Diurnal Monástico 1962 (consult/diurnal-1.md, Saturday Lauds)

- It prints the canticle as ***Cântico do Eclesiástico — Eclo. 36, 1-13***, ending at *E sejam herança tua \* como o foram desde o princípio*. Its antiphon is *Mostra-nos, Senhor, a luz das tuas misericórdias*.
- Its Portuguese here is almost word for word Matos Soares 1932: *Tem piedade de nós, Deus de tôdas as coisas*; *Na voracidade das chamas consumido seja o que escapar*; *Ajunta todas as tribos de Jacó*. So for this canticle the Diurnal is a witness of the Vulgate family, not of the Hebrew. It addresses God as *tu*.

## Liturgia das Horas, CNBB

- Source: liturgiadashoras.online, *Laudes de Segunda-feira da 2ª Semana do Tempo Comum*, saved as `consult/ps216/lh-online-laudes-seg-2tc.html` (gitignored). The canticle is Monday Lauds of Week II.
- Heading: *Cântico Eclo 36,1-7.13-16 — Súplica pela cidade santa, Jerusalém*. Antiphon: ***Mostrai-nos, ó Senhor, vossa luz, vosso perdão!***
- The text is a metrical paraphrase from the Neo-Vulgate, i.e. from the Greek. It is a witness of what Brazilian ears know, not of sense:
  - Fragments only (copyright; the saved page is gitignored): *Tende piedade e compaixão, Deus do universo*; *mostrai-nos vossa luz, vosso perdão*; *Espalhai vosso temor sobre as nações*; *que não querem procurar-vos*; *para que saibam*; *contra os estranhos*; *além de vós*; *Reuni todas as tribos de Jacó*; *de quem fizestes primogênito*; *o lugar santificado onde habitais*; *Enchei Jerusalém*.
- It leaves out DO 36:8–11, the verses of wrath.

## Lectionary (Brazil)

- Source: Canção Nova, *8ª Semana do Tempo Comum | Quarta-feira* (26 May 2021), saved as `consult/ps216/cancaonova-8tc-quarta.html` (gitignored). The first reading is **Eclo 36,1-2a.5-6.13-19**, year I. It is the CNBB Lectionary text as that site prints it:
  - The fragments that bear on the draft: *Tende piedade de nós, Senhor, Deus do mundo inteiro, e olhai!*; *Mostrai-nos a luz do vosso amor*; *Infundi o vosso temor*; *que não vos procuram*; *para que saibam que não há outro Deus senão vós*; *como nós reconhecemos*; *não há Deus além de vós, Senhor*; *Reuni as tribos todas de Jacó*; *dai-lhes a herança*; *povo chamado pelo vosso nome*; *a quem tratastes como primogênito*; *Enchei Sião*. The text is not reproduced here (copyright); the saved page is gitignored.
- The responsorial psalm that day is Ps 78, not this canticle.

## What Brazilian ears know, and what the draft takes

- The opening ***Tende piedade de nós*** (Lectionary) is also the psalter's formula (122:3). Taken.
- ***Deus do universo*** (LH) and ***Deus do mundo inteiro*** (Lectionary) both resolve *ómnium*, and so does *Deus de todas as coisas* (MS1932, DM1962). See decision `omnium`.
- ***Mostrai-nos … a luz*** is the start of both the LH antiphon and the Lectionary text. The draft keeps *compaixões* for *miseratiónum* (glossary), where the LH has *perdão* and the Lectionary *amor*.
- ***que não vos procuram*** (LH, Lectionary) matches the glossary's *exquírere → procurar*.
- ***para que saibam que … não há … Deus senão vós*** (both) supports *saber* for *cognóscere quia* (decision `cognoscant`). ***como nós reconhecemos … não há Deus além de vós, Senhor*** (Lectionary) supports *além de vós* for *præter te* in 36:6.
- ***Reuni todas as tribos de Jacó*** (LH; the Lectionary has *as tribos todas*): not taken. The bare *vós* imperative *Reuni* is also "I gathered" (the homograph ban, D18), so the draft has *Congregai* (decision `congrega`).
- ***Tende piedade do povo chamado pelo vosso nome*** (Lectionary) is the plain rendering of *super quam invocátum est nomen tuum*. See decision `invocatum`.
- ***Enchei Sião*** (Lectionary): the same words as the draft.
