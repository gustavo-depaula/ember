import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import {
	useAllReadingProgress,
	useToggleBookRead,
	useToggleChapterRead,
} from '@/features/divine-office'
import { type Book, getDrbBooks } from '@/lib/content'

type CompletedChapters = Record<string, number[]>

function useBookState() {
	const { data: allProgress = [] } = useAllReadingProgress()

	return useMemo(() => {
		const books = getDrbBooks()
		const otBooks = books.filter((b) => b.testament === 'ot')
		const ntBooks = books.filter((b) => b.testament === 'nt')

		const otProgress = allProgress.find((p) => p.type === 'ot')
		const ntProgress = allProgress.find((p) => p.type === 'nt')

		const otChapters: CompletedChapters = otProgress
			? JSON.parse(otProgress.completed_chapters)
			: {}
		const ntChapters: CompletedChapters = ntProgress
			? JSON.parse(ntProgress.completed_chapters)
			: {}

		return { otBooks, ntBooks, otChapters, ntChapters }
	}, [allProgress])
}

function countReadChapters(chapters: CompletedChapters, books: Book[]): number {
	return books.reduce((sum, b) => sum + (chapters[b.id]?.length ?? 0), 0)
}

function countTotalChapters(books: Book[]): number {
	return books.reduce((sum, b) => sum + b.chapters, 0)
}

export default function BooksScreen() {
	const router = useRouter()
	const theme = useTheme()
	const toggleChapter = useToggleChapterRead()
	const toggleBook = useToggleBookRead()
	const { otBooks, ntBooks, otChapters, ntChapters } = useBookState()
	const [expandedBook, setExpandedBook] = useState<string>()

	function handleExpandBook(bookId: string) {
		setExpandedBook(expandedBook === bookId ? undefined : bookId)
	}

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$md">
				<Pressable onPress={() => router.back()}>
					<XStack alignItems="center" gap="$sm">
						<ChevronLeft size={20} color={theme.accent.val} />
						<Text fontFamily="$body" fontSize="$2" color="$accent">
							Settings
						</Text>
					</XStack>
				</Pressable>

				<Text fontFamily="$heading" fontSize="$5" color="$color">
					Mark as Read
				</Text>
				<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
					Tap a book to expand, then toggle individual chapters.
				</Text>

				<TestamentSection
					label="Old Testament"
					books={otBooks}
					chapters={otChapters}
					testament="ot"
					expandedBook={expandedBook}
					onExpandBook={handleExpandBook}
					toggleChapter={toggleChapter}
					toggleBook={toggleBook}
				/>

				<TestamentSection
					label="New Testament"
					books={ntBooks}
					chapters={ntChapters}
					testament="nt"
					expandedBook={expandedBook}
					onExpandBook={handleExpandBook}
					toggleChapter={toggleChapter}
					toggleBook={toggleBook}
				/>
			</YStack>
		</ScreenLayout>
	)
}

function TestamentSection({
	label,
	books,
	chapters,
	testament,
	expandedBook,
	onExpandBook,
	toggleChapter,
	toggleBook,
}: {
	label: string
	books: Book[]
	chapters: CompletedChapters
	testament: 'ot' | 'nt'
	expandedBook: string | undefined
	onExpandBook: (bookId: string) => void
	toggleChapter: ReturnType<typeof useToggleChapterRead>
	toggleBook: ReturnType<typeof useToggleBookRead>
}) {
	const read = countReadChapters(chapters, books)
	const total = countTotalChapters(books)

	return (
		<YStack gap="$sm">
			<Text fontFamily="$heading" fontSize="$3" color="$color">
				{label} ({read} of {total} chapters)
			</Text>
			{books.map((book) => {
				const bookChapters = chapters[book.id] ?? []
				const readSet = new Set(bookChapters)
				const isExpanded = expandedBook === book.id
				const allRead = bookChapters.length === book.chapters

				return (
					<YStack key={book.id} gap="$xs">
						<Pressable onPress={() => onExpandBook(book.id)}>
							<XStack
								backgroundColor="$backgroundSurface"
								borderRadius="$lg"
								padding="$sm"
								paddingHorizontal="$md"
								alignItems="center"
								justifyContent="space-between"
							>
								<YStack flex={1}>
									<Text fontFamily="$body" fontSize="$2" color="$color">
										{book.name}
									</Text>
									<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
										{bookChapters.length} of {book.chapters} chapters
									</Text>
								</YStack>
								<Text fontFamily="$body" fontSize="$2" color="$accent">
									{isExpanded ? '▾' : '▸'}
								</Text>
							</XStack>
						</Pressable>

						{isExpanded ? (
							<YStack gap="$sm" paddingVertical="$xs">
								<XStack justifyContent="flex-end" paddingHorizontal="$xs">
									<Pressable
										onPress={() =>
											toggleBook.mutate({
												type: testament,
												bookId: book.id,
												totalChapters: book.chapters,
											})
										}
									>
										<Text fontFamily="$body" fontSize="$1" color="$accent">
											{allRead ? 'Unmark all' : 'Mark all'}
										</Text>
									</Pressable>
								</XStack>
								<XStack flexWrap="wrap" gap={4}>
									{Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => {
										const isRead = readSet.has(ch)
										return (
											<Pressable
												key={ch}
												onPress={() =>
													toggleChapter.mutate({
														type: testament,
														bookId: book.id,
														chapter: ch,
													})
												}
											>
												<YStack
													width={40}
													height={40}
													borderRadius="$sm"
													backgroundColor={isRead ? '$accent' : '$backgroundSurface'}
													alignItems="center"
													justifyContent="center"
												>
													<Text
														fontFamily="$body"
														fontSize="$5"
														color={isRead ? '$background' : '$colorSecondary'}
													>
														{ch}
													</Text>
												</YStack>
											</Pressable>
										)
									})}
								</XStack>
							</YStack>
						) : undefined}
					</YStack>
				)
			})}
		</YStack>
	)
}
