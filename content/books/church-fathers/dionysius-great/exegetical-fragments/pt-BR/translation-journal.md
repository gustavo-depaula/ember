# Diário de tradução — Fragmentos Exegéticos (pt-BR)

Fonte: en-US/ (S. D. F. Salmond, Ante-Nicene Fathers, vol. 6, 1886; revisão de Kevin Knight para o New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Dionysius the Great | Dionísio Magno | |
| Exegetical Fragments | Fragmentos Exegéticos | |
| cup | cálice | |
| will / the Father's will | vontade / vontade do Pai | |
| the inferior / the superior (will) | a vontade inferior / a superior | "vontade" explicitado no feminino |
| trial (temptation) / tempt (try) | prova (tentação) / tentar (provar) | parênteses da fonte mantidos |
| enter into / fall into temptation | entrar em / cair em tentação | |
| economy | economia | termo técnico patrístico |
| passion / impassibility | paixão / impassibilidade | |
| divinity / humanity | divindade / humanidade | |
| gnomè / gnomic will | *gnomè* / vontade gnômica | ver nota do tradutor |
| fathers | padres | como nos irmãos `athanasius/*` |
| the wicked one / the devil | o maligno / o diabo | |
| endurance of evil | paciência em suportar o mal | |
| the turned wine / the quick turning | o vinho virado / a rápida virada | conserva o jogo de palavras da fonte |
| the spirit's choice | escolha do espírito | Septuaginta; ver nota do tradutor |
| mirth / laughter / pleasure | alegria / riso / prazer | |
| folly / madness / fool | insensatez / loucura / insensato | |
| unto the age / unto the ages | para o século / para os séculos | também "world (age)" → "mundo (século)" |
| valley of weeping | vale do pranto | segue a palavra da fonte, não "vale de lágrimas" |
| Mark / Luke / Matthew / John | Marcos / Lucas / Mateus / João | |
| Abraham / Adam / Solomon / David / Paul | Abraão / Adão / Salomão / Davi / Paulo | |
| Ecclesiastes / Proverbs / Ephesians / Titus / 1 Kings | Eclesiastes / Provérbios / Efésios / Tito / 1 Reis | |

## Decisões

- Tratamento: Cristo ao Pai e o autor a Deus usam *vós* ("se quiserdes", "Por que me abandonastes?", "Bendito sejais, Senhor!"); Cristo a Judas, o leitor genérico ("talvez digas"), a alegria personificada (Ecl 2:2) e Gn 3:17-19 usam *tu*; os discípulos e Jo 16 usam o plural *vós*.
- Pronomes referentes a Cristo e a Deus em minúscula ("ele"), como é uso em edições católicas modernas.
- As citações bíblicas sem aspas na parte sobre Lucas ficam sem aspas, como na fonte. As referências soltas no texto ("Mateus 1:1", "1 Reis 4:32") são mantidas na mesma posição.
- Os marcadores sobrescritos `^1^`, `^2^` e `^3^` da fonte são restos das notas do New Advent e não têm definição. Foram mantidos nos mesmos lugares, sem acréscimo.
- Os números de versículo no início de parágrafo ("43.", "3.") levam barra invertida (`43\.`) para não virarem lista numerada em Markdown, sem negrito, que a fonte não tem.
- ¶4: o "I Mark" da fonte é um erro tipográfico; traduzido como "Marcos".
- ¶37, ¶39, ¶47: corrigidos erros tipográficos da fonte ("pleasure, And", falta de espaço depois de aspas, "mein").
- ¶55: a fonte fecha as aspas no lugar errado e junta a citação do Salmo à de Efésios 5:23. As duas citações foram separadas, sem acrescentar palavras.
- ¶53: "rather" (Jo 3:19) → "antes", porque o comentário argumenta a partir dessa palavra.
- Nota do tradutor [^1] (¶11): explica *gnómē* e "vontade gnômica", termo do século VII que indica acréscimo posterior ao texto de Dionísio.
- Nota do tradutor [^2] (¶32): explica que "escolha do espírito" vem da Septuaginta, enquanto o hebraico tem "correr atrás do vento".

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (78 paragraphs), the two translator's notes, the journal and book.json. Completeness, fidelity, forms of address, references, terms and format all check out; no fixes needed.
- Rejected: pt-BR/ch001.md [22] — "And again, He taught them" rendered "E, por outro lado, ensinou-os", which may suggest a contrast. — The source's "again" only introduces a further argument, and "por outro lado" can do the same; the sense of the passage is unchanged. This is a style choice.
- Rejected: pt-BR/ch001.md [11] — "that personality" (the devil) rendered "aquela personagem". — The rendering is accurate and the referent is clear from "iludiu Adão" and "o próprio enganador".
- Rejected: pt-BR/ch001.md [57]/[58] — The verse has "fui eu mais sábio" but the commentary quotes "fui eu então sábio". — The source does the same ("more wise" in the verse, "wise" in the commentary), so the translation keeps the source's difference.
- Rejected: pt-BR/ch001.md [33]/[34] — "aumenta a dor" in the verse but "aumenta a tristeza" in the commentary. — The source also differs here: "grief" in the verse, "sorrow" in the commentary.
- Rejected: pt-BR/ch001.md [73] — "keep the Scripture against the unworthy" rendered "guardar a Escritura diante dos indignos". — In context, "guardar" set against "apresentá-la aos dignos" reads as withholding the Scripture from the unworthy, so the sense is kept.

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 78 parágrafos, das duas notas do tradutor, do diário e de book.json; encontrado um desvio de sentido repetido em dois parágrafos.
- `pt-BR/ch001.md` [14]: “e será vencido se não lutar ele mesmo contra o mal e se Deus não o proteger com o seu escudo” → “e será vencido a menos que ele mesmo lute contra o mal e que Deus o proteja com o seu escudo” — A fonte apresenta a luta pessoal e a proteção divina como necessárias para evitar a derrota. A tradução condiciona a derrota à ausência simultânea das duas. *(meaning)*
- `pt-BR/ch001.md` [22]: “e será vencido se não lutar ele mesmo contra o mal e se Deus não o proteger com o seu escudo” → “e será vencido a menos que ele mesmo lute contra o mal e que Deus o proteja com o seu escudo” — A repetição de “unless” exige tanto a luta pessoal quanto a proteção divina; a tradução atual só prevê a derrota quando ambas faltam. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [13]-[15] and [21]-[23]: both round-2 fixes are faithful and grammatical, footnote markers are intact, and no new defects were found.
- Rejected: pt-BR/ch001.md [14], [22] — Checked whether "a menos que ele mesmo lute contra o mal e que Deus o proteja" is the right reading of the two "unless" clauses. — The source makes defeat follow from the lack of either condition, so victory needs both. "a menos que A e que B" says the same. The grammar and the punctuation around the dash are correct.
