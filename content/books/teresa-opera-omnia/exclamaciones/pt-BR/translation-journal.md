# Diário de tradução — Exclamações da alma a Deus (pt-BR)

Fonte: es-ES/, *Obras de Sta. Teresa de Jesús*, ed. P. Silverio de Santa Teresa, C.D., t. IV (Burgos: El Monte Carmelo, 1917), pp. 269–296.
Destino: pt-BR.

## Termos

| Espanhol | Português | Notas |
|---|---|---|
| Exclamaciones del alma a Dios | Exclamações da alma a Deus | Título já fixado em book.json. |
| Exclamación I… XVII | Exclamação I… XVII | Títulos dos capítulos. |
| Santa Teresa de Jesús / la Santa | Santa Teresa de Jesus / a Santa | Autoria do catálogo: Santa Teresa de Ávila. |
| vos / vuestro (a Deus) | vós / vosso; Vós com maiúscula conforme a fonte | Segunda pessoa do plural. |
| tú / ti (à alma, ao amor, à vida, à morte; a Deus em e14 e e17) | tu / ti | Preservadas as mudanças de tratamento da fonte. |
| ánima mía / alma mía | alma minha | |
| Su Majestad | Sua Majestade | |
| Criador / lo criado / Hacedor | Criador / o criado / Fazedor | |
| merced / mercedes | mercê / mercês | |
| regalo / contento / gozo | regalo / contentamento / gozo | Conforme as obras irmãs. |
| trabajos | trabalhos | Sofrimentos e provações. |
| desatino / desatinado | desatino / desatinado | Mantido o jogo atinar/desatinar (e09). |
| destierro | desterro | |
| entendimiento / voluntad / potencias | entendimento / vontade / potências | |
| libre albedrío | livre-arbítrio | |
| amadores / Amador | amadores ou amantes / Amante | Conforme o ritmo da frase. |
| Esposa / Esposo / Amado | Esposa / Esposo / Amado | Maiúsculas conforme a fonte. |
| Cantares | Cânticos | Cântico dos Cânticos nas referências. |
| Mi Amado a mí, y yo a mi Amado | O meu Amado a mim, e eu ao meu Amado | Conservada a preposição, sobre a qual a Santa argumenta em e16. |
| mayorazgo | morgadio | Nota do tradutor em e12. |
| águila caudalosa | águia-real | Nota do tradutor em e14. |
| despartir | despartir | Forma portuguesa existente; mantida para a nota 3 de e16. |
| Fr. Luis de León | Fr. Luís de León | Conforme as obras irmãs. |
| edición príncipe | primeira edição | Conforme as obras irmãs. |
| copia de Granada / de Salamanca | cópia de Granada / de Salamanca | Testemunhos manuscritos. |
| letras pegadas / cortadas | letras coladas / recortadas | Fragmentos compostos de letras recortadas de autógrafos. |
| Carmelitas Descalzas de Santa Ana de Madrid / de S. José de Guadalajara | Carmelitas Descalças de Santa Ana de Madri / de São José de Guadalajara | |
| Moradas Sextas | *Sextas Moradas* | |
| San Agustín / Confesiones | Santo Agostinho / *Confissões* | |
| San Martín | São Martinho | São Martinho de Tours; nota do tradutor em e15. |
| Lucifer / Satanás / demonio | Lúcifer / Satanás / demônio | |
| Ps. / Matth. / Joan. / Luc. / Prov. / Sap. / Is. / Cant. | Salmo / Mateus / João / Lucas / Provérbios / Sabedoria / Isaías / Cântico dos Cânticos | Numeração dos Salmos da fonte (Vulgata). |

## Decisões

- e02, nota 1: o OCR deslocou para o corpo do texto o fim da nota (“copias de Salamanca y Granada.”); devolvido à nota.
- Corrigidos sem nota erros evidentes de OCR: “dejaras” (dejaros), “primitáis”, “pednos” (sednos), “Alcánzanos” (alcanzadnos), “le teméis” (le tenéis), “batalla”, os fragmentos truncados de e11 e os resíduos de paginação (“27S” em e06, “X” em e09). Em e13, nota 1, “códice de üwiiBde” lido como “códice de Granada”, testemunho que cobre e09–e14.
- Em e10 a fonte parte uma frase entre dois parágrafos; mantido o corte no mesmo lugar (“o quanto me” / “atormenta”).
- Notas de Silverio sobre formas espanholas que a tradução não reproduz (e02 n. 1, e14 n. 3, e17 n. 1 e 13) citam em itálico a forma do original para que a nota faça sentido.
- O título de Fr. Luís de León (e01, nota 1) foi traduzido, não transcrito.
- Citações bíblicas no corpo seguem a redação da Santa, sem itálico nem aspas, como na fonte.
- Notas do tradutor: e12 n. 1 (*mayorazgo*, morgadio); e14 n. 4 (*águila caudalosa*, águia-real); e15 n. 2 (palavras de São Martinho de Tours no relato de Sulpício Severo). Colocadas logo após o parágrafo a que servem.
- *Acatamiento* (e15) traduzido por “presença”, sentido teresiano do termo.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 5 minor. Full read of e01–e17, journal and book.json: one orphaned translator's note, one false fact in a translator's note, a tense slip, a hyphenation slip (text and journal) and a truncated pt-BR description.
- `pt-BR/e15.md` [3]: “o vosso amante São Martinho[^1]” → “o vosso amante São Martinho[^1][^2]” — the translator's note [^2] on St. Martin has a definition but no marker in the text, so it never renders
- `pt-BR/e14.md` [5]: “esta águia real[^4]” → “esta águia-real[^4]” — the species name is hyphenated (águia-real), as the translator's note itself writes it
- `pt-BR/e14.md` [9]: “nome espanhol da águia-real, a maior e mais nobre das aves de rapina, em contraste” → “nome espanhol da águia-real, em contraste” — the golden eagle is not the largest bird of prey (vultures, the harpy eagle and others are larger); this translator's claim is false, so it is cut back to what is certain *(meaning)*
- `pt-BR/translation-journal.md`: “| águila caudalosa | águia real |” → “| águila caudalosa | águia-real |” — matches the corrected text and the translator's note
- `pt-BR/e03.md` [3]: “e o tereis para ir contra” → “e o tendes para ir contra” — source 'le tenéis' (an OCR correction recorded in the journal) is present tense, not future
- `book.json`: “"pt-BR": "Dezessete exclamações que Santa Teresa escreveu em 1569, depois da comunhão: o desterro desta vida, o desejo de ver a Deus, o amor, o arrependimento e a confiança."” → “"pt-BR": "Dezessete exclamações que Santa Teresa escreveu em 1569, depois de comungar, em diversos dias e conforme o espírito que o Senhor lhe comunicava: o desterro desta vida, o desejo de ver a Deus, o amor, o arrependimento e a confiança. Texto crítico do P. Silverio de Santa Teresa, com as suas notas."” — the pt-BR description dropped 'en diversos días y conforme al espíritu…' and the note on Silverio's critical text, which the translation also carries
- Rejected: audit: emphasis markers in e02, e05, e10, e11, e13, e14, e17 notes — italics added in the notes — they mark the cited Spanish forms and the title of a work, as the journal records
- Rejected: audit: parentheses in e07 [3], e11 [2], e14 [3] — source parenthesis missing — OCR stray '(' in the source ('(otras', '(piedad', '(áhora'), not real parentheses
- Rejected: journal Key Terms 'amadores ou amantes' — form not found in pt-BR — the row gives two alternatives; 'amadores' (e02) and 'amantes' (e13–e15) both occur
- Rejected: pt-BR/e09.md [2] — 'nelas' for source 'en ella' — the only sensible antecedent is the flames; the commitment is defensible
- Rejected: pt-BR/e17.md [3] — 'quisésseis' for 'quisiéredes' — Portuguese needs the imperfect subjunctive with the conditional 'iria'; the sense is unchanged

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral de e01–e17, incluindo notas, diário, book.json e auditoria: encontrado um defeito de sentido.
- `pt-BR/e10.md` [3]: “Ajudai a chorar o vosso Deus” → “Ajudai o vosso Deus a chorar” — O espanhol pede que se ajude Deus a chorar; a construção portuguesa faz de Deus o objeto do choro. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of e10 [2]–[4]: the change to e10 [3] is correct and the shown paragraphs are clean.
- Rejected: pt-BR/e10.md [3] — Change “Ajudai o vosso Deus a chorar” — Matches the source, which asks the reader to help God weep; concord and the following clause (“que não são só por Lázaro aquelas piedosas lágrimas”) remain intact.
- Rejected: pt-BR/e10.md [3] — “os chamasse em altas vozes” for “los diese voces” — Correct sense of *dar voces* (to call out loudly); not an addition.
- Rejected: pt-BR/e10.md [4] — “vede-a aqui” for “veisla aquí” — Presentative use (“here she is”); the Portuguese imperative works the same way, so this is a defensible choice.
- Rejected: pt-BR/e10.md [4] — “o quanto me” for “lo que me”, cut mid-sentence — The source breaks the sentence in the same place, as the journal records; the rendering is defensible.
- Rejected: audit: e10.md [8] emphasis markers — Italics in pt-BR with none in the source — Paragraph not shown in this delta. Round 1 already rejected this flag type: italics in the notes mark cited Spanish forms, per the journal.
- Rejected: audit: journal Key Terms “amadores ou amantes” — Form not found in pt-BR — Already rejected in round 1: the row gives two alternatives, and both occur in the text.
