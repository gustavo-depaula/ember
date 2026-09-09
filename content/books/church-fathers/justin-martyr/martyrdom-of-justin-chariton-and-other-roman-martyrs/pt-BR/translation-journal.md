# Translation Journal — Martyrdom of Justin, Chariton, and other Roman Martyrs (pt-BR)

Source: en-US (Marcus Dods translation, Ante-Nicene Fathers Vol. 1)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| Justin | Justino | Standard Portuguese form (São Justino) |
| Chariton | Caritão | Male martyr; standard Portuguese martyrology form |
| Charito / Charites | Carita | The source itself spells this name two ways — "Charites" in the subtitle, "Charito" in Ch. 3 — clearly the same woman (the only female defendant). Unified to one Portuguese form, "Carita" (feminine parallel to "Caritão"), for readability rather than reproducing the source's inconsistent spelling. |
| Euelpistus | Evelpisto | |
| Hierax | Hierace | |
| Pæon | Peão | Standard Portuguese martyrology form |
| Liberianus | Liberiano | |
| Rusticus (the prefect) | Rústico | Standard Portuguese form |
| the prefect | o prefeito | Roman civil office, kept as the direct cognate |
| Cæsar | César | |
| Cappadocia | Capadócia | |
| Iconium in Phrygia | Icônio, na Frígia | |

## Translation Decisions

- No editor footnotes present in the source (a single continuous martyrdom account in dialogue form); nothing to drop.
- No Latin phrases in the source to preserve inline.
- The subtitle names only five martyrs ("Justin, Chariton, Charites, Pæon and Liberianus"), but the body examines seven people — it also questions Charito (a woman, distinct from the man Chariton) and Hierax, neither named in the subtitle. This mismatch is in the source itself (a known feature of this ANF text) and is preserved as-is rather than "corrected," per the same rule the corpus already follows for other Church Fathers texts with source-level oddities (cf. `hippolytus/against-plato-on-the-cause-of-the-universe/pt-BR/translation-journal.md`).
- "the Timiotinian Bath" rendered "os Banhos Timiotinos" (plural, matching Portuguese usage for Roman public baths/thermae named after a person, e.g. "Banhos de Diocleciano") rather than a literal singular calque.
- Reverential capitalization: the source capitalizes divine pronouns sparingly ("His boundless divinity," "His gifts," "His appearance"). Rendered "Sua," "n'Ele," "Seus" capitalized to match, consistent with the majority convention already used across this corpus's bilingual church-fathers files (see the open question logged in `hippolytus/against-plato-on-the-cause-of-the-universe/pt-BR/translation-journal.md` — this file follows the "capitalize nominative/possessive divine references" half of the corpus's two live conventions).
- "the God of the Christians is not circumscribed by place" rendered "o Deus dos cristãos não está circunscrito a um lugar" — direct cognate, natural in Portuguese theological register.
- Chapter headings translated descriptively, matching the en-US source's own descriptive (non-authorial) chapter titles: e.g. "Examination of Justin by the prefect" → "Interrogatório de Justino pelo prefeito."
- 2026-09-09 (round-1 review): Fixed a tu/vós person mismatch in Chapter 2. The entire chapter is a two-person exchange between Rusticus and Justin alone (no other defendants present), and the rest of the chapter correctly addresses Justin with "tu" ("pensas", "recolhes", "és"). "Where do you assemble?" and "Tell me where you assemble, or into what place do you collect your followers?" had been rendered "Onde vos reunis?" and "Dize-me onde vos reunis, ou em que lugar recolhes os teus seguidores?" — mixing the "vós" verb form with the "tu" possessive/verb ("recolhes ... teus") inside the very same sentence, addressed to the same single person. Corrected both to "tu": "Onde te reúnes?" and "Dize-me onde te reúnes, ou em que lugar recolhes os teus seguidores?" (Left as "vós" elsewhere where the plural is textually motivated: "Foi Justino que vos fez cristãos?" matches the source's plural predicate "make you **Christians**", and "Reuni-vos, e oferecei sacrifício..." is addressed to the whole group of defendants together — neither of those was touched.)
- 2026-09-09 (round-2 review): Fixed another tu/vós person mismatch, in Chapter 3. "Rusticus the prefect said, 'Who taught you?'" — asked immediately after Pæon stands up and speaks on his own, and answered by Pæon alone ("From our parents we received this good confession") — had been rendered "Quem vos ensinou?", using the plural/formal oblique pronoun. Unlike the neighbouring "Did Justin make you Christians?" (kept as "vos" because the English predicate noun "Christians" is textually plural), "Who taught you?" carries no such plural marker and directly follows/is answered by a single speaker, matching the chapter's otherwise consistent singular "tu" address to each individual defendant ("és tu", "que dizes tu", "e tu, o que és", "e tu, és cristão", "onde estão os teus pais"). Corrected to "Quem te ensinou?" (the verb "ensinou" already agrees with "quem", not with the addressee, so no conjugation change was needed). Everything else checked in this pass — capitalization of every "Sua"/"Seus"/"n'Ele"/"d'Aquele" against the source's He/Him/His (all present and correctly cased, no omissions), the "[os deuses]" bracket in Ch. 3 (matches the source's "[the gods]" exactly), the "Disse"/"Diz" past/historic-present alternation (tracks the source's "said"/"says" alternation exactly in both places it occurs — Ch. 3 "Diz Rústico a Hierace" and Ch. 4 "Diz o prefeito a Justino"), place names (Icônio, Frígia, Capadócia — all standard Portuguese forms, verified), book.json (title/name/author/languages/toc all match current file contents), and Markdown structure (heading levels and paragraph count are exactly 1:1 with the source in all five chapters) — came back clean.
