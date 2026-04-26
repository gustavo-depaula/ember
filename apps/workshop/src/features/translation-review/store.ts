import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Issue, IssueDraft } from './types'

type ReviewState = {
  issues: Issue[]
}

type ReviewActions = {
  add: (draft: IssueDraft) => Issue
  update: (id: string, patch: Partial<IssueDraft>) => void
  remove: (id: string) => void
  clearForBook: (libraryId: string, bookId: string) => void
}

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set, get) => ({
      issues: [],

      add: (draft) => {
        const issue: Issue = {
          ...draft,
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          createdAt: Date.now(),
        }
        set({ issues: [...get().issues, issue] })
        return issue
      },

      update: (id, patch) => {
        set({
          issues: get().issues.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })
      },

      remove: (id) => {
        set({ issues: get().issues.filter((i) => i.id !== id) })
      },

      clearForBook: (libraryId, bookId) => {
        set({
          issues: get().issues.filter((i) => !(i.libraryId === libraryId && i.bookId === bookId)),
        })
      },
    }),
    {
      name: 'ember-translation-review',
      version: 1,
    },
  ),
)

const emptyIssues: Issue[] = []

export function useIssuesForBook(libraryId: string | undefined, bookId: string | undefined) {
  const issues = useReviewStore((s) => s.issues)
  return useMemo(() => {
    if (!libraryId || !bookId) return emptyIssues
    return issues.filter((i) => i.libraryId === libraryId && i.bookId === bookId)
  }, [issues, libraryId, bookId])
}
