#!/bin/sh
# Grep the Latin psalter for the new glossary terms of Pss 19–20 (sh research/psalterium/ps020/grep_terms.sh, from the repo root).
cd "$(dirname "$0")/.." || exit 1
for r in 'potentat' 'curr(us|ibus|um)\b' 'tue(ri|atur|bor|re)\b' 'obligat' 'erect' 'holocaust' 'decor' '\bgaudi' 'laetific' 'fraud' 'dulcedin' 'stabil' 'cliban' 'longitudin' 'reliqui' 'iubil|jubil'; do
  echo "== $r"
  python3.13 ps005/grep_latin.py "$r" | cut -c1-120 | head -16
done
