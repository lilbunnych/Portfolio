import * as THREE from 'three'
import { clamp, smooth } from './state'

/**
 * Rose petal: broad rounded blade with a ruffled rim and fine veins in the vertex colours.
 * cup bends the sides inwards, reflex rolls the top outwards. Local +z points away from the centre.
 */
export function petalGeometry(cup: number, reflex: number, roll: number, seed: number) {
  const g = new THREE.PlaneGeometry(1, 1, 26, 34)
  const p = g.attributes.position
  const cols = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i), v = p.getY(i) + .5
    const w = v < .6 ? .16 + .84 * Math.sin((Math.PI / 2) * v / .6) : Math.sqrt(Math.max(0, 1 - Math.pow((v - .6) / .42, 2)))
    const x = u * w * 1.02
    const top = smooth(clamp((v - .55) / .45, 0, 1))
    const edge = Math.pow(Math.abs(u) * 2, 2)
    let z = -cup * x * x * (1 - .35 * top)
    z += reflex * top * top * .6
    z += roll * x * x * top * 1.6
    z += (.035 * Math.sin(u * 17 + seed * 5) + .02 * Math.sin(u * 31 + seed * 11)) * top * (.4 + edge)
    p.setXYZ(i, x, v - reflex * top * top * .12, z)
    // Warm lighter base, darker veins, slightly paler rim
    const vein = 1 - .07 * Math.pow(Math.abs(Math.sin(u * w * 46 + v * 2)), 10) * (1 - top * .6)
    const base = 1 + .12 * (1 - smooth(clamp(v / .25, 0, 1)))
    const rim = 1 + .05 * edge * top
    const k = Math.min(1.15, vein * base * rim) * (.93 + .07 * v)
    cols[i * 3] = k * (1 + .04 * (1 - v))
    cols[i * 3 + 1] = k * (1 + .08 * (1 - smooth(clamp(v / .2, 0, 1))))
    cols[i * 3 + 2] = k
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
  g.computeVertexNormals()
  return g
}

/** Leaf: pointed, serrated, folded along a pale midrib. */
export function leafGeometry() {
  const g = new THREE.PlaneGeometry(1, 1, 16, 28)
  const p = g.attributes.position
  const cols = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i), v = p.getY(i) + .5
    const w = Math.pow(Math.sin(Math.PI * Math.pow(v, .75)), .8) * .62
    const serr = 1 + .07 * Math.pow(Math.abs(Math.sin(v * 44)), 3) * Math.pow(Math.abs(u) * 2, 4)
    const x = u * w * serr
    p.setXYZ(i, x, v, .22 * Math.abs(x) - .3 * v * v)
    const midrib = Math.exp(-Math.pow(u * 30, 2))
    const side = Math.pow(Math.abs(Math.sin((Math.abs(u) * 2 - v) * 16)), 12) * .08
    const k = .85 + .3 * midrib - side + .1 * v
    cols[i * 3] = k * .95; cols[i * 3 + 1] = k; cols[i * 3 + 2] = k * .9
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
  g.computeVertexNormals()
  return g
}

/** Soft round sprite for dust motes. */
export function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}
