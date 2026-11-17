"""Where the month-1 run (Nov 13-14, 2026) spent its tokens and time.

  python3.13 week-run.py <pipeline dir> <queue lines> <untranslated.json>

Reads runs/<book>/ for each queued book: translation calls (Claude usage JSON,
Codex logs), review rounds (mode, engine, findings, applied), and the status
logs' timestamps for quota waits.
"""
import collections, glob, json, os, re, sys

pipe, nq, wordsFile = sys.argv[1], int(sys.argv[2]), sys.argv[3]
queue = [l.strip() for l in open(pipe + "/queue.txt") if l.strip() and not l.startswith("#")][-nq:]
words = {r[0]: r[2] for r in json.load(open(wordsFile))}


def claudeUse(f):
    try:
        j = json.load(open(f))
        u = j["usage"]
        return dict(inp=u["input_tokens"] + u.get("cache_read_input_tokens", 0) + u.get("cache_creation_input_tokens", 0),
                    out=u["output_tokens"], cost=j.get("total_cost_usd", 0), ms=j.get("duration_ms", 0))
    except Exception:
        return None


def codexUse(f):
    try:
        m = re.findall(r"tokens used\s*\n([\d,]+)", open(f, errors="ignore").read())
        return int(m[-1].replace(",", "")) if m else None
    except Exception:
        return None


def field(t, k):
    m = re.search(k + r"=(\d+)", t)
    return int(m.group(1)) if m else 0


tot = collections.Counter()
rows = []
roundStats = collections.defaultdict(collections.Counter)  # (mode, engine) -> counters
byIndex = collections.defaultdict(collections.Counter)
partRounds = collections.Counter()
failures = []
for b in queue:
    run = "%s/runs/%s" % (pipe, b.replace("/", "__"))
    if not os.path.isdir(run):
        continue
    eng = open(run + "/engine").read().strip() if os.path.exists(run + "/engine") else "?"
    done = open(run + "/DONE").read().strip() if os.path.exists(run + "/DONE") else "running"
    st = open(run + "/status").read() if os.path.exists(run + "/status") else ""
    r = collections.Counter(words=words.get(b, 0))
    r["committed"] = os.path.exists(run + "/COMMITTED")
    r["unusable"] = st.count(" unusable")
    # Quota waits: each "quota: … waiting" line is one 10-minute sleep.
    r["quotaWaitMin"] = 10 * len(re.findall(r"quota: .* waiting", st))
    for f in glob.glob(run + "/translate-u*.json"):
        u = claudeUse(f)
        if u:
            r["tCalls"] += 1; r["tIn"] += u["inp"]; r["tOut"] += u["out"]; r["tCost"] += u["cost"]
    for f in glob.glob(run + "/translate-u*.log"):
        if os.path.exists(f[:-4] + ".codex.md"):
            c = codexUse(f)
            if c:
                r["tCodexCalls"] += 1; r["tCodexTok"] += c
    parts = sorted(glob.glob(run + "/part-*/")) or [run + "/"]
    for p in parts:
        res = sorted(glob.glob(p + "review-*.result"), key=lambda x: int(re.search(r"review-(\d+)\.", x).group(1)))
        if not res:
            continue
        partRounds[len(res)] += 1
        for x in res:
            n = int(re.search(r"review-(\d+)\.", x).group(1))
            t = open(x).read()
            mode = open(p + "review-%d.mode" % n).read().strip()
            e = open(p + "review-%d.engine" % n).read().strip()
            k = (mode, e)
            s = roundStats[k]
            s["rounds"] += 1
            s["meaning"] += field(t, "meaning"); s["minor"] += field(t, "minor"); s["applied"] += field(t, "applied")
            if e != "none" and field(t, "applied") == 0:
                s["noChange"] += 1
            byIndex[n]["rounds"] += 1; byIndex[n]["meaning"] += field(t, "meaning"); byIndex[n]["applied"] += field(t, "applied")
            if e == "claude":
                u = claudeUse(p + "review-%d.json" % n)
                if u:
                    s["in"] += u["inp"]; s["out"] += u["out"]; s["cost"] += u["cost"]
                    r["rIn"] += u["inp"]; r["rOut"] += u["out"]; r["rCost"] += u["cost"]
            elif e == "codex":
                c = codexUse(p + "review-%d.log" % n)
                if c:
                    s["codexTok"] += c; r["rCodexTok"] += c
            r["rounds"] += 1
    if done not in ("OK", "running"):
        failures.append((b, done, st.strip().splitlines()[-1][:160]))
    rows.append((b, eng, done, r))
    for k, v in r.items():
        tot[k] += v

print("books touched %d, committed %d" % (len(rows), sum(1 for *_, r in rows if r["committed"])))
cw = sum(r["words"] for *_, r in rows if r["committed"])
print("words committed %d" % cw)
print("\n== translation ==")
print("claude calls %d  in %.1fM  out %.1fM  cost-equiv $%.0f" % (tot["tCalls"], tot["tIn"] / 1e6, tot["tOut"] / 1e6, tot["tCost"]))
print("codex calls %d  tokens %.1fM" % (tot["tCodexCalls"], tot["tCodexTok"] / 1e6))
print("unusable attempts %d" % tot["unusable"])
print("\n== review ==")
print("claude in %.1fM  out %.2fM  cost-equiv $%.0f ; codex tokens %.1fM" % (tot["rIn"] / 1e6, tot["rOut"] / 1e6, tot["rCost"], tot["rCodexTok"] / 1e6))
print("%-16s %6s %8s %6s %8s %9s %8s %8s" % ("mode/engine", "rounds", "meaning", "minor", "applied", "noChange", "inM", "codexM"))
for k, s in sorted(roundStats.items()):
    print("%-16s %6d %8d %6d %8d %9d %8.1f %8.1f" % ("/".join(k), s["rounds"], s["meaning"], s["minor"], s["applied"], s["noChange"], s["in"] / 1e6, s["codexTok"] / 1e6))
print("\nrounds per part:", dict(sorted(partRounds.items())))
print("by round index (rounds, meaning, applied):", {n: (c["rounds"], c["meaning"], c["applied"]) for n, c in sorted(byIndex.items())})
print("\nquota wait (driver-minutes): %d" % tot["quotaWaitMin"])
print("\nclaude cost-equiv per committed 1k words: $%.2f" % ((tot["tCost"] + tot["rCost"]) / max(cw, 1) * 1000))
print("\n== per engine of the pool ==")
pe = collections.defaultdict(collections.Counter)
for b, eng, done, r in rows:
    if r["committed"]:
        pe[eng]["books"] += 1; pe[eng]["words"] += r["words"]; pe[eng]["claudeCost"] += r["tCost"] + r["rCost"]
        pe[eng]["claudeIn"] += r["tIn"] + r["rIn"]; pe[eng]["codexTok"] += r["tCodexTok"] + r["rCodexTok"]
for e, c in pe.items():
    print("%s: %d books, %dk words, claude $%.2f/1k words, claude in %.1f tok/word, codex %.1f tok/word" % (
        e, c["books"], c["words"] / 1000, c["claudeCost"] / c["words"] * 1000, c["claudeIn"] / c["words"], c["codexTok"] / c["words"]))
print("\n== failures ==")
for f in failures:
    print(f)
