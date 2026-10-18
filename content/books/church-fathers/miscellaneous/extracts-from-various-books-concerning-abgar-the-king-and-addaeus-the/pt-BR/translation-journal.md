# Diário de tradução — Extratos de Diversos Livros Acerca do Rei Abgar e do Apóstolo Adeu (pt-BR)

Fonte: en-US/, tradução de B. P. Pratten em Ante-Nicene Fathers, vol. 8 (1886), revista para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Miscellaneous | Diversos | Conforme miscellaneous/didache e teaching-of-the-apostles. |
| Addæus | Adeu | Conforme miscellaneous/teaching-of-the-apostles. |
| Abgar | Abgar | Forma usual em português. |
| Edessa | Edessa | |
| Marath Mary | Marath Maria | *Marath* (“minha senhora”, siríaco) mantido como título, como na fonte. |
| Mar Jacob | Mar Jacó | Título siríaco *Mar* mantido. |
| overseers / pastors | bispos / pastores | Conforme miscellaneous/teaching-of-the-apostles. |
| priests | sacerdotes | Conforme sibling works. |
| procurator / governor / judge | procurador / governador / juiz | Mantida a variação da fonte. |
| Tiberius the emperor | Tibério, o imperador | |
| Sabina | Sabina | Nome do procurador mantido como na fonte. |
| Seventy-two / Twelve | Setenta e Dois / Doze | Maiúsculas como na fonte. |
| watchers from on high | vigilantes do alto | Os anjos, segundo o uso siríaco. |
| latter Tishrin | Tishrin posterior | Mês siríaco (novembro); mantido o nome. |
| Paneus | Paneias | Forma portuguesa de Paneas (Cesareia de Filipe). |
| Zophenians | zofenianos | Habitantes da Sofena; adaptada a grafia da fonte. |
| Severus / Narcissus | Severo / Narciso | |
| Golgotha | Gólgota | |

## Decisões

- Tratamento: *vós* nos discursos de Adeu dirigidos a ouvintes no plural (§2–3) e na fala do juiz aos sacerdotes; *tu* na súplica dos sacerdotes ao juiz; terceira pessoa com “Vossa Majestade” na carta de Abgar a Tibério.
- O “71.” que abre o fragmento 5 é número do extrato original, formatado como texto em negrito inerte (`**71.**`).
- No título do fragmento 6, os três trechos em itálico separados da fonte foram unidos num só itálico.
- Pronomes pessoais referidos a Cristo em maiúscula (“Ele”) quando a fonte os capitaliza; possessivos e oblíquos em minúscula.
- Os versos da homilia de Mar Jacó (fragmento 7) mantêm um parágrafo por linha, como na fonte.
- Não há notas do editor na fonte; nenhuma nota do tradutor foi necessária.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 (34 paragraphs), the journal and book.json; one false friend fixed in Mar Jacob's homily ('concorriam' → 'concordavam'); the audit flags are deliberate choices recorded in the journal.
- `pt-BR/ch001.md` [27]: “Quando apóstolo e rei concorriam um com o outro,” → “Quando apóstolo e rei concordavam um com o outro,” — source 'concurred the one with the other' means agreed or cooperated; 'concorrer com' in pt-BR means to compete with, which reverses the sense *(meaning)*
- Rejected: pt-BR/ch001.md [14] — audit flag: '71.' set in bold, which the source does not have — the journal records this choice; a line opening with '71. ' would otherwise be parsed as an ordered list, and the bold keeps the number as inert text
- Rejected: pt-BR/ch001.md [16] — audit flag: three italic spans merged into one — the journal records this choice; it is the same italic title, and the split in the source is an artifact
- Rejected: pt-BR/ch001.md [19] — 'for I have been wishing' rendered as 'embora desejasse' — it renders what the letter means (he refrained although he wanted to march); a literal 'pois' would leave the Portuguese confusing; a defensible choice

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 34 parágrafos, do book.json e do diário; nenhum defeito objetivo encontrado. As duas divergências de ênfase apontadas pela auditoria são justificadas pelas decisões registradas.
