# Diário de tradução — O pequeno alfabeto do monge na escola de Deus (pt-BR)

Fonte: la/, *Thomae Hemerken a Kempis Parvum alphabetum monachi*, ed. M. J. Pohl (Freiburg: Herder 1904), *Opera omnia* III; OCR bruto do archive.org.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Thomas a Kempis | Tomás de Kempis | Convenção das obras irmãs e dos metadados. |
| Parvum alphabetum monachi in schola Dei | O pequeno alfabeto do monge na escola de Deus | Título estabelecido nos metadados. |
| monachus / religiosus / clericus | monge / religioso / clérigo | Convenções das obras irmãs. |
| novellus monachus | monge noviço | Apelo final ao principiante. |
| Christus / Deus / diabolus | Cristo / Deus / diabo | Convenções das obras irmãs. |
| Zachaee | Zaqueu | Vocativo; forma portuguesa do nome. |
| humilitas / mansuetudo / patientia | humildade / mansidão / paciência | Virtudes do caminho ensinado por Cristo. |
| paupertas / simplicitas / oboedientia | pobreza / simplicidade / obediência | Convenções das obras irmãs. |
| superbia / despectus | soberba / desprezo | |
| custodia cordis et oris | guarda do coração e da boca | Convenção das obras irmãs; expressa por verbos no texto. |
| evagatio / distractio / dissolutio | divagação / dispersão / dissipação | Distinção entre desvio interior, dispersão e falta de recolhimento. |
| consolatio / solacium | consolação | Convenção das obras irmãs. |
| praelatus / scriptura | superior / Escritura | Vocabulário da orientação espiritual. |
| saeculum / saecularis | mundo / mundano | Convenções das obras irmãs. |
| communia / singularia | práticas comuns / singularidades | Observância comum e práticas individuais que dela se afastam. |
| beatitudo / regnum Dei | bem-aventurança / reino de Deus | Convenções das obras irmãs. |
| sui ipsius abnegatio | própria abnegação | Encerramento; ver Decisões. |
| Amen | Amém | Convenção das obras irmãs. |
| tu, dirigido ao leitor | tu | Conservado também nas interpelações ao monge noviço e ao irmão Zaqueu. |

## Decisões

- Conservados os 22 parágrafos da fonte, inclusive os dois itens numerados XIII e os agrupamentos XVI–XVII e XVIII–XIX. Os numerais autorais aparecem como texto em negrito.
- A ordem alfabética corresponde às iniciais latinas das máximas; não se forçaram iniciais equivalentes em português.
- Corrigidas na leitura as corrupções evidentes de OCR: “squia” como *quia*, “infinum” como *infimum*, “domi-s natus” como *dominatus*, “isin” como *in* e “150mne” como *omne*. Descartados os resíduos isolados “s”, “2” e “or”, além de sinais intrusivos e falhas de espaçamento.
- Em XII, “ascensor eius” foi vertido por “aquele que sobe por sua instigação”, mantendo a referência ao diabo; “cum ad breve dominatus fuerit pauperum”, por “depois de ter dominado os pobres por breve tempo”.
- Em VIII, “gratiam ab omnibus” significa o favor recebido das pessoas; foi traduzido por “o favor de todos”.
- Em XX, conservada a imagem comercial de vender a Deus as próprias comodidades e comprar Cristo pelo amor.
- No encerramento, “contemptu et sui ipsius abnegatione” foi entendido como desprezo de si mesmo e própria abnegação; “velle suum et nolle” conserva a oposição entre querer e não querer.
- Não foram acrescentadas notas do tradutor; as decisões textuais e a estrutura alfabética estão documentadas neste diário.

## Review log

### Round 1 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Lidos integralmente os 22 parágrafos, os metadados, o diário e os apontamentos mecânicos; encontrados dois desvios de sentido.
- `pt-BR/alphabetum.md` [9]: “Humilha-te em tudo e diante de todos” → “Humilha-te em tudo e coloca-te abaixo de todos” — “Sub omnibus” significa abaixo de todos; “diante de todos” muda a relação de humildade para a presença de outras pessoas. *(meaning)*
- `pt-BR/alphabetum.md` [16]: “Em teu agir, procura sempre saber primeiro se agradas ou desagradas a Deus” → “Em toda obra tua, procura sempre saber primeiro se ela agrada ou desagrada a Deus” — O sujeito de “placeat vel displiceat” é a obra: deve-se examinar se ela agrada a Deus, não se a própria pessoa lhe agrada. *(meaning)*
- Rejected: pt-BR/alphabetum.md [2–22] — O audit aponta diferenças nos marcadores de ênfase. — As diferenças correspondem exclusivamente ao negrito dos numerais autorais, conforme a convenção exigida e registrada no diário.

### Round 2 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of all 22 paragraphs, book.json and the journal: the text is clean; one minor fix to a Key Terms row that names forms which do not occur.
- `pt-BR/translation-journal.md`: “| se abnegare / sui ipsius abnegatio | renunciar a si mesmo / abnegação de si mesmo | Vocabulário da renúncia à própria vontade. |” → “| sui ipsius abnegatio | própria abnegação | Encerramento; ver Decisões. |” — "se abnegare" does not occur in the source, and "abnegação de si mesmo" does not occur in the translation; [22] renders "sui ipsius abnegatione" as "pela própria abnegação", as the Decisões section states
- Rejected: pt-BR/alphabetum.md [7] — "non potes satis esse Deo et hominibus" rendered as "dedicar-te plenamente" rather than "satisfazer" — Both say that one cannot fully answer to God and to men at once; the sense is kept.
- Rejected: pt-BR/alphabetum.md [2–22] — The audit flags differing emphasis markers. — The only difference is the bold on the author's numerals, which the house rule requires; round 1 already rejected this.
- Rejected: pt-BR/alphabetum.md [22] — "A contemptu et sui ipsius abnegatione" rendered as "desprezo de si mesmo e pela própria abnegação" — Reading "sui ipsius" as governing both nouns is defensible, and the journal documents the choice.

### Round 3 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificada a correção da tabela de termos e sua coerência com as Decisões: nenhum defeito encontrado. Nenhum parágrafo de capítulo foi alterado ou apresentado nesta rodada.
