import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'
import { UsagePage } from './usage/UsagePage'

// The desk's data is pushed over the event stream, so a query never goes stale on its own.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY, retry: false } },
})

const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {location.pathname.startsWith('/usage') ? <UsagePage /> : <App />}
    </QueryClientProvider>
  </StrictMode>,
)
