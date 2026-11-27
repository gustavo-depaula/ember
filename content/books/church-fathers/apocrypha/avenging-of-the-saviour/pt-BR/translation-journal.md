# Diário de tradução — Vingança do Salvador (pt-BR)

Fonte: en-US/, tradução de Alexander Walker em Ante-Nicene Fathers, vol. 8, organizada por Alexander Roberts, James Donaldson e A. Cleveland Coxe (1886), revista e editada para o New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Avenging of the Saviour | Vingança do Salvador | “c. 700” mantido no título. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Lord / Jesus Christ / Son of God | Senhor / Jesus Cristo / Filho de Deus | Conforme os livros irmãos. |
| Father / Son / Holy Ghost | Pai / Filho / Espírito Santo | Conforme os livros irmãos. |
| God Almighty | Deus todo-poderoso | Conforme Atos de André. |
| Saviour / Redeemer / Emanuel / Messiah | Salvador / Redentor / Emanuel / Messias | |
| Tiberius Cæsar / Titus / Vespasian | Tibério César / Tito / Vespasiano | |
| Pontius Pilate / Herod / Archelaus | Pôncio Pilatos / Herodes / Arquelau | |
| Nathan / Nahum / Veronica / Velosianus | Natã / Naum / Verônica / Velosiano | Formas adotadas para as personagens. |
| Annas / Caiaphas / Joseph / Nicodemus / Lazarus | Anás / Caifás / José / Nicodemos / Lázaro | |
| Judæa / Judah / Jerusalem / Arimathæa | Judeia / Judá / Jerusalém / Arimateia | Preservada a distinção entre Judeia e Judá. |
| Bethlehem / Cana of Galilee / Mount Calvary | Belém / Caná da Galileia / monte Calvário | |
| Equitania / Libia / Burgidalla | Equitânia / Líbia / Burgidala | Mantidas as designações geográficas da fonte, sem correção conjectural. |
| Damascus / Lateran / Tiberis / Tiber | Damasco / Latrão / Tiberis / Tibre | Preservadas as duas formas do nome do rio. |
| Ishmaelites / house of Israel | ismaelitas / casa de Israel | |
| passion / resurrection / Hades | paixão / ressurreição / Hades | Conforme os livros irmãos. |
| patriarchs / prophets / disciples | patriarcas / profetas / discípulos | |
| face / portrait / image | rosto / retrato / imagem | Preservada a alternância da narrativa. |
| tree / green tree / dry tree | madeiro / madeiro verde / madeiro seco | Nos relatos de execução. |
| issue of blood | fluxo de sangue | |
| four quaternions of soldiers | quatro grupos de quatro soldados | Explicitação do agrupamento militar designado por “quaternion”. |
| denarius / pieces of silver / pounds | denário / moedas de prata / libras | Sem conversão monetária ou de peso. |
| first-created | primeiro criado | Mantida a expressão peculiar da fonte. |
| for everlasting / for ever and ever / Amen | para sempre / pelos séculos dos séculos / Amém | Conforme as fórmulas dos livros irmãos. |

## Decisões

- Empregados “tu” no tratamento singular entre personagens, “vós” no plural e “vós” nas orações dirigidas a Deus.
- Preservadas as peculiaridades e divergências internas da narrativa: Cristo “revelado por Tibério”; as designações Equitânia, Líbia e Burgidala; a espada de Arquelau no primeiro relato e sua lança no relato posterior; e as diferentes moedas empregadas na venda dos prisioneiros.
- Traduzido “first-created” por “primeiro criado”, sem substituição por “primogênito” nem harmonização doutrinal.
- Mantidos os termos de adoração dirigidos ao retrato, bem como a variação entre rosto, face, retrato e imagem.
- Mantidas as mudanças de referente pouco explícitas da fonte, inclusive no relato do embarque com os discípulos e na passagem sobre o envio do anjo.
- Preservadas integralmente as falas de vingança e os atos de violência da narrativa.
- Não acrescentadas referências bíblicas às citações e alusões que a fonte deixa sem indicação.
- Mantida a descrição bibliográfica de `sources` em sua forma original, pois é uma cadeia de texto, não um campo de traduções por idioma.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of ch001 (18 paragraphs), book.json and the journal; two minor fixes: a counterfactual tense in [6] and an added 'face' in [8].
- `pt-BR/ch001.md` [6]: “se estivesses há algum tempo em Jerusalém, ali terias encontrado” → “se tivesses estado em Jerusalém algum tempo atrás, ali terias encontrado” — source 'if you had been some time ago in Jerusalem' is a past counterfactual; 'se estivesses há algum tempo' does not match the tense of 'terias encontrado' and can be read as a duration
- `pt-BR/ch001.md` [8]: “destruir seus inimigos da face da terra” → “destruir seus inimigos da terra” — source says 'destroy His enemies from the earth'; 'face' is added, and it duplicates the later 'sobre a face da terra'
- Rejected: pt-BR/ch001.md [9] — 'take my kingdom and judge it' rendered 'governa-o' — 'judge' here means to rule, as in biblical usage; the rendering is defensible
- Rejected: pt-BR/ch001.md [12] — Joseph addresses Christ with 'vós' while Christ uses 'tu' — consistent with the journal's decision to use 'vós' when addressing God, as in Titus's prayer
- Rejected: pt-BR/ch001.md [18] — 'Himself shield us' with no 'Ele próprio' — the emphasis is carried by 'esse mesmo Deus'; a style choice

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 18 parágrafos, confrontados com a fonte, e revisão de book.json e do diário; nenhum defeito objetivo encontrado.
