// The page's few interactions. Everything renders without it; this only
// remembers the reader's choices and switches between branches already in the page.
const root = document.documentElement

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode: the choice lasts for this page only.
  }
}

const header = document.querySelector('.site-header')
function markScrolled() {
  header?.toggleAttribute('data-scrolled', window.scrollY > 8)
}
markScrolled()
window.addEventListener('scroll', markScrolled, { passive: true })

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  const dark =
    root.dataset.theme === 'dark' ||
    (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const next = dark ? 'light' : 'dark'
  root.dataset.theme = next
  store('ember-theme', next)
})

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-latin-toggle]')) {
  const sync = () => button.setAttribute('aria-pressed', String(root.dataset.latin === 'on'))
  sync()
  button.addEventListener('click', () => {
    const on = root.dataset.latin !== 'on'
    if (on) root.dataset.latin = 'on'
    else delete root.dataset.latin
    store('ember-latin', on ? 'on' : 'off')
    for (const other of document.querySelectorAll('[data-latin-toggle]')) {
      other.setAttribute('aria-pressed', String(on))
    }
  })
}

// The app's five reading sizes.
const sizes = [16, 19, 21, 24, 28]
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-size-step]')) {
  button.addEventListener('click', () => {
    const current = Number(stored('ember-size') ?? 21)
    const index = Math.max(0, sizes.indexOf(current))
    const next =
      sizes[Math.min(sizes.length - 1, Math.max(0, index + Number(button.dataset.sizeStep)))]
    root.style.setProperty('--reading-size', `${next}px`)
    store('ember-size', String(next))
  })
}

// A picker shows one branch of a choice; every branch is already in the page.
function choose(choice: Element, option: string): void {
  for (const tab of choice.querySelectorAll(':scope > .picker > [data-option]')) {
    tab.setAttribute('aria-selected', String(tab.getAttribute('data-option') === option))
  }
  for (const branch of choice.querySelectorAll<HTMLElement>(':scope > .branch')) {
    branch.hidden = branch.dataset.option !== option
  }
}

document.addEventListener('click', (event) => {
  const tab = (event.target as Element).closest?.('.picker > [data-option]')
  const choice = tab?.closest('.choice')
  if (!tab || !choice) return
  choose(choice, tab.getAttribute('data-option') ?? '')
})

// A link to `#choice=option` (the hour of the Office, a set of mysteries) opens on it.
const wanted = new URLSearchParams(location.hash.slice(1))
for (const [key, option] of wanted) {
  const choice = document.querySelector(`.choice[data-choice="${CSS.escape(key)}"]`)
  if (choice?.querySelector(`:scope > .branch[data-option="${CSS.escape(option)}"]`)) {
    choose(choice, option)
  }
}

// An undated "today" page was built on the build server's day. A reader whose
// own day has moved on (or is a timezone behind) goes to that day's page.
const dated = document.querySelector<HTMLElement>('[data-today-base]')
if (dated?.dataset.todayBase) {
  const now = new Date()
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const built = dated.dataset.date ?? local
  const apart = Math.abs(Date.parse(local) - Date.parse(built)) / 86_400_000
  if (local !== built && apart <= 7) location.replace(`${dated.dataset.todayBase}${local}/`)
}
