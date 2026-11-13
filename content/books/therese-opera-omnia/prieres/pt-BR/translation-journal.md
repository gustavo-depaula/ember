# Diário de tradução — Orações (pt-BR)

Fonte: fr-FR/, Archives du Carmel de Lisieux (texto da Nouvelle Édition du Centenaire, 1992).
Destino: pt-BR.

## Termos

| Francês | Português | Notas |
|---|---|---|
| Sainte Thérèse de l’Enfant-Jésus | Santa Teresinha do Menino Jesus | autora (book.json); no texto, “Teresa” |
| Thérèse de l'Enfant Jésus (et de la Sainte Face) | Teresa do Menino Jesus (e da Santa Face) | assinaturas |
| Céline | Celina | |
| la Sainte Vierge / la Ste Vierge | a Santíssima Virgem | |
| le Bon Dieu | o Bom Deus | maiúscula espelhada da fonte |
| la Sainte Face / la Face Adorable | a Santa Face / a Face Adorável | como no book.json e nos *Últimos colóquios* |
| Visage | Rosto | como nas *Poesias* |
| Bien-Aimé / Epoux / épouse | Bem-Amado / Esposo / esposa | |
| Amour Miséricordieux | Amor Misericordioso | |
| Offrande / Victime d'Holocauste | Oferenda / Vítima de Holocausto | Pri 6 |
| Offrande de la journée | Oferecimento do dia | forma usual em português (Pri 10) |
| Trinité Bienheureuse | Trindade Bem-aventurada | |
| creuset | crisol | |
| Patrie / exil | Pátria / exílio | |
| Face à Face | Face a Face | |
| doux et humble de cœur | manso e humilde de coração | Pri 5 e Pri 20 |
| tabernacle | tabernáculo | |
| oraison | oração | oração mental |
| Dieu des armées | Deus dos exércitos | |
| l'abbé Bellière | o abade Bellière | como na descrição do book.json |
| Jeanne d'Arc | Joana d'Arc | |
| Tarcisius | Tarcísio | |
| Sr M. de St-Pierre | Ir. M. de S. Pedro | Irmã Maria de São Pedro, carmelita de Tours |
| Sr (assinaturas) | Ir. | como nas *Poesias* |
| rel. carm. ind. | rel. carm. ind. | religiosa carmelita indigna; a abreviatura serve em português |
| Ainsi soit-il | Assim seja | |
| Aspirations | Aspirações | jaculatórias (Pri 5) |

## Decisões

- Tratamento: *vós* para Deus, Jesus, Maria e os santos onde a fonte tem *vous*; *tu* onde Teresa tutoia Jesus (Pri 2, 11, 14, 16).
- “Santa Face” (não “Sagrada Face” das *Poesias*), seguindo a descrição do book.json e os *Últimos colóquios*.
- “Abade Bellière”, como no book.json: era seminarista, e “padre” seria impróprio.
- Inserções editoriais entre colchetes mantidas em colchetes, ajustadas à sintaxe portuguesa: “[eu]” (Pri 2), “[libertando]”, “[dignastes]” (Pri 6).
- Erros materiais da fonte corrigidos em silêncio na tradução: “a grâce” (Pri 5), “Ben-Aimé” (Pri 5), “regardquand” (Pri 3), “o votre” (Pri 8).
- Pri 5: nomes das flores vertidos pelos nomes portugueses correntes (Lírio-do-Vale para *muguet*, Rosas-Silvestres para *églantines*, Rainha-dos-Prados para *reine des prés*); o partitivo “Des/Du” omitido.
- Pri 9: referência mantida na forma de legenda da fonte (“São Mateus, cap. XVIII / vv. 19-20”).
- Pri 12: abreviaturas dos nomes religiosos vertidas mantendo a forma abreviada (“Ir. Maria F. T. do Men. Jesus e da Santa Face”).
- Pri 14: a frase final incompleta da fonte (a assinatura a completa) mantida incompleta.
- Reticências e pontos de exclamação de Teresa conservados com a mesma contagem.
- Notas do tradutor: Pri 6 [^1] (J.M.J.T.) e [^2] (rel. carm. ind.); Pri 15 [^1] (Irmã Maria de São Pedro); Pri 17 [^1] (Joana d'Arc venerável em 1894); Pri 18 [^1] (São Tarcísio).

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of Pri 1–21, the journal and book.json. Fixed a reversed reflexive in Pri 3 and the sentence missing from the pt-BR description in book.json.
- `pt-BR/pri-03.md` [2]: “de Vos amar, de Vos assemelhar, e abençoareis” → “de Vos amar, de nos assemelhar a Vós, e abençoareis” — source: "de Vous ressembler" (to resemble You). "assemelhar-se a" is reflexive; "Vos assemelhar" means "to make You similar" *(meaning)*
- `book.json`: “as orações pelo abade Bellière e para obter a humildade."” → “as orações pelo abade Bellière e para obter a humildade. Texto autêntico da edição do Centenário, segundo os arquivos do Carmelo de Lisieux."” — fr-FR description ends with "Texte authentique de l'édition du Centenaire, d'après les archives du Carmel de Lisieux."; the pt-BR description drops this sentence *(meaning)*
- Rejected: pt-BR/translation-journal.md (Termos) — audit flag: "francês" ×1 / "português" ×0 — these are the column headers of the Key Terms table, not a term row
- Rejected: pt-BR/pri-17.md [4] — "me destinais" looks like a tense shift — "destinais" is the present tense of the vós form (the imperfect is "destináveis"), as in the source's present "destinez"
- Rejected: pt-BR/pri-03.md [2] — "vos pauvres enfants" rendered as "vossas pobres filhas" — the speakers are the community's "petites épouses", so the feminine is correct
- Rejected: pt-BR/pri-15.md, pri-17.md, pri-18.md translator's notes — facts of the notes on Maria de São Pedro, Joana d'Arc and Tarcísio — the dates (1816–1848; venerable 1894, beatified 1909, canonized 1920) and the epitaph by Damasus are correct

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral de Pri 1–21, notas, diário, auditoria e book.json; encontrado um defeito de sentido.
- `pt-BR/pri-12.md` [6]: “a fim de que, consumindo-se rapidamente, quase não se detenham” → “a fim de que, aperfeiçoando-se rapidamente, quase não se detenham” — O francês «se consommant» significa aqui chegar à perfeição ou plenitude; «consumindo-se» traduziria «se consumant» e perde esse sentido. *(meaning)*
- Rejected: pt-BR/pri-17.md [5] — «avec lui» traduzido por «com ela», embora «Amor» seja masculino. — O pronome também pode retomar «glaive», traduzido por «espada»; a concordância feminina é defensável.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of pri-12.md [5]–[7]: the round 2 fix (“aperfeiçoando-se” for «se consommant») is correct and the sentence stays intact; no defects.
- Rejected: pt-BR/pri-12.md [6] — Round 2 fix “aperfeiçoando-se” for «se consommant»; “consumando-se” would be more literal and keep the sense of completion at the end of life — «consommer» in this sense means to bring to perfection or fullness, so “aperfeiçoando-se” is a faithful rendering; choosing between it and “consumando-se” is a matter of style, not a defect
- Rejected: pt-BR/pri-12.md [5] — abbreviations “F. T.” and “Men.” for «F. TH.» and «Enf.» — the abbreviated form is kept, as the journal records, and each abbreviation is unambiguous in Portuguese
- Rejected: pt-BR/translation-journal.md (Termos) — audit flag: “francês” ×1 / “português” ×0 — these are the table's column headers, not a term row; round 1 already rejected this flag
