import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Text } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import wordmarkFont from '@fontsource/unbounded/files/unbounded-cyrillic-800-normal.woff?url'

/* ------------------------------------------------------------------ */
/* Backdrop: uneven wavy gradient, warm cream drifting into amber      */
/* ------------------------------------------------------------------ */

const backdropVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`

const backdropFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;

  // 2D simplex noise (Ashima Arts, MIT)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.55;
    float t = uTime * 0.045;

    // low-frequency domain warp: a few broad, uneven waves instead of busy marble
    vec2 q = vec2(snoise(p * 1.1 + vec2(0.0, t)), snoise(p * 1.1 + vec2(5.2, -t * 0.7)));
    float n = snoise(p + 0.9 * q + vec2(t * 0.6, -t * 0.4));
    float wave = 0.5 + 0.5 * sin((p.y + q.x * 0.55) * 3.4 + n * 1.6 + t * 3.0);

    vec3 milk  = vec3(0.985, 0.960, 0.920);
    vec3 mint  = vec3(0.960, 0.880, 0.780);
    vec3 fresh = vec3(0.950, 0.745, 0.500);
    vec3 juicy = vec3(0.880, 0.540, 0.260);

    float g1 = smoothstep(-0.45, 0.75, n);
    vec3 col = mix(milk, mint, smoothstep(0.15, 0.95, wave));
    col = mix(col, fresh, g1 * 0.8);
    col = mix(col, juicy, smoothstep(0.45, 1.0, g1 * wave) * 0.6);

    // keep the text column airy
    float calm = smoothstep(0.75, 0.05, length((uv - vec2(0.2, 0.55)) * vec2(1.2, 1.0)));
    col = mix(col, milk, calm * 0.45);

    float grain = fract(sin(dot(uv * uRes, vec2(12.9898, 78.233))) * 43758.5453);
    col += (grain - 0.5) * 0.012;

    // authored in sRGB, output linear so transmission and tone mapping see the same colours
    gl_FragColor = vec4(toLinear(col), 1.0);
    #include <colorspace_fragment>
  }
`

function Backdrop() {
  const size = useThree(s => s.size)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }), [])
  useEffect(() => { uniforms.uRes.value.set(size.width, size.height) }, [size, uniforms])
  useFrame((_, dt) => { uniforms.uTime.value += Math.min(dt, 0.05) })
  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={backdropVert} fragmentShader={backdropFrag} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* The fox: a cartoon head of amber glass, like the studio's logo       */
/* ------------------------------------------------------------------ */

const FOX_HEIGHT = 2.75 // chin at -0.95, ear tips at about 1.8
const FOX_CENTRE = 0.42

const AMBER = new THREE.Color('#ffb454')
const CREAM = new THREE.Color('#fff4e4')
const DARK = new THREE.Color('#5a2a12')

/** Colours every vertex of a part with `paint(localPosition)`, then moves the part into place. */
function part(g: THREE.BufferGeometry, m: THREE.Matrix4, paint: (p: THREE.Vector3) => THREE.Color) {
  const pos = g.attributes.position
  const col = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) col.set(paint(v.fromBufferAttribute(pos, i)).toArray(), i * 3)
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g.applyMatrix4(m)
}

const mat = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz))

function useFoxGeometry() {
  return useMemo(() => {
    const c = new THREE.Color()
    const parts: THREE.BufferGeometry[] = []
    // head: soft, a little wider than tall; cream lower cheeks
    parts.push(part(new THREE.SphereGeometry(1, 72, 48), mat(0, 0.05, 0, 0, 0, 0, 1.05, 0.88, 0.82),
      p => c.copy(AMBER).lerp(CREAM, THREE.MathUtils.smoothstep(-p.y, 0.15, 0.55) * THREE.MathUtils.smoothstep(p.z, -0.2, 0.4))))
    // muzzle: amber on top, cream underneath
    parts.push(part(new THREE.SphereGeometry(1, 48, 32), mat(0, -0.3, 0.62, 0.25, 0, 0, 0.42, 0.34, 0.72),
      p => c.copy(AMBER).lerp(CREAM, THREE.MathUtils.smoothstep(-p.y, -0.35, 0.25))))
    // cheek fluff pointing out and down
    for (const s of [-1, 1]) {
      parts.push(part(new THREE.ConeGeometry(0.46, 1.0, 32, 4), mat(s * 0.92, -0.38, 0.18, 0, s * 0.25, s * -(Math.PI / 2 + 0.55), 1, 1, 0.6),
        p => c.copy(CREAM).lerp(AMBER, THREE.MathUtils.smoothstep(-p.y, 0.1, 0.45) * 0.5)))
      // ears with dark tips
      parts.push(part(new THREE.ConeGeometry(0.5, 0.95, 40, 8), mat(s * 0.62, 0.98, -0.1, -0.15, 0, s * -0.42, 1, 1, 0.45),
        p => c.copy(AMBER).lerp(DARK, THREE.MathUtils.smoothstep(p.y, 0.1, 0.45))))
    }
    const g = mergeGeometries(parts)!
    g.translate(0, -FOX_CENTRE, 0)
    return g
  }, [])
}

function Fox({ target, calm }: { target: RefObject<Target>; calm: boolean }) {
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const ears = useRef<THREE.Group>(null!)
  const body = useFoxGeometry()
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
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.6, 1), 3)
    const amp = calm ? 0.35 : 1
    const { x, y, s } = target.current

    // levitation: slow bob and drift
    outer.current.position.set(x + Math.sin(t * 0.37) * 0.04 * amp, y + Math.sin(t * 0.9) * 0.1 * amp - (1 - intro) * 0.8, 0)
    outer.current.scale.setScalar(s * (0.8 + 0.2 * intro))
    // looks one way, then the other, and follows the cursor a little
    spin.current.rotation.y = Math.sin(t * 0.42) * 0.38 * amp + Math.sin(t * 0.17) * 0.14 * amp + pointer.current.x * 0.4
    outer.current.rotation.z = Math.sin(t * 0.6 + 1.2) * 0.09 * amp
    outer.current.rotation.x = Math.cos(t * 0.5) * 0.06 * amp + pointer.current.y * 0.25
    // a quick ear twitch every few seconds
    const tw = Math.max(0, Math.sin(t * 1.3) - 0.94) * 4
    ears.current.scale.set(1, 1 - tw * 0.04, 1)
  })

  const eye = { color: '#1c120b', roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02 }
  return (
    <group ref={outer}>
      <group ref={spin}>
        <group ref={ears}>
          <mesh geometry={body}>
            <meshPhysicalMaterial
              vertexColors
              transmission={1}
              thickness={0.5}
              roughness={0.03}
              ior={1.3}
              dispersion={3}
              clearcoat={1}
              clearcoatRoughness={0.03}
              iridescence={0.15}
              iridescenceIOR={1.3}
              iridescenceThicknessRange={[150, 420]}
              specularIntensity={1}
              attenuationColor="#ffe2b8"
              attenuationDistance={6}
              envMapIntensity={0.9}
            />
          </mesh>
        </group>
        {/* big cartoon eyes with a catchlight, and a glossy nose */}
        {[-1, 1].map(s => (
          <group key={s} position={[s * 0.38, 0.12 - FOX_CENTRE, 0.74]} rotation={[0, s * 0.4, 0]}>
            <mesh scale={[1, 1.3, 0.55]}><sphereGeometry args={[0.16, 32, 32]} /><meshPhysicalMaterial {...eye} /></mesh>
            <mesh position={[0.05, 0.08, 0.08]}><sphereGeometry args={[0.045, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
        ))}
        <mesh position={[0, -0.12 - FOX_CENTRE, 1.33]} scale={[1.3, 0.85, 0.9]}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshPhysicalMaterial {...eye} />
        </mesh>
      </group>
    </group>
  )
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
      const fit = Math.min((a.height / h.height) * vp.height, (a.width / h.width) * vp.width * 1.4)
      target.current = { x: (cx - 0.5) * vp.width, y: -(cy - 0.5) * vp.height, s: (fit * 0.9) / (FOX_HEIGHT + 0.15) }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (anchor.current) ro.observe(anchor.current)
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [anchor, host, viewport, camera, size])
  return target
}

/** Two thin orbits and an amber satellite around the fox. Opaque, so the glass refracts them too. */
function Orbits({ target, calm }: { target: RefObject<Target>; calm: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const a = useRef<THREE.Mesh>(null!)
  const b = useRef<THREE.Mesh>(null!)
  const sat = useRef<THREE.Mesh>(null!)
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 2, 1), 3)
    const { x, y, s } = target.current
    const speed = calm ? 0.2 : 1
    group.current.position.set(x, y, 0)
    group.current.scale.setScalar(s * intro)
    a.current.rotation.z = t * 0.12 * speed
    b.current.rotation.z = -t * 0.08 * speed
    const ang = t * 0.5 * speed
    sat.current.position.set(Math.cos(ang) * 1.95, Math.sin(ang) * 1.95, 0)
  })
  return (
    <group ref={group}>
      <group rotation={[1.25, 0.18, 0]}>
        <mesh ref={a}>
          <torusGeometry args={[1.95, 0.006, 8, 220]} />
          <meshBasicMaterial color="#13281e" />
          <mesh ref={sat}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshBasicMaterial color="#f5b041" />
          </mesh>
        </mesh>
      </group>
      <group rotation={[1.1, -0.5, 0.35]}>
        <mesh ref={b}>
          <torusGeometry args={[2.3, 0.004, 8, 240]} />
          <meshBasicMaterial color="#b04f18" />
        </mesh>
      </group>
    </group>
  )
}

/** Giant wordmark behind the fox, rendered in WebGL so the glass bends it. */
function Wordmark({ target }: { target: RefObject<Target> }) {
  const { viewport, camera, size } = useThree()
  const ref = useRef<THREE.Mesh>(null!)
  const Z = -2.2
  const vp = viewport.getCurrentViewport(camera, [0, 0, Z])
  const fontSize = Math.min(vp.width * (size.width < 768 ? 0.135 : 0.15), vp.height * 0.3)
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.4, 1), 3)
    // follow the fox's height; perspective scales the anchor from z=0 to z=Z
    const k = (camera.position.z - Z) / camera.position.z
    ref.current.position.set(0, target.current.y * k, Z)
    const m = ref.current.material as THREE.Material
    m.opacity = intro
  })
  return (
    <Text ref={ref} font={wordmarkFont} fontSize={fontSize} letterSpacing={-0.02} anchorX="center" anchorY="middle" color="#13281e" material-transparent={false}>
      БАБИЕВА
    </Text>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        {/* dark room with a few crisp strips: reflections stay as highlights instead of fogging the glass */}
        <color attach="background" args={['#2a1c12']} />
        <Lightformer form="rect" intensity={4} position={[-2.5, 2, 3]} rotation-y={0.5} scale={[0.35, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[2.8, 1, 3]} rotation-y={-0.6} scale={[0.25, 4, 1]} color="#fff3e2" />
        <Lightformer form="rect" intensity={2} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 0.4, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={1.5} position={[0, -4, 2]} scale={2} color="#f5b041" />
        <Lightformer form="rect" intensity={1.2} position={[3, -1, -3]} scale={[2, 2, 1]} color="#ffd2a6" />
      </Environment>
    </>
  )
}

function Scene({ anchor, host, calm }: { anchor: Anchor; host: Anchor; calm: boolean }) {
  const target = useAnchorTarget(anchor, host)
  return (
    <>
      <Backdrop />
      <Lights />
      <Suspense fallback={null}><Wordmark target={target} /></Suspense>
      <Orbits target={target} calm={calm} />
      <Fox target={target} calm={calm} />
    </>
  )
}

/** Full-bleed hero canvas: wavy gradient, wordmark, orbits and the glass fox aligned to `anchor`. */
export function FoxScene({ anchor, host }: { anchor: Anchor; host: Anchor }) {
  const [visible, setVisible] = useState(true)
  const lowPower = useMemo(() => matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4, [])
  const calm = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // stop rendering once the hero leaves the screen
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [host])

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={visible ? 'always' : 'never'}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 6], fov: 35 }}
      flat
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <Scene anchor={anchor} host={host} calm={calm} />
    </Canvas>
  )
}
