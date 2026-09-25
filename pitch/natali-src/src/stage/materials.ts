import * as THREE from 'three'
import { petalGeometry } from './geometry'

/** Velvety petal material with a little light passing through the rim (fake subsurface). */
function makePetalMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, side: THREE.DoubleSide, roughness: .5, metalness: 0,
    sheen: 1, sheenRoughness: .35, sheenColor: new THREE.Color('#ffe3ec'), specularIntensity: .35, envMapIntensity: .7,
  })
  m.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float rimLight = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.0);
      totalEmissiveRadiance += vColor.rgb * (.07 + .16 * rimLight);`)
  }
  return m
}

export function makeGreenMaterial() {
  const m = new THREE.MeshPhysicalMaterial({ color: '#4f8a3c', vertexColors: true, side: THREE.DoubleSide, roughness: .55, sheen: .4, sheenColor: new THREE.Color('#c8f0b0'), envMapIntensity: .7 })
  m.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += diffuseColor.rgb * .12;`)
  }
  return m
}

export const petalMaterial = makePetalMaterial()
export const outerPetal = petalGeometry(.7, .55, .55, 3)
