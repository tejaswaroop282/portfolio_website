import { Component, lazy, Suspense, useEffect, useRef } from 'react'
import { createScrollController } from './animations/scrollController'
import { setUI, useUI, world } from './hooks/useWorldProgress'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import Overlay from './components/Overlay'
import InfoPanel from './components/InfoPanel'
import ClassicView from './components/ClassicView'

// The 3D world (three.js + R3F) is a separate chunk: classic-view visitors never download it.
const World = lazy(() => import('./world/World'))

function detectWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!(window.WebGLRenderingContext && c.getContext('webgl'))
  } catch {
    return false
  }
}

class WorldBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.error('3D world failed, falling back to classic view:', err)
    setUI({ webgl: false, mode: 'classic' })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function WorldMode({ lite }) {
  const track = useRef()
  useEffect(() => {
    document.documentElement.scrollTop = 0
    world.target = 0
    world.f = 0
    return createScrollController(track.current)
  }, [])
  return (
    <>
      <WorldBoundary>
        <Suspense fallback={null}>
          <World lite={lite} />
        </Suspense>
      </WorldBoundary>
      {/* The scroll track: the page's scroll position is what drives the journey. */}
      <div ref={track} className="scroll-track" style={{ height: lite ? '900vh' : '1000vh' }} aria-hidden="true" />
      <Navbar />
      <Overlay />
      <InfoPanel />
      <LoadingScreen />
    </>
  )
}

export default function App() {
  const mode = useUI((s) => s.mode)
  const webgl = useUI((s) => s.webgl)
  const reduced = useUI((s) => s.reducedMotion)
  const lite = useUI((s) => s.lite)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const small = window.matchMedia('(max-width: 820px)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    const ok = detectWebGL()
    setUI({ reducedMotion: mq.matches, webgl: ok, lite: !!small, mode: !ok || mq.matches ? 'classic' : 'world' })
    const onChange = (e) => setUI({ reducedMotion: e.matches, mode: e.matches ? 'classic' : getModeFallback() })
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // The world is not mounted until detection has run, so no WebGL context is ever created needlessly.
  if (mode === 'pending') return null
  if (mode === 'classic') {
    const reason = !webgl
      ? 'Your browser or device could not start WebGL, so this is the classic view of the portfolio. Everything from the 3D journey is here.'
      : reduced
        ? 'Reduced-motion is on, so the animated journey is off and you are seeing the classic view. Everything from the 3D journey is here.'
        : null
    return <ClassicView reason={reason} canEnterWorld={webgl} />
  }
  return <WorldMode lite={lite} />
}

function getModeFallback() {
  return detectWebGL() ? 'world' : 'classic'
}
