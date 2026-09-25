import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { petalGeometry, leafGeometry } from './geometry'
import { makeGreenMaterial, outerPetal, petalMaterial } from './materials'
import { cur, motionState, clamp, lerp, smooth, RM } from './state'

const MAX = 120

// Built once at module load: geometry, materials and the per-petal layout (mutated by the frame loop).
function buildParts() {
  const kinds = [petalGeometry(2.6, 0, 0, 1), petalGeometry(1.5, .25, .25, 2), outerPetal]
  const counts = [0, 0, 0]
  // Golden-angle phyllotaxis; t = 0 heart, 1 outer ring
  const petals = Array.from({ length: MAX }, (_, i) => {
    const t = Math.pow((i + 1) / MAX, .8)
    const kind = t < .4 ? 0 : t < .72 ? 1 : 2
    return { t, kind, slot: counts[kind]++, yaw: i * 2.39996 + (Math.random() - .5) * .25, jit: (Math.random() - .5) * .12, len: .9 + Math.random() * .2, seed: Math.random() * 6.28, vis: 0 }
  })
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .38, 0), new THREE.Vector3(.03, -.6, -.04), new THREE.Vector3(.1, -1.9, .05), new THREE.Vector3(.06, -3.8, 0)])
  const leaves = [[.36, 1, 1.05], [.4, -2.1, .8], [.58, -.6, .95], [.62, 2.4, .7]].map(([at, yaw, s]) => ({ at, yaw, s, seed: Math.random() * 6 }))
  const thorns = [[.3, 0], [.46, 2.2], [.62, 4.1], [.78, 1.2]]
  return { kinds, petals, green: makeGreenMaterial(), stemGeo: new THREE.TubeGeometry(curve, 80, .042, 12), curve, leafGeo: leafGeometry(), thorns, leaves }
}
const PARTS = buildParts()

export function Rose() {
  const flower = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)

  const { kinds, green, stemGeo, curve, leafGeo, thorns, leaves } = PARTS

  const meshes = useRef<THREE.InstancedMesh[]>([])
  const sepals = useRef<THREE.Mesh[]>([])
  const leafMeshes = useRef<THREE.Mesh[]>([])
  const thornGeo = useMemo(() => { const g = new THREE.ConeGeometry(.018, .09, 8); g.translate(0, .045, 0); return g }, [])

  const tmp = useMemo(() => ({ m4: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(0, 0, 0, 'YXZ'), v: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), [])

  useFrame(() => {
    const { time, wind, open, spin, tilt } = motionState
    const { m4, q, e, v, s, c } = tmp

    // Outer petals open first, the heart stays wrapped; each petal breathes a little
    for (let i = 0; i < MAX; i++) {
      const p = PARTS.petals[i], m = meshes.current[p.kind]
      if (!m) continue
      p.vis += (clamp(cur.count - i, 0, 1) - p.vis) * .12
      const o = smooth(clamp(open * 1.4 - (1 - p.t) * .4, 0, 1))
      const flutter = RM ? 0 : Math.sin(time * 2.1 + p.seed) * .018 * p.t + wind * .012 * p.t
      const pitch = lerp(.04 + p.t * .16, .2 + p.t * 1.02, o) + p.jit * o + cur.droop * p.t * p.t + flutter
      const L = (.26 + .7 * Math.pow(p.t, .75)) * p.len * cur.size
      const r0 = .015 + .09 * p.t * (.35 + .65 * o)
      q.setFromEuler(e.set(pitch, p.yaw, flutter * .5))
      v.set(Math.sin(p.yaw) * r0, .02 - .07 * p.t * o, Math.cos(p.yaw) * r0)
      const sv = L * smooth(p.vis) + 1e-4
      m.setMatrixAt(p.slot, m4.compose(v, q, s.set(sv * (.95 + .1 * p.t), sv, sv)))
      m.setColorAt(p.slot, c.copy(cur.inner).lerp(cur.outer, Math.pow(p.t, 1.3)))
    }
    meshes.current.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true })

    // Sepals fold back as the rose opens; leaves sway in the wind
    sepals.current.forEach((sp, i) => { sp.rotation.x = lerp(.5, 2.1, smooth(clamp(open, 0, 1))) + Math.sin(i * 2.3) * .08 })
    leafMeshes.current.forEach((lm, i) => {
      const l = leaves[i]
      lm.rotation.x = 1.05 + (RM ? 0 : Math.sin(time * 1.4 + l.seed) * .05 + wind * .04)
      lm.rotation.z = RM ? 0 : Math.sin(time * 1.1 + l.seed) * .06
    })

    petalMaterial.roughness = cur.rough; petalMaterial.sheen = cur.sheen
    petalMaterial.sheenColor.copy(cur.outer).lerp(c.set('#ffffff'), .2)
    green.color.copy(cur.stem)

    flower.current.rotation.set(.38 + tilt + wind * .012, spin, -.06 + wind * .025)
    head.current.rotation.z = wind * .02
  })

  return (
    <group ref={flower}>
      <group ref={head} position={[0, .35, 0]}>
        {kinds.map((g, k) => (
          <instancedMesh key={k} ref={el => { if (el) meshes.current[k] = el }} args={[g, petalMaterial, PARTS.petals.filter(p => p.kind === k).length]} frustumCulled={false} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i} rotation={[0, (i / 5) * Math.PI * 2 + .3, 0]}>
            <mesh ref={el => { if (el) sepals.current[i] = el }} geometry={leafGeo} material={green} scale={[.22, .42, .3]} position={[0, -.02, 0]} />
          </group>
        ))}
        <mesh material={green} position={[0, -.02, 0]} scale={[1, .8, 1]}><sphereGeometry args={[.09, 20, 14]} /></mesh>
      </group>
      <mesh geometry={stemGeo} material={green} />
      {thorns.map(([at, a], i) => {
        const p = curve.getPointAt(at).add(new THREE.Vector3(Math.cos(a) * .035, 0, Math.sin(a) * .035))
        return <mesh key={i} geometry={thornGeo} material={green} position={p} rotation={[Math.sin(a) * 1.2 - .4, 0, -Math.cos(a) * 1.2]} />
      })}
      {leaves.map((l, i) => (
        <group key={i} position={curve.getPointAt(l.at)} rotation={[0, l.yaw, 0]}>
          <mesh ref={el => { if (el) leafMeshes.current[i] = el }} geometry={leafGeo} material={green} rotation={[1.05, 0, 0]} scale={l.s} />
        </group>
      ))}
    </group>
  )
}
