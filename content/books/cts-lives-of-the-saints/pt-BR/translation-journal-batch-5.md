# Translation Journal — Batch 5 (pt-BR)

Translator batch covering 15 chapters (see JSON below). This supplements the shared `translation-journal.md` — read that file for the pre-seeded glossary; only new items are listed here.

## New Key Terms / Expressions

| English | Portuguese | Notes |
|---------|-----------|-------|
| Society of the Catholic Apostolate (SAC) | Sociedade do Apostolado Católico | kept acronym SAC as in source |
| Catholic Apostolate | Apostolado Católico | |
| Passionist(s) / Congregation of the Passion | Passionista(s) / Congregação da Paixão | |
| Redemptorist(s) | Redentorista(s) | |
| Third Order (Dominican Tertiary) | Terceira Ordem / Terciária | |
| Barefooted Carmelites / Discalced Carmel | Carmelitas Descalças / Carmelo Descalço | |
| Prioress | Priora | |
| Provincial (superior) | Provincial | kept as masc. noun, same as English usage |
| the Angel Saints (Aloysius, Stanislaus, Berchmans) | os Santos Anjos | |
| Coadjutor Brother | Irmão Coadjutor | Redemptorist lay-brother vocation |
| League of St. Gerard | Liga de São Gerardo | |
| the Mothers' Saint | a Santa das Mães | recurring epithet for St. Gerard Majella, kept consistent throughout |
| Wonder-worker | Taumaturgo | used for both St. Anthony and St. Gerard |
| Holy Maid of Kent | Santa Donzela de Kent | Elizabeth Barton, in St. Thomas More chapter |
| Act of Supremacy / Act of Succession | Ato de Supremacia / Ato de Sucessão | |
| Lord Chancellor | Lorde Chanceler | kept English title form, common in pt-BR historical texts |
| Tower of London / Traitors' Gate | a Torre (de Londres) / Portão dos Traidores | |
| S.J. (Society of Jesus, post-nominal) | S.J. | kept as-is, per existing journal convention |
| Echevin (medieval Flemish magistrate) | echevin | kept untranslated (foreign title), as in source |
| Svatý Václav / Svaty Vaclav (Czech) | Svatý Václav | kept in Czech, translated title separately as "São Venceslau" |
| the Union of St. Paul (soldiers' society, Rome) | a "União de São Paulo" | |
| repetitor (university tutor) | repetitor | kept Latin-derived term as used in source |
| the Sapienza (Rome university) | a Sapienza | kept proper name |
| Union / League of the Catholic Apostolate sections: apostolic workers / spiritual co-operators / temporal co-operators | operários apostólicos / cooperadores espirituais / cooperadores temporais | |

## Non-obvious Translation Decisions

- **saint-rita.md vs saint-rita-of-cascia.md**: both are distinct CTS chapters on St. Rita of Cascia. `saint-rita.md` is the long narrative biography (Umbria, Roccaporena, the bees, the thorn, incorruption) with a Prayer and Novena at the end — titled simply **"Santa Rita"** to match its own H1 ("Saint Rita"). `saint-rita-of-cascia.md` is the shorter CTS pamphlet-style biography ("Saint of the Impossible") with Novena and a full Litany — titled **"Santa Rita de Cássia"**, matching the shared journal's standard form and its own H1 ("Saint Rita of Cascia"). Kept distinct per instructions.
- **the-life-of-saint-anthony.md**: "St. Anthony the Hermit" translated as "Santo Antônio Eremita" (distinct from Santo Antônio de Lisboa/Pádua, the chapter's subject) to avoid confusion between the two Anthonys mentioned in the text.
- **the-dauntless-virgin-of-siena.md**: title translated as "A Virgem Destemida de Sena" (Sena = Siena in Portuguese); St. Catherine consistently "Catarina de Sena" / "Catarina Benincasa" per the shared journal's Italian-saints convention (São/Santa forms already established).
- **saint-thomas-more.md**: More's own epitaph verse and his letters to Margaret were translated preserving register (formal, Tudor-flavored English rendered as dignified but not archaic Portuguese). The family nickname exchanges ("wife", "Meg") kept as literal terms of address translated naturally ("esposa", "Meg"/"Margarida" alternately, matching how the source itself alternates).
- **saint-vincent-pallotti.md**: "Every Catholic an Apostle!" rendered as "Cada católico, um apóstolo!" — kept as the recurring slogan, unchanged throughout.
- **saint-wenceslas.md**: This chapter has extensive proper names in Czech (people, places, historical figures) — restored standard Czech diacritics for accuracy (e.g., Přemyslides → Přemyslidas, Boleslav → Boleslau for the person / Stará Boleslav kept as place name, Ludmila, Drahomira unchanged, Radislas → Radislau). The English "Wenceslas" is rendered "Venceslau" per the shared journal; the Czech hymn "Svatý Václave" kept untranslated as a proper title but its verses were translated into Portuguese. The English carol "Good King Wenceslas" was translated into Portuguese verse (rhythm approximated, not a singable metrical translation) since it is quoted in full in the source text.
- **the-martyrdom-of-saint-perpetua-and-felicitas-with-their-companions.md**: Latin/archaic English court-record style preserved; Scripture-adjacent visionary narrative kept in first person exactly as narrated by St. Perpetua/St. Saturus in the source.
- Editor/footnote policy: no editor footnotes were present to drop in any of the 15 chapters (only endnotes to the Perpetua/Felicitas chapter, which are source citations — kept and translated: "Analect." and "Vitor" citations kept as bibliographic, untranslated author name "Vitor" per source spelling).
- Outdated/period terms (e.g., "Moors" in Rita of Cascia chapter, "the Turks" in Rita chapter, "negrophiles"/derogatory period language in the-adventurous-nun.md) were kept as literal, faithful translations of the period text rather than modernized, since the register is historical narration, not a live slur directed at a person in the text — translated directly ("mouros", "turcos", "negrófilos") to preserve fidelity to a mid-20th-century missionary-era source text discussing real historical racism; no softening applied per "faithful, not sanitized" translation principle. Flagged here for editorial awareness.

## Chapter IDs → Portuguese Titles

```json
{
  "saint-rita": "Santa Rita",
  "saint-rita-of-cascia": "Santa Rita de Cássia",
  "saint-rose-of-lima": "Santa Rosa de Lima",
  "saint-stanislaus-kostka": "São Estanislau Kostka",
  "saint-teresa-of-avila": "Santa Teresa de Ávila",
  "the-adventurous-nun": "A Freira Destemida",
  "the-dauntless-virgin-of-siena": "A Virgem Destemida de Sena",
  "the-life-of-saint-anthony": "A Vida de Santo Antônio",
  "the-life-of-saint-john-berchmans-s-j": "A Vida de São João Berchmans, S.J.",
  "the-martyrdom-of-saint-perpetua-and-felicitas-with-their-companions": "O Martírio de Santas Perpétua e Felicidade e Seus Companheiros",
  "the-mothers-saint": "A Santa das Mães",
  "saint-thomas-more": "São Tomás Moro",
  "saint-vincent-pallotti": "São Vicente Pallotti",
  "saint-vincent-strambi-c-p": "São Vicente Strambi, C.P.",
  "saint-wenceslas": "São Venceslau"
}
```
