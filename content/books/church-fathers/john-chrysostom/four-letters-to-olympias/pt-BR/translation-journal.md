# Diário de tradução — Quatro Cartas a Olímpia (pt-BR)

Fonte exclusiva: en-US/ch001.md (W. R. W. Stephens, NPNF I/9, conforme book.json).
Destino: pt-BR.

## Termos

| en-US | pt-BR | Observação |
|---|---|---|
| John Chrysostom | João Crisóstomo | Metadados conforme as obras irmãs do autor. |
| Olympias / deaconess | Olímpia / diaconisa | |
| Church / bishop / presbyter | Igreja / bispo / presbítero | Conforme Sobre o Sacerdócio. |
| philosophy / philosophic soul | filosofia / alma filosófica | Vida e sabedoria ascéticas; mantém-se a imagem do autor. |
| loving-kindness | benignidade | Conforme Sobre o Sacerdócio. |
| despondency / dejection | abatimento | |
| patient endurance / patience | perseverança paciente / paciência | Conforme o contexto. |
| garland / crown | coroa | Imagens da vitória nos jogos e do prêmio espiritual. |
| Isaurians / Goths | isáurios / godos | |
| Cucusus / Arabissus / Cæsarea | Cucuso / Arabisso / Cesareia | |
| Pharetrius / Dioscorus | Farétrio / Dióscoro | |
| Syncletion | Sinclétion | Transliteração; não se substitui por outro nome hagiográfico. |
| Pœanius / Evethius / Seleucia | Peânio / Evécio / Selêucia | |
| Maruthas / Moduarius / Unilas | Marutas / Moduário / Unilas | |

## Decisões — 2026-10-02

- Precedentes: metadados, diário e capítulos de Carta a uma Jovem Viúva, Carta a Alguns Presbíteros de Antioquia e Sobre o Sacerdócio; suas fontes identificam a tradução inglesa NPNF. Adotados “tu” para Olímpia, aspas curvas “ ” e nomes bíblicos portugueses com a numeração e posição das referências da fonte. As citações são traduzidas do inglês, sem substituição por uma Bíblia portuguesa.
- Mantidos o título Quatro Cartas a Olímpia e as cinco seções epistolares efetivamente presentes no arquivo, na ordem recebida, sem tentar reconciliá-los. Introdução editorial traduzida integralmente. Não há notas de rodapé; aplica-se a opção padrão de excluir notas editoriais, se houvesse.
- Numeração em negrito, sem acrescentar o §1 ausente nas seções que começam sem número. Mesmas divisões de parágrafos e níveis de títulos.
- Fórmulas honoríficas (“your Honour”, “your prudence”, “your Piety”) conservadas como “tua honrada pessoa”, “tua prudência”, “tua piedade”; “my lady” como “minha senhora”.
- Referências aparentemente erradas conservadas, inclusive Isaías 50:7-8 e Mateus 26:28. Jeremias xv e Lucas xvi mantêm os algarismos romanos da fonte. Conservadas também as particularidades narrativas da edição, como “great pain” no episódio dos três jovens e a contagem das cartas enviadas/prontas.
- Acrescentadas traduções apenas a name, author e toc.title e pt-BR a languages; sem criar description nem alterar a proveniência da fonte. Build reservado ao orquestrador.

## Correções da fonte

Somente lapsos inequívocos de digitação/importação em en-US/ch001.md:
- Introdução: “who has a devout Christian” → “who was a devout Christian”.
- Introdução: “induce her to edge Arsacius” → “induce her to acknowledge Arsacius” (palavra mutilada).
- Segunda seção, §2: “upon abed” → “upon a bed”.
- Quarta seção, §3: “trembling. with the expectation” → “trembling with the expectation”.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo e referências bíblicas, com auditoria mecânica 1–6 e metadados. Veredito: 1 defeito, corrigido.
- Correção — terceira seção epistolar, segundo parágrafo, `ch001.md:45`: “não se limitam a repelir [...] dessa natureza: elas pisotearam” → “não repelem [...] dessa natureza, mas pisotearam”. A fonte diz “do not repel [...] but they have trampled”: o texto anterior acrescentava a capacidade de repelir armas físicas, contrariando a negação da fonte.
- Rejeitados: Isaías 50:7-8 e “great pain” (fonte, linha 13), Mateus 26:28 (linha 17) e três cartas enviadas/terceira pronta (linha 59) são peculiaridades explícitas da fonte, já registradas acima; não cabe harmonizá-las. Apartes entre parênteses convertidos em travessões ou integrados à oração (p.ex., “of the sepulchre were broken”, linha 21) conservam o conteúdo. “it” após tratado e carta (linha 39) admite o tratado como antecedente de “o releias”; não há base para impor o feminino. “your prudence” (linha 57) é o honorífico registrado, não uma mudança de destinatário.
- Evidência: `.claude/codex-runs/runs/church-fathers__john-chrysostom__four-letters-to-olympias/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, oração por oração, e auditoria mecânica 1–6, metadados e diário. Veredito: CLEAN; nenhum defeito confirmado ou corrigido.
- Rejeitados: “head and crown of things accounted painful” (fonte, linha 33) → “a maior e suprema das coisas consideradas dolorosas” exprime supremacia; não exige “coroa” do glossário, reservado à imagem do prêmio. “the impossibility of moving about which I always used continually to need” (linha 39) → “a impossibilidade de me movimentar, algo de que sempre tive necessidade constante” admite o movimento como referente da necessidade, conforme o contexto. “patience probation” (linha 67) → “a paciência, virtude provada” conserva a qualidade comprovada pelo sofrimento, explicada pela comparação precedente com o ouro; não é acréscimo doutrinal. Mantidas as rejeições da Round 1, inclusive a ambiguidade de “it” (linha 39), o honorífico “your prudence” (linha 57) e as peculiaridades explícitas da edição.
- Evidência: `.claude/codex-runs/runs/church-fathers__john-chrysostom__four-letters-to-olympias/evidence/review-2.md`.

### Round 3

- Foco: leitura fria do pt-BR, completada por releitura integral em blocos (limitação de truncagem registrada na evidência), seguida de conferência das marcas e varredura de ortografia, diacríticos, crase, hifenização e pontuação; auditoria mecânica 1–6, metadados e diário. Veredito: CLEAN; nenhum defeito confirmado ou corrigido.
- Rejeitados: “rebanhos e manadas inteiras [...] estas [...] aqueles” (fonte, linha 33: “flocks and whole herds [...] the latter [...] the former”) tem concordância regular e referentes recuperáveis, com a mesma distribuição da fonte. A oração sobre a necessidade de movimentar-se (linha 39: “moving about which I always used continually to need”) permite que “algo” retome o movimento; mantida a decisão da Round 2. A transição narrativa para a citação de Paulo (linha 35: “Wherefore also being unable [...] I besought”) é um anacoluto compreensível também presente na fonte, não lacuna. “As” em “os que as arremessam” (linha 45: “the spears [...] those who discharge them”) antecipa “as lanças”, sem erro de gênero. “Contém” (linha 57: “put down those who talk about it”) é o imperativo correto para tu; o honorífico “tua prudência” permanece conforme a Round 1. Mantidas as rejeições anteriores sobre referências, contagem de cartas, “o releias” e “virtude provada”.
- Evidência: `.claude/codex-runs/runs/church-fathers__john-chrysostom__four-letters-to-olympias/evidence/review-3.md`.
