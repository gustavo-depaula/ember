import { canonicalizePracticeIds } from '@/db/canonicalizePracticeIds'
import { getDb } from '@/db/client'
import { once } from '@/db/upgradeLog'

import { refileMisplacedCompletions } from './completion'

/**
 * Repairs of what earlier versions wrote into the log: practices kept under a
 * bare id, completions filed on the wrong slot. They need the corpus and the
 * calendar, so they wait for both; and they run once for a database, never
 * again, because each writes its fix from what this device sees — on a log
 * two devices share, both would write one.
 */
export function straightenPlanOnce(): Promise<void> {
  return once(getDb(), 2, async () => {
    await canonicalizePracticeIds()
    await refileMisplacedCompletions()
  })
}
