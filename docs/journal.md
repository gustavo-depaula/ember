# Dev Journal

Accumulated learnings, discoveries, and decisions from Ember development. Things that aren't obvious from the code or docs — API quirks, licensing traps, UX lessons, technical gotchas.

**Agents: read this before starting work. Add entries when you learn something non-obvious.**

---

## Content & Licensing

- **DRB is the only viable bundled English Catholic Bible.** The Douay-Rheims (1749–1750) is fully public domain. Every other major Catholic English translation (NABRE, RSV-CE, NJB, etc.) is under active copyright. Source: `xxruyle/Bible-DouayRheims` on GitHub, MIT license.

- **Bolls.life DRB is incomplete — do NOT use it.** The Bolls.life API's Douay-Rheims translation only has 66 books — all 7 deuterocanonical books are missing. For Catholic use, always use the bundled version from xxruyle. Non-Catholic translations (66 books) work fine but need fallback to bundled DRB for deuterocanonical content.

- **ICEL copyright blocks free OF collects and antiphons.** The Ordinary Form's Collect, Entrance/Communion Antiphons, and other variable prayers are copyrighted by the International Commission on English in the Liturgy. No free API provides them in structured format. This is a hard blocker for complete OF daily Mass propers. The EF has no such problem — everything is available via Missale Meum/Divinum Officium.

- **CCC usage requires Vatican attribution.** The Catechism JSON comes from scraping vatican.va. Attribution required: "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana." Vatican generally permits non-commercial educational use.

- **Divinum Officium hymns use a custom bracket format.** The source files aren't JSON — they use `[SectionName]` brackets. Needs a one-time parse step to convert to JSON. Already done for MVP hymns.

## APIs & Integrations

- **Bolls.life API: free, no auth, generous rate limits.** Base URL: `https://bolls.life`. No documented rate limits, but don't abuse it. Responses cached indefinitely in SQLite since Bible text never changes.

- **Missale Meum API: complete EF propers in one call.** `https://www.missalemeum.com/{lang}/api/v5/proper/{YYYY-MM-DD}` returns every variable part of the 1962 Mass — Introit through Postcommunion, bilingual Latin/English. No auth. Free. Open source. Perfect for EF daily readings.

- **Evangelizo: OF reading text but with quirks.** `https://feed.evangelizo.org/v2/reader.php?date={YYYYMMDD}&lang={LANG}&type=all` provides full daily reading text. Limitations: response may contain HTML that needs stripping, date range limited to ~30 days from current date, no CORS headers (may need proxy for web), and does NOT provide collects/antiphons.

- **Catholic Readings API: OF calendar + references only.** GitHub Pages hosted (free, MIT). Provides Scripture references (not full text) and liturgical day metadata. The `psalm` field sometimes references non-psalm books (e.g., Jeremiah). Cross-chapter ranges use em-dash (—). Coverage: 2025–2026 data available.

- **Universalis JSONP: potentially has OF propers but unreliable.** Claims to provide full Mass propers via JSONP. Documentation is vague and incomplete. Legacy JavaScript callback pattern doesn't fit React Native well. Worth investigating further but don't count on it.

- **Bible Gateway and API.Bible are not viable.** Bible Gateway discontinued its API and prohibits scraping. API.Bible has FUMS tracking requirements implying online-only usage, unclear Catholic translation availability.

## UX & Design

*(Add entries as we learn from testing and user feedback)*

## Technical

*(Add entries as we discover platform quirks, library issues, or architectural lessons)*
