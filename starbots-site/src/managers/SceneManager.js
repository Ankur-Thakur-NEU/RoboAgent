import * as THREE from 'three'
import gsap from 'gsap'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { cameraTargets, sectionVisuals } from '../config/sceneConfig.js'
import { runtimeConfig } from '../config/runtimeConfig.js'
import { captureSnapshot } from '../utils/snapshot.js'

export class SceneManager {
  /**
   * @param {{ canvas: HTMLCanvasElement, prefersReducedMotion: boolean }} options
   */
  constructor({ canvas, prefersReducedMotion }) {
    this.canvas = canvas
    this.prefersReducedMotion = prefersReducedMotion
    this.isMobile = window.matchMedia(runtimeConfig.mobileQuery).matches
    this.highQuality = !this.isMobile
    this.heroIntroDone = prefersReducedMotion
    this.scrollProgress = 0
    this.aboutMorphProgress = 0
    this.rafId = 0
    this.isPaused = false

    this.scene = null
    this.camera = null
    this.renderer = null
    this.composer = null
    this.bloomPass = null
    this.clock = new THREE.Clock()

    this.ambientLight = null
    this.keyLight = null
    this.hemiLight = null
    this.fillLight = null
    this.sunMesh = null

    this.humanoid = null
    this.leftArmJoint = null
    this.rightArmJoint = null
    this.robotMixer = null

    this.coffeeFlow = null
    this.linesToBeans = null
    this.sectionAccents = null
    this.coffeeTrail = null
    this.parallaxLayers = []

    this.cameraState = {
      x: 0,
      y: 0,
      z: 0,
      lookX: 0,
      lookY: 0.6,
      lookZ: 0,
    }

    this.onResize = this.onResize.bind(this)
    this.animate = this.animate.bind(this)
  }

  async init() {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 1.2, 4)
    this.cameraState.x = this.camera.position.x
    this.cameraState.y = this.camera.position.y
    this.cameraState.z = this.camera.position.z
    this.scene.add(this.camera)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(this.ambientLight)

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.keyLight.position.set(2, 4, 3)
    this.keyLight.castShadow = true
    this.scene.add(this.keyLight)

    this.hemiLight = new THREE.HemisphereLight(0xdfefff, 0x2b1a10, 0.5)
    this.scene.add(this.hemiLight)

    this.fillLight = new THREE.PointLight(0xffd700, 0.8, 12)
    this.fillLight.position.set(-2, 1.5, 1.5)
    this.scene.add(this.fillLight)

    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    )
    this.sunMesh.position.set(-1.8, 1.6, -2)
    this.scene.add(this.sunMesh)

    this.buildHumanoid()
    this.loadRobot()

    const [{ createCoffeeFlow }, { createLinesToBeans }, { createSectionAccents }, { createCoffeeTrail }] =
      await Promise.all([
        import('../scenes/coffeeFlow.js'),
        import('../scenes/linesToBeans.js'),
        import('../scenes/sectionAccents.js'),
        import('../scenes/coffeeTrail.js'),
      ])

    this.coffeeFlow = createCoffeeFlow(this.scene)
    this.linesToBeans = createLinesToBeans(this.scene)
    this.sectionAccents = createSectionAccents(this.scene)
    this.coffeeTrail = createCoffeeTrail(this.scene)

    this.parallaxLayers = [
      { object: this.humanoid, depth: 0.35, base: this.humanoid.position.clone() },
      { object: this.coffeeFlow.points, depth: 0.2, base: this.coffeeFlow.points.position.clone() },
      { object: this.linesToBeans.points, depth: 0.1, base: this.linesToBeans.points.position.clone() },
    ]

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.6,
      0.85
    )
    if (!this.isMobile) {
      this.composer.addPass(this.bloomPass)
    }

    window.addEventListener('resize', this.onResize)

    return this
  }

  buildHumanoid() {
    this.humanoid = new THREE.Group()

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d2330,
      metalness: 0.65,
      roughness: 0.35,
    })
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ed1ff,
      metalness: 0.3,
      roughness: 0.2,
      emissive: new THREE.Color(0x0b2b3a),
    })

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.3, 24), bodyMaterial)
    torso.position.y = 0.6
    torso.castShadow = true
    this.humanoid.add(torso)

    const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), accentMaterial)
    chestCore.position.set(0, 0.9, 0.46)
    chestCore.castShadow = true
    this.humanoid.add(chestCore)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32), accentMaterial)
    head.position.y = 1.6
    head.castShadow = true
    this.humanoid.add(head)

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), bodyMaterial)
    neck.position.y = 1.32
    this.humanoid.add(neck)

    this.leftArmJoint = new THREE.Group()
    this.leftArmJoint.position.set(-0.55, 1.05, 0)
    this.humanoid.add(this.leftArmJoint)

    const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), bodyMaterial)
    leftUpperArm.position.y = -0.25
    leftUpperArm.castShadow = true
    this.leftArmJoint.add(leftUpperArm)

    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), bodyMaterial)
    leftForearm.position.y = -0.55
    leftUpperArm.add(leftForearm)

    this.rightArmJoint = new THREE.Group()
    this.rightArmJoint.position.set(0.55, 1.05, 0)
    this.humanoid.add(this.rightArmJoint)

    const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), bodyMaterial)
    rightUpperArm.position.y = -0.25
    rightUpperArm.castShadow = true
    this.rightArmJoint.add(rightUpperArm)

    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), bodyMaterial)
    rightForearm.position.y = -0.55
    rightUpperArm.add(rightForearm)

    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0xffc38f, roughness: 0.4, metalness: 0.1 })
    )
    mug.position.set(0, -0.36, 0.12)
    rightForearm.add(mug)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.9, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x2b3546, metalness: 0.5, roughness: 0.5 })
    )
    base.position.y = -0.25
    this.humanoid.add(base)

    this.scene.add(this.humanoid)
  }

  loadRobot() {
    const loader = new GLTFLoader()
    loader.load(
      'https://threejs.org/examples/models/gltf/RobotExpressive.glb',
      (gltf) => {
        const robot = gltf.scene
        robot.scale.set(0.6, 0.6, 0.6)
        robot.position.set(0, -0.4, 0)
        this.humanoid.visible = false
        this.scene.add(robot)
        if (gltf.animations?.length) {
          this.robotMixer = new THREE.AnimationMixer(robot)
          const clip =
            gltf.animations.find((animation) => animation.name.includes('Wave')) ||
            gltf.animations[0]
          if (clip) {
            this.robotMixer.clipAction(clip).play()
          }
        }
      },
      undefined,
      () => {
        this.humanoid.visible = true
      }
    )
  }

  applySectionVisuals(sectionId) {
    const target = sectionVisuals[sectionId]
    if (!target) return
    if (this.bloomPass?.enabled) {
      gsap.to(this.bloomPass, { strength: target.bloom, duration: 1.0, ease: 'power2.out' })
    }
    gsap.to(this.fillLight, { intensity: target.fill, duration: 1.0, ease: 'power2.out' })
    gsap.to(this.ambientLight, { intensity: target.ambient, duration: 1.0, ease: 'power2.out' })
  }

  transitionCamera(sectionId) {
    const target = cameraTargets[sectionId]
    if (!target) return
    gsap.to(this.cameraState, {
      ...target,
      duration: 1.4,
      ease: 'power3.out',
    })
  }

  setActiveSection(sectionId) {
    if (this.sectionAccents) {
      this.sectionAccents.setActive(sectionId)
    }
  }

  setQuality(isHigh) {
    this.highQuality = isHigh
    if (this.bloomPass) {
      this.bloomPass.enabled = isHigh
    }
    if (this.coffeeFlow) {
      this.coffeeFlow.points.visible = isHigh
    }
    if (this.linesToBeans) {
      this.linesToBeans.points.visible = isHigh
    }
    if (this.coffeeTrail) {
      this.coffeeTrail.points.visible = isHigh
    }
    if (!isHigh && this.sectionAccents) {
      this.sectionAccents.setActive('')
    }
  }

  setHeroIntroDone(value) {
    this.heroIntroDone = value
  }

  setScrollState({ scrollProgress, aboutMorphProgress }) {
    this.scrollProgress = scrollProgress
    this.aboutMorphProgress = aboutMorphProgress
  }

  addTrailPoint(x, y) {
    if (this.highQuality && this.coffeeTrail) {
      this.coffeeTrail.addPoint(x, y)
    }
  }

  getHeroIntroTargets() {
    return {
      cameraState: this.cameraState,
      keyLight: this.keyLight,
      ambientLight: this.ambientLight,
    }
  }

  playHeroIntro() {
    const { cameraState, keyLight, ambientLight } = this.getHeroIntroTargets()
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(
      cameraState,
      { x: 0.4, y: 1.35, z: 3.6, duration: 2.0, ease: 'power2.out' },
      0
    )
      .to(keyLight.position, { x: 3.2, y: 5.2, z: 2.2, duration: 1.8 }, 0.1)
      .to(ambientLight, { intensity: 0.45, duration: 1.6 }, 0.1)
      .to(keyLight, { intensity: 1.2, duration: 1.4 }, 0.2)
    return tl
  }

  captureSnapshot() {
    return captureSnapshot(this.renderer, this.scene, this.camera)
  }

  onResize() {
    const { innerWidth, innerHeight } = window
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.composer.setSize(innerWidth, innerHeight)
  }

  animate() {
    if (this.isPaused) return
    const elapsed = this.clock.getElapsedTime()

    this.humanoid.rotation.y = elapsed * 0.35
    this.humanoid.rotation.x = Math.sin(elapsed * 0.5) * 0.08
    this.leftArmJoint.rotation.z = Math.sin(elapsed * 1.2) * 0.35 - 0.4
    this.leftArmJoint.rotation.x = Math.cos(elapsed * 0.8) * 0.15
    this.rightArmJoint.rotation.z = Math.sin(elapsed * 1.1 + 1.2) * 0.25 + 0.6
    this.rightArmJoint.rotation.x = Math.cos(elapsed * 0.6) * 0.2

    if (this.heroIntroDone) {
      this.camera.position.set(this.cameraState.x, this.cameraState.y, this.cameraState.z)
      this.camera.lookAt(this.cameraState.lookX, this.cameraState.lookY, this.cameraState.lookZ)
      if (!this.prefersReducedMotion) {
        const drift = this.scrollProgress - 0.5
        this.camera.position.x += drift * 0.3
        this.camera.position.y -= this.scrollProgress * 0.4
        this.camera.position.z -= this.scrollProgress * 0.3
      }
    }

    this.parallaxLayers.forEach((layer) => {
      const offset = (this.scrollProgress - 0.5) * layer.depth * 3.5
      layer.object.position.y = layer.base.y - offset
      layer.object.position.x =
        layer.base.x + Math.sin(this.scrollProgress * Math.PI * 2) * layer.depth * 0.3
    })

    if (this.highQuality && this.coffeeFlow) {
      this.coffeeFlow.update(elapsed, this.scrollProgress)
    }

    if (this.highQuality && this.linesToBeans) {
      this.linesToBeans.update(elapsed, this.aboutMorphProgress)
    }

    if (this.highQuality && this.sectionAccents) {
      this.sectionAccents.update(elapsed)
    }

    if (this.highQuality && this.coffeeTrail) {
      this.coffeeTrail.update()
    }

    if (this.robotMixer) {
      this.robotMixer.update(this.clock.getDelta())
    }

    this.composer.render()
    this.rafId = requestAnimationFrame(this.animate)
  }

  start() {
    this.isPaused = false
    this.animate()
  }

  pause() {
    this.isPaused = true
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }

  resume() {
    if (!this.isPaused) return
    this.isPaused = false
    this.animate()
  }

  dispose() {
    window.removeEventListener('resize', this.onResize)
    this.renderer.dispose()
  }
}
