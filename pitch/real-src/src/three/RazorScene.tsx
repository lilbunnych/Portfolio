import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Text } from '@react-three/drei'
import * as THREE from 'three'
import engraveFont from '@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff?url'

/* ------------------------------------------------------------------ */
/* Straight razor: steel blade on a pivot, black scales, red pins       */
/* ------------------------------------------------------------------ */

const SPAN = 5.1 // blade tip to tail when fully open

function useRazorGeometry() {
  return useMemo(() => {
    // blade: pivot at the origin, spine on top, round point at the far end
    const b = new THREE.Shape()
    b.moveTo(0, 0.1)
    b.lineTo(0.38, 0.2)
    b.lineTo(2.08, 0.25)
    b.quadraticCurveTo(2.42, 0.25, 2.43, -0.01)
    b.quadraticCurveTo(2.41, -0.3, 2.06, -0.31)
    b.lineTo(0.52, -0.25)
    b.quadraticCurveTo(0.3, -0.22, 0.24, -0.06)
    b.lineTo(0, -0.08)
    b.closePath()
    const blade = new THREE.ExtrudeGeometry(b, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 32 })
    blade.translate(0, 0, -0.0175)

    // one scale of the handle: long, slightly waisted, rounded ends
    const h = new THREE.Shape()
    h.moveTo(-0.12, 0)
    h.quadraticCurveTo(-0.12, 0.2, 0.1, 0.22)
    h.quadraticCurveTo(1.3, 0.3, 2.45, 0.24)
    h.quadraticCurveTo(2.7, 0.2, 2.7, 0)
    h.quadraticCurveTo(2.7, -0.2, 2.45, -0.24)
    h.quadraticCurveTo(1.3, -0.3, 0.1, -0.22)
    h.quadraticCurveTo(-0.12, -0.2, -0.12, 0)
    const scale = new THREE.ExtrudeGeometry(h, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 5, curveSegments: 40 })
    return { blade, scale }
  }, [])
}

type Anchor = RefObject<HTMLElement | null>
type Target = { x: number; y: number; s: number }

/** Maps the anchor element's box onto world units at z = 0, kept in a ref for useFrame. */
function useAnchorTarget(anchor: Anchor, host: Anchor) {
  const { viewport, camera, size } = useThree()
  const target = useRef<Target>({ x: 0, y: 0, s: 1 })
  useEffect(() => {
    const measure = () => {
      const a = anchor.current?.getBoundingClientRect()
      const h = host.current?.getBoundingClientRect()
      if (!a || !h) return
      const vp = viewport.getCurrentViewport(camera, [0, 0, 0])
      const cx = (a.left + a.width / 2 - h.left) / h.width
      const cy = (a.top + a.height / 2 - h.top) / h.height
      target.current = { x: (cx - 0.5) * vp.width, y: -(cy - 0.5) * vp.height, s: ((a.width / h.width) * vp.width) / SPAN }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (anchor.current) ro.observe(anchor.current)
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [anchor, host, viewport, camera, size])
  return target
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function Razor({ target, calm }: { target: RefObject<Target>; calm: boolean }) {
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const blade = useRef<THREE.Group>(null!)
  const { blade: bladeGeo, scale } = useRazorGeometry()
  const pointer = useRef({ x: 0, y: 0 })
  const born = useRef<number | null>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => { pointer.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 } }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const age = t - born.current
    const amp = calm ? 0.3 : 1
    const { x, y, s } = target.current
    // the razor flips open once, then breathes: it closes a hair and opens again every few seconds
    const open = calm ? 1 : ease(Math.min(Math.max((age - 0.3) / 1.4, 0), 1))
    const breathe = calm ? 0 : Math.max(0, Math.sin(age * 0.9 - 2)) ** 6 * 0.18
    blade.current.rotation.z = (open - breathe) * (Math.PI - 0.22)
    // while closed the whole thing sits at the handle; opening slides the centre over
    outer.current.position.set(x - (1 - open) * s * 1.2 + Math.sin(t * 0.4) * 0.05 * amp, y + Math.sin(t * 0.9) * 0.06 * amp, 0)
    outer.current.scale.setScalar(s)
    outer.current.rotation.z = 0.18 + Math.sin(t * 0.5) * 0.03 * amp + pointer.current.x * -0.08
    spin.current.rotation.x = -0.35 + Math.sin(t * 0.45) * 0.3 * amp + pointer.current.y * 0.3
    spin.current.rotation.y = Math.sin(t * 0.3) * 0.18 * amp + pointer.current.x * 0.3
  })

  const steel = <meshPhysicalMaterial color="#f4f3f1" metalness={1} roughness={0.07} clearcoat={0.8} envMapIntensity={2.6} />
  const pin = <meshPhysicalMaterial color="#d8120f" metalness={0.4} roughness={0.25} clearcoat={1} />
  return (
    <group ref={outer}>
      {/* the pivot sits a little right of centre so the open razor is balanced on the anchor */}
      <group ref={spin} position={[-0.15, 0, 0]}>
        <group ref={blade}>
          <mesh geometry={bladeGeo}>{steel}</mesh>
          <Suspense fallback={null}>
            <Text font={engraveFont} fontSize={0.2} letterSpacing={0.12} anchorX="center" anchorY="middle" position={[1.35, -0.02, 0.031]} rotation={[0, 0, Math.PI]} color="#55524e">
              REAL
            </Text>
          </Suspense>
        </group>
        {/* two scales either side of the blade */}
        {[0.045, -0.125].map(z => (
          <mesh key={z} geometry={scale} position={[0, 0, z]}>
            <meshPhysicalMaterial color="#141212" roughness={0.22} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.2} />
          </mesh>
        ))}
        {/* pivot and tail pins */}
        {[0, 2.5].map(px => (
          <mesh key={px} position={[px, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.3, 24]} />
            {px === 0 ? steel : pin}
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 5]} intensity={1.5} />
      <Environment resolution={256} frames={1}>
        {/* a bright studio: broad softboxes so the steel reads as a mirror, one red card for a brand glint */}
        <color attach="background" args={['#8f8a82']} />
        <Lightformer form="rect" intensity={4} position={[0, 3, 4]} scale={[8, 1.2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[-4, 0, 2]} rotation-y={Math.PI / 3} scale={[2, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[4, -1, 2]} rotation-y={-Math.PI / 3} scale={[2, 4, 1]} color="#ff3b30" />
        <Lightformer form="rect" intensity={1} position={[0, -4, 2]} scale={[6, 1, 1]} color="#2a2826" />
      </Environment>
    </>
  )
}

/** Transparent hero canvas with the razor aligned to `anchor`. */
export function RazorScene({ anchor, host }: { anchor: Anchor; host: Anchor }) {
  const [visible, setVisible] = useState(true)
  const lowPower = useMemo(() => matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4, [])
  const calm = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [host])

  return (
    <Canvas className="!absolute inset-0" frameloop={visible ? 'always' : 'never'} dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 7], fov: 32 }} flat gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} aria-hidden>
      <Lights />
      <Scene anchor={anchor} host={host} calm={calm} />
    </Canvas>
  )
}

function Scene({ anchor, host, calm }: { anchor: Anchor; host: Anchor; calm: boolean }) {
  const target = useAnchorTarget(anchor, host)
  return <Razor target={target} calm={calm} />
}
