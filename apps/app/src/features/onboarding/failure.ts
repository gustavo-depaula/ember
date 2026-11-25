import { confirm } from '@/components'
import i18n from '@/lib/i18n'

/** A step that failed says so, with the reason, rather than leaving the screen stuck. */
export function reportFailure(error: unknown) {
  confirm({
    title: i18n.t('error.somethingWrong'),
    description: error instanceof Error ? error.message : String(error),
    singleAction: true,
  })
}
