import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(__dirname, '..', 'src', 'assets', 'bible', 'drb')
mkdirSync(outDir, { recursive: true })

const baseUrl =
	'https://raw.githubusercontent.com/xxruyle/Bible-DouayRheims/master/Douay-Rheims'

// Douay-Rheims uses older Catholic book names
// Map: [fileName (in repo), slug, display name, testament]
const books: [string, string, string, 'ot' | 'nt'][] = [
	// Old Testament
	['Genesis', 'genesis', 'Genesis', 'ot'],
	['Exodus', 'exodus', 'Exodus', 'ot'],
	['Leviticus', 'leviticus', 'Leviticus', 'ot'],
	['Numbers', 'numbers', 'Numbers', 'ot'],
	['Deuteronomy', 'deuteronomy', 'Deuteronomy', 'ot'],
	['Josue', 'josue', 'Josue', 'ot'],
	['Judges', 'judges', 'Judges', 'ot'],
	['Ruth', 'ruth', 'Ruth', 'ot'],
	['1 Kings', '1-kings', '1 Kings', 'ot'],
	['2 Kings', '2-kings', '2 Kings', 'ot'],
	['3 Kings', '3-kings', '3 Kings', 'ot'],
	['4 Kings', '4-kings', '4 Kings', 'ot'],
	['1 Paralipomenon', '1-paralipomenon', '1 Paralipomenon', 'ot'],
	['2 Paralipomenon', '2-paralipomenon', '2 Paralipomenon', 'ot'],
	['1 Esdras', '1-esdras', '1 Esdras', 'ot'],
	['2 Esdras', '2-esdras', '2 Esdras', 'ot'],
	['Tobias', 'tobias', 'Tobias', 'ot'],
	['Judith', 'judith', 'Judith', 'ot'],
	['Esther', 'esther', 'Esther', 'ot'],
	['Job', 'job', 'Job', 'ot'],
	['Psalms', 'psalms', 'Psalms', 'ot'],
	['Proverbs', 'proverbs', 'Proverbs', 'ot'],
	['Ecclesiastes', 'ecclesiastes', 'Ecclesiastes', 'ot'],
	['Canticles', 'canticles', 'Canticle of Canticles', 'ot'],
	['Wisdom', 'wisdom', 'Wisdom', 'ot'],
	['Ecclesiasticus', 'ecclesiasticus', 'Ecclesiasticus', 'ot'],
	['Isaias', 'isaias', 'Isaias', 'ot'],
	['Jeremias', 'jeremias', 'Jeremias', 'ot'],
	['Lamentations', 'lamentations', 'Lamentations', 'ot'],
	['Baruch', 'baruch', 'Baruch', 'ot'],
	['Ezechiel', 'ezechiel', 'Ezechiel', 'ot'],
	['Daniel', 'daniel', 'Daniel', 'ot'],
	['Osee', 'osee', 'Osee', 'ot'],
	['Joel', 'joel', 'Joel', 'ot'],
	['Amos', 'amos', 'Amos', 'ot'],
	['Abdias', 'abdias', 'Abdias', 'ot'],
	['Jonas', 'jonas', 'Jonas', 'ot'],
	['Micheas', 'micheas', 'Micheas', 'ot'],
	['Nahum', 'nahum', 'Nahum', 'ot'],
	['Habacuc', 'habacuc', 'Habacuc', 'ot'],
	['Sophonias', 'sophonias', 'Sophonias', 'ot'],
	['Aggeus', 'aggeus', 'Aggeus', 'ot'],
	['Zacharias', 'zacharias', 'Zacharias', 'ot'],
	['Malachias', 'malachias', 'Malachias', 'ot'],
	['1 Machabees', '1-machabees', '1 Machabees', 'ot'],
	['2 Machabees', '2-machabees', '2 Machabees', 'ot'],
	// New Testament
	['Matthew', 'matthew', 'Matthew', 'nt'],
	['Mark', 'mark', 'Mark', 'nt'],
	['Luke', 'luke', 'Luke', 'nt'],
	['John', 'john', 'John', 'nt'],
	['Acts', 'acts', 'Acts', 'nt'],
	['Romans', 'romans', 'Romans', 'nt'],
	['1 Corinthians', '1-corinthians', '1 Corinthians', 'nt'],
	['2 Corinthians', '2-corinthians', '2 Corinthians', 'nt'],
	['Galatians', 'galatians', 'Galatians', 'nt'],
	['Ephesians', 'ephesians', 'Ephesians', 'nt'],
	['Philippians', 'philippians', 'Philippians', 'nt'],
	['Colossians', 'colossians', 'Colossians', 'nt'],
	['1 Thessalonians', '1-thessalonians', '1 Thessalonians', 'nt'],
	['2 Thessalonians', '2-thessalonians', '2 Thessalonians', 'nt'],
	['1 Timothy', '1-timothy', '1 Timothy', 'nt'],
	['2 Timothy', '2-timothy', '2 Timothy', 'nt'],
	['Titus', 'titus', 'Titus', 'nt'],
	['Philemon', 'philemon', 'Philemon', 'nt'],
	['Hebrews', 'hebrews', 'Hebrews', 'nt'],
	['James', 'james', 'James', 'nt'],
	['1 Peter', '1-peter', '1 Peter', 'nt'],
	['2 Peter', '2-peter', '2 Peter', 'nt'],
	['1 John', '1-john', '1 John', 'nt'],
	['2 John', '2-john', '2 John', 'nt'],
	['3 John', '3-john', '3 John', 'nt'],
	['Jude', 'jude', 'Jude', 'nt'],
	['Apocalypse', 'apocalypse', 'Apocalypse', 'nt'],
]

type BookMeta = {
	slug: string
	name: string
	testament: 'ot' | 'nt'
	chapters: number
}

async function downloadBook(
	fileName: string,
	slug: string,
): Promise<Record<string, Record<string, string>>> {
	const url = `${baseUrl}/${encodeURIComponent(fileName)}.json`
	console.log(`  Fetching ${fileName}...`)
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Failed to fetch ${fileName}: ${res.status}`)
	return res.json()
}

async function main() {
	console.log('Downloading Douay-Rheims Bible (73 books)...\n')

	const manifest: BookMeta[] = []
	let downloaded = 0

	// Download in batches of 10 to avoid hammering the server
	for (let i = 0; i < books.length; i += 10) {
		const batch = books.slice(i, i + 10)
		const results = await Promise.all(
			batch.map(async ([fileName, slug, name, testament]) => {
				const data = await downloadBook(fileName, slug)
				const chapters = Object.keys(data).length
				return { fileName, slug, name, testament, chapters, data }
			}),
		)

		for (const { slug, name, testament, chapters, data } of results) {
			writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(data))
			manifest.push({ slug, name, testament, chapters })
			downloaded++
		}

		console.log(`  [${downloaded}/${books.length}] downloaded\n`)
	}

	writeFileSync(join(outDir, 'index.json'), JSON.stringify(manifest, undefined, '\t'))

	console.log(`\nDone! ${downloaded} books saved to src/assets/bible/drb/`)
	console.log(`Manifest written to src/assets/bible/drb/index.json`)
}

main().catch((err) => {
	console.error('Error:', err)
	process.exit(1)
})
