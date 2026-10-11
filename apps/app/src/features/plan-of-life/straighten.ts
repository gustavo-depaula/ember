import { canonicalizePracticeIds } from '@/db/canonicalizePracticeIds'
import { getPreference, setPreference } from '@/db/repositories/preferences'

import { refileMisplacedCompletions } from './completion'

const doneKey = 'plan-straightened'

/**
 * Repairs of what earlier versions wrote into the log: practices kept under a
 * bare id, completions filed on the wrong slot. They need the corpus and the
 * calendar, so they wait for both; and they run once for a database, never
 * again, because each writes its fix from what this device sees — on a log
 * two devices share, both would write one.
 */
export async function straightenPlanOnce(): Promise<void> {
  if (await getPreference(doneKey)) return
  await canonicalizePracticeIds()
  await refileMisplacedCompletions()
  await setPreference(doneKey, '1')
}
