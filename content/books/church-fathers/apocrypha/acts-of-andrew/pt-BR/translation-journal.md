# Diário de tradução — Atos de André (pt-BR)

Fonte: en-US/, tradução de Alexander Walker em Ante-Nicene Fathers, vol. 8, organizada por Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revista e editada para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Acts of Andrew | Atos de André | “c. 260” mantido no título. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Andrew / Peter / Adam | André / Pedro / Adão | Conforme os livros irmãos. |
| Ægeates / Stratocles / Maximilla | Egeates / Estrátocles / Maximila | Formas adotadas para as personagens. |
| Achaia / Patras / Achaians | Acaia / Patras / aqueus | |
| Cæsar / proconsul / procurator | César / procônsul / procurador | Preservada a distinção entre os cargos. |
| Jesus Christ / Lord / Son of God | Jesus Cristo / Senhor / Filho de Deus | Conforme os livros irmãos. |
| Father / Holy Spirit / Godhead | Pai / Espírito Santo / divindade | Conforme os livros irmãos. |
| perfect Trinity / unbegotten / only-begotten | Trindade perfeita / não gerado / unigênito | Mantidas as qualificações da profissão de fé inicial. |
| God Almighty | Deus todo-poderoso | |
| blessed / most blessed / holy | bem-aventurado / beatíssimo / santo | Preservada a variação dos qualificativos de André. |
| presbyter / deacon / apostle | presbítero / diácono / apóstolo | Conforme os livros irmãos. |
| devil / demon / Satan | diabo / demônio / Satanás | Conforme os livros irmãos. |
| passion / martyrdom / confession | paixão / martírio / confissão | |
| restoration / renewing | restauração / renovação | Mantida a distinção vocabular. |
| mystery of the cross / mystery of the sacrifice | mistério da cruz / mistério do sacrifício | |
| tree of the cross / tree of transgression | madeiro da cruz / árvore da transgressão | Mantida a correspondência entre a árvore e a cruz. |
| spotless lamb / Lamb | cordeiro imaculado / Cordeiro | Maiúsculas conforme a fonte. |
| body / blood / sacrifice | corpo / sangue / sacrifício | |
| Master / Teacher | Mestre | Nos discursos e na oração de André. |
| executioners / brethren / bond and free | carrascos / irmãos / escravos e livres | Carrascos conforme os livros irmãos. |
| Matthew / John / 2 Corinthians | Mateus / João / 2 Coríntios | Nomes empregados nas referências bíblicas. |
| for ever / for ever and ever / Amen | para sempre / pelos séculos dos séculos / Amém | Conforme as fórmulas dos livros irmãos. |
| kalends | calendas | Nota do tradutor 1. |

## Decisões

- Mantidos os 49 parágrafos da fonte, incluindo o título, e todas as referências bíblicas em seus pontos de ocorrência; a nota do tradutor constitui um parágrafo adicional de aparato.
- Empregado “tu” no diálogo entre André e Egeates e no diálogo com Estrátocles; “vós” nas exortações à multidão e nas orações dirigidas a Deus. A cruz é interpelada como “tu”.
- Conservadas as distinções “servo” e “escravo”, bem como a imagem dos fiéis como “atletas”.
- “Reasonable love” foi traduzido por “amor conforme à razão”, preservando a qualificação do amor com que Cristo aceita a cruz.
- No parágrafo 19, preservada a formulação incomum “desejava ter tempo para aprender”, sem substituir “aprender” por “ensinar”.
- No parágrafo 38, “a man of Jesus is unpunished” foi traduzido por “um homem de Jesus fica livre de castigo”, conservando a afirmação paradoxal no contexto dos suplícios.
- No parágrafo 42, “there will be opened up for time” foi entendido como lapso por “for thee” e traduzido por “será aberto para ti”, conforme a construção e o destinatário da promessa.
- Acrescentada a nota do tradutor 1 para esclarecer a data romana: a véspera das calendas de dezembro corresponde a 30 de novembro.
- A descrição bibliográfica em `sources` permanece inalterada: é uma cadeia de texto simples, sem campos por idioma; não se alterou a estrutura do metadado para acrescentar tradução.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of 49 paragraphs and the translator's note: one meaning defect ('fearful man' rendered as 'medroso' in [42]); the audit flags are not defects.
- `pt-BR/ch001.md` [42]: “Não deixes que aquele homem medroso te aterrorize” → “Não deixes que aquele homem temível te aterrorize” — source says 'Let not that fearful man terrify you'. Here 'fearful' means one who inspires fear; 'medroso' means timid, which reverses the sense. *(meaning)*
- Rejected: pt-BR/ch001.md [39] — audit flag 'todas todas' — 'de uma vez por todas' followed by 'todas as coisas temporárias' is grammatical and renders 'once for all despise all temporary things'
- Rejected: pt-BR/ch001.md [20], [31] — audit length outliers at 70% — every clause is present; Portuguese is simply more compact here
- Rejected: pt-BR/ch001.md [36] — 'you had much earthly fear' rendered 'causavas muito temor terreno' — a defensible reading of an ambiguous phrase (the cross was dreaded before Christ ascended it)
- Rejected: pt-BR/ch001.md [49] nota 1 — date of the eve of the kalends of December — pridie Kalendas Decembres is 30 November; the note is correct

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 49 parágrafos, da nota do tradutor, dos metadados e do diário; alertas mecânicos conferidos, sem novos defeitos objetivos.
