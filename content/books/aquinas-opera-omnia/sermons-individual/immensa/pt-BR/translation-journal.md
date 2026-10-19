# Diário de tradução — Sermão do Ofício — Os imensos benefícios da liberalidade divina (pt-BR)

Fonte: la/ (texto latino das edições Leonina / Marietti, espelhado de aquinas.cc).
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| divina largitas | liberalidade divina | Também *apostolica largitio* → “liberalidade apostólica” ([7]). |
| convivium | banquete | |
| sacramentum | sacramento | |
| species (panis et vini) | espécie (do pão e do vinho) | *aliena species* → “espécie alheia”. |
| sumere | tomar | Usado em todo o texto, também em *sumendus* e *sumitur*. |
| substantialiter convertuntur | convertem-se substancialmente | |
| accidentia sine subiecto | acidentes sem sujeito | |
| hostia | vítima | “no altar da Cruz”. |
| pretium / lavacrum | preço / banho | |
| charismata spiritualia | carismas espirituais | *inpinguatur* → “é nutrida”. |
| Passio / Cena / Pascha | Paixão / Ceia / Páscoa | Maiúsculas como na fonte. |
| memoriale perenne | memorial perene | |
| figurarum veterum impletivum | cumprimento das figuras antigas | |
| Dei potentia | o poder de Deus | |
| gratiarum actiones | ações de graças | |
| Missarum solemnia | a solenidade da Missa | |
| Romanus pontifex Urbanus quartus | o Romano Pontífice Urbano IV | |
| feria quinta | quinta-feira | |
| octavae (Pentecostes, festi) | oitava | No singular, como é usual em português. |
| communicatio fractionis panis | comunhão da fração do pão | Atos dos Apóstolos, sem referência na fonte. |
| distributiones materiales | distribuições materiais | Nota do tradutor 1. |
| stipendia spiritualia | estipêndios espirituais | |
| horae canonicae | horas canônicas | |
| Matutinum, Vesperae, Prima, Tertia, Sexta, Nona, Completorium | Matinas, Vésperas, Prima, Terça, Sexta, Noa, Completas | |
| indulgentia centum dierum | indulgência de cem dias | Nota do tradutor 2. |
| vere poenitentes et confessi | verdadeiramente arrependidos e confessados | |

## Decisões

- Título: “Sermão do Ofício — Os imensos benefícios da liberalidade divina”, com caixa de frase, como se usa em títulos em português. O título do sumário mantém “Immensa”, que é o *incipit*.
- [2]: a frase sobre a nação que tem deuses próximos ecoa Deuteronômio 4:7. A fonte não dá a referência, e a tradução não a acrescenta.
- [2]: *ut homines deos faceret factus homo* → “para que, feito homem, fizesse dos homens deuses”, conservando a fórmula patrística sem atenuá-la.
- [8]: o latim enumera números elípticos (*centum*, *totidem*, *quadraginta*) regidos pelo *tribuit* final. A ordem foi mantida; o primeiro número recebe “dias” para se entender, e os seguintes ficam elípticos como na fonte.
- Nota do tradutor 1 (após [7]): explica as “distribuições” do cabido, termo de direito canônico pouco conhecido.
- Nota do tradutor 2 (após [8]): explica as indulgências contadas em dias, segundo a disciplina anterior a 1967.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of immensa-c01 [1]–[8], footnotes, journal and book.json against the Latin: complete and faithful, no defects found.
- Rejected: pt-BR/immensa-c01.md [6] — *statim post Sancti Spiritus missionem* moved before the quotation from Acts — In the Latin the phrase qualifies *erant perseverantes*. Putting it first in Portuguese keeps that link and avoids attaching it to *orationibus*. No meaning is lost.
- Rejected: pt-BR/immensa-c01.md [3] — *inpinguatur* → “é nutrida” rather than a literal “é engordada/enriquecida” — This is a defensible rendering of the metaphor, and it is recorded in the Key Terms table.
- Rejected: pt-BR/immensa-c01.md [8] — Elliptical numbers (“cem dias … outros tantos … quarenta”) without a repeated noun — The translation follows the source's ellipsis governed by the final *tribuit*. The journal documents this choice, and the sense is clear.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[8], das notas, do diário e de book.json: encontrado um defeito de sentido na nota do tradutor 1.
- `pt-BR/immensa-c01.md`: “Urbano IV acrescenta-lhes uma recompensa espiritual” → “Urbano IV concede aos fiéis presentes às horas canônicas uma recompensa espiritual, em lugar das distribuições materiais” — Na nota 1, «acrescenta-lhes» apresenta a recompensa espiritual como adicional às distribuições materiais; o latim diz «loco distributionum materialium», isto é, em lugar delas. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the round-2 change to translator's note 1 in immensa-c01: the fix matches the Latin ('loco distributionum materialium' → 'em lugar das distribuições materiais'); the note's surrounding text was not shown, so it could not be checked; no defects found.
