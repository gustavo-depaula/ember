# Diário de tradução — A Espada de Madeira (pt-BR)

Fonte: en-US/, *The Sword of Wood* (E. Mathews & Marrot, 1928), Project Gutenberg Australia, ebooks09/0900731h.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| The Sword of Wood / G. K. Chesterton | A Espada de Madeira / G. K. Chesterton | Formas dos metadados recebidos. |
| God / Christmas / Satan | Deus / Natal / Satanás | Convenções católicas das obras irmãs. |
| England / English / London / Thames | Inglaterra / inglês / Londres / Tâmisa | Formas portuguesas; preservadas as distinções nacionais. |
| knight / chivalry / squire | cavaleiro / cavalaria / senhor rural | Convenções das obras irmãs. |
| Cavalier / Puritan | Cavaleiro realista / puritano | “Cavaleiro” retoma a designação política após sua primeira explicitação. |
| Merry England / Merry Monarch | Alegre Inglaterra / Monarca Alegre | Preservada a repetição que sustenta a ironia. |
| Sir / Lord / Master | Sir / Lord / mestre; jovem | Tratamentos conforme o contexto; “jovem” para Jeremy Bunt. |
| Charles I / Plantagenets / Coeur-de-Lion | Carlos I / Plantagenetas / Coração de Leão | Formas portuguesas tradicionais. |
| Orlando / Angelica / Queen Mab | Orlando / Angélica / Rainha Mab | Nomes literários. |
| Grayling-Abbot / Grayling-le-Griffin / Griffin Grange | Grayling-Abbot / Grayling-le-Griffin / Griffin Grange | Topônimos e nome da propriedade preservados; “Grange” nas retomadas. |
| Griffin / griffin | Griffin / grifo | Distinção entre sobrenome e criatura mítica. |
| schoolmaster / tutor / parson | mestre-escola / preceptor / pároco | “Pároco” conforme as obras irmãs, em contexto inglês. |
| sword of wood / wooden cross / walking-stick / staff | espada de madeira / cruz de madeira / bengala / bastão | Distinções lexicais que articulam a narrativa. |
| foil / parry / lunge / riposte / single-stick | florete / parada / estocada / *riposte* / esgrima de bastão | *Riposte* conserva o destaque e a forma francesa presentes na fonte. |
| Magnetic Sword / Royal Society / Natural Philosophy | Espada Magnética / Sociedade Real / Filosofia Natural | Maiúsculas do original preservadas. |
| witch / warlock / wizard / exorcist | bruxa / bruxo / feiticeiro / exorcista | Preservadas as designações da lenda local. |
| doublet / peruke / pillory | gibão / peruca / pelourinho | Vocabulário de vestuário e punição. |
| Agincourt / Children's Crusade | Azincourt / Cruzada das Crianças | Designações históricas em português. |

## Decisões

- Mantidos os 65 parágrafos da fonte, inclusive o título, na mesma ordem; as três definições de notas do tradutor são acréscimos ao texto.
- Preservadas as entradas pt-BR já existentes nos metadados; acrescentados o idioma à lista e a tradução do título no sumário.
- Empregado “tu” no tratamento singular e “vós” quando Sir Guy se dirige coletivamente aos filhos. A forma “Olhastes” no diálogo singular de Sir Guy conserva o tratamento respeitoso por “vós” nesse turno.
- “Cavalier” designa o partido realista das guerras civis inglesas; adotado “Cavaleiro realista” nas primeiras ocorrências de cada contraste com os puritanos.
- “Clerk” foi traduzido por “letrado”, seguido de “clérigo” para “clergyman”, preservando o encadeamento entre estudante, homem de letras e condição eclesiástica.
- “Public-school spirit” foi traduzido por “espírito dos colégios de elite”, de acordo com o sentido inglês de “public school”.
- Conservados os termos latinos *quis*, *fingo*, *figo*, *ferre* e *cumuli*, sem traduções acrescentadas ao corpo da narrativa.
- Nota [^1]: explica o jogo entre *ferre* e “ferry”, necessário para compreender a referência ao rio e à letra “y”.
- Nota [^2]: identifica Jack-in-the-Green e sua armação de folhagem, esclarecendo a comparação com a peruca; informação conferida na página da celebração de maio de Knutsford, vinculada na nota.
- Nota [^3]: identifica Kehama como o tirano do poema de Robert Southey; informação conferida no próprio poema, vinculado na nota.
- “His Majesty's own hand”, no desfecho, refere-se à escrita do próprio rei; traduzido por “a letra do próprio punho de Sua Majestade”.
- Mantidos sem identificação conjectural os nomes e as alusões que o narrador deixa implícitos, inclusive o “Cock” de Buckingham e Dorset e a dama enfrentada por Orlando.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 3 minor. Full read of all 65 paragraphs, the footnotes, the journal and book.json. Fixed one inconsistent vós form in Sir Guy's address to Tryon, with the matching journal line, and one added weapon detail.
- `pt-BR/ch01-the-sword-of-wood.md` [36]: ““Olhastes para o rosto dele?”” → ““Olhaste para o rosto dele?”” — Sir Guy addresses Tryon alone with tu in [60] and [62] (chamas, Agradeço-te, precisas). The vós form in this one line breaks that, and a reader takes it for a misspelling of 'Olhaste'.
- `pt-BR/ch01-the-sword-of-wood.md` [33]: “o golpe de sabre recebido” → “a cutilada recebida” — The source says only 'the slash'. 'Sabre' names a weapon the text does not mention.
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/translation-journal.md`: “por “vós” quando Sir Guy se dirige coletivamente aos filhos. A forma “Olhastes” no diálogo singular de Sir Guy conserva o tratamento respeitoso por “vós” nesse turno.” → “por “vós” quando Sir Guy se dirige coletivamente aos filhos.” — With 'Olhaste' in [36], Sir Guy uses tu with Tryon throughout, so the exception noted in the journal no longer applies.
- Rejected: pt-BR/ch01-the-sword-of-wood.md [19] — 'fighting to the death' rendered as 'lutava para matar' — In context, the point is the opponent's lethal intent. The sense is kept.
- Rejected: pt-BR/ch01-the-sword-of-wood.md [7] — 'beaten with a staff' rendered as 'castigado com um bastão' — The source means punishment, and the rendering is repeated the same way in [23]. This is a defensible choice.
- Rejected: pt-BR/ch01-the-sword-of-wood.md [47] — 'old pool' rendered as 'velho poço' — 'Poço' is also used for a deep stretch of a river. The sense is correct.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 65 parágrafos, das três notas, dos metadados e do diário: uma informação desatualizada no diário; nenhum defeito objetivo na tradução.
- NOT APPLIED (old text not found exactly once (2)): - `pt-BR/translation-journal.md`: “filhos. A forma “Olhastes” no diálogo singular de Sir Guy conserva o tratamento respeitoso por “vós” nesse turno.” → “filhos.” — O parágrafo [36] já apresenta “Olhaste”, corrigido na rodada anterior; a exceção registrada no diário deixou de existir.
