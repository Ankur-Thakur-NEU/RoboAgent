import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

export const createCoffeeFlow = (scene, { textureUrl } = {}) => {
  const noise3D = createNoise3D()
  const count = window.matchMedia('(max-width: 768px)').matches ? 700 : 1800
  const positions = new Float32Array(count * 3)
  const base = new Float32Array(count * 3)
  const dummy = new THREE.Object3D()

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

  const geometry = new THREE.SphereGeometry(0.03, 8, 8)
  const material = new THREE.MeshStandardMaterial({
    color: 0xffc38f,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(0x4b2a10),
  })
  if (textureUrl) {
    const loader = new THREE.TextureLoader()
    loader.load(
      textureUrl,
      (texture) => {
        material.map = texture
        material.needsUpdate = true
      },
      undefined,
      () => {
        console.error('Coffee texture load failed - check ASSET_PATHS.coffeeBeanTexture')
      }
    )
  }
  const points = new THREE.InstancedMesh(geometry, material, count)
  points.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  points.position.set(0, 0.2, -0.4)
  scene.add(points)

  const update = (elapsed, scroll) => {
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

      dummy.position.set(
        bx + curl * 0.5,
        by + scroll * 2.2 + Math.sin(elapsed + bx) * 0.05,
        bz + Math.cos(elapsed + by) * 0.05
      )
      dummy.updateMatrix()
      points.setMatrixAt(i, dummy.matrix)
    }
    points.instanceMatrix.needsUpdate = true
  }

  return { points, update }
}
