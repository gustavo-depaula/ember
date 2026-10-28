---
name: translation-pipeline
description: Run the unattended pt-BR book-translation pipeline (Claude Opus + Codex) over a queue of corpus books. Use to start a run, check on one, or handle a flagged book.
---

# Translation pipeline

Translates corpus books into Brazilian Portuguese without supervision: each book is translated in single-shot calls, reviewed in alternating Opus and Codex rounds until it converges, checked mechanically, committed and pushed to `main`. The code is in `pipeline/`; each script's header comment is its reference. The pipeline writes pt-BR only, from `la/` when a book has it, else from `en-US/`. For other target languages use the `translate-book` skill; this pipeline follows that skill's rules, and its prompts (`t2.system.md`, `review2.system.md`) restate them for tool-less calls.

## Machine

- `claude` at `~/.local/bin/claude`, logged in under `CLAUDE_CONFIG_DIR=~/.claude-work` (the account whose usage the pipeline spends).
- `codex` CLI, logged in.
- macOS (`date -j`, `stat -f`, `pmset`), zsh, `python3.13`.
- Plugged in, lid open or on an external display. Closed on battery, the Mac sleeps and every run freezes until it wakes.

## Start a run

1. **Worktree.** The pipeline writes into a separate checkout so the main one stays free: `git worktree add ../prayer-book-translation -b book-translation origin/main`. Put its absolute path in `pipeline/ROOT`. The committer pushes `HEAD:main` from it.
2. **Queue.** `pipeline/queue.txt` lists one book per line, a path relative to `content/books/` (`church-fathers/tertullian/apology`). Lines starting with `#` are comments; order is priority; lines may be appended while the run goes. A book too long for one run is queued one part at a time as `<book>#<scope>`, where `<scope>` is the prefix of that part's chapter files (`aquinas-opera-omnia/summa-theologiae#fp` takes the `fp-*` files). A book is claimed when its run directory `runs/<book with / as __>/` is created; delete that directory to rerun a book from scratch.
3. **Start the heartbeat** from `pipeline/`. It starts and keeps alive the watchdog, the committer, the pools and any driver left without a process, every 2 minutes, until `DEADLINE`:

   ```sh
   (POOLS="claude:3 codex:2" DEADLINE="2026-10-26 05:50" SESSION_LIMIT=88 WEEK_LIMIT=95 \
     CODEX_LIMIT=99 MAX_ROUNDS=10 nohup ./heartbeat.sh >> heartbeat.out 2>&1 &)
   ```

   | Variable | Meaning |
   |---|---|
   | `POOLS` | `engine:slots`, the pools to run. A `claude` pool translates with Opus; a `codex` pool translates with Codex and spends claude-work only on reviews. |
   | `DEADLINE` | Drivers stop at this time (exit 3) with their progress kept; a later run resumes where they stopped. |
   | `SESSION_LIMIT`, `WEEK_LIMIT` | claude-work usage (%) under which a claude step may start. |
   | `KILL_AT`, `WEEK_KILL_AT` | Watchdog: at this usage (default 90 / 97) it stops claude steps in flight, and they rerun after the reset. |
   | `CODEX_LIMIT` | Codex weekly usage (%) above which reviews fall back to Claude. `NO_CODEX=1` disables Codex. |
   | `MAX_ROUNDS` | Review rounds before a book (or part) is given up as `MAXED`. |
   | `PART_WORDS` | Books longer than this (default 40,000 words) are reviewed in parts of chapters. |

The run is done when every pool has written `POOL_DONE.<engine>` (queue drained) or the deadline passes.

## How a book goes through

1. **Translate.** `t2.py` cuts the source into spans of at most ~9k words. Call 1 writes the translation journal (`pt-BR/translation-journal.md`: key terms and decisions) and `book.json`'s pt-BR fields. Later calls read the journal and send back only their additions to it. A span unusable after two calls falls back to one agent session (`translate.prompt.md`), except in a `#scope` run, which fails.
2. **Titles** (`#scope` runs only). `titles.py` translates the part's toc titles from the translated text.
3. **Review.** `r2.py` builds each round's message (source and translation, paragraph-numbered, with `audit.py`'s mechanical report). The reviewer answers with exact-text patches classed `meaning` or `minor`, which are applied. Round 1 is a full read by Opus, then a full read by Codex. Later rounds are delta reads of the paragraphs the previous round changed, by the other engine. A delta read that finds a meaning-level defect is followed by a full read. **Stop rule:** at least 3 rounds and a full read from each engine; the last two rounds found no meaning-level defect, and the last changed nothing.
4. **Commit.** `committer.sh` checks the files (paragraph counts, Scripture references, `book.json`). It commits a clean book from the worktree and pushes. A `#scope` part adds pt-BR to `languages` only when the whole book is translated.

## Check on a run

`pipeline/check.sh` prints one line per book (`running`, `DONE …`, `pushed`, `FLAGGED …`, with the last status line), then claude-work's usage. Each `runs/<book>/` holds:

- `status`: the driver's log.
- `engine`: the pool that claimed it.
- `DONE`: `OK`, `MAXED` or `FAILED`.
- `NEEDS_REVIEW`: why the committer held it back.
- `COMMITTED`: the commit's sha.
- `part-K/`: the review rounds of each part.

Codex's weekly usage is in its newest `~/.codex/sessions/*/*/*/rollout-*.jsonl` (`"used_percent"`).

## Handle a flagged book

- **`NEEDS_REVIEW`, references differ.** Usually a false alarm: the translation corrected the edition's wrong or Roman-numeral reference (`Jonah 1:iv` → `Jonas 1:4`). Compare the flagged paragraph in source and pt-BR. If the translation is right, commit by hand from the worktree:

  ```sh
  git add -- content/books/<b>/pt-BR content/books/<b>/book.json
  git commit -- content/books/<b>/pt-BR content/books/<b>/book.json
  git push origin HEAD:main
  ```

  Name the correction in the message, and write the short sha to `runs/<book>/COMMITTED`.
- **`NEEDS_REVIEW` saying "driver ended …" on a book whose `DONE` is now `OK`** is left over from before a resume: delete it and the committer takes the book.
- **`MAXED`.** Read the last rounds in `status`.
  - If they found no meaning-level defect, resume with a higher cap: delete `DONE` and `NEEDS_REVIEW`, and start the driver with `MAX_ROUNDS` raised.
  - Every Codex round falling straight back to Claude (`no usable answer from codex`) means the round's prompt is too long for Codex. Check the `review-N.codex.md` size: about 1 MB is too long, and the book should have been split into parts.
- **`FAILED` in translate.** Read `translate-uK.problems`, and the usage in `translate-uK.json`. Output tokens at the 128k cap mean the answer was cut off. Fix the cause, delete `DONE`, and the heartbeat restarts the driver.

## Rules

- claude-work's session must never reach 100%. The watchdog is what guarantees it, so keep it running; at 98% or more, kill the heartbeat, the pools and every driver.
- At most 3 claude slots: wider pools exhaust the session faster than the watchdog can react.
- Edit a script by writing a copy and `mv`-ing it over the original: zsh reads a running script as it goes, so an in-place edit corrupts the drivers executing it.
- After the Mac wakes from sleep, a `claude -p` or `codex exec` far past its usual ~15 minutes is hung on a dead connection: kill it, and its driver retries.
- Commit messages carry no `Co-Authored-By` line.
