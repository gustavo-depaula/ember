# Book Reader — Overnight Work Plan

User went to sleep at **2026-06-05T23:35-03:00** with directive: work autonomously through the night building book-reader features, plan → build → simplify → commit each one, journal everything, only stop when explicitly told or genuinely nothing left to build.

**Heartbeat-then-work schedule**
- Now → +4h: send a heartbeat status update every 30 minutes
- **Work starts: 2026-06-06T03:35-03:00** (= 2026-06-06T06:35Z)
- After that: pick a feature, plan, build, simplify, commit, repeat

The /goal stop hook is active — the harness will not let me stop until the user clears the goal or work is genuinely exhausted.

## Feature backlog

Build these in this order. Each one gets its own commit (or its own PR if it's large enough to deserve one). Update the **Journal** section below after each feature lands.

### Phase 1 — planned Phase 2 features (per the original plan)
1. **Drop caps + chapter-opening ornaments** (CSS-only, fast win, makes books feel illuminated)
2. **"X pages left in chapter" indicator** (small, complements the Chapter X of Y indicator)
3. **Cross-chapter transition animation** (smooth fade when foliate swaps iframes)
4. **Footnote popovers** (anchor click → native popover sheet, no chapter nav)
5. **Internal-link back-stack** (Aquinas / CCC cross-refs — forward navigation with back history; back button restores prior position)
6. **In-book search** (query → walk every chapter HTML → results list → tap to jump to chapter+fraction)
7. **Bookmarks** (long-press to bookmark current page; sheet listing bookmarks; tap to restore)
8. **Highlights** (text selection → color picker → save; render colored span inside iframe; sheet listing highlights)
9. **Text-to-Speech** (read aloud current page using expo-speech; play/pause/skip)
10. **Two-page spread on tablet/desktop** (CSS `column-count: 2` when viewport wide)
11. **Hyphenation library** (Hyphenopoly or CSS `hyphens: auto` for pt-BR + Latin)

### Phase 2 — creative additions (build once Phase 1 base is solid)
12. **Reading streak + time tracker** (minutes/day per book, persistent)
13. **Per-book progress on library/frontispiece** (e.g. "37% read", "Chapter 8 of 24")
14. **Quick lookup on long-press word** (dictionary / wiki / Strong's number, depending on word context)
15. **Quote-share image generator** (Apple Books style — pick a passage, generate a beautiful share card)
16. **Sepia + paper themes** (beyond light/dark — warm cream, midnight, e-ink)
17. **Per-book theme override** (force sepia for one book, dark for another)
18. **Reading session insights** (post-session: "You read 12 pages, 23 min, finished Chapter 3")
19. **Adaptive font scaling at low light** (auto-bump size after sunset based on system Reduce Bright Colors)
20. **Chapter-completion checkmarks** (visible in TOC; auto-marks when reader finishes the chapter)
21. **Reading speed estimate + ETA** ("at your pace, ~14 min left in chapter")
22. **Pin-aware offline indicator** (book pinned → green dot in chrome)
23. **Resume across devices** (sync cursors via Turso if/when sync lands — defer until sync exists)

## Operating principles for the night

- **One feature at a time**. Plan → build → biome check → tests → commit. Then move on.
- **Use the simplify skill liberally** — invoke after every 2-3 features to keep the codebase clean.
- **Keep diffs focused.** No drive-by refactors unrelated to the current feature.
- **Update this journal** with what landed, what was tricky, what was deferred.
- **Don't add tooling deps** without strong reason; favor things already in the dep tree (`expo-speech`, `react-native-reanimated`, etc.).
- **Don't ship migrations** — user is the only user, no DB schema changes unless absolutely required.
- **Phase 2 items 22-23** require sync infra that doesn't exist — defer.

## Journal

### 2026-06-05T23:35-03:00 — plan filed

Heartbeat 0/8. Wake target: 2026-06-06T03:35-03:00 (4 hours from now). Goal stop-hook armed. Plan above is the working backlog.

### 2026-06-06T08:49 — user said "Start it" → began Phase 1

Heartbeat cancelled, work mode now. Beginning Phase 1 immediately.

### Feature 1: Drop caps + chapter-opening ornaments ✅

Added CSS-only illuminated chapter opening inside the foliate iframe's STYLE block:
- `h2.chapter-title` now centered italic with letter-spacing, followed by a small fleuron (✦) at 45% opacity
- `h2.chapter-title + p::first-letter` gets a 3.4em drop cap, floated left, inheriting the chosen reading font
- `:not(.no-dropcap)` opt-out class so authors can suppress on chapters that open with a pull-quote
- Removed paragraph indent on the first paragraph (text-indent: 0) so the drop cap sits flush

All in `apps/app/src/features/books/reader/foliate/FoliateReader.tsx` — no new files, no new deps.
