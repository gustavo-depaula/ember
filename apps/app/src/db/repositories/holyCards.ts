import { emit } from '../events'
import type { HolyCardCopy } from '../schema'

export async function recordHolyCardCopy(copy: HolyCardCopy): Promise<void> {
  await emit({ type: 'HolyCardRedeemed', ...copy })
}
