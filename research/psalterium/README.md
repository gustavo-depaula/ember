# Psalterium — Saltério Galicano em Português

A Brazilian Portuguese translation of the Gallican Psalter **meant to be prayed**, for a translation of the Breviarium Romanum (1961/62 books). Built by frontier LLMs working through agentic harnesses, with human philological sign-off. Output is public domain.

[`design.md`](design.md) is the founding design doc: goal, corpus, the style standard ("simple nobility"), a proposed pipeline, the pilot. Read it for the *intent*. Its pipeline, data model and tooling are a proposal, not a contract — this folder is deliberately empty so whoever does the work can find the shape that actually produces a good psalter. Make folders, formats and scripts as you need them, and say why in this README as you go.

**Status:** nothing started. The pilot is Sunday Prime and Compline.

## What does not bend

- Translate the Latin as Latin. LXX and Hebrew explain Jerome; they never correct him.
- It is a text for the mouth: recited daily, chanted to a psalm tone, facing the Latin column. Cola follow the Latin's flex, mediant and final; prayed verses are never merged or split.
- What repeats in the Latin repeats identically in the Portuguese — refrains, formulas, doublet psalms.
- No rendering is final without a human decision, and every rendering can be traced back to how it was made.

## What is already in the repo

Verified against the files, 2026-09-20:

- **The Breviary's Latin psalter is at `content/do/horas/Latin/Psalterium/Psalmorum/`** — a verbatim mirror of Divinum Officium (pinned commit in `content/do/meta.json`; never edit it). `Psalm1.txt`–`Psalm150.txt`, one prayed verse per line, LXX numbering, already pointed: `†` flex, `*` mediant. It is the text Ember's breviary renders, so translating it keeps both columns aligned in the app. It has not been collated against a printed Clementine (Hetzenauer / Colunga–Turrado) here.
- Orthography is liturgical: stress accents, `j`, `æ`/`œ`. Useful for cadence; normalise in memory before any lemmatiser sees it.
- **Verse division is the Breviary's, not the Bible's.** 194 verse lines in Pss 1–150 carry a letter suffix (`4:2a` / `4:2b`, `17:36b`) where a biblical verse is split into two prayed verses. The prayed verse is the unit.
- **No tituli and no *diapsalma*** — `Psalm4.txt` opens at `4:2a`. The design doc's "tituli translated literally" needs another witness, or to be dropped from the MVP.
- Canticles are `Psalm210.txt`–`Psalm273.txt` in the same folder (`Psalm233.txt` = Nunc dimittis). The invitatory form of Ps 94 (long verses with antiphon slots) is `Psalterium/Invitatorium.txt`; `Psalm94.txt` is the same psalm in ordinary verse form. The design doc says the invitatory is Roman-Psalter wording — diff the two files to see exactly where they part. Antiphons and hour assignments are in `Psalterium/Psalmi/*.txt`.
- **Pilot psalms per that data:** Sunday Prime `117, 118(1-16), 118(17-32)` (the `[Tridentinum]` scheme prefixes `53`); Sunday Compline `4, 90, 133`.
- *Quoniam in saeculum misericordia eius* is the refrain of Pss 105, 106, 117. Pss 135 and 99 read *in aeternum* — a different formula; whether they share a rendering is a choice to make on purpose.
- A Portuguese antecedent already aligned to the same cola sits at `content/do/horas/Portugues/Psalterium/Psalmorum/` — European Portuguese (*protecção*), so a reference and a contrast, not a base.

## Open questions

- Address to God: *vós* or *tu* — one choice for the whole corpus. Cheap to test: the same handful of verses both ways, recited and sung.
- Which printed witness is authoritative for wording, and whether the DO mirror is the working text collated against it.
- Tituli: in or out of the MVP.
- Who the Latinist reviewer is; whether the translation table is published for public comment.
