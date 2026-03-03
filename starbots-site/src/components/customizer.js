import * as THREE from 'three'
import { captureSnapshot } from '../utils/snapshot.js'

export const createCustomizerPreview = (canvas) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
  camera.position.set(0, 1.1, 3.2)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const hemi = new THREE.HemisphereLight(0xdfefff, 0x2b1a10, 0.8)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xffffff, 0.9)
  key.position.set(1.6, 2.4, 2)
  scene.add(key)

  const rim = new THREE.PointLight(0x9ef1ff, 0.6, 10)
  rim.position.set(-1.6, 1.4, -1)
  scene.add(rim)

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x9ef1ff,
    metalness: 0.3,
    roughness: 0.2,
    emissive: new THREE.Color(0x0b2b3a),
  })
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2330,
    metalness: 0.65,
    roughness: 0.35,
  })

  const shopMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b1a10,
    metalness: 0.2,
    roughness: 0.6,
  })

  const bot = new THREE.Group()
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.0, 24), bodyMaterial)
  torso.position.y = 0.5
  torso.name = 'body'
  bot.add(torso)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), accentMaterial)
  head.position.y = 1.2
  head.name = 'head'
  bot.add(head)

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), bodyMaterial)
  arm.position.set(0.5, 0.75, 0)
  arm.name = 'arm'
  bot.add(arm)

  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0xffc38f, roughness: 0.4, metalness: 0.1 })
  )
  mug.position.set(0.5, 0.45, 0.12)
  bot.add(mug)

  scene.add(bot)

  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), shopMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.1
  scene.add(floor)

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.5), shopMaterial)
  counter.position.set(0, 0.1, -0.6)
  counter.name = 'counter'
  scene.add(counter)

  const steamCount = 80
  const steamPositions = new Float32Array(steamCount * 3)
  for (let i = 0; i < steamCount; i += 1) {
    const i3 = i * 3
    steamPositions[i3] = (Math.random() - 0.5) * 0.2
    steamPositions[i3 + 1] = Math.random() * 0.5 + 0.3
    steamPositions[i3 + 2] = (Math.random() - 0.5) * 0.2
  }
  const steamGeometry = new THREE.BufferGeometry()
  steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3))
  const steamMaterial = new THREE.PointsMaterial({
    color: 0x9ef1ff,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  })
  const steam = new THREE.Points(steamGeometry, steamMaterial)
  steam.position.set(0.5, 0.4, 0.2)
  scene.add(steam)

  const parts = {
    head,
    body: torso,
    arm,
    counter,
  }

  let selectedMaterial = accentMaterial

  const presets = {
    matte: { metalness: 0.1, roughness: 0.8 },
    chrome: { metalness: 1.0, roughness: 0.15 },
    ceramic: { metalness: 0.4, roughness: 0.35 },
  }

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey]
    if (!preset || !selectedMaterial) return
    selectedMaterial.metalness = preset.metalness
    selectedMaterial.roughness = preset.roughness
  }

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect()
    const safeWidth = Math.max(width, 1)
    const safeHeight = Math.max(height, 1)
    camera.aspect = safeWidth / safeHeight
    camera.updateProjectionMatrix()
    renderer.setSize(safeWidth, safeHeight, false)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  let frameId = 0
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  const onPointerDown = (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects([head, torso, arm, counter])
    if (hits.length > 0) {
      setSelectedPart(hits[0].object.name)
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown)

  const animate = () => {
    bot.rotation.y += 0.01
    mug.rotation.z = Math.sin(Date.now() * 0.003) * 0.2
    const positions = steam.geometry.getAttribute('position')
    for (let i = 0; i < steamCount; i += 1) {
      const i3 = i * 3
      positions.array[i3 + 1] += 0.005
      if (positions.array[i3 + 1] > 0.9) {
        positions.array[i3 + 1] = 0.3
      }
    }
    positions.needsUpdate = true
    renderer.render(scene, camera)
    frameId = requestAnimationFrame(animate)
  }
  animate()

  const setColor = (value) => {
    if (!selectedMaterial) return
    selectedMaterial.color.set(value)
    if (selectedMaterial.emissive) {
      selectedMaterial.emissive.set(value)
    }
  }

  const setSelectedPart = (partName) => {
    if (!parts[partName]) return
    if (partName === 'head') {
      selectedMaterial = accentMaterial
    } else if (partName === 'counter') {
      selectedMaterial = shopMaterial
    } else {
      selectedMaterial = bodyMaterial
    }
  }

  const snapshot = () => captureSnapshot(renderer, scene, camera)

  const dispose = () => {
    cancelAnimationFrame(frameId)
    observer.disconnect()
    canvas.removeEventListener('pointerdown', onPointerDown)
    renderer.dispose()
  }

  return {
    setColor,
    setSelectedPart,
    setMaterialPreset: applyPreset,
    snapshot,
    dispose,
  }
}
