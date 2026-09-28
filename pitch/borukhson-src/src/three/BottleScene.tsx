import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Text } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import wordmarkFont from '@fontsource/unbounded/files/unbounded-cyrillic-800-normal.woff?url'
import { SHADES } from '@/data'

const SHADES_START = SHADES[0].hex

/* ------------------------------------------------------------------ */
/* Backdrop: uneven wavy gradient, pearl drifting into rose and berry   */
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

    vec3 milk  = vec3(0.985, 0.962, 0.970);
    vec3 pearl = vec3(0.950, 0.880, 0.910);
    vec3 lilac = vec3(0.905, 0.870, 0.960);
    vec3 rose  = vec3(0.925, 0.745, 0.820);
    vec3 berry = vec3(0.830, 0.520, 0.650);

    float g1 = smoothstep(-0.45, 0.75, n);
    vec3 col = mix(milk, pearl, smoothstep(0.15, 0.95, wave));
    // a pearly lilac sheen drifts across the pink, like nacre
    col = mix(col, lilac, smoothstep(0.1, 0.9, q.y) * 0.35);
    col = mix(col, rose, g1 * 0.75);
    col = mix(col, berry, smoothstep(0.45, 1.0, g1 * wave) * 0.55);

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
/* The lacquer bottle: glass body, liquid inside, tall glossy cap       */
/* ------------------------------------------------------------------ */

const BODY = { w: 1.7, h: 1.8, d: 1.1, y: -0.55 }
const CAP = { h: 1.0, y: 1.06 }
const BOTTLE_HEIGHT = 3.02
const CENTRE = 0.09 // the bottle spans -1.45..1.56, shift so it sits centred on the anchor

function useBottleGeometry() {
  return useMemo(() => ({
    body: new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 6, 0.3),
    // the lacquer fills about four fifths of the body and sits clear of the walls
    liquid: new RoundedBoxGeometry(BODY.w - 0.26, BODY.h * 0.72, BODY.d - 0.24, 5, 0.2),
  }), [])
}

function Bottle({ target, calm, shade }: { target: RefObject<Target>; calm: boolean; shade: string }) {
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const liquidMat = useRef<THREE.MeshPhysicalMaterial>(null!)
  const { body, liquid } = useBottleGeometry()
  const pointer = useRef({ x: 0, y: 0 })
  const born = useRef<number | null>(null)
  const want = useMemo(() => new THREE.Color(shade), [shade])

  useEffect(() => {
    const onMove = (e: PointerEvent) => { pointer.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 } }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.6, 1), 3)
    const amp = calm ? 0.35 : 1
    const { x, y, s } = target.current

    // levitation: slow bob and drift
    outer.current.position.set(x + Math.sin(t * 0.37) * 0.04 * amp, y + Math.sin(t * 0.9) * 0.1 * amp - (1 - intro) * 0.8, 0)
    outer.current.scale.setScalar(s * (0.8 + 0.2 * intro))
    // twist one way, then the other; the tilt runs out of phase
    spin.current.rotation.y = -0.45 + Math.sin(t * 0.42) * 1.1 * amp + Math.sin(t * 0.17) * 0.45 * amp
    outer.current.rotation.z = Math.sin(t * 0.6 + 1.2) * 0.08 * amp + pointer.current.x * -0.12
    outer.current.rotation.x = 0.08 + Math.cos(t * 0.5) * 0.06 * amp + pointer.current.y * 0.1
    // the lacquer flows into the new shade instead of snapping
    const k = 1 - Math.exp(-dt * 4)
    liquidMat.current.color.lerp(want, k)
    liquidMat.current.emissive.lerp(want, k)
  })

  return (
    <group ref={outer}>
      <group ref={spin} position={[0, -CENTRE, 0]}>
        <mesh geometry={liquid} position={[0, BODY.y - BODY.h * 0.12, 0]}>
          <meshPhysicalMaterial ref={liquidMat} color={SHADES_START} emissive={SHADES_START} emissiveIntensity={0.28} roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.3} />
        </mesh>
        <mesh geometry={body} position={[0, BODY.y, 0]}>
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.02}
            ior={1.45}
            dispersion={3}
            clearcoat={1}
            clearcoatRoughness={0.02}
            iridescence={0.25}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[180, 460]}
            specularIntensity={1}
            attenuationColor="#fff4f8"
            attenuationDistance={8}
            envMapIntensity={1}
          />
        </mesh>
        {/* neck and a satin metal collar */}
        <mesh position={[0, BODY.y + BODY.h / 2 + 0.1, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.24, 48]} />
          <meshPhysicalMaterial transmission={1} thickness={0.3} roughness={0.03} ior={1.45} clearcoat={1} envMapIntensity={1} />
        </mesh>
        <mesh position={[0, CAP.y - CAP.h / 2 - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.405, 0.035, 16, 72]} />
          <meshPhysicalMaterial color="#f1d3de" metalness={1} roughness={0.22} envMapIntensity={1.4} />
        </mesh>
        <mesh position={[0, CAP.y, 0]}>
          <cylinderGeometry args={[0.36, 0.4, CAP.h, 72, 1]} />
          <meshPhysicalMaterial color="#2a1422" roughness={0.18} metalness={0.2} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.2} />
        </mesh>
        <mesh position={[0, CAP.y + CAP.h / 2, 0]}>
          <sphereGeometry args={[0.36, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#2a1422" roughness={0.18} metalness={0.2} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={1.2} />
        </mesh>
        {/* monogram on the front of the glass */}
        <Suspense fallback={null}>
          <Text font={wordmarkFont} fontSize={0.3} letterSpacing={0.04} anchorX="center" anchorY="middle" position={[0, BODY.y - 0.05, BODY.d / 2 + 0.004]} color="#fff6f9">
            МБ
          </Text>
        </Suspense>
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
      target.current = { x: (cx - 0.5) * vp.width, y: -(cy - 0.5) * vp.height, s: (fit * 0.9) / (BOTTLE_HEIGHT + 0.25) }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (anchor.current) ro.observe(anchor.current)
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [anchor, host, viewport, camera, size])
  return target
}

/** Two thin orbits and a pearl satellite around the bottle. Opaque, so the glass refracts them too. */
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
          <meshBasicMaterial color="#2a1422" />
          <mesh ref={sat}>
            <sphereGeometry args={[0.07, 32, 32]} />
            <meshPhysicalMaterial color="#fff7fa" roughness={0.15} clearcoat={1} sheen={1} sheenColor="#f6b6ce" envMapIntensity={1.2} />
          </mesh>
        </mesh>
      </group>
      <group rotation={[1.1, -0.5, 0.35]}>
        <mesh ref={b}>
          <torusGeometry args={[2.3, 0.004, 8, 240]} />
          <meshBasicMaterial color="#ad2359" />
        </mesh>
      </group>
    </group>
  )
}

/** Giant wordmark behind the bottle, rendered in WebGL so the glass bends it. */
function Wordmark({ target }: { target: RefObject<Target> }) {
  const { viewport, camera, size } = useThree()
  const ref = useRef<THREE.Mesh>(null!)
  const Z = -2.2
  const vp = viewport.getCurrentViewport(camera, [0, 0, Z])
  const fontSize = Math.min(vp.width * (size.width < 768 ? 0.112 : 0.12), vp.height * 0.26)
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.4, 1), 3)
    // follow the bottle's height; perspective scales the anchor from z=0 to z=Z
    const k = (camera.position.z - Z) / camera.position.z
    ref.current.position.set(0, target.current.y * k, Z)
    const m = ref.current.material as THREE.Material
    m.opacity = intro
  })
  return (
    <Text ref={ref} font={wordmarkFont} fontSize={fontSize} letterSpacing={-0.02} anchorX="center" anchorY="middle" color="#2a1422" material-transparent={false}>
      БОРУХСОН
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
        <color attach="background" args={['#2a1422']} />
        <Lightformer form="rect" intensity={4} position={[-2.5, 2, 3]} rotation-y={0.5} scale={[0.35, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[2.8, 1, 3]} rotation-y={-0.6} scale={[0.25, 4, 1]} color="#fff0f5" />
        <Lightformer form="rect" intensity={2} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 0.4, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={1.5} position={[0, -4, 2]} scale={2} color="#f6b6ce" />
        <Lightformer form="rect" intensity={1.2} position={[3, -1, -3]} scale={[2, 2, 1]} color="#ffc4d6" />
      </Environment>
    </>
  )
}

function Scene({ anchor, host, calm, shade }: { anchor: Anchor; host: Anchor; calm: boolean; shade: string }) {
  const target = useAnchorTarget(anchor, host)
  return (
    <>
      <Backdrop />
      <Lights />
      <Suspense fallback={null}><Wordmark target={target} /></Suspense>
      <Orbits target={target} calm={calm} />
      <Bottle target={target} calm={calm} shade={shade} />
    </>
  )
}

/** Full-bleed hero canvas: wavy gradient, wordmark, orbits and the glass bottle aligned to `anchor`. */
export function BottleScene({ anchor, host, shade }: { anchor: Anchor; host: Anchor; shade: string }) {
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
      <Scene anchor={anchor} host={host} calm={calm} shade={shade} />
    </Canvas>
  )
}
