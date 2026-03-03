import * as THREE from 'three'

export const createCoffeeTrail = (scene) => {
  const maxPoints = 120
  const positions = new Float32Array(maxPoints * 3)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffc38f,
    size: 0.06,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.position.set(0, 0, -0.8)
  scene.add(points)

  let index = 0

  const addPoint = (x, y) => {
    const i3 = index * 3
    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = 0
    index = (index + 1) % maxPoints
    geometry.attributes.position.needsUpdate = true
  }

  const update = () => {
    material.opacity = 0.6 + Math.sin(Date.now() * 0.002) * 0.2
  }

  return { points, addPoint, update }
}
