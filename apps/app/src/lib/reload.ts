/**
 * Runs a native reload (`Updates.reloadAsync`, `reloadAppAsync`) with this JS
 * runtime's fatal-error path muted.
 *
 * On iOS the old runtime keeps executing — pending timers, microtasks, effect
 * cleanups — while its native modules are torn down under it, so work in
 * flight can throw. An uncaught error there goes through `ErrorUtils` to
 * `RCTFatal`, where expo-updates' ErrorRecovery (re-armed for the relaunch)
 * blames the incoming update, marks its launch failed, and — having nothing
 * left to roll back to once the first launch showed content — aborts the
 * process. Errors from a runtime being discarded are noise; the new runtime
 * installs its own handler.
 */
export async function reloadDiscardingRuntimeErrors(reload: () => Promise<void>) {
  if (typeof ErrorUtils === 'undefined') return reload()

  const previousHandler = ErrorUtils.getGlobalHandler()
  ErrorUtils.setGlobalHandler(() => {})
  try {
    await reload()
  } catch (err) {
    // The reload never happened, so this runtime lives on and needs its
    // error reporting back.
    ErrorUtils.setGlobalHandler(previousHandler)
    throw err
  }
}
