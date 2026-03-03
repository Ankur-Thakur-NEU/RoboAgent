import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

export const createCoffeeFlow = (scene) => {
  const noise3D = createNoise3D()
  const count = 1800
  const positions = new Float32Array(count * 3)
  const base = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    const radius = Math.random() * 1.6 + 0.4
    const angle = Math.random() * Math.PI * 2
    const height = (Math.random() - 0.5) * 4.2

    const x = Math.cos(angle) * radius
    const y = height
    const z = Math.sin(angle) * radius

    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z

    base[i3] = x
    base[i3 + 1] = y
    base[i3 + 2] = z
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffc38f,
    size: 0.03,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.position.set(0, 0.2, -0.4)
  scene.add(points)

  const update = (elapsed, scroll) => {
    const positionAttr = geometry.getAttribute('position')
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3
      const bx = base[i3]
      const by = base[i3 + 1]
      const bz = base[i3 + 2]

      const curl = noise3D(
        bx * 0.6 + elapsed * 0.2,
        by * 0.4 + scroll * 2.0,
        bz * 0.6 + elapsed * 0.15
      )

      positionAttr.array[i3] = bx + curl * 0.5
      positionAttr.array[i3 + 1] = by + scroll * 2.2 + Math.sin(elapsed + bx) * 0.05
      positionAttr.array[i3 + 2] = bz + Math.cos(elapsed + by) * 0.05
    }

    positionAttr.needsUpdate = true
  }

  return { points, update }
}
