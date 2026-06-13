/**
 * Dev-only JS-thread stall detector. A heartbeat interval measures the gap
 * between ticks; when the JS thread blocks, the gap stretches past the
 * threshold and we log it. The signature freeze this exists for: touches and
 * scroll dead while the native tab bar stays alive. No-ops when !__DEV__.
 */

let running = false

export function startStallMonitor(): void {
  if (!__DEV__ || running) return
  running = true
  const intervalMs = 250
  let last = Date.now()
  setInterval(() => {
    const now = Date.now()
    const gap = now - last
    last = now
    if (gap > 500) console.warn(`[stall] JS thread blocked ~${gap - intervalMs}ms`)
  }, intervalMs)
}
