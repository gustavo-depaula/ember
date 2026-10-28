
## Termos

| Inglês | Português | Nota |
|---|---|---|
| Mammon | Mamon | Personificação da riqueza; forma presente nos diários patrísticos do corpus. |
| philosopher | filósofo | Sentido moral e ascético, conforme Instruções aos Catecúmenos. |
| disorderly / busybodies | de modo desordenado / os que se intrometem na vida alheia | Preservada a distinção entre a conduta desordenada e a intromissão associada à ociosidade. |
| Teacher | Mestre | Maiúscula conforme a fonte. |
| Holy Ghost | Espírito Santo | Conforme Homilias sobre Filêmon e outras obras do autor. |
| now and ever, and world without end | agora e sempre, e pelos séculos dos séculos | Fórmula doxológica conforme o uso nas obras irmãs. |
| compunction | compunção | |

## Decisões

- Mantida a correspondência dos 42 parágrafos da Homilia 5, além da nota do tradutor.
- Homilia 5, §37: acrescentada a nota do tradutor 4 para esclarecer o sentido moral e ascético de “filósofo”.
- Preservadas as referências recebidas, inclusive Provérbios 14:12-31, Septuaginta, no §28.
- Homilia 5, §§10–11: conservada a alternância da fonte entre a tradição recebida “de nós” e “de mim”.
- Homilia 5, §40: conservadas as afirmações anatômicas da comparação, inclusive a origem dos nervos e dos ossos na cabeça, sem modernização do conteúdo.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 3 minor. Full read of 5 homilies: 2 meaning fixes (feminine referent in Homilia 3 [10]), 2 language fixes (Homilia 2 [26], [31]) and 1 journal-format fix
- `pt-BR/ch003.md` [10]: “ele as faz descer de sua exaltação” → “ele os faz descer de sua exaltação” — source 'he takes them down' refers to the Thessalonians (masculine), not the five virgins mentioned just before; the feminine misleads the reader about the referent *(meaning)*
- `pt-BR/ch003.md` [10]: “não se tornem vaidosas pelo excesso” → “não se tornem vaidosos pelo excesso” — same referent: 'that they may not be rendered vain' are the Thessalonians, who are being commended; the feminine points to the virgins *(meaning)*
- `pt-BR/ch002.md` [26]: “se te calas, extinguistes o inferno” → “se te calas, extinguiste o inferno” — the address is to tu ('te calas', 'tu o acendeste'); 'extinguistes' is the vós form
- `pt-BR/ch002.md` [31]: “Não banamos a lembrança da punição” → “Não afastemos a lembrança da punição” — 'banir' is defective and has no present subjunctive; 'banamos' is not a standard form
- `pt-BR/translation-journal.md`: “| Mammon | Mamon |” → “| Inglês | Português | Nota |
|---|---|---|
| Mammon | Mamon |” — the Key Terms table has no header row or separator, so it does not render as a Markdown table
- Rejected: pt-BR/ch003.md [26] — audit: the parenthesis of the source '(of course)' is missing — rendered as 'naturalmente,' with the sense intact; a punctuation choice, not a loss of content
- Rejected: pt-BR/ch004.md [30] — 'Mateus 20:18' is the wrong reference (the passage is Mt 18:20) — the reference reproduces the canonical source; the edition is not corrected
- Rejected: pt-BR/ch005.md [28] — 'Provérbios 14:12-31' is an odd range — kept as in the source; the journal records the decision
- Rejected: pt-BR/ch002.md [16] — 'philosophic soul' rendered as 'alma sábia' rather than 'filósofo', per Key Terms — the Key Terms row covers the noun in its ascetic sense in Homilia 5; 'alma sábia' renders the adjective with the same meaning
- Rejected: pt-BR/ch003.md [9] — the source has 'deigned to make them apostatize' — an obvious OCR slip for 'designed'; the PT 'destinados a' already renders the right sense, so no change is needed

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 3 minor. Leitura integral dos 144 parágrafos, quatro notas, book.json, diário e alerta mecânico: dois defeitos de sentido e três menores.
- `pt-BR/ch001.md` [4]: “reconheceremos?, pergunta alguém.” → “reconheceremos? — pergunta alguém.” — A vírgula imediatamente após o ponto de interrogação está incorreta; o travessão separa a intervenção do narrador.
- `pt-BR/ch001.md` [11]: “natureza, de que ela consiste” → “natureza, em que ela consiste” — O verbo 'consistir' rege a preposição 'em'.
- `pt-BR/ch003.md` [3]: “destruição eterna, longe da face do Senhor” → “destruição eterna proveniente da face do Senhor” — A explicação no parágrafo seguinte entende 'from' como procedência: a presença do Senhor produz a punição. 'Longe' introduz a ideia distinta de afastamento. *(meaning)*
- `pt-BR/ch003.md` [4]: ““Longe da face do Senhor”” → ““Da face do Senhor”” — O autor explica 'From the face' dizendo que basta Deus vir e ser visto para produzir a punição; não está explicando distância da face divina. *(meaning)*
- `pt-BR/ch005.md` [39]: “as primeiras cabem aos governados conceder” → “cabe aos governados conceder as primeiras” — O sujeito de 'caber' é a oração infinitiva 'conceder as primeiras', que exige o verbo no singular.
- Rejected: pt-BR/ch003.md [26] — O parêntese de '(of course)' não foi reproduzido. — 'Naturalmente' preserva integralmente o conteúdo; a diferença é apenas uma escolha de pontuação, conforme a rejeição anterior.
- Rejected: pt-BR/ch004.md [12] — 'Ele veio para destruir os homens' poderia parecer retomar Cristo. — O contexto da injustiça, das ordens ilícitas e da crueldade permite recuperar o Anticristo; a fonte também faz essa mudança de sujeito sem repetir o nome.
- Rejected: pt-BR/ch004.md [13] — 'Não realizou sinais nem prodígios, como Elias' poderia parecer negar também os prodígios de Elias. — A comparação admite a elipse 'como Elias os realizou'; a citação seguinte identifica João como aquele que não fez milagres.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the 5 round-2 fixes in ch001, ch003 and ch005 and their neighbours: all fixes are correct and no new defects were found.
- Rejected: pt-BR/ch001.md [4] — 'Como então as reconheceremos?' commits the source's 'them' to a feminine referent — The answer given is the handwritten signature, so the referent is the epistles; the feminine fits the context.
- Rejected: pt-BR/ch003.md [3] — 'proveniente da face do Senhor' interprets the source's 'from' instead of rendering it neutrally — Chrysostom's own gloss in [4] reads 'from' as origin (God's coming and being seen produces the punishment), so the rendering follows the source's interpretation.
- Rejected: pt-BR/ch005.md [39] — 'as primeiras' and 'estas' might not resolve to honours and virtues — Honours are named first and virtues last in the preceding sentence; 'as primeiras' takes the first and 'estas' the nearer, which matches the source's 'the other' and 'this'.
- Rejected: pt-BR/ch003.md [26] — Audit flag: the source's '(of course)' parenthesis is missing — Already rejected in rounds 1 and 2; the sense is kept by 'naturalmente', and there is no new argument.
