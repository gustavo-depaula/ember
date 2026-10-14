// The connect page: this browser asks to join an account, as a new phone does,
// and once it has joined, says so and offers to leave.
import qrcode from 'qrcode-generator'
import { joinAccount, removeThisDevice } from '@/features/sync/account'
import { askToJoin, waitForAnswer } from '@/features/sync/pairing'
import { useSync } from '@/features/sync/state'
import { keepInStep } from './account'

type Step = 'asking' | 'checking' | 'bringing' | 'done' | 'expired' | 'failed' | 'connected'

function qrSvg(value: string): string {
  const code = qrcode(0, 'M')
  code.addData(value)
  code.make()
  const count = code.getModuleCount()
  let path = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (code.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`
    }
  }
  return `<svg viewBox="0 0 ${count} ${count}" role="img" aria-hidden="true"><path d="${path}" fill="#1A1612"/></svg>`
}

export function mountConnect(root: HTMLElement): void {
  const part = <T extends HTMLElement>(name: string) => root.querySelector(`[data-${name}]`) as T
  const show = (step: Step) => {
    for (const section of root.querySelectorAll<HTMLElement>('[data-step]')) {
      section.hidden = section.dataset.step !== step
    }
  }

  if (useSync.getState().account) {
    showConnected()
    return
  }

  let stopped = false
  async function ask() {
    const asking = await askToJoin()
    part('qr').innerHTML = qrSvg(asking.qr)
    part('code').textContent = `${asking.code.slice(0, 4)} ${asking.code.slice(4)}`
    const remaining = part('remaining')
    const template = remaining.dataset.template ?? '{{time}}'
    const tick = () => {
      const seconds = Math.ceil(Math.max(0, asking.expiresAt - Date.now()) / 1000)
      const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
      remaining.textContent = template.replace('{{time}}', time)
    }
    tick()
    const every = setInterval(tick, 1000)
    show('asking')
    try {
      const secret = await waitForAnswer(
        asking,
        (check) => {
          part('check').textContent = check
          show('checking')
        },
        () => stopped,
      )
      if (!secret) return show('expired')
      show('bringing')
      await joinAccount(secret)
      keepInStep()
      show('done')
    } finally {
      clearInterval(every)
    }
  }

  function start() {
    ask().catch((err: unknown) => {
      show('failed')
      throw err
    })
  }

  for (const button of root.querySelectorAll('[data-again]'))
    button.addEventListener('click', start)
  addEventListener('pagehide', () => {
    stopped = true
  })
  start()

  function showConnected() {
    const status = part('status')
    const labels = JSON.parse(status.dataset.labels ?? '{}') as Record<string, string>
    const render = () => {
      status.textContent = labels[useSync.getState().state] ?? ''
    }
    render()
    useSync.subscribe(render)
    show('connected')

    const remove = part<HTMLButtonElement>('remove')
    remove.addEventListener('click', () => {
      if (!confirm(remove.dataset.confirm)) return
      remove.disabled = true
      removeThisDevice().catch((err: unknown) => {
        remove.disabled = false
        alert(remove.dataset.failed)
        throw err
      })
    })
  }
}
