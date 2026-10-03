# Diário de tradução — Vida de Paulo, o Primeiro Eremita (pt-BR)

Fonte: `en-US/ch001.md`, única língua disponível no livro; não há diretório `la/`.
Destino: `pt-BR/ch001.md`.

## Termos e precedentes

Consultados os capítulos, diários e metadados de `jerome/life-of-s-hilarion` e `jerome/perpetual-virginity-of-blessed-mary`; seus `sources` identificam as traduções inglesas de origem.

| Inglês | Português | Observação |
|---|---|---|
| Jerome | São Jerônimo / Jerônimo | Forma dos metadados / nome no texto, conforme as obras irmãs |
| Paulus / Paul | Paulo | Inclusive Paulo de Tebas e Paulo de Concórdia |
| Antony | Antão / Antônio | Antão, o monge; Antônio, unido a Cleópatra (§5) |
| Elias / John / Athanasius | Elias / João / Atanásio | Nomes portugueses |
| Amathas / Macarius | Amatas / Macário | Discípulos de Antão |
| Decius / Valerian / Cornelius / Cyprian | Décio / Valeriano / Cornélio / Cipriano | |
| hermit life / monk / monastery / cell | vida eremítica / monge / mosteiro / cela | Vocabulário monástico das obras irmãs |
| blessed / brethren / cloak | bem-aventurado / irmãos / manto | |
| Saracens / Gentiles / Thebaid | sarracenos / gentios / Tebaida | Vocabulário histórico |
| Fauns / Satyrs / Incubi / Hippocentaur | faunos / sátiros / íncubos / hipocentauro | Seres descritos pela fonte |
| Ecclesiastes / Gehenna | Eclesiastes / Geena | Referência bíblica com numeração inalterada |

## Decisões — 2026-10-02

- Tradução integral nesta sessão, sem perguntas nem subagentes. Política padrão de excluir notas editoriais de rodapé; nenhuma está presente. A introdução editorial foi traduzida integralmente como texto corrido. Sem notas do tradutor.
- Preservados os parágrafos, a ordem, o título, os dois versos em bloco de citação e as 18 seções, com números em negrito inerte. Aspas curvas e pronomes reverenciais em minúsculas, conforme as obras irmãs. Tratamento singular por “tu”; apóstrofe aos ricos por “vós”.
- Citações traduzidas das palavras da fonte inglesa, sem harmonização com outra Bíblia; Eclesiastes 3:7 permanece no lugar original. As alusões sem referência não recebem referências novas.
- Metadados pt-BR apenas nos campos existentes `name`, `author`, `languages` e título do sumário. Sem descrição nova. Build reservado ao orquestrador por instrução do usuário.

## Expressões e particularidades

- *Gubba* (§6) conserva o itálico e a explicação da fonte; é o nome siríaco da cisterna, não inglês sem tradução.
- `to be dissolved` (§11): “deixar esta vida”, mantendo a associação com estar com Cristo; `falling asleep`: “adormecer”, imagem da morte.
- `intestate dead` (§16): “morto que não deixara testamento”, preservando a metáfora jurídica da herança da túnica.
- Conservadas as afirmações da edição, inclusive os 113 anos de vida celeste na terra (§7), o “capacete da esperança” (§8) e a formulação da resposta de Paulo sobre orações e ameaças (§9), sem reconstrução a partir do latim ausente.

## Alterações na fonte

Nenhuma.

## Review log

### Round 1

- Foco: completude, parágrafo a parágrafo, citações, apartes e referências; auditoria mecânica 1–6 e metadados. Fonte: `en-US/ch001.md`.
- Veredito: CLEAN. Nenhum defeito confirmado; nenhuma correção no capítulo, nos metadados, nos termos ou nas afirmações deste diário.
- Achados considerados e rejeitados:
  - §§5–7 e 12, fonte linhas 13, 15, 17 e 32: os apartes entre parênteses (“so eager are men…”, “called in the country dialect…”, “as he himself was wont to declare”, “why should he indeed…”) estão preservados entre travessões. Mudança de delimitador não é omissão.
  - §7, fonte linha 17, “the life of heaven for a hundred and thirteen years”; §8, linha 19, “the helmet of hope”; §9, linha 26, “Prayers like these do not mean threats”: as formulações portuguesas reproduzem as peculiaridades do inglês canônico disponível; não corrigir com base em outra edição ou na memória bíblica.
  - §§10–12, fonte linhas 28, 30 e 32: “began to address Antony.”, “fellow-servant; but” e “a single word; then” recebem pontuação portuguesa diferente, mantendo integralmente as orações no mesmo parágrafo. Variação na contagem de períodos não indica fusão ou divisão de parágrafos.
  - §11, fonte linha 30, “to be dissolved and to be with Christ”: “deixar esta vida e estar com Cristo” conserva o sentido da morte desejada e da união com Cristo; não há oração omitida. §16, linha 40, “intestate dead”: “morto que não deixara testamento” explicita exatamente o adjetivo jurídico.
- Evidência: `.claude/codex-runs/runs/church-fathers__jerome__life-of-paulus-the-first-hermit/evidence/review-1.md`.

### Round 2

- Foco: fidelidade bilíngue, oração por oração, de todo o capítulo; auditoria mecânica 1–6, metadados e afirmações verificáveis do diário. Fonte: `en-US/ch001.md`, único idioma-fonte disponível.
- Veredito: ISSUES 1; corrigido.
- §11, `pt-BR/ch001.md`, linha 30: “depositar meu pobre corpo no chão” → “sepultar meu pobre corpo na terra”. A fonte, linha 30, diz “to lay my poor body in the ground, yea to return earth to earth”: pede sepultamento, não deposição na superfície; o enterro narrado no §16 confirma o sentido.
- Achados considerados e rejeitados:
  - §7, fonte linha 17, “with swift flight”: “numa corrida veloz” é defensável; flight também expressa deslocamento rápido, e o sujeito é a criatura meio cavalo, sem asas mencionadas.
  - §8, fonte linha 19, “whose sound has gone forth into all the earth”: “cuja voz se espalhou por toda a terra” mantém o anúncio, o possessivo singular e o alcance universal; não introduz o plural de uma versão bíblica familiar.
  - §11, fonte linha 30, “the rites of hospitality”: “os deveres da hospitalidade” exprime as práticas de acolhimento invocadas por Paulo para deferir ao hóspede; não se exige um rito litúrgico.
- Evidência: `.claude/codex-runs/runs/church-fathers__jerome__life-of-paulus-the-first-hermit/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral de pt-BR antes de abrir o capítulo-fonte, seguida de conferência das marcações no inglês e varredura ortográfica; auditoria mecânica 1–6, metadados e diário.
- Veredito: CLEAN. Nenhum defeito confirmado; nenhuma correção no capítulo, nos metadados, nos termos ou nas afirmações anteriores deste diário.
- Achados considerados e rejeitados:
  - §8, fonte linha 19, “tears, the marks of his deep feeling, which he shed”: em “lágrimas, sinais de sua profunda emoção, que derramava”, o relativo retoma “lágrimas” após o aposto; Antão é o sujeito elíptico. A distância do antecedente não torna o pronome irresolúvel.
  - §12, fonte linha 32, “exhausted as he was with fasting and broken by age, his courage”: “embora exausto pelo jejum e debilitado pela idade, sua coragem” admite a elipse de “ele estivesse”, referida a Antão, já sujeito das frases anteriores. Os adjetivos não qualificam “coragem”; não se confirmou erro de concordância.
  - §14, fonte linha 36, “longing for him alone, thirsting to see him”: “ansiando somente por ele, sedento de vê-lo” retoma Paulo, destinatário da viagem de regresso; Antão permanece sujeito. A alternância de referentes corresponde à fonte e é recuperável no contexto.
  - §16, fonte linha 40, “he said: If I return to the monastery”: o pensamento após “disse:” não recebe aspas em nenhuma das línguas. A delimitação por dois-pontos é válida; não há aspa perdida.
  - §9, fonte linha 24, “To whom the hero thus brief answer made”: a linha “Ao que o herói deu esta breve resposta”, sem pontuação final, introduz a fala seguinte como na fonte; não é trecho truncado.
- Evidência: `.claude/codex-runs/runs/church-fathers__jerome__life-of-paulus-the-first-hermit/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas de referentes/gênero/tratamento; auditoria mecânica 1–6, metadados e afirmações verificáveis do diário. Fonte: `en-US/ch001.md`.
- Veredito: CLEAN. Nenhum defeito confirmado; nenhuma alteração no capítulo, nos metadados, nos termos ou nas afirmações anteriores deste diário.
- Achados considerados e rejeitados:
  - §4, fonte linha 11, “His brother-in-law” e “a wife's tears”: “Seu cunhado” e “as lágrimas da esposa” não impõem parentesco novo; a irmã recém-casada e a esposa que tenta dissuadir o traidor sustentam a identificação contextual.
  - §11, fonte linha 30, “each … nearest to himself, pull towards him”: “cada um … mais próximo de si, puxaria para si” resolve corretamente o pronome pelo gesto distributivo de partir o pão, sem deslocá-lo para o companheiro.
  - §12, fonte linha 32, “his friend's regrets at his decease” e “Athanasius and his cloak”: “dor do amigo por sua morte” refere a morte de Paulo e a dor de Antão; “Atanásio e de seu manto” admite a relação com o doador, e a fala anterior já explicita que o destinatário do manto é Antão. Não há atribuição do manto a Paulo.
  - §16, fonte linha 40, “even dumb animals felt His divinity”: “até os animais mudos sentiam sua divindade” retoma Cristo, expressamente nomeado na oração anterior; a minúscula não muda o referente.
  - §§17–18, fonte linhas 42–44, “those … Your … you” e “reader, whoever you may be”: vós dirige-se ao grupo de ricos e tu ao leitor individual; a mudança de destinatário justifica a mudança de número. O masculino genérico de “leitor” não restringe o público.
  - §18, fonte linha 44, “Paul's tunic with his merits … kings with their punishment”: “seus méritos” refere Paulo e “seu castigo”, os reis; o paralelismo permite recuperar os antecedentes sem emenda dos possessivos.
- Evidência: `.claude/codex-runs/runs/church-fathers__jerome__life-of-paulus-the-first-hermit/evidence/review-4.md`.
