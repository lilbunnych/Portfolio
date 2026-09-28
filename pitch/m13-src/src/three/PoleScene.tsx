import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* Barber pole: striped core turning inside a glass tube, chrome caps   */
/* ------------------------------------------------------------------ */

const TUBE_H = 2.6
const POLE_HEIGHT = TUBE_H + 0.95 // with both caps and the finial

const stripeVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

// three diagonal bands (brick, bone, graphite) that climb as uT grows; simple rim light keeps it round
const stripeFrag = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uT;
  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
  void main() {
    float s = fract(vUv.x * 3.0 + vUv.y * 2.4 - uT);
    float aa = fwidth(s) * 1.5;
    vec3 brick = vec3(0.78, 0.25, 0.16);
    vec3 bone = vec3(0.95, 0.93, 0.89);
    vec3 coal = vec3(0.10, 0.10, 0.11);
    vec3 col = mix(brick, bone, smoothstep(0.34 - aa, 0.34 + aa, s));
    col = mix(col, coal, smoothstep(0.66 - aa, 0.66 + aa, s));
    col = mix(col, bone, smoothstep(0.84 - aa, 0.84 + aa, s));
    float light = 0.55 + 0.45 * max(dot(vNormal, normalize(vec3(0.4, 0.3, 1.0))), 0.0);
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
    gl_FragColor = vec4(toLinear(col) * light + rim * 0.12, 1.0);
    #include <colorspace_fragment>
  }
`

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
      const fit = Math.min((a.height / h.height) * vp.height, (a.width / h.width) * vp.width * 2.4)
      target.current = { x: (cx - 0.5) * vp.width, y: -(cy - 0.5) * vp.height, s: (fit * 0.92) / POLE_HEIGHT }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (anchor.current) ro.observe(anchor.current)
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [anchor, host, viewport, camera, size])
  return target
}

function Chrome({ rough = 0.12 }: { rough?: number }) {
  return <meshPhysicalMaterial color="#eeeae4" metalness={1} roughness={rough} clearcoat={0.6} envMapIntensity={2.4} />
}

function Pole({ target, calm }: { target: RefObject<Target>; calm: boolean }) {
  const outer = useRef<THREE.Group>(null!)
  const stripes = useRef<THREE.ShaderMaterial>(null!)
  const pointer = useRef({ x: 0, y: 0 })
  const born = useRef<number | null>(null)
  const uniforms = useMemo(() => ({ uT: { value: 0 } }), [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => { pointer.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 } }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.4, 1), 3)
    const amp = calm ? 0.3 : 1
    const { x, y, s } = target.current
    outer.current.position.set(x, y + Math.sin(t * 0.8) * 0.05 * amp - (1 - intro) * 0.6, 0)
    outer.current.scale.setScalar(s * (0.85 + 0.15 * intro))
    outer.current.rotation.z = -0.08 + Math.sin(t * 0.5) * 0.03 * amp + pointer.current.x * -0.1
    outer.current.rotation.x = pointer.current.y * 0.15
    outer.current.rotation.y = pointer.current.x * 0.35
    // the classic endless climb of the stripes
    stripes.current.uniforms.uT.value += Math.min(dt, 0.05) * 0.35 * amp
  })

  const top = TUBE_H / 2
  return (
    <group ref={outer}>
      {/* striped core */}
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, TUBE_H, 96, 1, true]} />
        <shaderMaterial ref={stripes} vertexShader={stripeVert} fragmentShader={stripeFrag} uniforms={uniforms} />
      </mesh>
      {/* glass tube */}
      <mesh>
        <cylinderGeometry args={[0.46, 0.46, TUBE_H, 96, 1, true]} />
        {/* plain transparent glass, not transmission: the stripes stay sharp behind it */}
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.16} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.02}
          specularIntensity={1} envMapIntensity={1.6} depthWrite={false} />
      </mesh>
      {/* chrome caps with rings and a ball finial */}
      {[1, -1].map(d => (
        <group key={d} position={[0, d * (top + 0.12), 0]}>
          <mesh><cylinderGeometry args={[0.53, 0.53, 0.24, 96]} /><Chrome /></mesh>
          <mesh position={[0, d * 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.5, 0.035, 16, 96]} /><Chrome rough={0.08} /></mesh>
          <mesh position={[0, -d * 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.5, 0.025, 16, 96]} /><Chrome rough={0.08} /></mesh>
        </group>
      ))}
      <mesh position={[0, top + 0.3, 0]} scale={[1, 0.7, 1]}><sphereGeometry args={[0.36, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><Chrome /></mesh>
      <mesh position={[0, top + 0.62, 0]}><sphereGeometry args={[0.13, 32, 32]} /><Chrome rough={0.05} /></mesh>
      <mesh position={[0, -top - 0.36, 0]}><cylinderGeometry args={[0.3, 0.44, 0.22, 64]} /><Chrome /></mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffe9d6" />
      <Environment resolution={256} frames={1}>
        {/* a dim loft: warm Edison strips and one cold window, so chrome reads as metal */}
        <color attach="background" args={['#3a2e26']} />
        <Lightformer form="rect" intensity={5} position={[-2.5, 1.5, 3]} rotation-y={0.5} scale={[0.3, 6, 1]} color="#ffd9b0" />
        <Lightformer form="rect" intensity={3} position={[2.8, 0.5, 3]} rotation-y={-0.6} scale={[0.25, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.5} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 0.4, 1]} color="#ffe4c4" />
        <Lightformer form="rect" intensity={1.2} position={[3, -1, -3]} scale={[2, 2, 1]} color="#e8704f" />
      </Environment>
    </>
  )
}

/** Transparent hero canvas with the barber pole aligned to `anchor`. */
export function PoleScene({ anchor, host }: { anchor: Anchor; host: Anchor }) {
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
  return <Pole target={target} calm={calm} />
}
