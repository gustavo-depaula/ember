# Diário de tradução — Contra a Heresia de Noeto (pt-BR)

Fonte: en-US/ (trad. J. H. MacMahon, Ante-Nicene Fathers, vol. 5, 1886; revista por Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Noetus / Noetians | Noeto / noecianos | |
| Smyrna | Esmirna | |
| Theodotus | Teódoto | nota do tradutor no cap. 3 |
| Valentinus, Marcion, Cerinthus | Valentino, Marcião, Cerinto | |
| the Word (Logos) | o Verbo | "the word of truth" → "a palavra da verdade" |
| God the Word | Deus, o Verbo | como em `antichrist` |
| reason (Logos) | razão | cap. 10; nota do tradutor |
| economy | economia | termo patrístico, como em `discourse-on-the-holy-theophany`; "economy (disposition)" → "economia (disposição)" |
| disposition | disposição | |
| power / Power | poder / Poder | "Father's power, which is the Word" |
| Person(s) | Pessoa(s) | maiúscula onde a fonte a tem |
| the All | o Todo | |
| unoriginated, impassible | sem origem, impassível | |
| Light of Light | Luz da Luz | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Only-begotten | unigênito | |
| Almighty | Todo-Poderoso | |
| blessed presbyters | bem-aventurados presbíteros | |
| brethren | irmãos | |
| Lord of hosts | Senhor dos exércitos | |
| Sabeans, Ethiopia | sabeus, Etiópia | |
| Isaiah, Jeremiah, Micah | Isaías, Jeremias, Miqueias | |
| Philip, Cornelius, Caiaphas, Herod, Pilate, Simeon, Anna, Lazarus, Cana | Filipe, Cornélio, Caifás, Herodes, Pilatos, Simeão, Ana, Lázaro, Caná | |
| conversion (Christological) | conversão | cap. 17: mudança de natureza, negada |
| gives up the ghost | entrega o espírito | |

## Decisões

- Os números de capítulo da fonte (`1.` … `18.`) ficam como texto em negrito (`**1.**`).
- Isaías 45:14: a fonte alterna "you" (o destinatário, minúsculo) e "You" (Deus, maiúsculo); seguiu-se a regra: *tu* para o primeiro, *vós* para o segundo ("Pois vós sois Deus"). Também *vós* em João 17 (oração ao Pai) e no Salmo 110:3 ("eu vos gerei"), onde a fonte tem "You".
- João 14:9: "convosco" (plural, como no grego) e "não me conheceste" (singular, a Filipe); a paráfrase de Hipólito a Filipe segue no singular.
- O interlocutor imaginário dos caps. 15 e 16 é tratado por *tu*; as falas de Noeto ao seu público ("You see, he says"), por *vós*.
- "word" minúsculo com sentido pessoal ("manifested His word… by Him He made all things", cap. 10; "whose word is present", cap. 17) → "Verbo"; "uttering the word" na criação → "a palavra".
- Jeremias 23:18 "perceived" → "divisou", para manter o vínculo com o argumento sobre *ver* o Verbo.
- Cap. 7: "I and the Father *am one*, but *are one*" → "*sou um* … *somos um*", que conserva o argumento gramatical.
- Pronomes referidos a Deus e a Cristo em minúscula, conforme o uso editorial moderno.
- Correções tácitas de erros da fonte: "con-versed", "let us took", "Scripture. with", espaço ausente após “…Christ?”.
- Notas do tradutor: [^1] Teódoto, o Curtidor (pessoa pouco conhecida do leitor); [^2] *logos* como razão, palavra e Verbo (jogo dos caps. 10 e 13, que o português não reproduz).

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of ch001 against en-US and of the journal and book.json; four small fixes (one lost parenthesis, one word added to a Bible quotation, one unclear rendering of 'when by Himself', one regency error with 'zombar'), otherwise clean.
- `pt-BR/ch001.md` [11]: “e isso ainda invisível ao mundo criado” → “e isso (ainda) invisível ao mundo criado” — source has the editorial insertion '(yet)' in parentheses; the parentheses were dropped (audit flag: parentheses 3 vs 2)
- `pt-BR/ch001.md` [7]: “Então também o próprio Filho estará sujeito” → “Então também ele mesmo estará sujeito” — source reads 'Then shall He also Himself be subject'; 'Filho' is imported from the familiar wording of 1 Cor 15:28, not from the source
- `pt-BR/ch001.md` [16]: “antes da encarnação e estando consigo mesmo” → “antes da encarnação e por si mesmo” — source 'when by Himself' (Gk. kath' heauton) means 'on His own, considered in Himself'; 'estando consigo mesmo' says 'being with Himself' *(meaning)*
- `pt-BR/ch001.md` [19]: “E é zombado pelos soldados” → “E é ridicularizado pelos soldados” — 'zombar' takes an indirect object ('zombar de'), so the passive 'é zombado' is incorrect; 'escarnecido' is already used for Herod in the same paragraph
- Rejected: pt-BR/ch001.md [2] — '(and) lived' rendered '(que) viveu' — the editorial insertion and its parentheses are kept; in Portuguese the relative is the natural link
- Rejected: pt-BR/ch001.md [18] — 'in later times' rendered 'nos últimos tempos' — the standard patristic formula for the Incarnation; the sense is not misrepresented
- Rejected: pt-BR/ch001.md [2]-[19] — audit: emphasis markers differ — the difference is the bold paragraph numbers '**n.**' added per the journal; italics match the source

### Round 2 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 against en-US plus the journal and book.json: the translation is clean; one minor fix to a Key Terms row naming a form ('Esaias') absent from the source.
- `pt-BR/translation-journal.md`: “| Esaias / Isaiah, Jeremiah, Micah |” → “| Isaiah, Jeremiah, Micah |” — the form 'Esaias' does not occur in the source; the text has only 'Isaiah' (ch. 18)
- Rejected: pt-BR/ch001.md [11] — '(and) His own mind' rendered '(e como) sua própria mente', with the translator's 'como' inside the editorial parentheses — same kind of adaptation as '(que) viveu' in [2], which round 1 accepted; the editorial insertion is kept and the sense is unchanged
- Rejected: pt-BR/ch001.md [19] — 'had blood and water flowing from His sacred side' rendered actively, 'fez correr sangue e água' — fits the series of Christ's actions in the sentence and matches Hippolytus's Greek participle (prochéas, 'pouring forth'); no misinformation
- Rejected: pt-BR/ch001.md [7] — 'and to my God and your God' rendered without 'e': 'para meu Pai e vosso Pai, para meu Deus e vosso Deus' — asyndeton is a style choice; nothing is lost
- Rejected: pt-BR/ch001.md [13] — 'If, then, said he' rendered in the present, 'diz ele' — the same historical present is used throughout the paragraph for John; the sense is unchanged

### Round 3 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos 19 blocos, notas, diário e book.json: um defeito de sentido e um de pontuação; as 18 diferenças de ênfase correspondem à numeração em negrito prevista no diário.
- `pt-BR/ch001.md` [11]: “(e,) proferindo” → “(e), proferindo” — A vírgula que delimita a oração participial deve ficar fora dos parênteses que encerram a conjunção.
- `pt-BR/ch001.md` [16]: “e não andam eles retamente?” → “e andam eles retamente?” — A fonte pergunta “and do they walk rightly?”, sem negação nesta segunda oração; a tradução acrescenta “não”. *(meaning)*

### Round 4 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [10]-[12] and [15]-[17]: both round-3 fixes are correct and nothing new was found.
- Rejected: pt-BR/ch001.md [16] — Round-3 change: 'e andam eles retamente?' now lacks the negation — Correct. Source 'Are not His words good with them, and do they walk rightly?' negates only the first clause, and the sentence still reads well.
- Rejected: pt-BR/ch001.md [11] — Round-3 change: '(e), proferindo' — Correct. The editorial insertion keeps its parentheses, and the comma now sits outside them, marking off the participial clause.
- Rejected: pt-BR/ch001.md [16] — 'came under suffering' rendered 'se submeteu ao sofrimento' — Acceptable. It conveys that the impassible Word became subject to suffering, which is the source's sense.
