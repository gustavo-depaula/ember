# Translation Journal — On Pilgrimages (pt-BR)

Source: en-US (Moore & Wilson translation, NPNF Second Series vol. 5, via New Advent)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| pilgrimage(s) | peregrinação(ões) | title term |
| the Holy Life | a Vida Santa | capitalized to match source's capitalized "Holy Life" |
| Modesty (as the mark of the contemplative life) | Modéstia | capitalized per source |
| the higher life | a vida mais alta | |
| the Gospel rule of life | a regra evangélica de vida | |
| the Holy Council | o Santo Concílio | refers to the council that commissioned Gregory's visitation |
| Heads of the Holy Jerusalem Churches | Chefes das Santas Igrejas de Jerusalém | |
| our most religious Emperor | nosso religiosíssimo Imperador | |
| the Holy Spirit | o Espírito Santo | |
| Golgotha / the Mount of Olives / the memorial-rock of the Resurrection | Gólgota / Monte das Oliveiras / rocha memorial da Ressurreição | proper/holy-site names |
| Cappadocia / Cappadocian | Capadócia / capadócia | region name kept as-is |
| Arabia | Arábia | |

## Translation Decisions

- Single unbroken paragraph in the source (no section breaks, no numbered items) preserved as a single paragraph in the translation — matches the pattern used for other short church-fathers epistles (e.g. `gregory-thaumaturgus/trinity`).
- No Scripture chapter:verse citations appear in this letter (unlike other Gregory of Nyssa/Thaumaturgus fragments already translated), so there was no book-name-translation decision to make here.
- The rhetorical quotation `"blows" where He "lists"` (an allusion to John 3:8, "the wind bloweth where it listeth") was translated as `"sopra" onde "quer"` — matching the sense (the Spirit acts according to its own will) rather than the archaic "listeth", which has no natural Portuguese equivalent. This phrase does not appear as a direct quotation elsewhere in the pt-BR corpus to match against.
- Divine pronouns ("ele"/"nele"/"-lo") kept lowercase mid-sentence, capitalized only at sentence-initial position — following the convention documented in the `gregory-thaumaturgus/trinity` journal, confirmed here against corpus usage in `ignatius/*/pt-BR` and `ambrose/mysteries/pt-BR` (lowercase "ele"/"nele" dominate; no other file in `church-fathers/*/pt-BR` uses a capital "nEle" or "-Lo").
- No editor or author footnotes present in the source — none to drop or preserve.
- No translator notes added — the letter's historical references (the Holy Council, the imperial postal service) are already explained by context within the text itself and don't need glossing for a general reader.

## Review Rounds

Three independent adversarial review rounds, each a fresh bilingual (and, in round 3, additionally monolingual) read with no access to prior rounds' conclusions. All three reported clean; no fixes were needed.

- **Round 1** — full sentence-by-sentence bilingual comparison, completeness (exact term-occurrence counts for God/Deus, Jerusalem/Jerusalém, Christ/Cristo, Holy Spirit/Espírito Santo, and the 7-item vice list), diacritics spot-check, tu/vós register consistency, divine-pronoun capitalization verified independently against the claim in this journal, markdown structure, book.json. Clean.
- **Round 2** — mechanical structural counts (semicolons 25/25, question marks 7/7, exclamation marks 1/1, quotation pairs 3/3, em-dashes — the one PT delta is a legitimate restructuring of an English comma clause into a dash-set clause, not added content); full proper/place-name occurrence parity (13 names/terms, all exact matches); verb mood/tense fidelity in the exhortative close; false-friend idiom check (licence, conductor, yeoman's service, waggon) — all correct senses. Clean.
- **Round 3** — cold monolingual Portuguese proofread (grammar, gender/number agreement, verb conjugations including `críamos`/`jejuávamos`/`concedera`, no mojibake or duplicated words); bilingual logical-connective pass (Now/Ora vs. Agora, Whereas/Ao passo que, Inasmuch as/Visto que, etc. — no connective flattened to a bare "e"); firstly/secondly/thirdly enumeration checked against the source itself (source has no "firstly", only secondly/thirdly — PT mirrors this exactly); formatting (no trailing whitespace, no double spaces); book.json re-verified (valid JSON, both languages listed, TOC id matches filename). Clean.
