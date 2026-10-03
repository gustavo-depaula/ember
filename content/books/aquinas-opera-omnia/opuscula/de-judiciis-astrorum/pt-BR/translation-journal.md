# Diário de Tradução — Dos Juízos dos Astros (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (aquinas.cc), somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

Convenções herdadas de *Das Sortes* (`opuscula/de-sortibus/pt-BR`), que trata do mesmo assunto e cita as mesmas passagens de Agostinho e de 1 Cor 10.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| iudicia astrorum / iudicium astrorum | juízos dos astros / juízo dos astros | Termo do título; mantido literal (não "horóscopos", como a referência inglesa), porque o texto distingue o uso lícito e o ilícito do mesmo juízo. |
| corpora celestia / inferiora corpora | corpos celestes / corpos inferiores | |
| uirtus (celestium corporum) | virtude | Sentido de poder ou eficácia, como em *Das Sortes*. |
| astra / stelle / sydereus | astros / estrelas / siderais | |
| prenoscere | conhecer de antemão | Como em *Das Sortes*. |
| obseruatio | observação | |
| dies cretici | dias críticos | |
| liberum arbitrium | livre-arbítrio | |
| astrologi | astrólogos | |
| instinctus occultissimus | instinto ocultíssimo | Igual à citação em *Das Sortes*, cap. 4. |
| spiritus immundi et seductores | espíritos imundos e sedutores | Idem. |
| pacta cum demonibus habita | pactos estabelecidos com os demônios | Idem. |
| societas / socii demoniorum | sociedade / sócios dos demônios | "Sociedade" retoma *socios* de 1 Cor 10, como em *Das Sortes*. |
| Apostolus | o Apóstolo | |

## Decisões

- 2026-10-03: Tradução do latim, um parágrafo por parágrafo da fonte (três), com os dois espaços finais dos parágrafos 1 e 2 espelhados. A referência inglesa acrescenta referências entre parênteses (*De civitate Dei* v, 6; *De Genesi ad litteram* ii, 15; *De doctrina Christiana* ii, 23; Jr 10, 2; 1 Cor 10, 20) que o latim não tem — omitidas, como aparato editorial.
- Referências bíblicas no formato de *Das Sortes*: algarismos arábicos, sem versículo quando a fonte não o dá (`Ier. x` → `Jr 10`; `I Cor. x` → `1 Cor 10`).
- Obras de Agostinho com os títulos de *Das Sortes*: *A Cidade de Deus*, *Sobre o Gênesis ao pé da letra*, *A Doutrina Cristã*, em itálico, precedidos de "no livro V / II de".
- Citações traduzidas da letra latina desta fonte, alinhadas à redação de *Das Sortes* onde o latim coincide. *ad solas corporum differentias afflatus quosdam sydereos peruenire* → "certos influxos siderais chegam às simples diferenças dos corpos" (*Das Sortes* tem *valere*, aqui *peruenire*). A citação de *Sobre o Gênesis* traz aqui o sujeito *ab astrologis* e a oração final *quibus quedam uera… nosse permittitur*, ausentes em *Das Sortes*; traduzidas.
- Jr 10: *A signis celi nolite metuere que gentes timent* → "Não temais os sinais do céu, que as nações temem" (vós, plural do texto).
- *oportet te scire* → "deves saber" (tu, o destinatário singular da consulta).
- `book.json`: `name` "Dos Juízos dos Astros" (forma "Dos/Das …" das obras irmãs; literal ao título latino, não ao inglês *On Astrology*); `author` "Santo Tomás de Aquino" (forma majoritária nas obras irmãs); `description` (campo já existente) traduzida; título do sumário "Dos Juízos dos Astros", como nas obras irmãs de capítulo único, em vez do rótulo técnico "DeIudiciis.2".
- Sem notas editoriais na fonte; nenhuma nota do tradutor acrescentada.

## Alterações na fonte

Nenhuma. O espaço antes de `;` (*intendunt ;*, *patiuntur ;*) é pontuação da edição, não corrupção de OCR.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo; nomes e números das referências bíblicas. Veredito: limpo, nenhuma alteração. Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-judiciis-astrorum/review-1.md` (fora do corpus).

Achados considerados e rejeitados:
- *ad solas corporum differentias* → "às simples diferenças dos corpos": "simples" anteposto vale "meras", o sentido restritivo de *solas*; mesma decisão registrada em *Das Sortes*.
- *ubertatem et sterilitatem fructuum* → "das colheitas": *fructus* aqui são os frutos da terra; "colheitas" é tradução legítima, não omissão.
- *Ier. x* / *I Cor. x* sem versículo: a fonte não dá versículo; os "10:2" e "10:20" da referência inglesa são aparato editorial e não entram.
- *immiscet se* → "imiscui-se": forma correta do presente de *imiscuir-se*.

### Round 2

Foco: leitura bilíngue oração por oração (`la/` × `pt-BR/`), mais a auditoria mecânica e a conferência das afirmações deste diário. Veredito: limpo, nenhuma alteração. Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-judiciis-astrorum/review-2.md` (fora do corpus).

Achados considerados e rejeitados:
- *Non usquequaque absurde dici potest* → "Não se pode dizer de modo inteiramente absurdo": o latim também põe *non* longe de *absurde*; o português segue essa ordem e o sentido sai certo (dizê-lo não é de todo absurdo). A frase é idêntica à de *Das Sortes*, cap. 4. É escolha de estilo, não negação invertida.
- *quod cum ad decipiendos homines fit* → "e, quando isso se faz": *cum* temporal é leitura legítima. O "since" da referência inglesa é uma interpretação, não um erro do português.

### Round 3

Foco: leitura do pt-BR sem a fonte, depois conferência de cada marca com o `la/`; varredura de ortografia, diacríticos, crase, hífen, pontuação e pares de itálico; auditoria mecânica e `book.json`. Veredito: limpo, nenhuma alteração. Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-judiciis-astrorum/review-3.md` (fora do corpus).

Achados considerados e rejeitados:
- *Et ideo pro certo tenendum est* → "E por isso deve-se ter por certo": a ênclise depois de "por isso" é uso aceito no Brasil; não é erro de colocação.
- *puta tempestatem et serenitatem aeris* → "por exemplo a tempestade…", sem vírgula depois de "por exemplo": escolha de pontuação, não defeito.
