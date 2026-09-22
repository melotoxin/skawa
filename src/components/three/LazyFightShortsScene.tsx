import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './fight-shorts-scene.css'

const ProceduralFightShortsScene = lazy(() => import('./ProceduralFightShortsScene'))

export type LazyFightShortsSceneProps = {
  className?: string
  eager?: boolean
  label?: string
  staticFallback?: boolean
}

type SceneBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

type SceneBoundaryState = {
  failed: boolean
}

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false }

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function StaticFightShortsPreview({ loading = false }: { loading?: boolean }) {
  return (
    <div className="skawa-3d__static" aria-hidden="true">
      <div className="skawa-3d__static-product">
        <span className="skawa-3d__waist" />
        <span className="skawa-3d__left-leg" />
        <span className="skawa-3d__right-leg" />
        <span className="skawa-3d__static-mark">SF</span>
      </div>
      <span className="skawa-3d__status">{loading ? 'LOADING 3D' : 'STATIC PREVIEW'}</span>
    </div>
  )
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', { powerPreference: 'high-performance' })
      ?? canvas.getContext('webgl', { powerPreference: 'high-performance' })
    return Boolean(context)
  } catch {
    return false
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

export default function LazyFightShortsScene({
  className = '',
  eager = false,
  label = 'Interactive 3D demo of SKAWA fight shorts. Procedural placeholder geometry will be replaced by an approved production model.',
  staticFallback = false,
}: LazyFightShortsSceneProps) {
  const figureRef = useRef<HTMLElement>(null)
  const captionId = useId()
  const reducedMotion = usePrefersReducedMotion()
  const [nearViewport, setNearViewport] = useState(eager)
  const [sceneVisible, setSceneVisible] = useState(eager)
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (staticFallback) return
    setWebGLAvailable(supportsWebGL())
  }, [staticFallback])

  useEffect(() => {
    if (eager || staticFallback) {
      setNearViewport(eager)
      return
    }

    const element = figureRef.current
    if (!element || !('IntersectionObserver' in window)) {
      setNearViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '320px 0px', threshold: 0.01 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [eager, staticFallback])

  useEffect(() => {
    if (staticFallback) return
    const element = figureRef.current
    if (!element || !('IntersectionObserver' in window)) {
      setSceneVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setSceneVisible(entry.isIntersecting), { threshold: 0.04 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [staticFallback])

  const shouldRenderCanvas = !staticFallback && nearViewport && webGLAvailable === true
  const fallback = <StaticFightShortsPreview loading={!staticFallback && webGLAvailable !== false} />

  return (
    <figure
      ref={figureRef}
      className={`skawa-3d ${className}`.trim()}
      aria-labelledby={captionId}
    >
      <span className="skawa-3d__badge" aria-hidden="true">
        3D DEMO PLACEHOLDER · GLB READY
      </span>
      {shouldRenderCanvas ? (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <ProceduralFightShortsScene reducedMotion={reducedMotion} active={sceneVisible} />
          </Suspense>
        </SceneBoundary>
      ) : fallback}
      <figcaption id={captionId} className="skawa-3d__caption">
        {label}
      </figcaption>
    </figure>
  )
}
