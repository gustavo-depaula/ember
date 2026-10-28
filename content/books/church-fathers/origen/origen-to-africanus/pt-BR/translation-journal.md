# Diário de tradução — Orígenes a Africano (pt-BR)

Fonte: en-US/, tradução de Frederick Crombie (Ante-Nicene Fathers, vol. 4, 1885), revista para o New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Origen | Orígenes | como nas obras irmãs |
| Africanus | Africano | Júlio Africano, como em `africanus-to-origen` |
| Susanna / History of Susanna | Susana / História de Susana | como em `africanus-to-origen` |
| holm-tree (*prinos*) | azinheira | como em `africanus-to-origen` |
| saw asunder (*prisein*) | serrar ao meio | como em `africanus-to-origen` |
| mastich-tree (*schinos*) | lentisco | como em `africanus-to-origen` |
| rent asunder / rend | rasgado ao meio / rasgar | como em `africanus-to-origen`; "rent/rend in pieces" → "rasgado/rasgará em pedaços" |
| cut asunder | cortar ao meio | Mateus 24:51, distinto de "serrar ao meio" |
| Chaldeans | caldeus | |
| Joakim | Joaquim | |
| partner of his throne | parceiro de seu trono | masculino, como na obra irmã |
| Philistion the play-writer | Filístion, o autor de farsas | |
| the Seventy / Septuagint | os Setenta / Septuaginta | |
| Aquila / Theodotion | Áquila / Teodocião | |
| copy / copies | exemplar / exemplares | |
| various readings | variantes | |
| obelisk / asterisk | óbelo / asterisco | sinais críticos da Héxapla |
| elders | anciãos | |
| ethnarch | etnarca | |
| half-shekel | meio siclo | |
| Gehenna | geena | |
| Esaias / Jeremias | Isaías / Jeremias | formas portuguesas correntes |
| Mardochaios / Amman | Mardoqueu / Amã | |
| Nabouchodonosor | Nabucodonosor | |
| Sedrach, Misach, Abednego | Sidrac, Misac e Abdênago | |
| Zedekias / Achiab | Sedecias / Acab | Jeremias 29:22 |
| Chanaan / Juda | Canaã / Judá | |
| Nineve / Senachereim | Nínive / Senaqueribe | |
| Nemessarus, Gabael, Gabrias, Ragi | Nemessaro, Gabael, Gabrias, Ragi | formas do próprio texto (Septuaginta), sem harmonizar |
| Dachiacharus / Achiacharus / Acherdon | Daquiacaro / Aquiacaro / Aquerdon | a inconsistência da fonte (Daquiacaro/Aquiacaro) foi mantida |
| Bassus / Ambrosius / Marcella / Anicetus / Apollinarius | Basso / Ambrósio / Marcela / Aniceto / Apolinário | |
| third book of Kings | terceiro livro dos Reis | numeração da Septuaginta mantida |
| First Chronicles | Primeiro Livro das Crônicas | |

## Decisões

- Africano é tratado por *tu* em toda a carta. Nas citações bíblicas o destinatário foi seguido caso a caso. Provérbios 22:28, Êxodo 23:7 e as falas a Jacó e a Rúben vão no singular. "Reuni-vos" (Gênesis 49) e "Ai de vós" (Mateus 23) vão no plural. Na apóstrofe a Jerusalém, "e vós não quisestes" e "a vossa casa" ficam no plural, como no grego.
- Susana 57: "Thus have you dealt" foi traduzido com *vós* ("Assim procedíeis"), dirigido aos anciãos em conjunto; mantido "filhos de Israel", como na fonte.
- 3 Reis 3: "To me, my lord" foi traduzido por "Ouve-me, meu senhor", fórmula de súplica ao rei, pois a forma literal soa ininteligível em português.
- "His holy Child" (παῖς) foi traduzido por "seu santo Filho".
- "Psalm cv." e "Psalm xcvi." foram traduzidos por "Salmo CV" e "Salmo XCVI". A numeração da fonte foi mantida, com romanos em maiúsculas.
- Os números de seção da fonte (2. a 15.) foram mantidos em negrito inerte. Os parágrafos sem número seguem sem número.
- As palavras hebraicas transliteradas (*Essa*, *chos isouoth essa*, *is*, *Hesre aïs*) e as gregas (*prinos*, *prisein* etc.) foram mantidas em itálico, como na fonte.
- Notas do tradutor:
  - [^1], sobre Filístion e o trocadilho *prinos/prisein*, *schinos/schisis*, para que o leitor perceba o jogo de palavras sem saber grego.
  - [^2], sobre Áquila e Teodocião, tradutores pouco conhecidos do leitor.
  - [^3], sobre o etnarca (patriarca judeu da Palestina), termo de ofício obscuro.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (31 paragraphs, 3 translator's notes), journal and book.json; translation complete and faithful, audit flags all explained, no fixes.
- Rejected: pt-BR/ch001.md [3]–[27] — audit: emphasis markers differ in 14 paragraphs — each difference is the 4 asterisks of the bold section number (**2.** etc.); the italics match the source
- Rejected: pt-BR/ch001.md [8], [10] — audit: parentheses differ — '(just as they will cut asunder the wicked steward…)' and '(for by an old idiom…)' were recast as a clause and a separate sentence with their full content; '(Apocrypha)' is kept as '(apócrifos)'
- Rejected: pt-BR/translation-journal.md, Key Terms — audit: 'serrar ao meio' and 'cortar ao meio' ×0 in pt-BR — the inflected forms appear: 'serrado/serraria/serrará ao meio' in [8], [9], [10], [16]; 'cortará/cortarão ao meio' in [8]
- Rejected: pt-BR/ch001.md [22] — 'as if he were a rich man' rendered 'como homem rico que era' — the English is ambiguous, and the Greek ὡς πλούσιος means 'as a rich man'; Origen's argument treats Tobias as rich
- Rejected: pt-BR/ch001.md [9] — 'pretended to the Jews' rendered 'davam a entender a eles' — the sense of a false claim survives, since the sentence ends with 'e assim enganavam'; this is a style choice
- Rejected: pt-BR/ch001.md [31] — 'her children' rendered 'os seus filhos' — the Greek has only 'with the children'; the possessive's ambiguity misinforms no reader
- Rejected: pt-BR/ch001.md [5] — 'bought with a price' rendered 'comprados por alto preço' — this is the usual Portuguese wording of 1 Cor 6:20 (pretio magno); defensible

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 31 parágrafos, das três notas do tradutor, do diário e de book.json, com conferência dos alertas mecânicos; nenhum defeito objetivo novo encontrado.
