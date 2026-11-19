# Diário de tradução — Sobre os sacramentos da Igreja (resposta às queixas de Valerano) (pt-BR)

Fonte: la/, S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), texto de Gerberon (Corpus Corporum, texto 10633).
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Anselmus Cantuariensis | Santo Anselmo de Cantuária | Convenção das obras irmãs. |
| Walerannus Newemburgensis episcopus | Valerano, bispo de Naumburgo | |
| Ecclesia Cantuariensis | Igreja de Cantuária | |
| Paschalis papa | papa Pascoal | Pascoal II. |
| Responsio / Caput | Resposta / Capítulo | Numeração romana mantida. |
| sacramentum / substantia / virtus | sacramento / substância / virtude | Convenção das obras irmãs. |
| consuetudo / usus | costume | |
| unitas charitatis | unidade da caridade | |
| aptitudo et decentia administrationis | conveniência e decoro da administração | c01. |
| canon | cânon | Cânon romano; maiúscula só na nota. |
| oblatio / hostia | oblação / hóstia | c02. |
| sacrificare / sacrificium | oferecer em sacrifício; oferecer o sacrifício / sacrifício | Evita “sacrificar o corpo/cálice”. |
| benedicere / benedictio / sanctificare | abençoar / bênção / santificar | |
| corporale | corporal | c03. |
| calix / operire / discooperire | cálice / cobrir / descobrir | |
| nudus / nuditas / sub nudo coelo | nu / nudez / a céu aberto | “Nu” mantido para o cálice, para conservar o paralelo com Cristo nu. |
| fermentatum | pão fermentado | c03. |
| Psal. / Luc. / I Petr. | Salmo / Lucas / 1 Pedro | Numeração dos Salmos da fonte (Vulgata). |

## Decisões

- Tratamento: o latim *vestra reverentia / sanctitas / sapientia* vira “vossa reverência / santidade / sabedoria”, com os verbos dirigidos ao destinatário na 2.ª pessoa do plural (“escreveis”, “tendes”), conforme o uso epistolar.
- O longo período inicial de c02 (*Nempe quod alii…*) foi dividido em frases dentro do mesmo parágrafo, sem omitir cláusulas.
- *Haec dona, haec munera, haec sancta sacrificia* (c02) mantido em latim e itálico; nota do tradutor c02 [^1] identifica a oração *Te igitur* e dá a tradução.
- Nota do tradutor c03 [^1]: identifica a carta anterior sobre o pão fermentado (*Epistola de sacrificio azymi et fermentati*).
- Nota do tradutor responsio [^1]: identifica Valerano e a “mudança” (reconciliação com Pascoal II).
- Minerva e “monte” (responsio) mantidos sem nota; o elogio fica claro pelo contexto.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Leitura completa (responsio, c01–c03, notas, book.json, diário): uma omissão de saepe em responsio [3]; o resto está fiel e as notas do tradutor estão corretas.
- `pt-BR/responsio.md` [3]: “Costumamos, com efeito, julgar melhor” → “Costumamos, com efeito, julgar muitas vezes melhor” — fonte: "Solemus enim saepe sentire meliora"; o advérbio saepe foi omitido *(meaning)*
- Rejected: pt-BR/translation-journal.md — Auditoria: “latim” ×4 na fonte, “português” ×0 no pt-BR — São os rótulos de cabeçalho da tabela de termos (Latim | Português), não termos a traduzir.
- Rejected: pt-BR/c02.md [2] — “A não ser, talvez, que seja mais conveniente” por nisi forsitan quia … notantur (indicativo) — A ressalva de Anselmo, apresentada como possibilidade (forsitan), fica preservada; é escolha de estilo.
- Rejected: pt-BR/c03.md [2] — Paralelismo irregular em “devem antes ser imitadas … do que significar-se a nudez” — A frase é compreensível e fiel a imitanda … quam … significanda; não chega a ser um erro objetivo.
- Rejected: pt-BR/responsio.md [2] — “o afeto do seu amor” pode ser ambíguo — Na saudação em terceira pessoa, “seu” remete naturalmente a Anselmo, o remetente.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral de responsio e c01–c03, notas, book.json, diário e auditoria: encontrado um erro de pessoa verbal.
- `pt-BR/responsio.md` [3]: “do que eles mesmos merecem” → “do que nós mesmos merecemos” — A fonte diz «quam ipsi mereamur»: mereamur está na primeira pessoa do plural, não na terceira. A tradução muda o sujeito da comparação. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of responsio [2]–[3] and note [^1]: the round 2 fix (mereamur → «nós mesmos merecemos») is faithful to the source; no new defects.
- Rejected: pt-BR/responsio.md [3] — «do que nós mesmos merecemos» reads oddly; the expected sense is that the loved ones deserve less than we think (mereantur) — The canonical source reads «quam ipsi mereamur», first person plural. The variant is not an unmistakable OCR slip, so the translation follows the source as printed.
- Rejected: pt-BR/responsio.md [3] — «Quanto a vossa sublime humildade» without crase — Crase before a possessive pronoun is optional; this is not an error.
- Rejected: pt-BR/translation-journal.md — Mechanical audit: «latim» ×4 in the source, «português» ×0 in pt-BR — Already rejected in round 1: these are the header labels of the terms table.
