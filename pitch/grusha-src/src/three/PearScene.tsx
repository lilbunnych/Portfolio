import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Text } from '@react-three/drei'
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import wordmarkFont from '@fontsource/unbounded/files/unbounded-cyrillic-800-normal.woff?url'

/* ------------------------------------------------------------------ */
/* Backdrop: uneven wavy gradient, pale mint drifting into juicy green */
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

    vec3 milk  = vec3(0.945, 0.972, 0.930);
    vec3 mint  = vec3(0.860, 0.930, 0.820);
    vec3 fresh = vec3(0.700, 0.855, 0.610);
    vec3 juicy = vec3(0.520, 0.760, 0.450);

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
/* The pear                                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* The pear: lathe profile, then small asymmetries so it reads as fruit */
/* ------------------------------------------------------------------ */

const PEAR_HEIGHT = 2.68

function usePearGeometry() {
  return useMemo(() => {
    // radius / height profile, bottom to top; the first and last points make the calyx and stem dimples
    const pts = [
      [0, 0.03], [0.16, 0.0], [0.42, 0.04], [0.72, 0.18], [0.93, 0.42], [1.02, 0.72], [1.0, 1.02],
      [0.89, 1.3], [0.73, 1.56], [0.61, 1.8], [0.54, 2.03], [0.49, 2.26], [0.42, 2.46], [0.28, 2.61], [0.11, 2.68], [0, 2.655],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const profile = new THREE.SplineCurve(pts).getPoints(180)
    profile[0].x = 0
    profile[profile.length - 1].x = 0
    let g: THREE.BufferGeometry = new THREE.LatheGeometry(profile, 180)
    g.deleteAttribute('uv')
    g.deleteAttribute('normal')
    g = mergeVertices(g, 1e-5) // welds the lathe seam so normals stay smooth all the way round

    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const base = new THREE.Color('#f4f8dc'), top = new THREE.Color('#e3f2c4'), blush = new THREE.Color('#f7e2d6'), c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), z = pos.getZ(i)
      const y = pos.getY(i), yn = y / PEAR_HEIGHT
      const th = Math.atan2(z, x)
      // slightly oval section and two very soft ripples, like a real pear skin
      const k = 1 + 0.03 * Math.cos(2 * th) + 0.01 * Math.sin(3 * th + yn * 4) + 0.006 * Math.sin(5 * th - yn * 7)
      x *= k; z *= k
      // the belly sits a touch off-centre and the neck leans the other way
      const lean = Math.pow(THREE.MathUtils.smoothstep(yn, 0.45, 1), 2)
      x += 0.035 * Math.sin(yn * Math.PI) - 0.12 * lean
      z += 0.04 * lean
      pos.setXYZ(i, x, y - PEAR_HEIGHT / 2, z)
      // tint: pale yellow-green below, greener shoulders, a faint blush on one cheek
      c.copy(base).lerp(top, THREE.MathUtils.smoothstep(yn, 0.3, 0.9))
      c.lerp(blush, Math.max(0, Math.cos(th - 0.6)) * (1 - Math.abs(yn - 0.35) * 2.2) * 0.45)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

const STEM_TOP = new THREE.Vector3(-0.12, PEAR_HEIGHT / 2 - 0.03, 0.04)

function useStemGeometry() {
  return useMemo(() => {
    const p = STEM_TOP
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(p.x, p.y - 0.06, p.z),
      new THREE.Vector3(p.x + 0.01, p.y + 0.14, p.z),
      new THREE.Vector3(p.x + 0.07, p.y + 0.32, p.z + 0.02),
      new THREE.Vector3(p.x + 0.17, p.y + 0.44, p.z + 0.05),
    ])
    const g = new THREE.TubeGeometry(curve, 48, 0.045, 16, false)
    // taper towards the tip
    const pos = g.attributes.position
    const seg = 49
    for (let i = 0; i < pos.count; i++) {
      const t = Math.floor(i / 17) / (seg - 1)
      const centre = curve.getPoint(t)
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(centre).multiplyScalar(1 - t * 0.45).add(centre)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }, [])
}

function useLeafGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.2, 0.15, 0.48, 0.2, 0.82, 0.02)
    s.bezierCurveTo(0.46, -0.19, 0.2, -0.13, 0, 0)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 40 })
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      // curl along the length and fold along the midrib
      pos.setZ(i, pos.getZ(i) + Math.sin(x * 3.2) * 0.07 - Math.abs(y) * 0.25)
    }
    g.computeVertexNormals()
    return g
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
      const fit = Math.min((a.height / h.height) * vp.height, (a.width / h.width) * vp.width * 1.4)
      target.current = { x: (cx - 0.5) * vp.width, y: -(cy - 0.5) * vp.height, s: (fit * 0.9) / (PEAR_HEIGHT + 0.75) }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (anchor.current) ro.observe(anchor.current)
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [anchor, host, viewport, camera, size])
  return target
}

function Pear({ target, calm }: { target: RefObject<Target>; calm: boolean }) {
  const outer = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const leaf = useRef<THREE.Mesh>(null!)
  const body = usePearGeometry()
  const stemGeo = useStemGeometry()
  const leafGeo = useLeafGeometry()
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
    // twist one way, then the other; the tilt runs out of phase
    spin.current.rotation.y = Math.sin(t * 0.42) * 1.35 * amp + Math.sin(t * 0.17) * 0.5 * amp
    outer.current.rotation.z = Math.sin(t * 0.6 + 1.2) * 0.09 * amp + pointer.current.x * -0.12
    outer.current.rotation.x = Math.cos(t * 0.5) * 0.06 * amp + pointer.current.y * 0.1
    leaf.current.rotation.z = 0.5 + Math.sin(t * 1.6) * 0.08 * amp
  })

  return (
    <group ref={outer}>
      <group ref={spin}>
        <mesh geometry={body}>
          <meshPhysicalMaterial
            vertexColors
            transmission={1}
            thickness={0.35}
            roughness={0.015}
            ior={1.3}
            dispersion={4}
            clearcoat={1}
            clearcoatRoughness={0.02}
            iridescence={0.2}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[150, 420]}
            specularIntensity={1}
            attenuationColor="#e4f2c6"
            attenuationDistance={6}
            envMapIntensity={0.9}
          />
        </mesh>
        <mesh geometry={stemGeo}>
          <meshPhysicalMaterial color="#7a5836" roughness={0.55} clearcoat={0.4} />
        </mesh>
        <mesh ref={leaf} geometry={leafGeo} position={[STEM_TOP.x + 0.1, STEM_TOP.y + 0.27, STEM_TOP.z + 0.03]} rotation={[0.35, -0.45, 0.5]}>
          <meshPhysicalMaterial color="#5fb14a" roughness={0.1} transmission={0.8} thickness={0.2} ior={1.35} clearcoat={1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

/** Two thin orbits and a lime satellite around the pear. Opaque, so the glass refracts them too. */
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
          <meshBasicMaterial color="#0f2417" />
          <mesh ref={sat}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshBasicMaterial color="#c8f25a" />
          </mesh>
        </mesh>
      </group>
      <group rotation={[1.1, -0.5, 0.35]}>
        <mesh ref={b}>
          <torusGeometry args={[2.3, 0.004, 8, 240]} />
          <meshBasicMaterial color="#2f7a37" />
        </mesh>
      </group>
    </group>
  )
}

/** Giant wordmark behind the pear, rendered in WebGL so the glass bends it. */
function Wordmark({ target }: { target: RefObject<Target> }) {
  const { viewport, camera, size } = useThree()
  const ref = useRef<THREE.Mesh>(null!)
  const Z = -2.2
  const vp = viewport.getCurrentViewport(camera, [0, 0, Z])
  const fontSize = Math.min(vp.width * 0.205, vp.height * (size.width < 768 ? 0.16 : 0.34))
  const born = useRef<number | null>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (born.current === null) born.current = t
    const intro = 1 - Math.pow(1 - Math.min((t - born.current) / 1.4, 1), 3)
    // follow the pear's height; perspective scales the anchor from z=0 to z=Z
    const k = (camera.position.z - Z) / camera.position.z
    ref.current.position.set(0, target.current.y * k, Z)
    const m = ref.current.material as THREE.Material
    m.opacity = intro
  })
  return (
    <Text ref={ref} font={wordmarkFont} fontSize={fontSize} letterSpacing={-0.02} anchorX="center" anchorY="middle" color="#0f2417" material-transparent={false}>
      ГРУША
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
        <color attach="background" args={['#1d3325']} />
        <Lightformer form="rect" intensity={4} position={[-2.5, 2, 3]} rotation-y={0.5} scale={[0.35, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[2.8, 1, 3]} rotation-y={-0.6} scale={[0.25, 4, 1]} color="#f4ffe6" />
        <Lightformer form="rect" intensity={2} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[4, 0.4, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={1.5} position={[0, -4, 2]} scale={2} color="#b5e08f" />
        <Lightformer form="rect" intensity={1.2} position={[3, -1, -3]} scale={[2, 2, 1]} color="#ffc4d6" />
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
      <Pear target={target} calm={calm} />
    </>
  )
}

/** Full-bleed hero canvas: wavy gradient, wordmark, orbits and the glass pear aligned to `anchor`. */
export function PearScene({ anchor, host }: { anchor: Anchor; host: Anchor }) {
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
