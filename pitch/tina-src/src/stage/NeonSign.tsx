import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/** Neon colours the visitor can switch between by clicking the sign. */
const NEON = [
  { name: 'Тёплый белый', hex: '#ffe2bd' },
  { name: 'Пыльная роза', hex: '#ff7d93' },
  { name: 'Персик', hex: '#ffb07a' },
]

const RM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const V = (x: number, y: number) => new THREE.Vector3(x, y, 0)

// Hand-drawn monogram strokes (script "T", "S" and an underline swash), in sign units.
const STROKES: { letter: number; pts: THREE.Vector3[] }[] = [
  // T: crossbar with a curled start
  { letter: 0, pts: [V(-1.62, .78), V(-1.78, .98), V(-1.6, 1.16), V(-1.2, 1.12), V(-.7, 1.02), V(-.2, 1.06), V(.22, 1.18)] },
  // T: stem with a small foot
  { letter: 0, pts: [V(-.72, 1.04), V(-.76, .5), V(-.84, -.1), V(-.92, -.62), V(-1.1, -.9), V(-1.34, -.84)] },
  // S
  { letter: 1, pts: [V(1.46, .92), V(1.1, 1.14), V(.62, 1.05), V(.42, .7), V(.66, .32), V(1.14, .06), V(1.4, -.32), V(1.26, -.78), V(.8, -.98), V(.3, -.86), V(.1, -.62)] },
  // swash under both letters
  { letter: 2, pts: [V(-1.7, -1.24), V(-.8, -1.36), V(.3, -1.3), V(1.3, -1.24), V(1.9, -1.1)] },
]

/** Brightness of each letter over time: an ignition flicker, then a steady glow with rare stutters. */
function brightness(letter: number, t: number, start: number) {
  const s = t - start - letter * .35
  if (s < 0) return .04
  if (s < .9) {
    const f = Math.sin(s * 91 + letter * 7) * Math.sin(s * 37)
    return f > .15 ? 1 : s > .7 ? .8 : .08
  }
  const stutter = Math.sin(t * 2.3 + letter * 11) > .996 ? .35 : 1
  return stutter
}

function Environment() {
  const gl = useThree(s => s.gl)
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const tex = pmrem.fromScene(new RoomEnvironment(), .04).texture
    pmrem.dispose()
    return tex
  }, [gl])
  return <primitive object={env} attach="environment" />
}

/** Additive halo shell: bright where the shell faces the camera, fading to nothing at its silhouette. */
function haloMaterial(color: THREE.Color, falloff: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uStrength: { value: 0 }, uFalloff: { value: falloff } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uStrength, uFalloff; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(max(dot(normalize(vN), normalize(vV)), 0.0), uFalloff); gl_FragColor = vec4(uColor * f * uStrength, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  })
}

/** Painted brick wall (the salon's facade is dark brick); the neon lights it through the point light. */
function brickTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const x = c.getContext('2d')!
  x.fillStyle = '#1c1714'; x.fillRect(0, 0, 512, 512)
  const bw = 128, bh = 42, gap = 5
  for (let row = 0; row * bh < 512; row++) {
    for (let col = -1; col * bw < 512; col++) {
      const ox = (row % 2) * bw / 2
      const l = 16 + ((row * 7 + col * 13) % 5) * 1.6
      x.fillStyle = `hsl(18 16% ${l}%)`
      x.fillRect(col * bw + ox + gap / 2, row * bh + gap / 2, bw - gap, bh - gap)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(9, 9)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function Wall() {
  const map = useMemo(() => brickTexture(), [])
  return (
    <mesh position={[0, 0, -.7]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={map} roughness={.95} metalness={0} envMapIntensity={.18} />
    </mesh>
  )
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.45, 'rgba(255,255,255,.15)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

function roundedPlate(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -h / 2)
  s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  const g = new THREE.ExtrudeGeometry(s, { depth: .07, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 3 })
  g.translate(0, 0, -.2)
  return g
}

// Module-level scene parts (built once).
const PARTS = (() => {
  const tubes = STROKES.map(s => {
    const curve = new THREE.CatmullRomCurve3(s.pts, false, 'centripetal')
    // core tube plus two soft halo shells (no post-processing needed)
    return { letter: s.letter, geo: new THREE.TubeGeometry(curve, 140, .05, 12, false), halo: [new THREE.TubeGeometry(curve, 140, .11, 12, false), new THREE.TubeGeometry(curve, 140, .24, 12, false)], ends: [s.pts[0], s.pts[s.pts.length - 1]] }
  })
  const plate = roundedPlate(4.3, 3.2, .12)
  return { tubes, plate }
})()

function Sign({ color, igniteAt, onToggle }: { color: string; igniteAt: number; onToggle: () => void }) {
  const group = useRef<THREE.Group>(null!)
  // Unlit tubes: a near-white core and additive halos tinted with the neon colour. Brightness drives colour and opacity.
  const base = useMemo(() => new THREE.Color(color), [color])
  const mats = useMemo(() => [0, 1, 2].map(() => ({
    core: new THREE.MeshBasicMaterial({ color: base.clone(), toneMapped: false }),
    halo: [haloMaterial(base, 3), haloMaterial(base, 5)],
  })), [base])
  const white = useMemo(() => new THREE.Color('#ffffff'), [])
  const glowTex = useMemo(() => glowTexture(), [])
  const glow = useRef<THREE.MeshBasicMaterial>(null!)
  const pointer = useThree(s => s.pointer)
  const [hover, setHover] = useState(false)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    let total = 0
    mats.forEach((m, i) => {
      const b = RM ? 1 : brightness(i, t, igniteAt)
      m.core.color.copy(base).lerp(white, .55 * b).multiplyScalar(.18 + b * .82)
      m.halo[0].uniforms.uStrength.value = .9 * b; m.halo[1].uniforms.uStrength.value = .45 * b
      m.halo[0].uniforms.uColor.value.copy(base); m.halo[1].uniforms.uColor.value.copy(base)
      total += b
    })
    glow.current.opacity = (total / 3) * .4
    const tx = RM ? 0 : pointer.x * .35, ty = RM ? 0 : -pointer.y * .22
    group.current.rotation.y += (tx - group.current.rotation.y) * .06
    group.current.rotation.x += (ty - group.current.rotation.x) * .06
    group.current.position.y = RM ? 0 : Math.sin(t * .8) * .05
  })

  return (
    <group ref={group}
      onClick={e => { e.stopPropagation(); onToggle() }}
      onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
      scale={hover ? 1.02 : 1}>
      {/* neon light spilling onto the brick wall */}
      <pointLight position={[0, 0, .6]} intensity={9} color={color} distance={9} decay={1.6} />
      {/* wall glow behind the sign */}
      <mesh position={[0, 0, -.35]} scale={[7.5, 6, 1]}>
        <planeGeometry />
        <meshBasicMaterial ref={glow} map={glowTex} color={color} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* acrylic backing plate with four metal standoffs */}
      <mesh geometry={PARTS.plate}>
        <meshStandardMaterial color="#f7f5e9" transparent opacity={.1} roughness={.15} metalness={0} envMapIntensity={.6} depthWrite={false} />
      </mesh>
      {[[-1.95, 1.4], [1.95, 1.4], [-1.95, -1.4], [1.95, -1.4]].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, -.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[.07, .07, .22, 20]} />
          <meshStandardMaterial color="#c9a188" metalness={1} roughness={.25} />
        </mesh>
      ))}
      {/* neon tubes with dark electrode caps */}
      {PARTS.tubes.map((tube, i) => (
        <group key={i}>
          <mesh geometry={tube.geo} material={mats[tube.letter].core} />
          <mesh geometry={tube.halo[0]} material={mats[tube.letter].halo[0]} />
          <mesh geometry={tube.halo[1]} material={mats[tube.letter].halo[1]} />
          {tube.ends.map((p, k) => (
            <mesh key={k} position={p}><sphereGeometry args={[.052, 16, 12]} /><meshStandardMaterial color="#1f1a17" roughness={.4} /></mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Tiny sparks drifting around the sign. */
const SPARKS = (() => {
  const n = 90, a = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 8; a[i * 3 + 1] = (Math.random() - .5) * 6; a[i * 3 + 2] = (Math.random() - .5) * 2 }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(a, 3))
})()

function Sparks({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null!)
  const geo = SPARKS
  useFrame(({ clock }) => { ref.current.rotation.z = RM ? 0 : clock.elapsedTime * .02 })
  return <points ref={ref} geometry={geo}><pointsMaterial color={color} size={.03} transparent opacity={.7} depthWrite={false} toneMapped={false} /></points>
}

/** Pulls the camera back on narrow screens so the whole sign stays in frame. */
function Rig({ target }: { target: React.RefObject<THREE.Group | null> }) {
  useFrame(({ camera, size }) => {
    // fov 34: visible height = .611 * z. The sign plus margin is 5.8 x 4.8 units.
    const aspect = size.width / size.height
    const wide = aspect > 1.05
    const z = wide ? Math.max(4.8 / .611, 11.6 / (.611 * aspect)) : Math.max(5.8 / (.611 * aspect), 9.6 / .611 * .5)
    if (Math.abs(camera.position.z - z) > .001) { camera.position.z = z; camera.updateProjectionMatrix() }
    const vh = .611 * z, vw = vh * aspect
    if (target.current) target.current.position.set(wide ? vw / 4 : 0, wide ? 0 : vh * .27, 0)
  })
  return null
}

export function NeonSign({ colorIndex, onToggle }: { colorIndex: number; onToggle: () => void }) {
  const [igniteAt, setIgniteAt] = useState(.4)
  const holder = useRef<THREE.Group>(null)
  const color = NEON[colorIndex].hex
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 34, position: [0, 0, 7.4] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      fallback={<div className="grid h-full place-items-center font-serif text-7xl text-cream italic">TS</div>}
    >
      <color attach="background" args={['#2B2421']} />
      <Environment />
      <Rig target={holder} />
      <Wall />
      <ambientLight intensity={.12} />
      
      <group ref={holder}>
        <Sign color={color} igniteAt={igniteAt} onToggle={onToggle} />
        <Sparks color={color} />
      </group>
      <Reignite colorIndex={colorIndex} onIgnite={setIgniteAt} />
    </Canvas>
  )
}

/** Restarts the ignition flicker whenever the colour changes. */
function Reignite({ colorIndex, onIgnite }: { colorIndex: number; onIgnite: (t: number) => void }) {
  const clock = useThree(s => s.clock)
  const last = useRef(colorIndex)
  useFrame(() => {
    if (last.current !== colorIndex) { last.current = colorIndex; onIgnite(clock.elapsedTime) }
  })
  return null
}
