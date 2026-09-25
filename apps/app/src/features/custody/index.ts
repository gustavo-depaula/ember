/**
 * Custody — ascetical commitments (the negative half of the rule of life):
 * schedules, daily limits and, on iOS, Family Controls app shields.
 *
 * A self-contained module: screens, enforcement, notifications, the native
 * bridge and its own repository (the tables live in the shared migrations; the
 * iOS extensions and config plugins stay in the native project). Import it
 * only through this barrel. It is currently unplugged; to plug it back in,
 * wire these seams:
 *
 * - Boot — `app/_layout.tsx`: `startCustody()` in `initCorpus`'s `finally`,
 *   after the corpus has seeded.
 * - Routes — `app/(tabs)/(today,explore,library,you,search)/custody/`, one
 *   `export { X as default } from '@/features/custody'` file per screen:
 *   `_layout` → CustodyLayout, `index` → CustodyScreen,
 *   `new` → NewCommitmentScreen, `[commitmentId]` → EditCommitmentScreen,
 *   `session` → CustodySessionScreen, `shield-pray/[commitmentId]` →
 *   ShieldPrayScreen, `pray-to-disable/[commitmentId]` → PrayToDisableScreen.
 * - You — `<RuleOfLifeSections belowWall={<CustodyCard />} />`.
 * - Search — `useCustodyShortcut()` at the end of the study tiles.
 */

export { CustodyCard } from './components/CustodyCard'
export { CustodyLayout } from './screens/CustodyLayout'
export { CustodyScreen } from './screens/CustodyScreen'
export { CustodySessionScreen } from './screens/CustodySessionScreen'
export { EditCommitmentScreen } from './screens/EditCommitmentScreen'
export { NewCommitmentScreen } from './screens/NewCommitmentScreen'
export { PrayToDisableScreen } from './screens/PrayToDisableScreen'
export { ShieldPrayScreen } from './screens/ShieldPrayScreen'
export { useCustodyShortcut } from './shortcut'
export { startCustody } from './start'
