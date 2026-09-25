import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { Rose } from './Rose'
import { petalMaterial, outerPetal } from './materials'
import { dotTexture } from './geometry'
import { bindDrag, computeLayout, cur, layout, motionState, lerp, smooth, step, RM } from './state'

const CAM_Z = 7, FOV = 32, BACK_Z = -6

/** Runs first each frame: scroll, order, blending, layout. */
function Driver() {
  const size = useThree(s => s.size)
  useEffect(() => { computeLayout(size.width, size.height, FOV, CAM_Z) }, [size])
  useEffect(() => bindDrag(), [])
  useFrame((_, dt) => step(Math.min(dt, .05)), -1)
  return null
}

/** Soft studio reflections, attached to the scene as its environment map. */
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

const BACKDROP_UNIFORMS = {
  uTime: { value: 0 }, uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uTint: { value: new THREE.Color() },
  uCaustic: { value: 0 }, uAspect: { value: 1 }, uCenter: { value: new THREE.Vector2(.68, .52) },
}

/** Gradient, soft halo behind the rose, drifting light and a faint grid. */
function Backdrop() {
  const size = useThree(s => s.size)
  const uniforms = BACKDROP_UNIFORMS
  const aspect = size.width / size.height
  const vh = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (CAM_Z - BACK_Z)
  useFrame(() => {
    uniforms.uA.value.copy(cur.bgA); uniforms.uB.value.copy(cur.bgB); uniforms.uTint.value.copy(cur.outer)
    uniforms.uCaustic.value = cur.caustic; uniforms.uTime.value = RM ? 0 : motionState.time
    uniforms.uAspect.value = aspect; uniforms.uCenter.value.set(layout.cx, layout.cy)
  })
  return (
    <mesh position={[0, 0, BACK_Z]} scale={[vh * aspect * 1.05, vh * 1.05, 1]}>
      <planeGeometry />
      <shaderMaterial depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime, uCaustic, uAspect; uniform vec3 uA, uB, uTint; uniform vec2 uCenter;
          float caustic(vec2 p, float t){
            for (int n = 0; n < 3; n++) p += .45 * vec2(sin(p.y * 1.3 + t * (1.0 + float(n) * .3)), cos(p.x * 1.1 - t * (.8 + float(n) * .25)));
            return pow(1.0 - abs(sin(p.x) * sin(p.y)), 14.0);
          }
          void main(){
            vec2 uv = vUv; uv.x *= uAspect;
            vec2 d = vUv - uCenter; d.x *= uAspect;
            vec3 col = mix(uA, uB, smoothstep(0.0, 1.0, length(d) * .9));
            col = mix(col, uTint, exp(-dot(d, d) * 5.0) * .4);
            col += vec3(1.0) * caustic(uv * 3.0, uTime * .2) * .16 * uCaustic;
            float stripes = smoothstep(.6, 1.0, sin(uv.x * 8.0 - uv.y * 2.4 + uTime * .05));
            col = mix(col, col * .9 + .1, stripes * .25 * uCaustic);
            vec2 g = abs(fract(uv * 14.0) - .5);
            col -= smoothstep(.485, .5, max(g.x, g.y)) * .012;
            gl_FragColor = vec4(col, 1.0);
          }`} />
    </mesh>
  )
}

/** Thin orbit ring and dotted track for the futuristic frame. */
function Rings() {
  const g = useRef<THREE.Group>(null!), dots = useRef<THREE.Points>(null!)
  const dotGeo = useMemo(() => {
    const a = new Float32Array(72 * 3)
    for (let i = 0; i < 72; i++) { const t = (i / 72) * Math.PI * 2; a[i * 3] = Math.cos(t) * 1.65; a[i * 3 + 1] = Math.sin(t) * 1.65 }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(a, 3))
  }, [])
  useFrame(() => {
    const t = motionState.time
    g.current.rotation.set(1.25 + Math.sin(t * .3) * .06, 0, t * .08)
    dots.current.rotation.z = -t * .15
  })
  return (
    <group ref={g} position={[0, .45, 0]}>
      <mesh><ringGeometry args={[1.45, 1.456, 160]} /><meshBasicMaterial color="#d23a6f" transparent opacity={.3} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <points ref={dots} geometry={dotGeo}><pointsMaterial color="#111016" size={.022} transparent opacity={.3} depthWrite={false} /></points>
    </group>
  )
}

/** Dust motes drifting up through the light. */
const POLLEN = (() => {
  const N = 140, pos = new Float32Array(N * 3), seed = new Float32Array(N)
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 10; pos[i * 3 + 1] = (Math.random() - .5) * 7; pos[i * 3 + 2] = (Math.random() - .5) * 4; seed[i] = Math.random() }
  return { N, geo: new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)), seed }
})()

function Pollen() {
  const tex = useMemo(() => dotTexture(), [])
  const mat = useRef<THREE.PointsMaterial>(null!)
  const c = useMemo(() => new THREE.Color(), [])
  useFrame((_, dt) => {
    const a = POLLEN.geo.attributes.position.array as Float32Array, { time, wind } = motionState, seed = POLLEN.seed
    for (let i = 0; i < POLLEN.N; i++) {
      a[i * 3 + 1] += Math.min(dt, .05) * (.04 + seed[i] * .1) * (RM ? 0 : 1)
      a[i * 3] += (Math.sin(time * .5 + seed[i] * 20) * .03 + wind * .02) * Math.min(dt, .05)
      if (a[i * 3 + 1] > 3.5) a[i * 3 + 1] = -3.5
    }
    POLLEN.geo.attributes.position.needsUpdate = true
    mat.current.color.copy(cur.outer).lerp(c.set('#ffffff'), .6)
  })
  return <points geometry={POLLEN.geo}><pointsMaterial ref={mat} size={.06} map={tex} transparent opacity={.75} depthWrite={false} /></points>
}

/** Loose petals drifting down across the scene. */
const DRIFT = Array.from({ length: 7 }, () => ({ x: (Math.random() - .5) * 9, y: Math.random() * 7 - 3.5, z: -1.5 - Math.random() * 2, r: Math.random() * 6, s: .18 + Math.random() * .12, v: .15 + Math.random() * .15 }))

function Drift() {
  const N = DRIFT.length, D = DRIFT
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])
  useFrame((_, dt) => {
    const t = motionState.time, d0 = Math.min(dt, .05)
    D.forEach((d, i) => {
      if (!RM) { d.y -= d.v * d0; d.x += Math.sin(t * .7 + i) * d0 * .12; d.r += d0 * .6 }
      if (d.y < -4) { d.y = 4; d.x = (Math.random() - .5) * 9 }
      tmp.q.setFromEuler(tmp.e.set(d.r, d.r * .7, Math.sin(d.r) * .8))
      mesh.current.setMatrixAt(i, tmp.m.compose(tmp.p.set(d.x, d.y, d.z), tmp.q, tmp.s.setScalar(d.s)))
      mesh.current.setColorAt(i, tmp.c.copy(cur.outer).lerp(cur.inner, .3))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[outerPetal, petalMaterial, N]} frustumCulled={false} />
}

/** Positions and scales the rose group from the computed layout. */
function Holder({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame(() => {
    const { time, intro } = motionState
    g.current.position.set(layout.x, layout.y + (RM ? 0 : Math.sin(time * .6) * .04), 0)
    g.current.scale.setScalar(layout.s * lerp(.6, 1, smooth(intro)))
  })
  return <group ref={g}>{children}</group>
}

export function Stage() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      dpr={[1, 2]}
      camera={{ fov: FOV, position: [0, 0, CAM_Z], near: .1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1 }}
      fallback={<div className="stage-fallback" />}
      aria-hidden
    >
      <Driver />
      <Environment />
      <Backdrop />
      <Holder>
        <Rose />
        <Rings />
      </Holder>
      <Pollen />
      <Drift />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff1e2" />
      <hemisphereLight args={['#ffffff', '#d8c8d2', .7]} />
      <directionalLight position={[-2, 2.5, -4]} intensity={2.2} color="#ffd6e4" />
    </Canvas>
  )
}
