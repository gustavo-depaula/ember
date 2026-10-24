# Diário de tradução — Sobre a comunhão frequente (pt-BR)

Fonte: la/, *Doctoris Ecstatici D. Dionysii Cartusiani Opera Omnia*, tom. XXXV (Monstrolii–Tornaci, 1896–1913), texto lido dos escaneamentos com dots.mocr e revisado página por página. Referência en-US consultada só para registro e terminologia.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Dionysius Cartusianus | Dionísio, o Cartuxo | como no `book.json` |
| sacra communio / communicare | sagrada comunhão / comungar | |
| Eucharistia / Sacramentum (altissimum) | Eucaristia / Sacramento (altíssimo) | maiúscula da fonte |
| Christifidelis | fiel de Cristo | |
| religiosa persona / religiosi | pessoa religiosa / religiosos | concordância feminina com "pessoa" |
| Sorores / Frater | Irmãs / Irmão | maiúscula da fonte |
| Matres / Patres (spirituales) | Madres / Padres | |
| Abbatissæ et Priorissæ | Abadessas e Prioras | |
| Paternitas / Pater (destinatário) | Paternidade / Padre | tratamento com *vós* |
| visitator | visitador | |
| prælatus / superior / confessor | prelado / superior / confessor | |
| præsidens / qui præest | quem preside / aquele que preside | |
| informatio / dictamen | instrução / ditame | |
| culpa mortalis / peccatum mortale | culpa mortal / pecado mortal | |
| caritas | caridade | |
| amor privatus / proprius | amor privado / próprio | |
| obedientia / inobedientia | obediência / desobediência | |
| votum solenne | voto solene | |
| claustrum | claustro | |
| suspensio et dilatio communionis | suspensão e adiamento da comunhão | |
| panis supersubstantialis | pão supersubstancial | nota do tradutor em c008 |
| Vitaspatrum | Vidas dos Padres | nota do tradutor em c006 |
| Ordo Cartusiensis | Ordem Cartuxa | |
| doctor irrefragabilis / doctor devotus | Doutor Irrefragável / Doutor Devoto | Alexandre de Hales / dom Boaventura |
| Bernardus / Augustinus / Thomas / Albertus / Gregorius | São Bernardo / Santo Agostinho / Santo Tomás / Alberto / bem-aventurado Gregório | |
| Climacus / Maurus / Benedictus / Paulus abbas | Clímaco / São Mauro / Bento / abade Paulo | |
| Hieronymus / Basilius / Epicurus | Jerônimo / Basílio / Epicuro | |
| Michæas / Josue / Samuel / Saul / Salomon | Miqueias / Josué / Samuel / Saul / Salomão | |
| I Reg. | 1 Samuel | numeração da Vulgata convertida, como na referência en-US |

## Decisões

- Citações bíblicas traduzidas do latim de Dionísio, sem aspas, como na fonte.
- Referências em notas: algarismos romanos e leituras de OCR evidentes ("vu", "u.", "11" por "ii") convertidos em arábicos. Erros de localização da fonte espelhados, sem correção: c004 [^1] Mateus 21:37-38 (é 22:37-38); c005 [^3] João 12:15 (é 12:25); as notas deslocadas de c006 e c007 [^1]; c007 [^9] "Filipenses vi." e [^10] "Colossenses vi.", mantidos em romanos por serem ilegíveis (os locais corretos aparecem em c008 [^1]). A nota de Miqueias em c001 fica no fim do ¶4, como na fonte.
- Quebras de página da fonte mantidas: c002 ¶5–6 ("sub-" / "traído", com a nota ¹ da edição de Colônia no meio) e c008 ¶5 ("sacramen-", texto interrompido na fonte).
- c005 ¶5: o "A" solto no início ("A Evangelio") é marca de coluna do escaneamento; omitido.
- c008 ¶3: o fragmento deslocado "tum, quia incertus est an exstet in caritate.[^1] ipsarum" traduzido no lugar, ligando "ipsarum" a "indignidade ou indisposição delas".
- c001 ¶3: *supergloriosissima* → "supergloriosíssima", conservando o gosto de Dionísio pelos compostos com *super-*.
- c002 ¶6: *Joannes Soter* → "Johannes Soter", nome do impressor de Colônia.
- c006 ¶4: *peccatum ariolandi* → "pecado de agourar", para distinguir da glosa *crimen ariolationis* → "crime da adivinhação".
- c006 ¶7: *draco* → "serpente".
- Notas do tradutor: c006 [^16] sobre as *Vitae Patrum*; c008 [^4] sobre "pão supersubstancial" (Vulgata, Mateus 6:11). Cada definição vem logo após o parágrafo a que serve.
- c003: o juízo do autor sobre as mulheres é traduzido fielmente, sem atenuação nem comentário.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of c001–c008, the footnotes, book.json and the journal; one fix: in c008 ¶3 the fragment's 'tum' is the end of 'sacramen-tum', so 'naquele momento' is removed.
- `pt-BR/c008.md` [3]: “indisposição delas naquele momento, porque é incerto” → “indisposição delas, porque é incerto” — the 'tum' of the displaced fragment is the end of 'sacramen-tum' cut off at the close of ¶5 ('accipere sacramen-' + 'tum, quia incertus est an exstet in caritate'), not the adverb 'then'; 'naquele momento' adds a time limit the source does not have *(meaning)*
- Rejected: pt-BR/c006.md [4] — audit: parentheses 2 vs 1 — 'Pepercimus (inquiens)' is rendered as 'dizendo:' before the quotation; nothing is lost, and the other parenthesis (id est … magicæ artis) is kept
- Rejected: pt-BR/translation-journal.md — audit: Key Terms row 'Abadessas e Prioras' ×0 — c003 ¶3 has 'as Abadessas, as Prioras e as Madres', the same terms with articles; the row is accurate
- Rejected: pt-BR/c006.md [5] — 'outro bem comum' for 'aliam substantiam simplicem' could be read as 'the common good' — after 'prata e ouro', the sense of an ordinary possession is clear; a style choice
- Rejected: pt-BR/c002.md [4] — 'ut breviter audivi' rendered as 'para dizê-lo em poucas palavras, ouvi' — 'breviter' as 'briefly' is the ordinary reading; 'recently' cannot be shown to be meant
- Rejected: pt-BR/c006.md [^16] — translator's note on the Vitae Patrum — the identification is correct (a Latin collection of the lives and sayings of the Egyptian and Syrian desert monks, widely read in the cloister) and does more than restate the text

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral de c001–c008, notas, book.json e diário: dois defeitos de sentido e um de concordância; os alertas mecânicos não indicam defeitos.
- `pt-BR/c003.md` [4]: “jurisdição, dispensa e governo” → “jurisdição, administração e governo” — Dispensatio designa aqui a administração das coisas sacramentais, não a dispensa de uma obrigação. *(meaning)*
- `pt-BR/c004.md` [5]: “o homicida e o salteador ou ladrão peca” → “o homicida, assim como o salteador ou ladrão, peca” — A coordenação por 'e' exige concordância plural. A construção comparativa preserva o sentido distributivo e a concordância singular do restante da frase.
- `pt-BR/c008.md` [3]: “porque é incerto se alguém está na caridade” → “porque não se tem certeza de estar na caridade” — Incertus est an exstet exprime a incerteza do homem sobre o próprio estado de caridade, não uma incerteza impessoal sobre o estado de alguém. *(meaning)*
- Rejected: pt-BR/translation-journal.md — Alerta mecânico sobre a correspondência 'latim' / 'português'. — São os cabeçalhos das colunas da tabela, não um par terminológico que deva ocorrer na tradução.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of c003 [3–5], c004 [4–6] and c008 [2–4]: the three round-2 fixes are correct; one minor fix to a connective in the 1 Tim 2:12 quotation
- `pt-BR/c003.md` [3]: “com toda a sujeição; pois não permito à mulher ensinar” → “com toda a sujeição; mas não permito à mulher ensinar” — source 'docere autem mulieri non permitto': 'autem' is a weak adversative ('but'), not causal; 'pois' adds a 'for' link the Latin does not make
- Rejected: pt-BR/c003.md [4] — round-2 change 'dispensa' → 'administração' for 'dispensationem' — in sacramental matters dispensatio is the stewardship or administration of the sacraments; the fix is correct and the list still reads cleanly
- Rejected: pt-BR/c004.md [5] — round-2 change 'o homicida, assim como o salteador ou ladrão, peca' — keeps the Latin's distributive singular 'peccat' and the singular 'sua'/'ela' that follow; the sense is unchanged
- Rejected: pt-BR/c008.md [3] — round-2 change 'porque não se tem certeza de estar na caridade' for 'quia incertus est an exstet in caritate' — 'incertus' (masculine, personal) means the person is unsure of his own state, not an impersonal 'incertum est'; the generic 'se' fits the displaced fragment, and the [^1] marker stays in the source position
- Rejected: pt-BR/c008.md [4] — masculine 'sejam atraídos' after 'ministros de Cristo e as pessoas religiosas' — a mixed-gender coordinated subject takes the masculine; correct
- Rejected: pt-BR/translation-journal.md — audit: Key Terms rows 'latim'/'português' and 'Abadessas e Prioras' ×0 — already rejected in rounds 1 and 2: the first pair is the column headers, and the second occurs with articles in c003 ¶3

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente c003 [2–4], book.json e diário, e conferidos os alertas mecânicos. A troca de «pois» por «mas» traduz corretamente «autem» e preserva a frase; nenhum novo defeito encontrado.
