import { Component, type ReactNode } from 'react'

// Guards the lazily-loaded native map. If the expo-maps native view isn't in the running binary yet
// (the app needs a rebuild after adding it) or fails to mount, we show the fallback instead of
// red-screening — the list view still works without the native module.
export class MapErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[mass-times] native map unavailable', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
