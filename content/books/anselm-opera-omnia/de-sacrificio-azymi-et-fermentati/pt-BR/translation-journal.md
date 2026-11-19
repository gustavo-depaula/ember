# Diário de tradução — Sobre o sacrifício do pão ázimo e fermentado (pt-BR)

Fonte: la/, Migne, Patrologia Latina 158 (Paris 1853), texto de Gerberon, via Corpus Corporum (texto 10607).
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Anselmus Cantuariensis | Santo Anselmo de Cantuária | Convenção das obras irmãs. |
| De sacrificio azymi et fermentati | Sobre o sacrifício do pão ázimo e fermentado | Título do livro. |
| Praefatio / Caput | Prefácio / Capítulo | Numeração romana mantida. |
| azymus / fermentatus | ázimo / fermentado | |
| azymitae / fermentarii | azimitas / fermentários | Nota do tradutor em c02. |
| fermentum | fermento | |
| sacrificare de azymo | sacrificar com ázimo | *de* instrumental; “consagrar no ázimo” nos títulos (*conficere in azymo*). |
| conficere | consagrar | Realizar o sacramento. |
| figura / figurate | figura / em figura | |
| judaizare / Judaismus | judaizar / judaísmo | |
| vetustas / novitas | velhice / novidade | “Velhice da Lei”, como em Romanos 7:6. |
| malitia / nequitia | malícia / perversidade | 1 Coríntios 5:8. |
| conspersio | massa | 1 Coríntios 5:7. |
| epulari | celebrar a festa | 1 Coríntios 5:8. |
| Pascha nostrum | nossa Páscoa | |
| littera occidit / spiritus vivificat | a letra mata / o espírito vivifica | 2 Coríntios 3:6. |
| occisio litterae | morte causada pela letra | c05. |
| concupiscentia / concupiscere | concupiscência / cobiçar | Convenção das obras irmãs. |
| sacrificate de fermentato laudem | sacrificai o louvor com fermentado | Amós 4:5. |
| Galgala / Bethel | Gálgala / Betel | Forma da Vulgata citada. |
| cognatio / cognati / connubia | parentela / parentes / casamentos | c07. |
| generatio | geração | Grau de parentesco, c07. |
| Graeci / Latini | gregos / latinos | |
| Julius Caesar / Nero / Julianus apostata | Júlio César / Nero / Juliano, o Apóstata | Prefácio. |
| Exod. / Amos / Tit. | Êxodo / Amós / Tito | Referências com dois-pontos. |
| Joan. / Luc. / Rom. / I Cor. / II Cor. | João / Lucas / Romanos / 1 Coríntios / 2 Coríntios | |
| et seqq. / Ibid. | e seguintes / Ibid. | |

## Decisões

- c01: o latim traz *ait, azymum vel fermentatum*, onde o sentido exige *non ait*; traduzido “não disse” (provável lapso do OCR ou da edição). *Azynum* lido como *azymum*.
- c02: *prius* traduzido “mais antigo” (o uso que remonta à instituição pelo Senhor); não se emendou para *purius*.
- c03: *in corpus ejus sacrificemus* vertido “sacrificar o próprio pão, convertendo-o em seu corpo”; as subentendidas *quod ego* / *sed non de hoc, unde ego* completadas como “o que eu fiz” / “mas não com aquilo com que eu o fiz”.
- c04: o último período, uma pergunta retórica pontuada com ponto no latim, termina com interrogação.
- c06: *non reprehendunt* tratado como subjuntivo exortativo (“não repreendam”), em paralelo com *defendant* e *rejiciant*.
- Notas do tradutor: c02 (azimitas/fermentários), c07 (cômputo dos graus de parentesco e reforma de Latrão IV), Prefácio (o imperador e o partido de Valerano).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of the Praefatio and c01–c07 against the Latin: two minor fixes (concord in c04, verb tense in the c05 Romans quotation); the translator's notes and book.json check out.
- `pt-BR/c04.md` [2]: “apresentar-nos tais quais é a nossa Páscoa” → “apresentar-nos tais qual é a nossa Páscoa” — tales … quale Pascha nostrum est: the relative agrees with the singular 'Páscoa'; 'quais é' breaks concord
- `pt-BR/c05.md` [2]: “Pois eu não conheceria a concupiscência” → “Pois eu não conhecia a concupiscência” — source has nesciebam (imperfect indicative); the conditional drifts from the quoted Vulgate wording
- Rejected: pt-BR/c04.md [2] — Audit: Key Terms 'celebrar a festa' ×0 — the term occurs inflected twice ('celebremos a festa'), matching the table; the row is correct
- Rejected: pt-BR/c07.md footnote [^1] — Claims about the seventh degree, Lateran IV and the Byzantine affinity impediment — all three are accurate: the Latin seventh-degree computation, its 1215 reduction to the fourth degree, and the Byzantine prohibition of such second-kind affinity unions
- Rejected: pt-BR/c06.md [2] — 'Venite in Galgala' is Amos 4:4, not 4:5 — the source prints IV, 5; the author's citation is not corrected

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral do prefácio e dos capítulos I–VII, com conferência das notas, do diário e de book.json; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/c04.md [2] — Auditoria indica ausência de “celebrar a festa”, previsto na tabela de termos. — A expressão ocorre duas vezes flexionada como “celebremos a festa”; não há divergência terminológica.
