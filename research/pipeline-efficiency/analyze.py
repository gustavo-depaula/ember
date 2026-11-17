"""Where the translation pipeline's tokens went, across every run in runs/."""
import json, glob, os, re, collections, sys
RUNS = sys.argv[1]
tok = collections.defaultdict(lambda: [0, 0, 0, 0])  # in, out, think, calls
words = collections.Counter()
roundsHist = collections.Counter()
byRound = collections.defaultdict(lambda: [0, 0, 0, 0, 0])  # parts reaching it, meaning, minor, in tokens, rounds w/ changes
codexTok = collections.Counter()
def claudeUse(f):
    try:
        u = json.load(open(f))["usage"]
        return u["input_tokens"], u["output_tokens"], u.get("output_tokens_details", {}).get("thinking_tokens", 0)
    except Exception:
        return None
def codexUse(f):
    try:
        m = re.findall(r"tokens used\s*\n([\d,]+)", open(f, errors="ignore").read())
        return int(m[-1].replace(",", "")) if m else None
    except Exception:
        return None
for run in sorted(glob.glob(RUNS + "/*/")):
    for f in glob.glob(run + "translate-u*.json"):
        u = claudeUse(f)
        if u:
            t = tok["translate claude"]; t[0] += u[0]; t[1] += u[1]; t[2] += u[2]; t[3] += 1
    for f in glob.glob(run + "translate-u*.log"):
        if os.path.exists(f[:-4] + ".codex.md"):
            c = codexUse(f)
            if c: codexTok["translate"] += c; codexTok["translate calls"] += 1
    parts = sorted(glob.glob(run + "part-*/")) or [run]
    for p in parts:
        res = sorted(glob.glob(p + "review-*.result"), key=lambda x: int(re.search(r"review-(\d+)", x).group(1)))
        if not res: continue
        roundsHist[len(res)] += 1
        for r in res:
            n = int(re.search(r"review-(\d+)", r).group(1))
            txt = open(r).read()
            g = lambda k: int((re.search(k + r"=(\d+)", txt) or [0, 0])[1])
            mode = open(p + "review-%d.mode" % n).read().strip() if os.path.exists(p + "review-%d.mode" % n) else "?"
            eng = open(p + "review-%d.engine" % n).read().strip() if os.path.exists(p + "review-%d.engine" % n) else "?"
            b = byRound[min(n, 8)]; b[0] += 1; b[1] += g("meaning"); b[2] += g("minor"); b[4] += (g("applied") > 0)
            key = "review %s %s" % (eng, mode)
            u = claudeUse(p + "review-%d.json" % n)
            if u:
                t = tok[key]; t[0] += u[0]; t[1] += u[1]; t[2] += u[2]; t[3] += 1; b[3] += u[0]
            elif eng == "codex":
                c = codexUse(p + "review-%d.log" % n)
                if c: codexTok[key] += c; codexTok[key + " calls"] += 1
print("CLAUDE tokens (M): step  in  out  thinking  calls")
for k, (i, o, th, c) in sorted(tok.items()):
    print("  %-22s %7.1f %6.1f %6.1f %5d" % (k, i / 1e6, o / 1e6, th / 1e6, c))
print("CODEX tokens:", {k: (round(v / 1e6, 1) if "calls" not in k else v) for k, v in codexTok.items()})
print("rounds per part:", sorted(roundsHist.items()))
print("round: parts reaching, meaning, minor, claude-in(M), rounds with changes")
for n in sorted(byRound):
    b = byRound[n]; print("  %s%d: %4d  %5d %6d  %6.1f  %4d" % ("≥" if n == 8 else " ", n, b[0], b[1], b[2], b[3] / 1e6, b[4]))
