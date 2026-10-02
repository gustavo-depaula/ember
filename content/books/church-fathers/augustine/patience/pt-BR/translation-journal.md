# Diário de tradução — Sobre a Paciência (pt-BR)

Fonte: en-US/ch001.md (H. Browne, conforme os metadados existentes).
Destino: pt-BR.

## Termos

| Inglês | Português | Convenção |
| --- | --- | --- |
| Augustine of Hippo | Agostinho de Hipona | Metadados de `augustine/creed` e `care-to-be-had-for-the-dead`; sem honorífico acrescentado. |
| On Patience | Sobre a Paciência | Mesmo padrão dos títulos das obras irmãs. |
| Retractations | Retratações | Conforme `care-to-be-had-for-the-dead`. |
| patience / long-suffering | paciência / longanimidade | A paciência verdadeira distingue-se da obstinação. |
| impassible | impassível | Incapaz de sofrer; não significa insensível. |
| love / charity | amor / caridade | Distinção seguida em `enchiridion`. |
| lust / concupiscence | concupiscência | Conforme `enchiridion`; formas verbais: cobiçar. |
| righteousness / righteous | justiça / justo | Conforme `enchiridion`. |
| free-will / free choice | livre-arbítrio / livre escolha | Preservada a variação da fonte. |
| grace / election of grace | graça / eleição da graça | Gratuidade anterior aos méritos. |
| Abba, Father | Abba, Pai | Conforme `faith-and-the-creed/pt-BR/ch001.md`. |
| Holy Spirit / Word | Espírito Santo / Verbo | Conforme as obras irmãs. |
| Job / David / Abraham / Isaac | Jó / Davi / Abraão / Isaac | Nomes portugueses; Jó conforme `creed`, Davi e Abraão conforme `care-to-be-had-for-the-dead`. |

## Decisões

- 2026-10-02: Tradução integral e exclusiva do inglês fornecido, com a introdução editorial no corpo do capítulo, os mesmos parágrafos e a numeração em `**N.**`. Notas editoriais de rodapé seriam omitidas por padrão; a fonte não contém nenhuma. Glosas entre colchetes e parênteses no corpo são preservadas.
- Aspas curvas e pronomes referentes a Deus em minúsculas, conforme `creed`; tratamento direto a Deus com Vós, interlocutor individual com tu e plural com vós. Títulos divinos mantêm as maiúsculas da fonte.
- Citações bíblicas traduzidas da redação inglesa, sem substituir por uma versão portuguesa nem acrescentar referências ausentes. As remissões da introdução permanecem, inclusive “cap. 12” junto à citação latina, embora o trecho correspondente apareça na seção 9. O latim da introdução permanece sem glosa acrescentada, como na fonte; `a patiendo` conserva a explicação traduzida que o acompanha.
- Metadados: acrescentar pt-BR somente a `name`, `author`, `languages` e ao título do sumário. Sem descrição nova; sem build, conforme a instrução desta execução.

## Expressões

- `leeches` (seção 6): “médicos”, no sentido antigo do inglês, coerente com os cirurgiões da frase anterior.
- `parricide` (seções 4 e 10): “parricida”; mantida a explicação do próprio autor, que abrange o assassinato de parentes, não só do pai.
- `shall prevent me` (seção 18): “se antecipará a mim”, seguindo o sentido antigo de `prevent` e a convenção de `enchiridion`.
- `earnest` (seção 26): “penhor”, antecipação da herança; `shall not perish for ever`: “não perecerá para sempre”, mantido nas repetições e na explicação do fruto eterno da paciência.

## Alterações na fonte

- Nenhuma.

## Review log

### Round 1

- Foco: completude por parágrafo, citações, glosas e remissões; auditoria mecânica e metadados. Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, nos metadados ou nas convenções do diário.
- Considerados e rejeitados: `leeches` (§6, fonte linha 15) significa médicos no contexto dos cirurgiões, não sanguessugas; `chap. 12` (introdução, linha 3) é remissão da própria edição e deve permanecer, embora o episódio esteja em §9; as aspas adicionais em §13 (linha 29) apenas isolam o inciso `say they`, sem acrescentar fala; `Sacrament or Word` (§24, linha 51) designa a Palavra conservada junto do Sacramento, não o Verbo encarnado de §18, logo não contradiz a tabela; `perishes not forever` / `shall not perish for ever` (§§12 e 26, linhas 27 e 55) é esclarecido pelo próprio autor como fruto eterno, justificando a redação registrada no diário.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__patience/evidence/review-1.md` (fora do corpus).

### Round 2

- Foco: leitura bilíngue integral, oração por oração; auditoria mecânica, metadados e verificação do diário. Veredito: ISSUES 2, ambos corrigidos.
- §13 (`ch001.md`, linha 29): “a fim de que, confessando seus crimes, não sejam condenados à morte” → “para não serem condenados à morte ao confessarem seus crimes”. A fonte diz “lest confessing their misdeeds they be ordered to be put to death”: a confissão acarretaria a condenação que a mentira busca evitar; não é uma confissão feita com a finalidade de escapar à morte.
- §21 (`ch001.md`, linha 45): “tanto mais facilmente suportará por sua causa aquilo cujo sofrimento é menor do que o prazer de desfrutá-lo” → “tanto mais facilmente suportará por sua causa aquilo que é menos penoso de sofrer do que essa coisa é agradável de desfrutar”. Em “bear what is less for it to suffer than that is to be enjoyed”, o sofrimento suportado e a coisa desejada são objetos diferentes; “desfrutá-lo” retomava incorretamente o objeto do sofrimento.
- Considerados e rejeitados: §7, fonte linha 17, “For in hope are we saved” → “Pois na esperança fomos salvos”: a passiva inglesa admite estado resultante da salvação recebida; o perfeito português não constitui erro inequívoco. §11, linha 25, “acceptable men” → “homens agradáveis a Deus”: explicita a aceitação divina determinada pelo contexto, sem novo conteúdo. §22, linha 47, “Unless then its love be given to us” → “se o amor desse prazer não nos for dado”: o antecedente imediato é “the pleasure of the Creator”, em contraste com o prazer criado de §21. §25, linha 53, “very-begotten” → “legitimamente gerada”: escolha defensável no contraste com os filhos das concubinas. Mantidas as rejeições da Round 1, pelas razões ali registradas.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__patience/evidence/review-2.md` (fora do corpus).

### Round 3

- Foco: leitura fria integral do pt-BR antes da fonte, seguida de confronto das marcas, varredura ortográfica e auditoria mecânica/metadados/diário. Veredito: CLEAN. Nenhum defeito objetivo confirmado ou corrigido.
- Considerados e rejeitados: §1 (fonte linha 5, “in words to unfold this who can be able?”): a pergunta longa tem retomada em “explicá-la”, sem quebra sintática. §§8–9 (linhas 19–21, “their mind” / “its mind” e “by his own will”): os possessivos retomam, respectivamente, mártires/crueldade e a vontade de Jó; o contexto resolve os referentes. §16 (linha 35, “to the Apostle”): o singular junto à fala plural pertence à fonte e não autoriza corrigir a edição. §18 (linha 39, “show compassion on whom I will have compassion”): “compaixão de” tem regência nominal válida; trocar por “por” não é correção necessária. O possessivo de “Meu Deus, sua misericórdia” também conserva “His mercy” nessa linha. §22 (linha 47, “let not that make the mind ... uplifted”): “não deixe a mente ensoberbecer-se” admite exortação com destinatário genérico implícito, preservando o contraste entre mérito próprio e dom; reformular não é obrigatório. Mantidas as rejeições anteriores pelas razões registradas.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__patience/evidence/review-3.md` (fora do corpus).

### Round 4

- Foco: palavras funcionais, títulos e compromissos de gênero, antecedente e tratamento; revisão integral e auditoria mecânica/metadados/diário. Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, metadados ou termos/afirmações do diário.
- Considerados e rejeitados: §5 (fonte linha 13, “when that is not polluted by lust, then is this distinguished from falsity”): “aquela” retoma a causa e “esta” a paciência, preservando a oposição. §21 (linha 45, “the creature loved approaches itself to the creature loving”): “criatura amada” e “criatura que ama” têm gênero gramatical, sem especificação de sexo; “sua doçura” pertence à criatura amada que oferece a experiência. §24 (linha 51, “which has remained with him”): “com ele” refere-se ao homem separado da Igreja, não cabe o reflexivo “consigo”. §25 (linha 53, “Cast out the bondmaid and her son”; “In Isaac shall your seed be called”; “You have not received”): “Expulsa” e “tua” dirigem-se a Abraão individualmente; “recebestes” dirige-se aos herdeiros plurais. Mantidas as rejeições anteriores pelas razões registradas.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__patience/evidence/review-4.md` (fora do corpus).
