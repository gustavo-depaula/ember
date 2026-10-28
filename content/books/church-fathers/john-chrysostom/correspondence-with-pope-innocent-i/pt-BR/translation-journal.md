# Diário de tradução — Correspondência com o Papa Inocêncio I (pt-BR)

Fonte: en-US/, tradução de W. R. W. Stephens, Nicene and Post-Nicene Fathers, First Series, vol. 9 (ed. Philip Schaff, 1889), revista por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| John Chrysostom | João Crisóstomo | Conforme as obras irmãs de Crisóstomo. |
| Pope Innocent I / Innocent | Papa Inocêncio I / Inocêncio | |
| your Piety / your Charity / your Diligence | vossa Piedade / vossa Caridade / vossa Diligência | Tratamentos honoríficos com maiúscula, como na fonte. |
| your love (tratamento) | vossa dileção / tua dileção | Distingue o tratamento de "your Charity"; nas cartas de Crisóstomo, onde "love" é afeto literal, "vosso amor". |
| divinely beloved | amado de Deus | |
| most devout / most pious Emperor | piedosíssimo imperador | |
| my lords / master (a bispos) | meus senhores / senhor | |
| Master (Cristo) | Senhor | Conforme as obras irmãs. |
| the fathers (legisladores da Igreja) | os Padres | Maiúscula para evitar a leitura "padres" = sacerdotes. |
| canons / synod / œcumenical synod | cânones / sínodo / sínodo ecumênico | |
| bills of indictment / minutes / memoranda | libelos acusatórios / atas / memoriais | |
| lawlessness / lawless | ilegalidade / ilegal | |
| the great Sabbath | o Grande Sábado | Sábado Santo; ver nota do tradutor. |
| presbyter / deacon / archdeacon | presbítero / diácono / arquidiácono | |
| priests (= bispos, na carta de Inocêncio) | sacerdotes | |
| Greeks (= pagãos) | gregos | Conforme *Homilia sobre São Bábilas*. |
| Theophilus | Teófilo | |
| Demetrius, Pansophius, Pappus, Eugenius | Demétrio, Pansófio, Papo, Eugênio | |
| Paulus, Cyriacus, Germanus, Severus, Casianus, Palladius | Paulo, Ciríaco, Germano, Severo, Cassiano, Paládio | |
| Demetrius of Pesinus, Eulysius of Apamea, Lupicinus of Appiaria | Demétrio de Pessinunte, Eulísio de Apameia, Lupicino de Apiária | |
| Thrace, Nicæa, Sardica | Trácia, Niceia, Sárdica | |
| Scythians, Sarmatians, Isaurian, Syrians | citas, sármatas, isáurios, sírios | |

## Decisões

- Os números de seção da fonte ("1.", "2.", …) foram vertidos em negrito inerte (`**1.**`), não como marcadores de lista.
- Tratamento: Crisóstomo dirige-se a Inocêncio por *vós*; com "vossa Caridade" como sujeito, verbo na terceira pessoa ("rogo a vossa Caridade que desperte"). Inocêncio trata João por *tu* ("thou"), conforme a fonte, e o clero de Constantinopla por *vós*.
- Em §4, "my lords, most honourable and devout" está no plural na fonte e foi mantido no plural; o parágrafo seguinte, que fecha com "master" no singular, mantém o singular.
- "infinitely lawless" (§4) → "por mais que despreze a lei", para evitar o decalque.
- "sergeants" (§3) → "oficiais de justiça" (agentes civis, por contraste com os diáconos).
- Notas do tradutor: [^1] sobre o Grande Sábado (Sábado Santo, vigília batismal, Páscoa de 404); [^2] sobre os isáurios, que assolavam a região de Cucuso, lugar do exílio de Crisóstomo.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (17 paragraphs, 2 translator's notes), book.json and journal; translation is complete and faithful, terms match the Key Terms table, the audit flags are the intended bold numbers; no fixes.
- Rejected: pt-BR/ch001.md [4], [5], [7], [8] — Mechanical audit: emphasis markers differ (source 0, pt-BR 4) — These are the bold section numbers (`**1.**` to `**4.**`), rendered inert as the journal's Decisões record. Not a defect.
- Rejected: pt-BR/ch001.md [10] — Singular participles ('informado', 'movido') with plural verb 'possais' — The reverential vós addresses one person (Innocent, 'master'), so the singular participle is correct concord.
- Rejected: pt-BR/ch001.md [9], [12] — 'your love' rendered 'vosso amor', not 'vossa dileção' — The Key Terms row reserves 'vosso amor' for Chrysostom's letters, where 'love' is affection. Both places follow that rule.
- Rejected: pt-BR/ch001.md [15] — 'so many people' rendered 'tantos povos' — It refers to the congregations of a bishop's flock. The rendering is defensible and does not misinform the reader.
- Rejected: pt-BR/ch001.md [7] — 'the same supplication again' has no 'de novo' — 'deixamos de dirigir a mesma súplica' already conveys the repetition. No content is lost.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 17 parágrafos, das duas notas, do book.json e do diário; encontrada uma alteração de sentido temporal. Os quatro alertas de ênfase correspondem à numeração em negrito prevista no diário.
- `pt-BR/ch001.md` [5]: “quando a tarde já ia avançada” → “quando a noite já ia avançada” — A fonte diz “when the evening was far advanced”, indicando uma hora já avançada da noite, não da tarde. *(meaning)*
- Rejected: pt-BR/ch001.md [17] — A afirmação de que seria preferível condenar boas ações parece uma inversão. — A formulação reproduz exatamente a comparação da fonte: “more fitting […] that good deeds should be condemned”. Não cabe corrigir o argumento do autor.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [4]–[6]: the 'tarde'→'noite' fix in [5] is correct and did not break the sentence; no defects in the shown paragraphs.
- Rejected: pt-BR/ch001.md [5] — 'quando a noite já ia avançada' may overstate 'when the evening was far advanced' (late night rather than late evening) — A far-advanced evening is already nightfall, and the source goes straight on to the 'night voyage'. Late afternoon ('tarde') was the inaccurate reading; the fix keeps the sense and reads well with the rest of the sentence.
- Rejected: pt-BR/ch001.md [4] — 'para que ... se tomem medidas' makes impersonal what the source gives to the bishops ('to take measures') — The subject stays clear from 'depois de vos informarem'. The bishops' agency is not lost, and the reader is not misinformed.
- Rejected: pt-BR/ch001.md [4], [5] — Mechanical audit: emphasis markers differ (source 0, pt-BR 4) — These are the bold section numbers (**1.**, **2.**) that the journal's Decisões record; already rejected in round 1.
