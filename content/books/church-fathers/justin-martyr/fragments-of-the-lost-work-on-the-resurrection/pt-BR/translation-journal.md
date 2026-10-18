# Diário de tradução — Fragmentos da obra perdida sobre a ressurreição (pt-BR)

Fonte: en-US/, tradução de Marcus Dods, *Ante-Nicene Fathers*, vol. 1 (1885), revista para a New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Fragments of the Lost Work on the Resurrection | Fragmentos da obra perdida sobre a ressurreição | título; caixa de frase, como *Fragmentos diversos de escritos perdidos* |
| Justin Martyr | Justino Mártir | como nas obras irmãs |
| Chapter N. | Capítulo N. | forma de título das obras irmãs |
| the Word (maiúsculo) | o Verbo | como nas obras irmãs |
| the word (of truth; "the word says", Escritura) | a palavra | minúsculo, como na fonte |
| divine pronouns | Ele, Sua, d'Ele, n'Ele, Lhe, Si, Se, Consigo | maiúsculos, apóstrofo reto, como nas obras irmãs |
| resurrection of the flesh | ressurreição da carne | |
| flesh / body / soul / spirit | carne / corpo / alma / espírito | |
| heavenly economy | economia celeste | termo teológico mantido |
| the Incorruptible / the Intelligence of the universe | o Incorruptível / a Inteligência do universo | maiúsculas da fonte |
| incorruption / corruption | incorrupção / corrupção | |
| lawless desire / marriage made lawless | desejo desregrado / casamento tornado desregrado | |
| test (of sense, of reason) | critério | |
| the ruler | o príncipe | o diabo; ver nota do tradutor |
| prince of wickedness | príncipe da maldade | |
| devils ("the gods of the nations are devils") | demônios | |
| heathen / unbelievers / believers | pagãos / incrédulos / crentes | |
| natural philosophers | filósofos da natureza | |
| Plato, Epicurus, the Stoics, Pythagoras, Homer | Platão, Epicuro, os estoicos, Pitágoras, Homero | |
| atoms and the void | átomos e vazio | |
| Sadducees | saduceus | |
| secular (arguments) | seculares | mantém o jogo com "nem o próprio mundo" |

## Decisões

- Nota do tradutor [^1] (cap. 3): "the ruler" a quem Cristo mostra a formação do homem sem intervenção humana é o diabo, "o príncipe deste mundo" (João 12:31). Sem a nota, o leitor português poderia entender um governante humano.
- Cap. 6, "both these are indestructible and God": a construção do inglês é truncada. Foi vertida como "ambos, a matéria e Deus, são indestrutíveis", que é o sentido evidente.
- Cap. 6: "Epicures" (erro tipográfico da fonte) foi vertido como Epicuro.
- Cap. 8, título "soulto": erro da fonte, corrigido para "a alma a pecar".
- Cap. 8, "what thank have you?" (Lucas 6:32): vertido como "que mérito tendes?", com *vós* porque o original é plural.
- Cap. 8, "inspired by Him … being His inspiration": vertido como "inspirada por Ele … sendo o Seu sopro", para conservar a imagem do sopro divino.
- Cap. 8, "those that are begotten of Him": o pronome foi mantido em maiúscula, como na fonte ("d'Ele").
- Cap. 2 e 7: o ponto de interrogação fica fora das aspas, como é norma em português, quando a pergunta é do autor e não da citação.
- As referências bíblicas foram mantidas inline, na posição da fonte, com nomes portugueses. "Luke 24:32, etc." foi vertido como "Lucas 24:32 etc.". As citações dos Salmos no cap. 5 não têm referência na fonte e ficaram sem referência.
- Para facilitar a leitura, várias frases longas do inglês foram divididas em frases mais curtas dentro do mesmo parágrafo. Nenhuma oração foi omitida, e a ordem dos argumentos foi mantida.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 [1]–[23], footnote, journal and book.json; one fix: restored the dropped 'since' in ch. 9.
- `pt-BR/ch001.md` [21]: “em nada difere dos saduceus. A ressurreição da carne é o poder de Deus” → “em nada difere dos saduceus, pois a ressurreição da carne é o poder de Deus” — source says 'since the resurrection of the flesh is the power of God'; splitting the sentence dropped the 'since', which gives the reason the objector is like the Sadducees (who do not know 'the power of God') *(meaning)*
- Rejected: pt-BR/ch001.md [7], [11], [21] — audit: parentheses differ — the parenthetical content is kept in full and only recast as clauses or sentences; nothing is lost
- Rejected: pt-BR/ch001.md [3] — 'since what is disbelieved…' lost its 'since' when the sentence was split — 'com efeito' in the previous sentence keeps the explanatory link clear; the reasoning is not obscured
- Rejected: pt-BR/ch001.md [11], [15] — added 'dividem-se em três grupos' and 'por duas razões' — both only make explicit the enumeration the source itself lays out; no new content
- Rejected: pt-BR/ch001.md [13] — 'que é estes quatro' / 'que é átomos e vazio': singular verb with a plural predicate — with 'universo' as subject, agreement in the singular is accepted; this is a style choice, not an error
- Rejected: pt-BR/ch001.md [23] — 'But if our physician Christ… regulates…' rendered as a statement — the conditional's premise is asserted by the author; the inference 'é evidente, então' keeps the logic

### Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[23], da nota, do diário e de book.json; encontrados três problemas de sentido.
- `pt-BR/ch001.md` [3]: “tendo n'Ele a fé como sua prova” → “crendo n'Ele como sua prova” — Em 'having faith in Him as their proof', é Ele quem serve de prova; a tradução faz da fé a prova. *(meaning)*
- `pt-BR/ch001.md` [9]: “se lhe falta alguma parte do corpo, nessa parte o homem há de ressuscitar mutilado” → “se tem algum defeito em qualquer parte do corpo, nessa parte o homem há de ressuscitar com esse defeito” — 'Defective in any part' abrange qualquer defeito numa parte do corpo, não apenas a ausência de uma parte. *(meaning)*
- `pt-BR/ch001.md` [23]: “uma fé inquestionável em Deus” → “uma fé sem questionamentos em Deus” — 'Unquestioning' descreve uma fé que não questiona; 'inquestionável' significa que ela não pode ser questionada. *(meaning)*
- Rejected: pt-BR/ch001.md [7], [11], [21] — Divergências na quantidade de parênteses apontadas pela auditoria. — Todo o conteúdo parentético foi preservado em orações ou frases; confirma-se a rejeição da rodada anterior.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]–[23], footnote, journal and book.json: no defects; audit flags and minor points checked and rejected
- Rejected: pt-BR/ch001.md [7], [11], [21] — audit: parentheses differ — the parenthetical content is kept in full and recast as clauses; nothing is lost, as earlier rounds already concluded
- Rejected: pt-BR/ch001.md [19] — 'for even the most savage of the wild beasts do so' lost its 'for' when the sentence was split ('Até as mais ferozes das feras fazem isso') — placed right after 'alguém o chama de homem bom', the sentence still reads plainly as the reason; the sense is unchanged
- Rejected: pt-BR/ch001.md [19] — 'your soul' rendered with tu ('a tua alma') — the source's 'your' is open; a singular address to the reader is a defensible choice and consistent within the paragraph
- Rejected: pt-BR/translation-journal.md — Key Terms row for divine pronouns lists Consigo, Lhe, Se, Si — all occur in the text ([19] Consigo, Lhe; [21] pediram-Lhe; [7] Se submeteu; [3] a Si mesmo); the row is accurate
