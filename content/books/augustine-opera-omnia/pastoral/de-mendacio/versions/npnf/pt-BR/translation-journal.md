# Diário de tradução — Sobre a Mentira (pt-BR)

Fonte: en-US/ch001.md (H. Browne, conforme os metadados existentes). Não há diretório la/; o inglês local é a fonte desta tradução.
Destino: pt-BR.

## Termos

| Inglês | Português | Convenção |
| --- | --- | --- |
| Augustine of Hippo | Agostinho de Hipona | Conforme `patience` e `continence`, inclusive seus metadados e fontes. |
| On Lying / Against Lying | Sobre a Mentira / Contra a Mentira | Padrão dos títulos das obras irmãs. |
| Retractations | Retratações | Conforme `patience`. |
| lie / falsehood / deceit | mentira / falsidade / engano | Preservada a distinção entre dizer algo falso e mentir. |
| believe / opine / know | crer / opinar / saber | Distinção explícita do autor. |
| double heart | coração duplo | Dupla intenção ou pensamento, conforme a explicação do texto. |
| lust / chastity / righteousness / charity | concupiscência / castidade / justiça / caridade | Conforme `continence` e `patience`. |
| mind / soul / spirit | mente / alma / espírito | Preservadas as distinções da fonte. |
| Holy Spirit | Espírito Santo | Conforme as obras irmãs. |
| pudicity / chastity / purity | pudor / castidade / pureza | Nos §§40–42, preservada a distinção entre pudor do corpo e castidade da mente. |
| faith / perfect faith | fé / fidelidade perfeita | Nos §§41–42, fidelidade à verdade; preservada a explicação etimológica de fé, sem acrescentar palavras latinas ausentes. |
| detraction / backbiting | detração / maledicência | Preservada a variação das citações nos §§31 e 33. |
| Firmus / Thagasta / Consentius | Firmo / Tagaste / Consêncio | Mantido o jogo entre Firmo e firme no §23. |
| Abraham / Isaac / Jacob / David | Abraão / Isaac / Jacó / Davi | Conforme as obras irmãs. |

## Decisões

- 2026-10-02: Tradução integral do inglês local, por seções, com os mesmos parágrafos e números em negrito. Introdução editorial e excerto das Retratações no corpo conservados. Notas editoriais de rodapé são omitidas por padrão; não há notas de rodapé na fonte.
- Aspas curvas e pronomes divinos em minúsculas, seguindo `patience` e `continence`. Citações bíblicas traduzidas da redação da fonte, sem substituição por versão bíblica portuguesa; nomes dos livros em português, números das referências preservados.
- Latim conservado nos trechos em que a fonte o apresenta, com a explicação traduzida quando existente. Sem notas novas do tradutor.
- Metadados: pt-BR apenas nos campos existentes `name`, `author`, `languages` e título do sumário. Sem descrição nova, sem build e sem operações de alteração do estado do Git, conforme a instrução desta execução.

## Particularidades da edição

- §32: mantida a construção de `is but then defiled ... but is defiled` como “só seja maculado ... mas seja maculado”, sem acrescentar uma negação ausente no inglês. §35: `moral life` traduzido como “vida moral”, sem emenda conjectural para mortal.
- A fonte não apresenta referências bíblicas numéricas; foram preservados os nomes e indicações existentes, sem acrescentar remissões. O título latino e o início latino citado nas Retratações permanecem como na fonte.
- Os argumentos favoráveis à mentira são apresentados antes da conclusão contrária do autor; preservadas suas afirmações e sua ordem, sem harmonizá-las antecipadamente.

## Alterações na fonte

- Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, citações, incisos e referências bíblicas, além da auditoria mecânica e da verificação do diário. Veredito: **ISSUES 2**, ambos corrigidos.
- §2 (`ch001.md`, linha 13): “almas perfeitas” → “mentes perfeitas”. A fonte traz “perfect minds”; a troca por alma contrariava a distinção `mind / soul / spirit` da tabela de Termos. Mantida a convenção existente.
- §31 (`ch001.md`, linha 73): “nem o julgamento, quando pune, passará por ele” → “nem o julgamento, quando pune, o deixará impune”. Em “neither shall the judgment when it punishes pass by him”, `pass by` significa deixar o culpado de lado: ele não escapará à punição. A redação anterior não conservava esse sentido da negação.
- Considerados e rejeitados: §32 (fonte, linha 75), “is but then defiled ... but is defiled”, e §35 (linha 81), “moral life”: as dificuldades já registradas pertencem à fonte canônica; não cabe inserir negação nem substituir “moral” por “mortal”. §39 (linha 89), “it is right ... to redeem them even by sins of lesser moment”, e §41 (linha 93), “may on behalf of pudicity of body be admitted”: são etapas do argumento, não omissões de uma negação; a conclusão contrária vem no §42. §30 (linha 71), “communicate unto him, that teaches in all things”: “reparta todos os bens com aquele que o instrui” exprime a partilha material tratada no contexto, sem acréscimo substantivo. §9 (linha 27), “refuse to tell a lie, and thereby slay his own soul”: “recusar-se a mentir e assim matar a própria alma” admite o mesmo alcance da recusa sobre mentir e matar a alma; não se confirmou inversão. Introdução (fonte, linhas 5–9) e citações extensas nos §§31–32: mantida a disposição dos parágrafos da fonte, sem criar blocos independentes que dividissem os parágrafos; não há bloco `>` original perdido.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__lying/evidence/review-1.md` (fora do corpus).

### Round 2

- Foco: leitura bilíngue integral, cláusula por cláusula, com auditoria mecânica e verificação dos termos e das afirmações do diário. Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; nenhuma correção no texto, nos metadados ou nas convenções do diário.
- Considerado e rejeitado: §7 (fonte, linha 23), “they are not altogether lies” → possível “não são inteiramente mentiras”. Mantido “não são de modo algum mentiras”: a alternativa é defensável no contexto dos atos figurativos, expressamente descritos no mesmo parágrafo como “it is no lie”; não há qualificador inequivocamente perdido.
- Reavaliadas e mantidas as rejeições da rodada 1: §9 (fonte, linha 27), “refuse to tell a lie, and thereby slay his own soul”, admite que a recusa reja ambos os infinitivos; §30 (linha 71), “communicate unto him, that teaches in all things”, trata da partilha material no contexto do sustento dos pregadores; §§32 e 35 (linhas 75 e 81), “is but then defiled ... but is defiled” e “moral life”, reproduzem dificuldades da fonte; §§39 e 41 (linhas 89 e 93), “to redeem them even by sins of lesser moment” e “may on behalf of pudicity of body be admitted”, são admissões provisórias anteriores à conclusão do §42.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__lying/evidence/review-2.md` (fora do corpus).

### Round 3

- Foco: leitura integral do português antes da consulta ao capítulo-fonte, seguida de conferência das suspeitas e varredura ortográfica, de acentuação, crase, hífen e pontuação; auditoria mecânica e do diário. Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; texto, metadados e convenções mantidos.
- Considerados e rejeitados: §10 (fonte, linha 29), `to which lust has consented`: “à qual consentiu” admite a regência com a; §14 (linha 37), `to his account ... to theirs`: “à deles” conserva a elipse de conta; §15 (linha 39), `whatever of all these a man may have unjustly suffered`: a ordem de “Seja qual for dessas coisas que um homem tenha sofrido” permite recuperar qual dessas coisas, sem quebra comprovada de sintaxe; §19 (linha 47), `does not hurt himself ... or ... not hurt himself`: a repetição das negativas pertence à fonte, não cabe eliminar uma delas; §23 (linha 57), `being brought before the emperor ... he ... obtained`: Firmo é o referente de “Levado” e o sujeito elíptico de “obteve”, apesar da oração intermediária sobre sua conduta; §25 (linha 61), `not only a just and innocent, but also a culprit`: enumera classes de pessoas protegidas, não atribui culpa e inocência simultâneas ao mesmo caso; §30 (linha 71), `what ... which ... unless it were recalled by an example`: “aquilo” é antecedente recuperável de “sem ser reconduzido ... seria desviado”; §38 (linha 87), `and either ... or`: a pontuação “e, ou ... ou ...” delimita a alternativa, sem erro sintático; §40 (linha 91), `that outermost sense of the soul ... but if it cannot this`: “ela” retoma a sensibilidade, e “isso”, evitar o deleite; §41 (linha 93), `chastity of the mind ... pudicity of the body ... both the one and the other`: “tanto uma como o outro” concorda com castidade e pudor, e “ambos” admite corretamente o plural masculino.
- Mantidas as rejeições anteriores: §7 (fonte, linha 23), `not altogether lies`, admite a leitura já fundamentada pelo contexto figurativo; §9 (linha 27), `refuse to tell a lie, and thereby slay his own soul`, admite recusa sobre os dois infinitivos; §30 (linha 71), `communicate unto him, that teaches in all things`, trata da partilha material; §§32 e 35 (linhas 75 e 81), `is but then defiled ... but is defiled` e `moral life`, conservam dificuldades da fonte, sem inserir negação ou trocar moral por mortal; §§39 e 41 (linhas 89 e 93), `to redeem them even by sins of lesser moment` e `may on behalf of pudicity of body be admitted`, são concessões anteriores à conclusão do §42.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__lying/evidence/review-3.md` (fora do corpus).
