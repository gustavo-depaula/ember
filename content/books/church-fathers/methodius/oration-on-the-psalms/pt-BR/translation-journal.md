# Diário de tradução — Oração sobre os Salmos (pt-BR)

Fonte: en-US/ (trad. William R. Clark, *Ante-Nicene Fathers*, vol. 6, 1886; revisão de Kevin Knight para New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Oration on the Psalms | Oração sobre os Salmos | "oração" no sentido de discurso, como nas orações dos Padres |
| Methodius | Metódio | como em `fragments` |
| Blessed is He that comes in the name of the Lord | Bendito Aquele que vem em nome do Senhor | fórmula fixa em toda a obra |
| Hosanna in the highest / to the Son of David | Hosana nas alturas / Hosana ao Filho de Davi | |
| babes and sucklings | pequeninos e crianças de peito | "sucklings" isolado → "lactentes" |
| perfected praise | aperfeiçoou/aperfeiçoastes o louvor | |
| ass's colt / foal | jumentinho / potro | |
| the Deity / Divinity | a Divindade | maiúscula como na fonte e em `fragments` |
| the Word | o Verbo | |
| Very God / Omnipotent | Deus verdadeiro / Onipotente | |
| coeval | coeterno | como em `fragments` e `concerning-free-will` |
| uncreate | incriada | |
| substance / personality | substância / personalidade | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Chief Shepherd | Príncipe dos pastores | 1 Pedro 5:4 |
| Lover of mankind | Amigo dos homens | |
| long-suffering One | o Longânime | |
| Saviour-God | Deus Salvador | |
| destroyer (Êxodo) | exterminador | |
| palaestra | palestra | lugar de exercício atlético |
| Canaan / Judah | Canaã / Judá | |

## Decisões

- Os números romanos de seção (I.–VII.) ficam como texto simples no início dos parágrafos, como na fonte.
- As referências bíblicas ficam inline na posição da fonte, sem parênteses. Erros da edição (Daniel 3:56 por Daniel 13:56; Ezequiel 3:22 por 3:12; Tiago 1:18) foram mantidos.
- Pronomes que se referem a Deus têm maiúscula quando a fonte os tem (Ele, Lhe, Vós, Vossos). Na apóstrofe a Cristo usa-se *vós*. Os fariseus dirigem-se a Jesus sem reverência e por isso usam *tu* ("Não ouves…", "Te fazes Deus").
- Destinatários: *vós* para irmãos/amados, crianças e judeus no plural; *tu* para o profeta, o "judeu insensato" (até o fim do §IV) e o herege.
- O §VII põe a fala atribuída aos fariseus e a resposta de Cristo entre aspas, com o texto de Isaías 42:8 em aspas simples dentro delas.
- Corrigidos erros tipográficos evidentes da fonte: "very Cod" → "verdadeiro Deus"; "caught tip" → "retomada"; "Blessed is he. that" → fórmula padrão.
- Para maior clareza, períodos longos da fonte foram divididos em várias frases, sem omitir nenhuma oração.
- A ordem entre "loucura" e "da cruz" (1 Coríntios 1:21) foi ajustada à sintaxe portuguesa.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of ch001 [1]–[8], journal and book.json: 2 fixes ('falsely-named' rendered as 'falsos mestres'; 'vingador' dropped from the referent in §VII); both audit flags are false positives
- `pt-BR/ch001.md` [4]: “Ó loucura destes falsos mestres!” → “Ó loucura destes pretensos mestres!” — source: "falsely-named teachers", i.e. teachers in name only; "falsos mestres" in Portuguese means teachers of false doctrine *(meaning)*
- `pt-BR/ch001.md` [8]: “Esse inimigo, sem dúvida, sois vós.” → “Esse inimigo e vingador, sem dúvida, sois vós.” — source: "Which without doubt are you" refers to "the enemy and the avenger"; dropping "vingador" loses the link with the next sentence ("to avenge the glory of God") *(meaning)*
- Rejected: pt-BR/ch001.md [8] — audit: repeated word "despreza despreza" — "quem Me despreza despreza também o Meu Pai" renders "he that despises Me despises My Father also"; the repetition is correct
- Rejected: pt-BR/translation-journal.md — audit: "pequeninos e crianças de peito" ×0 in pt-BR — all 5 occurrences are present with articles as "dos pequeninos e das crianças de peito" ([2], [3], [5] ×2, [8]); the row is correct
- Rejected: pt-BR/ch001.md [5] — "ou reivindicas … ou nos entregas" uses the indicative where the source has the imperative — "ou … ou" with the present indicative is the normal form of an ultimatum in Portuguese; the injunction is clear
- Rejected: pt-BR/ch001.md [3] — "Assim o Espírito Santo soprará também sobre nós" turns the purpose clause ("that … may breathe") into a statement of result — the sentence was split for clarity; the sense of consequence is kept and the content is complete
- Rejected: pt-BR/ch001.md [3] — "do céu e da terra" added after "Senhor de ambos" — a gloss on a referent the context already makes clear; it adds no content

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral de ch001.md [1]–[8], book.json e diário; encontrado um erro menor de concordância, sem defeitos de sentido.
- `pt-BR/ch001.md` [5]: “e é por si mesmas que elevam” → “e é por si mesmos que elevam” — O referente é «os vossos filhos», retomado por «deles» e «os» nas frases anteriores; «mesmos» deve concordar no masculino plural.
- Rejected: pt-BR/ch001.md [8] — Auditoria: repetição «despreza despreza». — Os verbos pertencem a orações distintas: «quem Me despreza» é o sujeito de «despreza também o Meu Pai». A repetição está correta.
- Rejected: pt-BR/translation-journal.md — Auditoria: nenhuma ocorrência de «pequeninos e crianças de peito». — As cinco ocorrências estão presentes como «dos pequeninos e das crianças de peito»: [2], [3], [5] duas vezes e [8]. A linha do glossário está correta.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [4]–[6]: the round 2 concord fix in [5] is correct and the paragraphs shown are clean.
- Rejected: pt-BR/ch001.md [5] — «e é por si mesmos que elevam» (round 2 fix) — Correct: the referent is «os vossos filhos» (masculine plural), and the sentence and its neighbours remain intact.
- Rejected: pt-BR/ch001.md [5] — «Well, therefore» rendered as «e com razão» — «Well» here means 'rightly, appositely'. «com razão» gives that sense, and «therefore» is carried by the context.
- Rejected: pt-BR/ch001.md [5] — «to speak peace» rendered as «a falar de paz» — «falar paz» is not idiomatic Portuguese. «falar de paz» keeps the sense of the Isaiah quotation.
- Rejected: pt-BR/ch001.md [6] — «Hosana ao filho de Davi» with lowercase «filho», while the Key Terms row has «Filho» — The source has lowercase «son» here. The house rule is not to normalize reverential capitalization.
