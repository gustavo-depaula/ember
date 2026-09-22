# Trial: Grok 4.7 (high, fast) as translator — 2026-09-22

Gustavo asked to see how `grok-4.7-high-fast` (Cursor CLI, `cursor-agent`) does as the translating agent, since it is cheaper and faster. Two finished psalms were re-translated blind with the same brief, and read by the same readers, so the result could be compared with the finished text.

## Setup

- **Psalms:** 22 (9 prayed verses, familiar; tests fidelity to the Latin against the Hebrew-family wording) and 26 (20 prayed verses; the D36 hoping verbs, places held against the gate).
- **Procedure:** the AGENT-BRIEF steps, in two cursor-agent calls on the same chat (`run.sh`, prompts `prompt-draft.md` and `prompt-revise.md`). The first call ran parallels, the literal version, draft 1, render and checks. The coordinator then ran the three blind readers. The second call handled the revision, outcomes, glossary proposals and progress row. Finally the coordinator ran the Latinist gate on draft 2. Grok wrote only in `trials/grok-4.7/psNNN/`, touched no shared file, and made no commits.
- **Readers:** every reader, for both versions, was Claude Opus 5.5 in a fresh context that saw only the role prompt and the target. The finished psalms were given the same Latinist (`baseline/psNNN/critic/latinist.json`), since their own gates were Codex.

## Contamination (read this before the numbers)

- **Leaks:** Grok was told never to open the finished folder, and it didn't read it directly. But repo-wide greps returned lines from it (`leaks.py`):
  - Ps 26: verse 26:2b.
  - Ps 22: verses 22:3 and 22:6, plus the verse ids.
- **Glossary:** bigger than the leaks and unavoidable. `glossary.md` quotes the finished wording of many verses as evidence, for example 26:13 *Creio que verei*, 26:14 *Aguarda o Senhor … e espera pelo Senhor*, and 22:1 *O Senhor me rege*. Grok followed those rows, as it should.
- **Consequence:** where Grok agrees with the finished text, that proves less than where it differs. A clean test would be a psalm not yet translated.

## Results

| | Ps 22 (Opus finished) | Ps 22 (Grok) | Ps 26 (Opus finished) | Ps 26 (Grok) |
|---|---|---|---|---|
| checks.py | pass | pass | pass | pass |
| same Opus Latinist, verses flagged | 2 minor | 1 minor (gate v2) | 6 minor | 4 minor (gate v2) |
| majors at the end | 0 | 0 | 0 | 0 |
| decisions | 19 | 17 | 24 | 21 |
| remark outcomes recorded | 8 | 26 (4 taken, 19 refused, 3 option) | 24 | 49 (5 taken, 31 refused, 13 option) |
| verses identical to the finished text | — | 5 / 9 | — | 8 / 20 |

- **Differences from the finished text:**
  - Ps 22: all small. *Sobre a água* (closer to *super*, which the Latinist had flagged in ours) for *Junto à água*. *foram eles que me consolaram*. The cry at the end in 22:5b.
  - Ps 26: mostly order and punctuation. The one real word choice is 26:3 *se assentar um acampamento* for *se instalar*, which the Latinist marked minor.
- **Reasoning:** the `why` notes are dense, cite the right rulings (D2, D19, D24, D36, and D39, ruled the same day), weigh the Greek and the Vulgate family correctly, and give a reason for every refusal. For example, on 26:9 it moved *na ira* because three readers misparsed the order.
- **Weakness:** no fault of sense or rule was found. Its Portuguese in the notes and replies is terse. The stylist's remarks were mostly refused (19 of 26 in Ps 22), a harder line than the Opus agents take. With only two psalms that may be style, not a flaw.

## Speed and size

| run | wall time | input tokens | output tokens | cache-read tokens |
|---|---|---|---|---|
| Ps 22 draft | 848 s | 369k | 61k | 3.88M |
| Ps 22 revision | 223 s | 32k | 21k | 2.93M |
| Ps 26 draft | 760 s | 287k | 60k | 2.73M |
| Ps 26 revision | 360 s | 54k | 30k | 5.09M |

For comparison, the Opus 5.5 agents translating new psalms the same day took:

- **Ps 37** (23 verses): about 11 minutes of agent time (438 s draft, 136 s revision, 86 s finish), about 270k tokens as reported by the harness.
- **Ps 38** (18 verses): about 12½ minutes (515 s draft, 114 s revision, 118 s finish).

So **Grok was not faster here**: roughly 18 minutes a psalm against 11–12½. The time is spent in many small tool rounds over the large glossary. Whether it is cheaper depends on Cursor's pricing for this model, which was not checked.

## Verdict (for Gustavo)

On these two psalms Grok 4.7 produced work of the same standard as the Opus agents: same checks, fewer Latinist minors, sound reasoning, a complete audit. The test is weak for the reasons above. Grok was also slower, not faster, in this setup.

If it is much cheaper, a fair next step is to give it the **next untranslated psalm alongside an Opus agent** (or instead of one) and compare there. Its Portuguese diction should also be judged by ear on the site, which the numbers here can't show.
