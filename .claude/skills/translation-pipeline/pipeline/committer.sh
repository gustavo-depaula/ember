#!/bin/zsh
# Commits each book whose driver finished with DONE=OK, after mechanical
# checks, and pushes to main. A book that fails a check gets NEEDS_REVIEW and
# is left uncommitted for the orchestrator. A push that fails (network, main
# moved mid-push) is retried on the next pass. Runs until killed.
set -u

here=${0:A:h}
root=$(<$here/ROOT)
cd $root

check() { # book [scope] -> prints problems, empty when clean
  python3.13 - content/books/$1 ${2:-} <<'EOF'
import sys, re, json, glob, os, subprocess
d = sys.argv[1]
# One part of a long book (book#scope): that part's files and toc titles.
scope = sys.argv[2] + "-" if len(sys.argv) > 2 and sys.argv[2] else ""
lang = "la" if os.path.isdir(d + "/la") else "en-US"
problems = []
paras = lambda f: [p for p in open(f).read().split("\n\n") if p.strip()]
for src in sorted(glob.glob(d + "/" + lang + "/" + scope + "*.md")):
    tgt = src.replace("/" + lang + "/", "/pt-BR/")
    name = os.path.basename(src)
    if not os.path.exists(tgt):
        problems.append("missing " + tgt); continue
    a = paras(src)
    # A translator's footnote is the one paragraph pt-BR may add.
    b = [p for p in paras(tgt) if not (p.startswith("[^") and "Nota do tradutor" in p)]
    if len(a) != len(b):
        problems.append("%s: %d vs %d paragraphs" % (name, len(a), len(b))); continue
    # OCR reads 1 as l in the English editions ("Galatians 6:l", "Luke 7:12-l5").
    refs = lambda s: sorted(r.replace("l", "1") for r in re.findall(r"\d+:[\dl]+\b", s))
    # The English editions also cite in Roman numerals ("1 Cor. XI. 5", "iii. 1"),
    # which a translation writes as 11:5; those may appear in pt-BR only.
    roman = lambda r: sum({"i": 1, "v": 5, "x": 10, "l": 50, "c": 100}[c] * (-1 if k + 1 < len(r) and {"i": 1, "v": 5, "x": 10, "l": 50, "c": 100}[c] < {"i": 1, "v": 5, "x": 10, "l": 50, "c": 100}[r[k + 1]] else 1) for k, c in enumerate(r))
    romanRefs = lambda s: {"%d:%s" % (roman(m.group(1).lower()), m.group(2)) for m in re.finditer(r"\b([IVXLCivxlc]+)\.\s*(\d+)", s)}
    for i, (x, y) in enumerate(zip(a, b)):
        if lang == "en-US" and (set(refs(x)) - set(refs(y)) or set(refs(y)) - set(refs(x)) - romanRefs(x)): problems.append("%s p%d: scripture refs differ" % (name, i + 1))
        wx, wy = len(x.split()), len(y.split())
        if wx > 40 and wy / wx < 0.6: problems.append("%s p%d: pt-BR only %.0f%% of source length" % (name, i + 1, 100 * wy / wx))
    if re.search(r"truncated to [0-9]+ chars", open(tgt).read()): problems.append(tgt + ": truncation marker")
    t = open(tgt).read()
    defs = re.findall(r"^\[\^(\w+)\]:", t, re.M)
    if len(defs) != len(set(defs)): problems.append(name + ": a footnote defined twice")
    if set(re.findall(r"\[\^(\w+)\](?!:)", t)) - set(defs): problems.append(name + ": a footnote marker without definition")
bj = json.load(open(d + "/book.json"))
old = json.loads(subprocess.run(["git", "show", "HEAD:" + d + "/book.json"], capture_output=True, text=True).stdout)
complete = all(os.path.exists(f.replace("/" + lang + "/", "/pt-BR/")) for f in glob.glob(d + "/" + lang + "/*.md"))
if (not scope or complete) and "pt-BR" not in bj.get("languages", []): problems.append("book.json: pt-BR not in languages")
if "description" in bj and "description" not in old: problems.append("book.json: added top-level description")
if isinstance(bj.get("description"), dict) and "pt-BR" not in bj["description"]: problems.append("book.json: description missing pt-BR")
def nodes(ns):
    for n in ns:
        yield n
        yield from nodes(n.get("children", []))
if scope:
    if any("pt-BR" not in n.get("title", {}) for n in nodes(bj.get("toc", [])) if (n.get("id", "") + "-").startswith(scope)): problems.append("book.json: a toc title of this part missing pt-BR")
elif any("pt-BR" not in t.get("title", {}) for t in bj.get("toc", [])): problems.append("book.json: toc title missing pt-BR")
extra = [f for f in os.listdir(d + "/pt-BR") if not f.endswith(".md") or ("notes" in f)]
if extra: problems.append("stray files in pt-BR: %s" % extra)
print("\n".join(problems))
EOF
}

commitBook() { # book run [scope]
  local book=$1 run=$2 scope=${3:-}
  local name author rounds defects who msg
  name=$(jq -r '.name["en-US"]' content/books/$book/book.json)
  author=$(jq -r '.author["en-US"]' content/books/$book/book.json | sed -E 's/ *\(.*\)//')
  rounds=$(ls $run | grep -c '^review-[0-9]*\.verdict$')
  defects=$(cat /dev/null $run/review-*.verdict(N) | awk '$2 == "ISSUES" {s += $3} END {print s + 0}')
  who=Codex; [[ -f $run/engine && $(<$run/engine) == claude ]] && who=Claude
  local reviewers=$who
  [[ -n $(cat /dev/null $run/review-*.engine(N) | sort -u | grep -v "^$(<$run/engine)$") ]] && reviewers="Codex and Claude in turn"
  if [[ -f $run/pipeline && $(<$run/pipeline) == v2 ]]; then
    # A long book is reviewed in parts (runs/<book>/part-K/), each to convergence.
    local v2=($run/review-*(N) $run/part-*/review-*(N))
    rounds=${#${(M)v2:#*.result}}
    local fulls=$(cat /dev/null ${(M)v2:#*.mode} | grep -c '^full$') meaning=$(cat /dev/null ${(M)v2:#*.result} | grep -oE 'meaning=[0-9]+' | cut -d= -f2 | awk '{s+=$1} END {print s+0}')
    local minor=$(cat /dev/null ${(M)v2:#*.result} | grep -oE 'minor=[0-9]+' | cut -d= -f2 | awk '{s+=$1} END {print s+0}')
    if [[ -f $run/parts ]]; then
      msg="Translated by Claude; reviewed in $(<$run/parts) parts by Codex and Claude in turn,
$rounds rounds in all: $fulls full bilingual reads, the rest checks of the
passages the previous round changed. $meaning meaning-level and $minor minor
defects fixed; in every part the last two rounds found no meaning-level
defect and the last changed nothing."
    else
    msg="Translated by Claude; $rounds review rounds by Codex and Claude in turn: $fulls full
bilingual reads, the rest checks of the passages the previous round changed.
$meaning meaning-level and $minor minor defects fixed; the last two rounds found
no meaning-level defect and the last changed nothing."
    fi
  elif [[ -f $run/batches.json ]]; then
    msg="Translated by $who in $(jq '.batches | length' $run/batches.json) batches of chapters, each reviewed by $reviewers until
its last two reviews were clean ($rounds batch reviews, $defects defects fixed),
then a book-wide terms-consistency pass."
  else
    msg="Translated by $who; $rounds review rounds of differing focus by $reviewers,
$defects defects fixed, last two rounds clean."
  fi
  if [[ -n $scope ]]; then
    # One part of a long book: its files, the journal and book.json. The last
    # part also puts pt-BR in `languages`, which makes the book readable in it.
    local d=content/books/$book part
    part=$(jq -r --arg s $scope '.toc[] | select(.id == $s) | .title.la // .title["en-US"]' $d/book.json)
    python3.13 -c "
import glob, json, os, sys
d = sys.argv[1]; lang = 'la' if os.path.isdir(d + '/la') else 'en-US'
if all(os.path.exists(f.replace('/' + lang + '/', '/pt-BR/')) for f in glob.glob(d + '/' + lang + '/*.md')):
    bj = json.load(open(d + '/book.json'))
    if 'pt-BR' not in bj['languages']:
        bj['languages'].append('pt-BR'); open(d + '/book.json', 'w').write(json.dumps(bj, ensure_ascii=False, indent=2) + '\\n')
" $d || return 1
    # A review may fix an OCR slip in the part's source files: theirs too.
    local src=$d/la; [[ -d $src ]] || src=$d/en-US
    local files=($d/pt-BR/$scope-*.md $d/pt-BR/translation-journal.md $d/book.json $src/$scope-*.md)
    git add -- $files || return 1
    git commit -q -m "Translate the ${part} of ${author}'s ${name} to pt-BR" -m "$msg" -- $files
    return
  fi
  git add -- content/books/$book || return 1
  git commit -q -m "Translate ${author}'s ${name} to pt-BR" -m "$msg" -- content/books/$book
}

commitHaydock() { # bible book, run
  local f=content/bible/haydock/pt-BR/$1.json
  local notes=$(jq '[.[][] | length] | add' $f) || return 1
  local reviews=$(ls $2 | grep -c '^review-[0-9]*\.verdict$')
  local defects=$(cat /dev/null $2/review-*.verdict(N) | awk '$2 == "ISSUES" {s += $3} END {print s + 0}')
  git add -- $f || return 1
  git commit -q -m "Haydock on ${(C)1//-/ } in pt-BR" -m "The $notes notes, translated by Claude and reviewed part by part by Codex and
Claude in turn until each part's last two reviews were clean ($reviews part
reviews, $defects defects fixed). Same shape and key order as the English file;
the Greek and Latin apparatus blocks are carried over unchanged." -- $f
}

# Local commits not yet on main: replay them onto origin/main if it moved, then push.
pushPending() {
  git fetch -q origin main || return 1
  [[ -n $(git rev-list origin/main..HEAD) ]] || return 0
  if ! git merge-base --is-ancestor origin/main HEAD; then
    local mine=($(git rev-list --reverse origin/main..HEAD)) tip=$(git rev-parse HEAD)
    git reset -q --keep origin/main || return 1
    git cherry-pick $mine > /dev/null || { git cherry-pick --abort; git reset -q --keep $tip; return 1; }
  fi
  git push -q origin HEAD:main
}

while true; do
  for run in $here/runs/*(N/); do
    [[ -f $run/DONE && ! -f $run/COMMITTED && ! -f $run/NEEDS_REVIEW ]] || continue
    if [[ ${run:t} == haydock__* ]]; then
      # Not a book: haydock.py import already validated the file's structure.
      b=${${run:t}#haydock__}
      if [[ $(<$run/DONE) == OK ]] && commitHaydock $b $run; then
        git rev-parse --short HEAD > $run/COMMITTED
      else
        print "driver ended $(<$run/DONE), or the commit failed" > $run/NEEDS_REVIEW
      fi
      continue
    fi
    book=${${run:t}//__//} scope=
    [[ $book == *\#* ]] && scope=${book#*\#} book=${book%%\#*}
    if [[ $(<$run/DONE) != OK ]]; then
      print "driver ended $(<$run/DONE)" > $run/NEEDS_REVIEW; continue
    fi
    problems=$(check $book $scope)
    if [[ -n $problems ]]; then
      print -r -- $problems > $run/NEEDS_REVIEW; continue
    fi
    if commitBook $book $run $scope; then
      git rev-parse --short HEAD > $run/COMMITTED
    else
      print "commit failed" > $run/NEEDS_REVIEW
    fi
  done
  pushPending || print "$(date '+%H:%M:%S') push failed, will retry" >> $here/committer.log
  sleep 60
done
