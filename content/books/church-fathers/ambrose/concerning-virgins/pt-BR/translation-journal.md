# Translation Journal — Sobre as Virgens (pt-BR)

Source: en-US (H. de Romestin et al., NPNF, segunda série, vol. 10, via New Advent)
Target: pt-BR

## Termos

| Inglês | Português | Observações |
|---|---|---|
| Ambrose | Santo Ambrósio | Conforme `repentance` e `mysteries`, inclusive no autor dos metadados. |
| virginity / chastity / modesty | virgindade / castidade / pudor | Distinção mantida; modesty também pode ser modéstia conforme o contexto. |
| Virgin / spouse | virgem, Virgem / esposo, esposa, Esposo | Capitalização contextual, inclusive esposo/Esposo para Cristo; núpcias espirituais preservadas. |
| Godhead / Word | Divindade / Verbo | Conforme as obras irmãs. |
| Marcellina / Agnes / Thecla | Marcelina / Inês / Tecla | Formas portuguesas. |
| veil / profession | véu / profissão | Vocabulário da consagração virginal. |
| luxury / lust | luxo / concupiscência | Conforme `repentance`; luxo não é luxúria. |
| Song of Songs | Cântico dos Cânticos | Conforme `mysteries`; demais livros bíblicos também localizados. |

## Decisões

- 2026-10-02: Tradução integral exclusivamente de `en-US`, mantendo parágrafos, títulos, resumos, numeração e ordem. Números de parágrafos em negrito no destino; fonte não reformatada. Títulos: “Sobre as Virgens” e “Livro I–III”.
- Aspas curvas “ ”; tu para uma interlocutora e vós para grupos. Pronomes reverenciais em minúsculas, como em `repentance`.
- Citações bíblicas traduzidas a partir das palavras da fonte, sem substituir por uma Bíblia portuguesa. Números e eventuais peculiaridades das referências preservados.
- Notas editoriais seriam omitidas por padrão; introdução, resumos e esclarecimentos incorporados ao corpo são preservados. Não há notas de rodapé separadas na fonte.
- Metadados recebem pt-BR apenas nos campos já existentes; sem descrição nova. Build reservado ao orquestrador, conforme a instrução desta execução.

## Emendas da fonte

- Livro I, introdução: `corning of our Lord` → `coming of our Lord`, confusão inequívoca de OCR entre m e rn.
- Livro III, §1: `two former hooks` → `two former books` (b/h).
- Livro III, §3: removido o resíduo de marcação `k28--` antes de `Wisdom 24:3`; nome e numeração da referência mantidos.
- Livro III, §16: `These kings were suited` → `These things were suited`, palavra corrompida no encadeamento sobre os exercícios ascéticos.
- Livro III, resumo do capítulo 5: `wash l my couch` → `wash I my couch` (l/I).

## Particularidades preservadas

- Livro I, §22: mantido “Ele é ... a Virgem”, como no inglês, sem emendar a transição entre Cristo e a Igreja. Introdução: referências patrísticas e colchete sem fechamento conservados.
- Livro II, §17: “Mary” → “Maria” na retomada tipológica do tamborim de Miriam; Livro I, §12, conserva “Miriam”.
- Livro II, §36: a atribuição dos episódios mitológicos ao “homem que foi condenado” é mantida, sem correção histórica.
- Livro III: numeração passa de 35 a 37, sem §36; resumo menciona “irmã”, enquanto o relato traz “irmãs”. §2 conserva “Divindade não gerada”; §14 conserva a oposição textual entre pântanos e rãs; §16 conserva a mudança de pessoa em “enquanto ele amadurecia” e verte “exceptive produce” pelo sentido contextual de produção excessiva, sem emenda conjectural ao inglês.
- Mantidas referências como Lucas 1:56 (II, §12), Sabedoria 24:3 (III, §3), Cântico dos Cânticos 3:6 (III, §21), e “quatro mil” com cinco pães e dois peixes (III, §1). Nenhuma harmonização com outra edição.
- Vocabulário adicional: Libério, Pelágia, Sotéria, Herodíades, Hipólito, Dámon, Pítias, Esculápio; Placência, Bolonha, Mauritânia; “fonte batismal” para *laver*, conforme `mysteries`.

## Review log

### Round 1

- 2026-10-02. Foco: completude parágrafo a parágrafo, citações, apartes e referências bíblicas; auditoria mecânica 1–6 e `book.json`. Veredito: **ISSUES 3**, todos corrigidos.
- I, §15 (`ch001.md:69`): “Ensinam que suas virgens não devem perseverar e são incapazes de fazê-lo aqueles que fixaram um prazo à virgindade.” → “Aqueles que fixaram um prazo à virgindade ensinam que suas virgens não devem perseverar e que são incapazes de fazê-lo.” O complemento de “teach” atribui a incapacidade às virgens; a coordenação anterior a atribuía aos que fixaram o prazo.
- I, §57 (`ch001.md:183`): “deixe-me tratar do assunto em outro lugar” → “deixai-me tratar do assunto em outro lugar”. Concordância com a audiência plural de “Vedes” e “vos”, segundo a convenção de tratamento registrada.
- II, §23 (`ch002.md:63`): “o rubor com que era olhada” → “o rubor que sentia ao ser olhada”. “Her blushes at being looked on” é o rubor da donzela, não de quem olha.
- Rejeitado: I, §35, fonte `en-US/ch001.md:121`, “This is the gift of few only, that is of all”. “Esta é dom de poucos; aquele, de todos” distingue corretamente virgindade e matrimônio pelos antecedentes; não falta conteúdo.
- Rejeitado: I, §54, fonte `en-US/ch001.md:173`, “my sister” / “adorn yourselves”. A alternância “minha irmã” / “não vos adornardes” acompanha o singular/plural explícito da fonte; não deve ser uniformizada.
- Rejeitado: II, §26, fonte `en-US/ch002.md:69`, “fear to laud on or describe”. “Continuar a louvar ou descrever” acompanha “laud”; a estranheza do inglês não basta para presumir OCR e emendar a fonte.
- Rejeitados novamente, conforme as razões em Particularidades preservadas: I §22 (`en-US/ch001.md:87`, “He is, then, the Virgin”); III §16 (`en-US/ch003.md:49`, “while he was ripening” / “exceptive produce”). A mudança de referente/pessoa vem do inglês, e a produção excessiva tem a justificativa contextual já registrada. Não são defeitos novos de tradução.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-1.md`.

### Round 2

- 2026-10-02. Foco: leitura bilíngue integral, oração por oração; auditoria mecânica 1–6, `book.json` e afirmações do diário. Veredito: **ISSUES 2**, ambos corrigidos.
- I, introdução (`ch001.md:7`): “Tampouco os pronunciamentos dos Padres e dos Concílios estabelecem a esse respeito algo além da segunda opinião mencionada acima.” → “Os pronunciamentos dos Padres e dos Concílios tampouco oferecem mais fundamento para essa opinião do que para a segunda mencionada acima.” A fonte compara o apoio documental às duas opiniões (“on this point more than on the second”), não o limita ao conteúdo da segunda.
- I, §50 (`ch001.md:159`): “mil para Salomão e duzentos para os que guardam seu fruto” → “mil para Salomão e duzentos que guardam seu fruto”. “Two hundred who keep” conta guardiões, não unidades destinadas a eles; a soma de mil e duzentos no §51 confirma a leitura.
- Rejeitado: I, §15 (`en-US/ch001.md:69`), “Nor is she modest … and she immodest …”: a negação pode abranger ambos os predicados, como em “Nem é pudica … nem impudica …”.
- Rejeitado: I, §30 (`en-US/ch001.md:107`), “you do not, intent upon the eyes of men, consider as merits”: “não ficais atentas … nem considerais como méritos” explicita defensavelmente a negação da conduta descrita.
- Rejeitado: I, §36 (`en-US/ch001.md:123`), “to Whom alone it is suitable to say”: “ao Esposo das quais” explicita o destinatário divino do elogio, confirmado pela pergunta seguinte, “Who is that Spouse?”.
- Rejeitado: I, §45 (`en-US/ch001.md:149`), “It loves to grow in gardens”: “Ela” retoma corretamente a flor do §44; a metáfora aplicada à pureza de Susana pode permanecer implícita.
- Rejeitado: I, §55 (`en-US/ch001.md:175`), “you … are condemned by public justice”: a pontuação da fonte atribui a condenação a “you”; não cabe deslocá-la para “aqueles” na tradução.
- Rejeitado: II, §29 (`en-US/ch002.md:75`), “and each for Christ”: “e cada uma por Cristo” admite como referente as vestes mencionadas, sem erro inequívoco de gênero.
- Rejeitado: II, §33 (`en-US/ch002.md:83`), “the one the impulse and the other the result”: “um o impulso e a outra o resultado” é sustentado pelo soldado que iniciou a troca e pela virgem que voltou para o martírio; os gêneros são implícitos no inglês.
- Rejeitado: III, §30 (`en-US/ch003.md:85`), “blood pouring from the still flowing veins”: “sangue que escorre das veias ainda abertas” mantém o fluxo atual; não há supressão objetiva desse evento.
- Rejeitado: III, §39 (`en-US/ch003.md:105`), “injuries”: “injúrias” admite o sentido de dano/violência no contexto dos golpes; não exige a leitura restrita de insultos verbais.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-2.md`.

### Round 3

- 2026-10-02. Foco: leitura integral do pt-BR sem abrir os capítulos da fonte, seguida de conferência dos candidatos no inglês canônico e varredura ortográfica; auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: **ISSUES 1**, corrigido.
- I, §60 (`ch001.md:189`): “provêm seu sustento pelo trabalho” → “proveem seu sustento pelo trabalho”. A fonte (`en-US/ch001.md:189`) diz “provide their sustenance by labour”: trata-se de prover, cujo presente plural é “proveem”; “provêm” pertence a provir.
- Rejeitado: I, §60 (`en-US/ch001.md:189`), “Not being of the sex which lives in common”: a estranheza de “Não pertencendo ao sexo que vive em comum” já está na fonte; não autoriza inverter a negação nem substituir “sexo”.
- Rejeitado: I, §66 (`en-US/ch001.md:205`), “Which answer concerning her father, but warning as to himself, he made good by his own speedy death”: “ele próprio” e “ele” retomam o parente que interpelou a virgem; o pai já morto é assunto da resposta, não sujeito da morte subsequente.
- Rejeitado: II, §14 (`en-US/ch002.md:37`), “And then, how she also went every year”: o “como” de “E depois, como também ia todos os anos” introduz uma evocação retórica elíptica, não uma oração causal que exija completar o período. III, §10 (`en-US/ch003.md:33`), “What of Rachel, how she”: “E Raquel, como” tem a mesma função de evocação interrogativa. Não são omissões de conteúdo.
- Rejeitado: III, §21 (`en-US/ch003.md:63`), “of which four elements the human body consists”: “desses quatro elementos consistindo o corpo humano” emprega a variante de regência “consistir de” no sentido de compor-se, registrada por Luft e discutida no Ciberdúvidas; preferir “em” seria uma normalização prescritiva, não correção inequívoca neste escopo.
- Rejeitado: III, §29 (`en-US/ch003.md:83`), “having heard that it was Herod’s birthday, and of the state banquet”: “tendo ouvido que era o aniversário de Herodes, e do banquete solene” coordena a notícia expressa por oração e as notícias introduzidas por “de”; mantém os complementos e seu sentido, apesar da construção pouco usual.
- Rejeitados novamente: I, §22 (`en-US/ch001.md:87`), “He is, then, the Virgin”; III, §16 (`en-US/ch003.md:49`), “while he was ripening”. As mudanças de referente que causam estranheza na leitura isolada já vêm do inglês; mantêm-se as razões registradas nas rodadas anteriores.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-3.md`.

### Round 4

- 2026-10-02. Foco: palavras funcionais, títulos e compromissos de gênero, antecedente e tratamento; leitura integral, auditoria mecânica 1–6, `book.json` e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma alteração nos capítulos, metadados ou Termos.
- Rejeitado: I, §28 (`en-US/ch001.md:103`), “he loves another, you desire to please another”. “Ele ama outra, tu desejas agradar a outro” resolve os gêneros abertos de *another* pela imagem feminina pintada e pelo marido a quem se procura agradar. Não afirma a existência de outro amante nem exige uniformizar os dois gêneros.
- Rejeitado: I, §32 (`en-US/ch001.md:115`), “The virgin is an offering for her mother, by whose daily sacrifice”. “Por cujo sacrifício diário” conserva a possibilidade de retomar a virgem/oferenda; a proximidade de “mãe” não torna obrigatória a atribuição exclusiva do sacrifício à mãe. Não se confirmou troca de agente.
- Rejeitado: I, parágrafo sem número antes do §54 (`en-US/ch001.md:171`), “no desire of possessions inflames you”. “Não vos inflamar nenhum desejo de posses” pode continuar a audiência plural dos §§51–53; a apóstrofe singular “my sister” começa no §54. O resumo não obriga a antecipar essa mudança de tratamento.
- Rejeitado: II, §8 (`en-US/ch002.md:25`), “the one abounding beyond nature, the other almost insufficient for nature”. “Esta excedendo a natureza, aquela quase insuficiente” identifica corretamente a abundância de serviços e a frugalidade no alimento pelos predicados. Não há inversão dos demonstrativos.
- Rejeitado: III, §6 (`en-US/ch003.md:21`), “though each be criminal”. “Embora cada um seja criminoso” admite os envolvidos nos episódios como antecedente; o inglês não impõe que *each* retome exclusivamente as fábulas. Trocar por feminino ou por “ambas” fixaria uma leitura não demonstrada.
- Rejeitado: III, §38 (`en-US/ch003.md:103`), “a martyred ancestor”. “Uma antepassada mártir” resolve o gênero pela Sotéria identificada no §39 e no resumo do capítulo; não é acréscimo arbitrário.
- Evidência integral e rastreamento dos interlocutores: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-4.md`.

### Round 5

- 2026-10-02. Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes próprios; auditoria mecânica 1–6 e metadados. Veredito: **ISSUES 1**, corrigido no diário; capítulos e metadados sem alterações.
- Termos, linha `Virgin / spouse`: “Maiúsculas nos títulos de Cristo e Maria” → “Capitalização contextual, inclusive esposo/Esposo para Cristo”; explicitadas as variantes na coluna portuguesa. A afirmação anterior não descrevia I, §§9 e 22 (`en-US/ch001.md:49,87`: “my spouse”, “Christ is the spouse”), corretamente vertidos com “esposo” minúsculo. Corrigida a documentação, sem normalizar a capitalização dos capítulos.
- Rejeitado: exigir exclusividade lexical de “esposa/esposo” para *spouse*. I, §§23–24 (`en-US/ch001.md:89,95`: “wife”), §31 (`:109`: “bride”, “Bridegroom”, “Spouse”), e III, §10 (`en-US/ch003.md:33`: “bridegroom”) sustentam os equivalentes portugueses; não há troca de referente ou do sentido nupcial.
- Rejeitado: tratar como omissões as diferenças nas contagens de *virgin*, *modesty* e *veil*. I, introdução e resumo do cap. 12 (`en-US/ch001.md:5,195`: “virgin life”) e III, §8 (`en-US/ch003.md:25`: “virgin flight”) admitem “virginal”; I, resumo do cap. 7 (`en-US/ch001.md:113`: “their spouse”) explicita “das virgens”; II, §32 (`en-US/ch002.md:81`: “for the virgin who was seized for the virgin”) retoma a virgem por “dela”; II, §19 (`:51`: “modestly”) usa “com pudor”; III, §35 (`en-US/ch003.md:99`: “to veil their modesty”) usa o verbo “resguardar”, não o substantivo “véu”.
- Rejeitado: substituir Dámon por Dâmon, ou Sanir/Hermon por outras variantes. II, resumo do cap. 5 e §34 (`en-US/ch002.md:87,89`: “Damon and Pythias”) e I, §38 (`en-US/ch001.md:127`: “Sanir and Hermon”) conservam nomes reconhecíveis em português; Dámon é forma portuguesa atestada, e Sanir/Hermon ocorrem também em `jerome/perpetual-virginity-of-blessed-mary/pt-BR/ch001.md:49`. A variação não constitui nome errado.
- Evidência: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-5.md`.

### Round 6

- 2026-10-02. Foco: completude e alinhamento integral parágrafo a parágrafo, citações, apartes, frases e referências bíblicas; auditoria mecânica 1–6, `book.json` e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma alteração nos capítulos, metadados ou Termos.
- Rejeitado: supressão de fala em III, §1 (`en-US/ch003.md:7`, “You,” said he, “my daughter”). O destino desloca “disse” para antes da citação; há um par de aspas a menos, mas a fala permanece completa.
- Rejeitado: diferenças de contagem de frases como indício de omissão em I, §§23, 42, 52 (`en-US/ch001.md:89,139,163`), e II, §§13, 28, 29, 32, 34 (`en-US/ch002.md:35,73,75,81,89`). Reticências, interrogação em aparte, integração de pontos internos e redistribuição de pontuação explicam as diferenças; não se suprimiu proposição nem se fundiu ou dividiu parágrafo.
- Rejeitado: falta do §36 no Livro III (`en-US/ch003.md:99,101`, “35.” → “37.”); o salto já está na fonte. Rejeitado também normalizar “Judite x” (`en-US/ch002.md:65`, “Judith x”): o nome foi localizado e o numeral romano preservado conforme a edição.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-6.md`.

### Round 7

- 2026-10-02. Foco: leitura bilíngue integral, oração por oração, com atenção a negações, agentes, tempos, qualificadores e redação das citações; auditoria mecânica 1–6, `book.json` e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, sem alterações nos capítulos, metadados ou Termos.
- Rejeitado: I, §65 (`en-US/ch001.md:203`), “Make the most you can of my wealth”. “Exagerai quanto puderdes minha riqueza” admite o sentido de dar o máximo relevo à riqueza, no encadeamento retórico com “boast of his nobility, extol his power”; não se exige a leitura de administrar ou aproveitar materialmente os bens.
- Rejeitado: II, §32 (`en-US/ch002.md:81`), “For the sentence is changed for a former one”. “Pois a sentença é trocada por uma anterior” acompanha a direção expressa na fonte; não cabe inverter a troca por conjectura, nem harmonizá-la com outra redação.
- Rejeitado: III, §28 (`en-US/ch003.md:81`), “I know which to have in the greatest horror”. “Sei qual dos dois devo ter em maior horror” preserva a afirmação do inglês; inserir “não” contrariaria a fonte, cuja frase seguinte compara o perjúrio aos juramentos dos tiranos.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__ambrose__concerning-virgins/evidence/review-7.md`.
