
## Termos

| Lectio / Lectio prima | Leitura / Primeira leitura | Matinas da Oitava (cap. 11) |
| Gratian, *De consecratione*, dist., can. | Graciano, *De consecratione*, dist., cân. | referências do editor; títulos de obras ficam em latim (*De Trinitate*, *De sacramentis*, *De officiis*) |
| Peter Lombard, *Sententiae*, bk., ch. | Pedro Lombardo, *Sententiae*, liv., cap. | “quarto sententiarum” → “quarto livro das Sentenças”; “et ponitur decretis” → “e consta dos Decretos” |
| Augustinus, Ambrosius, Hilarius, Hieronymus, Gregorius, Cyprianus, Leo papa, Sergius papa, Eusebius Emisenus, Paschasius Radbertus | Agostinho, Ambrósio, Hilário, Jerônimo, Gregório, Cipriano, Papa Leão, Papa Sérgio, Eusébio de Emesa, Pascásio Radberto | sem “Santo”, como a fonte |
| sacramentum / res sacramenti | sacramento / realidade do sacramento | |
| species (panis, vini) | espécie | |
| Caro, Sanguis, Corpus (Christi) | Carne, Sangue, Corpo | maiúscula onde a fonte a usa |
| hostia / victima / oblatio | hóstia / vítima / oblação | |
| iudicium (1 Cor 11:29) | juízo | “come e bebe o seu próprio juízo” |
| cruorem occisi (hominis) | o sangue de um homem assassinado | |
| Kyrie / Christe … eleison | Senhor / Cristo … tende piedade | tropo *Kyrie fons bonitatis* |
| Introitus, Graduale, Offertorium, Secreta, Praefatium, Communio, Postcommunio, Prosa | Introito, Gradual, Ofertório, Secreta, Prefácio, Comunhão, Pós-comunhão, Prosa | Kyrie, Gloria, Sanctus, Agnus Dei ficam em latim como títulos |
| de Sancto Spiritu / de sancta Cruce | do Espírito Santo / da Santa Cruz | nas indicações de melodia |
| viaticum | viático | |

## Decisões

- Cap. 11, Leituras e cabeçalhos: traduzidos os nomes dos autores e as palavras do editor (Gratian, can., bk., ch., continued, conclusion); mantidos os colchetes e o itálico da fonte.
- Nota do tradutor [^1] (cap. 11, Dia 3): as cinco palavras da oração *Quam oblationem* do Cânon Romano e o jogo etimológico do comentário.
- Nota do tradutor [^1] (cap. 12, *Lauda Sion*): *Phase*, transcrição da Vulgata para o hebraico *pesah*, mantido em itálico para conservar a oposição com *Pascha*.
- Cap. 11, “pars oblatae in calicem Missa”: *missa* é particípio de *mittere* (“posta”), não a Missa; traduzido como “posta no cálice”.
- Cap. 11, “manducare panem vinum” (Graciano, cân. 59): lido *panem vivum*, como em Agostinho; traduzido “o pão vivo”.
- Cap. 11, “in libro officiis**”: o asterisco duplo solto da fonte foi corrigido para “no livro *De officiis*”, para não quebrar o Markdown.
- Cap. 12, “santus” no Sanctus (erro tipográfico) traduzido normalmente; colchete não fechado da Pós-comunhão fechado após “Amém.”.
- Cap. 12, Kyrie farcido traduzido por inteiro (“Senhor”, “Cristo”, “tende piedade”), para que o tropo seja compreendido; o título *Kyrie fons bonitatis* fica em latim.
- *Lauda Sion* traduzido verso a verso, sem rima, mantendo a quebra de linhas e as notas do editor no lugar da fonte; súplica final a Cristo em *vós*.
- Fala a Cristo nas citações dos Padres (o centurião, Pedro em João 6) em *vós*, como no restante do ofício.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 7 minor. Full read of c01–c12, book.json and the journal. One added editor's note in c10 removed; six can.→cân. fixes in c03 and one Latin title restored in c11, per Key Terms.
- `pt-BR/corpuschri-c10.md` [4]: “*(O manuscrito BNF 1143 não contém a hora de Completas. Tudo seria, porém, igual às Completas anteriores à festa, dadas acima. Aqui, no entanto, oferece-se uma antífona alternativa e própria para o *Nunc dimittis*, dada para esta hora de Completas no manuscrito de Graz, MS 134 (Universitätbibliothek), ainda que sem melodia.)* Ó admirável” → “Ó admirável” — The canonical la/ source has no editor's note here (audit: parentheses 0 vs 2, emphasis 2 vs 6). The note is added content and is removed. *(meaning)*
- `pt-BR/corpuschri-c03.md` [164]: “dist. II, can. 69, início]” → “dist. II, cân. 69, início]” — Key Terms renders can. as cân., as everywhere in c11.
- `pt-BR/corpuschri-c03.md` [173]: “dist. II, can. 69, continuação]” → “dist. II, cân. 69, continuação]” — Key Terms renders can. as cân.
- `pt-BR/corpuschri-c03.md` [182]: “dist. II, can. 69, continuação]” → “dist. II, cân. 69, continuação]” — Key Terms renders can. as cân.
- `pt-BR/corpuschri-c03.md` [435]: “dist. II, can. 69, conclusão]” → “dist. II, cân. 69, conclusão]” — Key Terms renders can. as cân.
- `pt-BR/corpuschri-c03.md` [444]: “dist. II, can. 55;” → “dist. II, cân. 55;” — Key Terms renders can. as cân.
- `pt-BR/corpuschri-c03.md` [453]: “dist. II, can. 55, conclusão]” → “dist. II, cân. 55, conclusão]” — Key Terms renders can. as cân.
- `pt-BR/corpuschri-c11.md` [179]: “no livro sobre a catequese dos principiantes” → “no livro *De catechizandis rudibus*” — Source 'in libro de catecizandis rudibus' names a work. The journal keeps work titles in Latin, as with *De sermone de infantibus* in [159].
- Rejected: pt-BR/corpuschri-c11.md [76], [83] — Audit: emphasis 4 vs 2, because 'inquit' is not kept between the italic spans — 'inquit' is rendered as 'diz' before the quotation. Nothing is lost.
- Rejected: pt-BR/corpuschri-c12.md [48] — Audit: emphasis 0 vs 2 on *Phase* — Italics kept on purpose, per the journal decision and footnote [^1].
- Rejected: pt-BR/corpuschri-c07.md [38] — 'Tornai-vos agradáveis' looks reflexive — 'vos' reads as a dative ('make them pleasing to you'). The grammar holds.
- Rejected: pt-BR/corpuschri-c01/c09, c03/c11 — Melquisedec vs Melquisedeque; rocha vs pedra; Capítula vs Capítulo across files — Each file is internally consistent, and each form is an accepted Portuguese rendering.
- Rejected: pt-BR/corpuschri-c03.md footnotes [^1], [^3], [^4], [^5] — Claims of fact in translator's notes — All check out: Granum cadens is from the Becket office (martyred 1170); lessons 4–6 and 10 come from De mysteriis; Alcuin draws on Augustine's tractate 26; De sacramentis is the oldest witness to the Canon.

### Round 2 (codex, full read)
Verdict: 8 meaning-level, 4 minor. Leitura integral de c01–c12, notas do tradutor, book.json e diário; 8 correções de sentido e 4 menores; os quatro alertas mecânicos não constituem defeitos.
- `pt-BR/corpuschri-c01.md` [75]: “Não fez assim a nenhuma nação” → “Não fez assim a nenhuma outra nação” — O contexto distingue Israel das demais nações; a tradução atual nega que Deus tenha feito isso também a Israel. *(meaning)*
- `pt-BR/corpuschri-c02.md` [21]: “o que dizeis em vossos corações, em vossos leitos compungi-vos” → “do que dizeis em vossos corações, em vossos leitos compungi-vos” — Falta a preposição que liga o motivo da compunção a 'compungi-vos'.
- `pt-BR/corpuschri-c02.md` [45]: “pusestes muito alto o vosso refúgio” → “fizeste do Altíssimo o teu refúgio” — 'Altissimum' designa Deus, constituído refúgio pelo fiel; não indica a altura de um refúgio estabelecido por Deus. *(meaning)*
- `pt-BR/corpuschri-c03.md` [96]: “cem dias de indulgência, que haveriam de durar por todos os tempos” → “uma indulgência de cem dias, cuja concessão valeria por todos os tempos” — 'Perpetuis temporibus duraturam' qualifica a indulgência concedida, não a duração dos cem dias. *(meaning)*
- `pt-BR/corpuschri-c03.md` [174]: “a água que a natureza não tinha” → “a água que ela não tinha por natureza” — Em 'petra quam non habebat natura', a rocha é o sujeito de 'habebat'; 'natura' é ablativo: a rocha não possuía naturalmente aquela água. *(meaning)*
- `pt-BR/corpuschri-c05.md` [27]: “e habitarei na casa do Senhor” → “e para que eu habite na casa do Senhor” — 'Et ut inhabitem' exprime finalidade, que foi substituída por uma afirmação no futuro. *(meaning)*
- `pt-BR/corpuschri-c07.md` [74]: “E o vinho alegra o coração do homem” → “E o vinho alegre o coração do homem” — 'Laetificet' está no subjuntivo; a tradução o converteu em afirmação indicativa. *(meaning)*
- `pt-BR/corpuschri-c08.md` [69]: “E o vinho alegra o coração do homem” → “E o vinho alegre o coração do homem” — 'Laetificet' está no subjuntivo, como corretamente traduzido em c03 [246]. *(meaning)*
- `pt-BR/corpuschri-c11.md` [58]: “no livro das *Sentenças de Próspero*” → “no livro *Sententiarum Prosperi*” — O diário determina conservar em latim os títulos das obras; a exceção registrada para o quarto livro das Sentenças de Pedro Lombardo não corresponde a esta obra.
- `pt-BR/corpuschri-c11.md` [77]: “sejamos tidos como entranhas de Cristo” → “sejamos tidos como pertencentes às entranhas de Cristo” — 'Visceribus Christi esse censeamur' exprime pertencimento; 'visceribus' não é um predicativo que identifique os fiéis com as próprias entranhas. *(meaning)*
- `pt-BR/corpuschri-c11.md` [177]: “no livro das *Sentenças de Próspero*” → “no livro *Sententiarum Prosperi*” — Restaura o título latino conforme a regra do diário.
- `pt-BR/corpuschri-c11.md` [186]: “[no livro] das *Sentenças*” → “[no livro] *Sententiarum*” — Restaura o título latino da obra atribuída a Agostinho conforme a regra do diário.
- Rejected: pt-BR/corpuschri-c11.md [76], [83], [179]; pt-BR/corpuschri-c12.md [48] — Diferenças na contagem dos marcadores de ênfase. — Em [76] e [83], 'diz' foi deslocado para antes da citação; em [179], o título latino recebeu itálico conforme o diário; em c12 [48], o itálico de Phase é deliberado. Nenhum conteúdo foi perdido.
- Rejected: pt-BR/corpuschri-c11.md [135] — Possível inversão de sujeito e predicativo em 'aquele homem é verdadeiramente Cristo'. — A construção copulativa latina permite ligar 'ille' a 'homo'; a leitura adotada é defensável no contexto.
- Rejected: pt-BR/corpuschri-c11.md [157] — 'Que também fez de nós mesmos' poderia sugerir que o corpo físico de Cristo foi produzido a partir dos fiéis. — A construção portuguesa 'fazer de alguém alguma coisa', com o predicativo antecipado pelo relativo, também exprime corretamente que Cristo nos fez seu corpo; a frase seguinte confirma essa leitura.
- Rejected: pt-BR/corpuschri-c12.md [57] — 'Tanto estes quanto aquele' poderia expressar apenas inclusão dos dois grupos. — No contexto, a construção elíptica admite a comparação de quantidade recebida exigida por 'quantum isti tantum ille'; não há erro inequívoco.

### Round 3 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of c01–c12, notes, book.json and journal: 1 meaning fix (c02 Compline antiphon syntax) and 3 minor fixes (subjunctive, Papa capitalization, ambiguous 'presente'); audit flags already settled.
- `pt-BR/corpuschri-c02.md` [15]: “da santa Sião; dai igualmente a recompensa aos devotos que assistem,” → “da santa Sião e igualmente dos que assistem; dai aos devotos a recompensa,” — 'astantium' is genitive, parallel to 'psallentium' under 'miserere'; 'devotis' is the separate dative of 'da … premium'. The translation joined the bystanders to the reward instead of to the plea for mercy. *(meaning)*
- `pt-BR/corpuschri-c06.md` [51]: “Foi bom para mim que me humilhastes:” → “Foi bom para mim que me humilhásseis:” — A subject clause after 'foi bom' takes the subjunctive; the indicative 'humilhastes' breaks normative grammar.
- `pt-BR/corpuschri-c11.md` [130]: “Do Concílio do papa Martinho;” → “Do Concílio do Papa Martinho;” — Key Terms and the rest of c11 write 'Papa Leão', 'Papa Sérgio', 'Papa Alexandre'; this is the only lowercase occurrence in the file.
- `pt-BR/corpuschri-c11.md` [209]: “se aproxima deste presente” → “se aproxima deste altar presente” — In 'ad hoc praesens', 'praesens' qualifies the visible altar set against 'altare invisibile'. Used alone as a noun, 'presente' reads as 'gift'.
- Rejected: pt-BR/corpuschri-c03.md [294] — 'para libertar o homem que havíeis de assumir' makes 'hominem' the object of 'liberandum' — This follows the traditional Portuguese reading of the Te Deum ('para libertardes o homem'). The sense is defensible.
- Rejected: pt-BR/corpuschri-c03.md [141] — Source reads 'usque ad donum Dei', translation 'até a casa de Deus' — 'donum' is an evident slip for the Vulgate's 'domum'. The translation renders the intended text.
- Rejected: pt-BR/corpuschri-c09.md [45] — 'quia' of 'O Domine, quia ego servus tuus' not rendered — Here 'quia' is an asseverative Hebraism; omitting it loses no content.

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos os 12 parágrafos apresentados, a nota, book.json e o diário; as quatro alterações estão corretas, os alertas mecânicos já foram justificados e não há novos defeitos.
- Rejected: pt-BR/corpuschri-c11.md [209] — “Pão vivo” diverge de “panem vinum” na fonte. — “Vinum” é um lapso evidente por “vivum” neste contexto; a leitura está registrada no diário e não requer alteração da tradução.
