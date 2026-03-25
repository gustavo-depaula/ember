const baseUrl = 'https://bolls.life'

export type BollsBook = {
	bookid: number
	name: string
	chronorder: number
	chapters: number
}

export type BollsVerse = {
	pk: number
	verse: number
	text: string
}

export async function fetchBooks(translation: string): Promise<BollsBook[]> {
	const res = await fetch(`${baseUrl}/get-books/${translation}/`)
	if (!res.ok) {
		throw new Error(`Bolls.life: failed to fetch books for ${translation} (${res.status})`)
	}
	return res.json()
}

export async function fetchChapter(
	translation: string,
	bookId: number,
	chapter: number,
): Promise<BollsVerse[]> {
	const res = await fetch(`${baseUrl}/get-text/${translation}/${bookId}/${chapter}/`)
	if (!res.ok) {
		throw new Error(
			`Bolls.life: failed to fetch ${translation}/${bookId}/${chapter} (${res.status})`,
		)
	}
	return res.json()
}

// Translations known to have 73 books (full Catholic canon)
export const catholicTranslations = ['NABRE', 'RSV'] as const

// All available translations we support
export const availableTranslations = [
	{ code: 'DRB', name: 'Douay-Rheims Bible', source: 'bundled' },
	{ code: 'NABRE', name: 'New American Bible Revised Edition', source: 'api' },
	{ code: 'RSV', name: 'Revised Standard Version', source: 'api' },
] as const
