import * as THREE from 'three'
import vertexShader from '../shaders/linesToBeans.vert?raw'
import fragmentShader from '../shaders/linesToBeans.frag?raw'

const createBeanTarget = (radius, thickness) => {
  const angle = Math.random() * Math.PI * 2
  const wobble = 0.25 + 0.2 * Math.sin(angle * 2.0)
  const r = radius + wobble * 0.4
  const x = Math.cos(angle) * r
  const y = Math.sin(angle) * r * 0.65
  const z = (Math.random() - 0.5) * thickness
  return new THREE.Vector3(x, y, z)
}

export const createLinesToBeans = (scene) => {
  const count = 1400
  const positions = new Float32Array(count * 3)
  const targets = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    const lineIndex = i % 14
    const lineX = (lineIndex - 7) * 0.14
    const lineY = (Math.random() - 0.5) * 3.6
    const lineZ = (Math.random() - 0.5) * 0.6

    positions[i3] = lineX
    positions[i3 + 1] = lineY
    positions[i3 + 2] = lineZ

    const bean = createBeanTarget(1.1, 0.5)
    targets[i3] = bean.x
    targets[i3 + 1] = bean.y
    targets[i3 + 2] = bean.z
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targets, 3))

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointSize: { value: 14 },
      uLineColor: { value: new THREE.Color(0x9ef1ff) },
      uBeanColor: { value: new THREE.Color(0xffc38f) },
    },
    transparent: true,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.position.set(0, 0.6, -0.6)
  scene.add(points)

  const update = (elapsed, progress) => {
    material.uniforms.uTime.value = elapsed
    material.uniforms.uProgress.value = THREE.MathUtils.clamp(progress, 0, 1)
  }

  return { points, update }
}
