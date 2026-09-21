#!/bin/sh
# The concordances behind words/ps118-terms.md. Run from the repo root: sh research/psalterium/ps118/concordances.sh
W="python3.13 research/psalterium/words.py"
$W lex '^(lex|legis|legi|legem|lege|leges|legum|legibus)$' --greek 'νομ' --pt 'lei|mandament|preceit|estatut|decret|ordena'
$W testimonium '^testimoni' --greek 'μαρτυρ' --pt 'testemunh|preceit|mandament|orden|lei'
$W mandatum '^mandat(um|i|o|a|orum|is)$' --greek 'εντολ' --pt 'mandament|preceit|orden|lei|decret'
$W iustificatio '^iustificatio' --greek 'δικαι' --pt 'justific|preceit|estatut|decret|lei|mandament|orden|justiç'
$W iudicium '^iudici' --greek 'κριμα|κρισ' --pt 'juíz|juiz|julgament|decret|sentenç|justiç|direit|preceit'
$W verbum '^verb(um|i|o|a|orum|is)$' --greek 'λογο|λογω|λογου|λογοι|λογων|ρημα|λογι' --pt 'palavr|promess|oráculo|dit|discurs'
$W sermo '^sermo(n|$)' --greek 'λογο|λογω|λογου|λογοι|λογων|ρημα|λογι' --pt 'palavr|promess|oráculo|dit|discurs'
$W eloquium '^eloqui' --greek 'λογο|λογω|λογου|λογοι|λογων|ρημα|λογι' --pt 'palavr|promess|oráculo|dit|discurs'
$W via '^(via|viae|viam|vias|viis|viarum)$' --greek 'οδο|οδω|οδου|οδοι|οδων|τριβ' --pt 'caminh|vered|send|via'
$W semita '^semit' --greek 'οδο|οδω|τριβ' --pt 'caminh|vered|send|via'
$W praeceptum '^praecept' --greek 'εντολ|προσταγ|δικαι|παιδει' --pt 'mandament|preceit|orden|lei|decret'
