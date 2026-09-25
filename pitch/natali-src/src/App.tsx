import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { Header, Rail, Hud, Fab } from './components/Chrome'
import { Chapters } from './components/Chapters'
import { Builder } from './components/Builder'
import { Sheet } from './components/Sheet'
import { useChrome, useSmoothScroll } from './hooks'

// three.js is the heavy part: load it after the page text has rendered.
const Stage = lazy(() => import('./stage/Stage').then(m => ({ default: m.Stage })))

export default function App() {
  useSmoothScroll()
  const chrome = useChrome()
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div className="stage-fallback" />}><Stage /></Suspense>
      <Header />
      <Rail active={chrome.active} hidden={chrome.onSheet} />
      <Hud hidden={chrome.hudHidden} />
      <Chapters />
      <Builder />
      <Sheet />
      <Fab hidden={chrome.fabHidden} />
    </MotionConfig>
  )
}
