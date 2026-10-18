# Diário de tradução — Martírio dos Santos Confessores Shamuna, Guria e Habib (pt-BR)

Fonte: en-US/ (trad. B. P. Pratten, Ante-Nicene Fathers, vol. 8, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Martyrdom | Martírio | Sem artigo no título, como na fonte e em miscellaneous/martyrdom-of-habib-the-deacon. |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Holy Confessors | Santos Confessores | |
| Simeon Metaphrastes | Simeão Metafrastes | |
| Shamuna / Guria / Habib | Shamuna / Guria / Habib | Nomes siríacos mantidos, como nas obras irmãs. |
| Thelsæa | Telseia | Forma grega de Telzeha (miscellaneous/martyrdom-of-habib-the-deacon); adaptada na grafia. |
| Sarcigitua / Ganas / Bethelabicla | Sarcigitua / Ganas / Bethelabicla | Topônimos mantidos. |
| empire of Alexander the Macedonian | império de Alexandre, o Macedônio | Era selêucida; nota do tradutor [^1]. |
| Diocletian / Maximian / Licinius / Constantine | Diocleciano / Maximiano / Licínio / Constantino | |
| Augar son of Zoaras / Cognatus | Augar, filho de Zoaras / Cognato | |
| Edessa / Edessenes | Edessa / edessenos | |
| Antonius / Musonius / Lysanias / Theotecnus | Antônio / Musônio / Lisânias / Teotecno | Lisânias conforme obra irmã. |
| Anovitus / Anuinus | Anovito / Anuíno | Variação da fonte mantida ([6] e [8]). |
| Duke Heraclianus | o duque Heracliano | |
| Epiphanius, Petrus, Pamphilus, Timotheus, Agapetus, Hesychius, Philippus, Hermes | Epifânio, Pedro, Pânfilo, Timóteo, Agapito, Hesíquio, Filipe, Hermes | |
| Cæsarea in Palestine / Thessalonica / Nicomedia / Adrianopolis / Melitina / Martyropolis | Cesareia da Palestina / Tessalônica / Nicomédia / Adrianópolis / Melitene / Martirópolis | |
| Saturn and Rhea / Jupiter | Saturno e Reia / Júpiter | |
| governor / judge / tyrant | governador / juiz / tirano | |
| judgment-seat / tribunal | tribunal | |
| attendants | oficiais | Conforme obra irmã. |
| jailor | carcereiro | |
| halberdier | alabardeiro | |
| stocks | cepo | |
| iron claws | garras de ferro | |
| champion | campeão | Imagem atlética do martírio. |
| Umpire of the strife | Árbitro do combate | Nota do tradutor [^2]. |
| King of kings | Rei dos reis | Conforme obras irmãs. |
| most divine emperor | diviníssimo imperador | |
| Roman gate | porta Romana | |

## Decisões

- Diálogos sem aspas, como na fonte; aspas nas citações da Escritura, no cognome “o Puro” e nos termos comentados nas notas do tradutor.
- Tratamento: o governador fala aos dois mártires por *vós*; os mártires ao governador, Habib a Teotecno e Teotecno a Habib por *tu*; as orações a Deus por *vós*. Pronomes referidos a Deus em minúscula.
- Citações bíblicas traduzidas da redação da fonte, sem referências, pois a fonte não as dá.
- [4] “lovingness” traduzido por “caridade”; “surname of the pure” por “cognome de ‘o Puro’”.
- [12] O “disse ele” antes de “Os que se submetem…” fica ambíguo, como na fonte.
- [15] “Lysanias had appointed governor” (frase truncada na fonte) traduzido pelo sentido: “Lisânias fora nomeado governador”.
- [15] “a quem procurais”: plural, referido às autoridades que procuravam Habib.
- Nota do tradutor [^1] (após [3]): explica a era selêucida e a data correspondente.
- Nota do tradutor [^2] (após [10]): explica a imagem do agonoteta em “Árbitro do combate”.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Leitura completa dos 17 parágrafos, das notas, do book.json e do diário; um defeito menor (socket/cabeça do osso do quadril em [9]), o resto fiel e correto.
- `pt-BR/ch001.md` [9]: “a cabeça do osso do quadril foi arrancada do seu encaixe” → “o encaixe do osso do quadril foi arrancado do seu lugar” — source: 'the socket of the hip-bone was wrenched out of its place'; 'socket' é o encaixe, não a cabeça, e o osso do quadril não tem cabeça; o sentido (quadril deslocado) se mantém
- Rejected: pt-BR/ch001.md [4] — 'in whom is no safety' traduzido por 'nos quais não há salvação', mais próximo da redação bíblica corrente — 'safety' admite 'salvação' (σωτηρία, Sl 146,3); escolha defensável, sem perda de sentido
- Rejected: pt-BR/ch001.md [12] — 'que dirás' (tu) supõe que quem fala é o mártir, embora a fonte diga 'said he' depois da fala do governador — o conteúdo é claramente do mártir, e o diário já registra essa ambiguidade; o tratamento por tu segue a regra do diário
- Rejected: pt-BR/ch001.md [13] — 'the cry which is wrung from you by force' sem 'from you' — o 'vós' está implícito no contexto; não há perda de sentido

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 17 parágrafos, das duas notas, do book.json e do diário; encontrada apenas uma afirmação inexata no diário, de classe minor.
- `pt-BR/translation-journal.md`: “aspas apenas nas citações da Escritura.” → “aspas nas citações da Escritura, no cognome “o Puro” e nos termos comentados nas notas do tradutor.” — A afirmação de exclusividade contradiz o uso de aspas em “o Puro” no parágrafo 4 e nas duas notas do tradutor.
- Rejected: pt-BR/ch001.md [11] — Shamuna aparece curvado pela idade, e Guria impossibilitado de andar, apesar das descrições anteriores. — Essas aparentes inconsistências já estão na fonte inglesa; a tradução preserva corretamente os sujeitos e suas condições.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura delta: verificada a única mudança (decisão sobre aspas no diário), correta e sem efeito em outras entradas; nenhum defeito.
- Rejected: pt-BR/translation-journal.md (Decisões) — Item [4] cita o cognome com aspas simples (‘o Puro’), enquanto a decisão revista fala em aspas no cognome — As aspas simples ali são aninhadas, dentro das aspas duplas da própria citação no diário; não contradizem o uso de aspas duplas em “o Puro” no texto
