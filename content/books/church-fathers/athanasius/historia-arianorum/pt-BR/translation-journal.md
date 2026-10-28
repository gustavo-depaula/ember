
## Termos

| Secundus (de Pentápole e de Barca) / Stephanus / Barka / Pentapolis | Segundo / Estêvão / Barca / Pentápole | |
| Costyllius | Costílio | diminutivo depreciativo de Constâncio; nota do tradutor em ch008 |
| Ahab / Doeg / Ziphites / Nob / Pharaoh / Barabbas / Pilate | Acab / Doeg / zifeus / Nob / Faraó / Barrabás / Pilatos | |
| Hosius / Olympias / Zenobia / Paul of Samosata | Ósio / Olímpia / Zenóbia / Paulo de Samósata | |
| Vetranio / Magnentius / Gallus | Vetrânio / Magnêncio / Galo | |
| Germinius / Cyzicus / Sirmium / Cecropius / Laodicea / Nicomedia | Germínio / Cízico / Sírmio / Cecrópio / Laodiceia / Nicomédia | |
| Auxentius / Dionysius / Epictetus / Felix / Paulinus / Lucifer / Ursacius / Valens | Auxêncio / Dionísio / Epicteto / Félix / Paulino / Lúcifer / Ursácio / Valente | |
| Euzoius the Chananæan / Sarapion surnamed Pelycon / Sisinnius | Euzóio, o cananeu / Sarapião, de sobrenome Pélicon / Sisínio | |
| Meletians / Valentinians | melecianos / valentinianos | |
| Syrianus / Maximus / Arbæthion / Collianus | Siriano / Máximo / Arbecião / Coliano | “Collianus” mantido como na fonte |
| Mechir / Preparation | Mequir / Parasceve | |
| Controllers / masters of vessels | intendentes / capitães dos navios | |
| son of lawlessness / falling away | filho da iniquidade / apostasia | 2 Tessalonicenses 2:8 e 2:3 |

## Decisões

- ch008: os parágrafos que começam com “64.” e “69.” levam o número em negrito inerte (`**64.**`, `**69.**`).
- ch008 § 66: o apóstrofo à heresia (“O new heresy, that hast…”) vai em *tu*.
- ch008 § 76: os bispos dirigem-se a Constâncio em *tu* (singular da fonte); Constâncio dirige-se aos bispos em *vós* (“deveis crer”).
- ch008 §§ 79–80: *vós* nas orações a Deus (Joel 2:17; “nem servimos à criatura mais do que a vós”) e no imperativo plural de Isaías 52:11.
- ch008 § 80: “Your word” e “the same Word” ficaram ambos como “Verbo”, pois designam o Filho.
- ch008 § 79: “Epicritian players” → “atores epicricianos”, sem nota, por não haver certeza sobre a alusão.
- ch008 § 81: “the Preparation” → “a Parasceve” (a sexta-feira); “Court” (§ 76) → “corte”.
- ch008 § 75: “forsooth”, irônico, → “pretensamente”.
- Notas do tradutor em ch008: [^1] (Zenóbia), [^2] (Costílio, diminutivo depreciativo de Constâncio), [^3] (mês de Mequir).

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of ch001–ch008, the footnotes, the journal and book.json. Two fixes: a contrastive connector rendered as a parallel one (ch003 [18]) and an ambiguous subject that inverts the sense (ch007 [8]). The audit flags are not defects.
- `pt-BR/ch003.md` [18]: “que, assim como antes ordenara que se vigiassem os caminhos, agora lhe concedessem livre passagem” → “que, embora antes tivesse ordenado que se vigiassem os caminhos, agora lhe concedessem livre passagem” — source: 'whereas he had before commanded the ways to be guarded, they should now grant him a free passage'. The relation is contrastive; 'assim como' wrongly presents the two orders as parallel. *(meaning)*
- `pt-BR/ch007.md` [8]: “Mas não se deixou persuadir por Eusébio e os seus” → “Mas o pai não se deixou persuadir por Eusébio e os seus” — source: 'but he would not be persuaded', where 'he' is the father, Constantine. After the parenthesis, the unexpressed subject reads as Constantius (the paragraph's subject) or Constantine II, which reverses the sense. *(meaning)*
- Rejected: pt-BR/ch001.md [11] and the other emphasis flags — inline paragraph numbers bolded (**5.**) where the source has plain numbers — This is a consistent house format applied across the book and recorded in the journal for ch008. It is not a content change.
- Rejected: pt-BR/ch005.md [10] — parenthesis '(for theirs is a pleasure-loving race…)' dropped — The content is kept in full as its own clause after the sentence was split. Nothing is lost.
- Rejected: pt-BR/ch006.md [7]–[8] — unbalanced quotes — The letter's quotation opens in the heading and closes at the end of the letter, as in the source.
- Rejected: pt-BR/ch008.md [23] — repeated word 'Daniel Daniel' — The second 'Daniel' begins the inline Scripture reference 'Daniel 7:25', following the source's reference style.
- Rejected: pt-BR/ch008.md [8] — apostrophe to the heresy continues in the second person where the source turns to the third ('it is but a lately invented evil') — The journal records this as a decision. The sense is unchanged.

### Round 2 (codex, full read)
Verdict: 9 meaning-level, 0 minor. Leitura integral de ch001–ch008, das notas, do diário, de book.json e dos apontamentos da auditoria: nove defeitos de sentido.
- `pt-BR/ch003.md` [29]: “ele fora tirado por mãos sacrílegas” → “ele fora morto por mãos sacrílegas” — “Taken off” significa aqui morto, não simplesmente retirado. *(meaning)*
- `pt-BR/ch003.md` [31]: “exceto uns dois ou três, e esses homens de caráter suspeito,” → “exceto uns dois ou três, homens de caráter suspeito,” — “And those men of suspected character” caracteriza os dois ou três excetuados; a tradução os apresenta como outro grupo que recebeu Atanásio. *(meaning)*
- `pt-BR/ch004.md`: “à perdiz que choca ovos que não pôs e, no meio dos seus dias, os perde.” → “à perdiz que choca ovos que não pôs.” — Em Jeremias 17:11, quem perde as riquezas no meio dos seus dias é o homem injusto; a nota atribui essa oração à perdiz e aos ovos. *(meaning)*
- `pt-BR/ch005.md` [4]: “Não respeitaram o seu episcopado, por ser um trono apostólico.” → “Não respeitaram o seu episcopado, embora fosse um trono apostólico.” — O caráter apostólico deveria motivar respeito; não é apresentado como motivo do desrespeito. *(meaning)*
- `pt-BR/ch005.md` [4]: “Não sentiram reverência alguma por Roma, por ser ela a metrópole da România.” → “Não sentiram reverência alguma por Roma, embora ela seja a metrópole da România.” — A condição de metrópole é razão desconsiderada para reverenciar Roma, não causa da falta de reverência. *(meaning)*
- `pt-BR/ch007.md` [4]: “Deus era tudo em todos para o santo homem.” → “Deus era tudo para o santo homem.” — “All in all to the holy man” significa que Deus era tudo para Elias; não afirma que era tudo em todas as pessoas. *(meaning)*
- `pt-BR/ch007.md` [6]: “ou se considerassem seus inimigos.” → “ou se considerassem inimigos do imperador.” — A ameaça declara inimigos de Constâncio aqueles que não perseguirem Atanásio; “seus” aponta para Atanásio e permite inverter o sentido. *(meaning)*
- `pt-BR/ch007.md` [16]: “Este tornou públicos os decretos do imperador” → “Heráclio tornou públicos os decretos do imperador” — Quem publica os decretos é Heráclio. Depois da divisão da frase, “Este” aponta para Atanásio, o último nome mencionado. *(meaning)*
- `pt-BR/ch008.md` [17]: “se simplesmente lhes apetece inventar acusações contra eles, estes têm de ser condenados.” → “se simplesmente lhes apetece inventar acusações contra eles, os próprios acusadores têm de ser condenados.” — “They must be condemned” refere-se aos acusadores: tentar acusar coletivamente todas essas regiões denuncia a falsidade da acusação. “Estes” transfere a condenação às vítimas. *(meaning)*

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de ch001–ch008, notas, diário e book.json: as correções da rodada 2 estão aplicadas e não há novos defeitos objetivos.
- Rejected: pt-BR/ch001.md [10] — “his mother” committed to “a mãe do imperador” — Eustácio foi acusado de insultar Helena, mãe de Constantino; o compromisso está correto.
- Rejected: pt-BR/ch004.md [6] — “Como cães, voltam ao próprio vômito” deixa de depender de “persuadem” — A comparação continua a descrever a mesma mudança de lado; o sentido não se altera.
- Rejected: pt-BR/ch005.md [3] nota [^3] — Deuteronômio 23:1 em vez de 23:2 — A numeração varia entre edições (Almeida usa 23:1); a citação não está errada.
- Rejected: pt-BR/ch008.md [17] — “os próprios acusadores têm de ser condenados” (correção da rodada 2) — O grego (ἵνα, κἂν θελήσωσι συκοφαντεῖν, καταγνωσθῶσιν) e a frase seguinte confirmam que acusar todos em bloco desmascara os próprios acusadores.
- Rejected: pt-BR/ch008.md [41] — quinto dia antes dos idos de fevereiro igualado ao 14 de Mequir — A equivalência é da fonte e foi traduzida sem alteração.
- Rejected: pt-BR/ch007.md [29] — parênteses acrescentados — “(pois é isso o que são)” traduz o inciso da fonte, que vem entre vírgulas; não há conteúdo novo.
