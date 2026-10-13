export const meta = {
  name: 'church-instagram-search',
  description: 'Instagram search for one round of Brazilian churches (batches of 10, Haiku, 15 searches per batch)',
  phases: [{ title: 'Search', detail: 'one Haiku agent per batch of 10 churches', model: 'haiku' }],
}
const SCHEMA = { type: 'object', properties: { blocked: { type: 'boolean' }, results: { type: 'array', items: { type: 'object', properties: { n: { type: 'integer' }, instagram: { type: ['string', 'null'] }, match: { type: 'string', enum: ['confirmed', 'probable', 'none', 'not_searched'] }, owner: { type: ['string', 'null'], enum: ['own', 'parent', null] }, evidence: { type: 'string' }, candidates: { type: 'array', items: { type: 'string' } }, searches: { type: 'integer' } }, required: ['n', 'instagram', 'match', 'owner', 'evidence', 'searches'] } } }, required: ['results', 'blocked'] }
function prompt(b) {
  return `Find the Instagram account of each Catholic church listed in ${args.dir}/batch_${b}.txt (read it first; one church per line, all in Brazil, each with its "cidade: City/UF"; each line starts with its number "n=…", which you must copy back unchanged).

A wrong handle is much worse than "none": these go into a public church directory. Never construct or guess a handle — only return one that appeared as an instagram.com profile URL in a search result. Return the handle without "@" and without URL.

HARD BUDGET: you may make at most 15 WebSearch calls in total for the whole file. Spend one on every church first, then use what is left on second attempts for parishes that came back unresolved. If the search tool ever answers that the web search budget is used up, stop searching immediately, mark every church you did not get to as match "not_searched", and set blocked to true. Never report "none" for a church you did not actually search.

How to search (load the tool with ToolSearch "select:WebSearch" if it is not callable):
- WebSearch with mode "standard" and allowed_domains ["instagram.com"]. Query = church name + neighbourhood (when the line or address has one, otherwise the street name) + city name. In a small town the name + city is enough. No quotes, and do not add the word "instagram".
- Results come back as titles like "Paróquia X (@handle) • Instagram photos and videos", with a summary that often quotes the bio.
- Do not fetch instagram.com pages (login wall). Use no other tool to look churches up.

What counts as a match. Brazil has dozens of churches per patron saint and a large city alone has several, so a matching name — or the city or state in the handle of a big city's church — proves nothing.
- "confirmed": something specific ties the account to THIS church: its neighbourhood or street in the handle, title or quoted bio; its phone; the handle equal to the local part of its email (paroquiasvp@gmail.com ↔ @paroquiasvp); its website domain; the right diocese/region together with an unusual name; or, in a small town with a single parish of that name, the town itself named in the handle, title or bio.
- "probable": the name matches, it is clearly in the same city, nothing contradicts, but no specific tie.
- "none": searched, and no candidate or only namesakes from elsewhere. List the namesakes in "candidates".

Chapels and "Comunidade"/"CEB" entries usually have no account of their own. Only return a parent's account (owner "parent") when it is the parent PARISH and something ties it to this chapel (the email often names the parent parish). Do not return the account of a hospital, school, university or religious order as the chapel's account — that is "none".
If a line lists "handles seen on its site", pick the church's own (not the diocese's, an order's or a priest's personal account) and treat it as confirmed if the name fits; that needs no search.

"owner" is "own", "parent", or null. "evidence" is one short sentence quoting what tied it (or why candidates were rejected). Return one result per line of the file, same "n" values, nothing skipped.`
}
phase('Search')
const out = await parallel(
  Array.from({ length: args.end - args.start }, (_, i) => () =>
    agent(prompt(args.start + i), { label: `batch ${args.start + i}`, phase: 'Search', schema: SCHEMA, model: 'haiku' }),
  ),
)
const rows = out.filter(Boolean).flatMap(o => o.results || [])
const c = m => rows.filter(x => x.match === m).length
return { range: [args.start, args.end], blockedAgents: out.filter(o => o && o.blocked).length, nullAgents: out.filter(o => !o).length, confirmed: c('confirmed'), probable: c('probable'), none: c('none'), notSearched: c('not_searched'), searches: rows.reduce((a, x) => a + (x.searches || 0), 0) }