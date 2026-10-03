# Diário de Tradução — Da Mistura dos Elementos (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Larkin, revisado pelo Aquinas Institute), somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

O vocabulário escolástico segue as tabelas de `de-ente-et-essentia/pt-BR/`, `de-principiis-naturae/pt-BR/` e `de-operationibus-occultis/pt-BR/`.

| Latim | Português | Notas |
|---|---|---|
| mixtio | mistura | Como em *Das Obras Ocultas da Natureza*; não “combinação” nem “mescla” (en-US *blend*). |
| mixtum / corpus mixtum | misto / corpo misto | |
| corpora simplicia | corpos simples | Os elementos. |
| elementum | elemento | |
| forma substantialis / accidentalis | forma substancial / acidental | |
| qualitates activae et passivae | qualidades ativas e passivas | |
| qualitas media / medium | qualidade média / meio | *medium inter* (substância e acidente) → “intermédio”. |
| extrema | extremos | |
| excellentiae qualitatum | excessos das qualidades | *remissis* → “abrandados”. |
| suscipere / recipere magis et minus | admitir mais e menos | |
| complementum | plenitude | *secundum suum complementum*. |
| dispositio propria | disposição própria | |
| alteratio / generatio / corruptio | alteração / geração / corrupção | |
| motus continuus | movimento contínuo | *ubi* → “onde” (categoria). |
| per se / per accidens | por si / por acidente | |
| ratio (elementi, plurium corporum) | razão | Sentido de caráter, como em *Dos Princípios da Natureza*. |
| hoc aliquid | “este algo” | Entre aspas. |
| educere in actum | educir ao ato | |
| virtus | virtude | Sentido de poder ou eficácia. |
| materia prima | matéria-prima | |
| Philosophus / Aristoteles | o Filósofo / Aristóteles | |

## Decisões

- 2026-10-03: Tradução diretamente do latim: título, dedicatória, frase inicial em negrito-itálico e 11 parágrafos, na mesma ordem. Mantidos os dois espaços finais de linha que a fonte traz nos parágrafos.
- Título *De Mixtione Elementorum* → *Da Mistura dos Elementos*, no padrão “Do/Das …” dos opúsculos irmãos. Dedicatória → “a Mestre Filipe de Castro Caeli”, igual a *Do Movimento do Coração* (mesmo destinatário).
- A frase inicial *Dubium apud multos…* fica como linha em negrito-itálico, como no latim; a referência inglesa a substitui por uma repetição do título e põe a frase como parágrafo comum. Seguido o latim.
- Citações de obras no estilo de *Do Ente*: “no I da *Física*”, “no X da *Metafísica*”, “nas *Categorias*”. As referências Bekker que só a versão inglesa traz (ex.: 185b16) não foram importadas.
- *materiam secundum idem … suscipere* → “receba, segundo o mesmo” (sob o mesmo aspecto); *multa corpora … simul* → “juntos no mesmo lugar”, que explicita o sentido de *simul* nesse argumento.
- *sapiat utriusque extremi naturam* → “tenha algo da natureza de ambos os extremos”; *pallidum* → “o pálido”.
- *differens tamen in diversis* → “nos diversos mistos”, suprindo o substantivo implícito.
- Sem notas editoriais na fonte; nenhuma nota do tradutor acrescentada.
- `book.json`: entradas pt-BR acrescentadas a `name`, `author`, `description` (campo já existente) e ao título do sumário; `pt-BR` incluído em `languages`.

## Alterações na fonte

Nenhuma. A dedicatória latina traz *ad Magistram* (feminino) por *Magistrum*; pode ser variante da transcrição e não afeta a tradução, por isso foi deixada como está.

## Review log

### Round 1

Foco: completude, parágrafo a parágrafo (11 ↔ 11, mais título, dedicatória e frase inicial), citações de obras e auditoria mecânica. Veredito: limpo, sem alterações.

Achados rejeitados:
- ¶3 *sed secundum sensum* → “mas só segundo os sentidos”: o “só” não tem palavra latina, mas já está no contraste com *vera mixtio*, e o ¶4 o diz com todas as letras (*solum ad sensum*). O sentido não muda.
- ¶3 *non … in qualibet parte … erunt quatuor elementa* → “não estarão … em qualquer parte”: mantém o mesmo alcance do latim. O argumento só exige que os quatro elementos não estejam todos em cada parte.
- ¶8 *secundum qualitates, quae suscipiunt magis et minus* → relativa restritiva (“as qualidades que admitem”): a afirmação é a mesma nas duas leituras.
- la ¶2 *materie*, *presuppositis*: grafia medieval da edição, não erro de OCR; fonte não alterada.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-mixtione-elementorum/review-1.md`.

### Round 2

Foco: leitura bilíngue cláusula a cláusula (latim ↔ pt-BR), texto inteiro, e auditoria mecânica. Veredito: limpo, sem alterações.

Achados rejeitados:
- ¶2 *Rursus, si forma substantialis…* → “Por outro lado”: o segundo argumento vai na mesma direção do primeiro, mas *rursus* também tem o sentido de “por outro lado” (de outro ponto de partida), e o português usa a expressão também para somar argumentos. É escolha de estilo, não erro de sentido.
- ¶11 *non autem per eius actionem … educeretur* → “e por sua ação … não seria educida”: o “e” no lugar do adversativo *autem* não muda o sentido. A negação e o seu alcance são os mesmos.
- ¶9 *variat speciem* → “varia a espécie”: “variar” transitivo (“fazer variar”) é português correto.
- ¶1 *Videtur autem* → “Parece a alguns”, sem conectivo: o *autem* que abre o tratado é só de transição.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-mixtione-elementorum/review-2.md`.

### Round 3

Foco: leitura a frio do pt-BR sem a fonte, depois conferência com o latim; varredura de ortografia, diacríticos, crase, hífen, pontuação e aspas. Veredito: limpo, sem alterações.

Achados rejeitados:
- ¶8 *tam generatio quam corruptio … erit* → “tanto a geração como a corrupção … será”: com “tanto… como” a gramática admite o verbo no singular (o plural é preferível, não obrigatório), e o singular segue o *erit* latino.
- ¶9 *magis facta vel minus facta speciem variabit* → “feita mais ou feita menos variará a espécie”: o sujeito implícito é “a forma” da oração anterior, e “feita” concorda com ele.
- ¶11 *est quidem aliud a forma substantiali* → “outra coisa que a sua forma”: “outro que” é construção corrente em português.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-mixtione-elementorum/review-3.md`.
