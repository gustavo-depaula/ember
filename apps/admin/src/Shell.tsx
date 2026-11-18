import { useEffect, useState } from 'react'
import { App } from './App'
import { UsagePage } from './usage/UsagePage'

// The panel's frame: the desks listed down the side, and the one that is open beside them.
// Moving between them changes the address without loading the page again, so a desk keeps what
// it has read.

const desks = [
  { path: '/', label: 'Mass times', title: 'Ember admin · Mass times', Page: App },
  { path: '/usage', label: 'Usage', title: 'Ember admin · Usage', Page: UsagePage },
]

const deskAt = (pathname: string) =>
  desks.find((desk) => desk.path !== '/' && pathname.startsWith(desk.path)) ?? desks[0]

export function Shell() {
  const [pathname, setPathname] = useState(location.pathname)
  const current = deskAt(pathname) as (typeof desks)[number]

  useEffect(() => {
    const onPop = () => setPathname(location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    document.title = current.title
  }, [current])

  return (
    <div className="shell">
      <nav className="rail">
        <span className="rail-name">Ember</span>
        {desks.map((desk) => (
          <a
            key={desk.path}
            href={desk.path}
            className={desk === current ? 'on' : ''}
            aria-current={desk === current ? 'page' : undefined}
            onClick={(event) => {
              // A new tab or window is the browser's to open.
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
              event.preventDefault()
              history.pushState(null, '', desk.path)
              setPathname(desk.path)
            }}
          >
            {desk.label}
          </a>
        ))}
      </nav>
      <div className="shell-page">
        <current.Page />
      </div>
    </div>
  )
}
