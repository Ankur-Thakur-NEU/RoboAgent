import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { createCoffeeFlow } from './scenes/coffeeFlow.js'
import { createLinesToBeans } from './scenes/linesToBeans.js'
import { createSectionAccents } from './scenes/sectionAccents.js'
import { createCustomizerPreview } from './components/customizer.js'
import { createCoffeeTrail } from './scenes/coffeeTrail.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('#webgl')

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(0, 1.2, 4)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
keyLight.position.set(2, 4, 3)
keyLight.castShadow = true
scene.add(keyLight)

const hemiLight = new THREE.HemisphereLight(0xdfefff, 0x2b1a10, 0.5)
scene.add(hemiLight)

const fillLight = new THREE.PointLight(0xffd700, 0.8, 12)
fillLight.position.set(-2, 1.5, 1.5)
scene.add(fillLight)

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffd700 })
)
sunMesh.position.set(-1.8, 1.6, -2)
scene.add(sunMesh)

const humanoid = new THREE.Group()
let robotMixer = null

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
humanoid.add(torso)

const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), accentMaterial)
chestCore.position.set(0, 0.9, 0.46)
chestCore.castShadow = true
humanoid.add(chestCore)

const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32), accentMaterial)
head.position.y = 1.6
head.castShadow = true
humanoid.add(head)

const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), bodyMaterial)
neck.position.y = 1.32
humanoid.add(neck)

const leftArmJoint = new THREE.Group()
leftArmJoint.position.set(-0.55, 1.05, 0)
humanoid.add(leftArmJoint)

const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), bodyMaterial)
leftUpperArm.position.y = -0.25
leftUpperArm.castShadow = true
leftArmJoint.add(leftUpperArm)

const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), bodyMaterial)
leftForearm.position.y = -0.55
leftUpperArm.add(leftForearm)

const rightArmJoint = new THREE.Group()
rightArmJoint.position.set(0.55, 1.05, 0)
humanoid.add(rightArmJoint)

const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), bodyMaterial)
rightUpperArm.position.y = -0.25
rightUpperArm.castShadow = true
rightArmJoint.add(rightUpperArm)

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
humanoid.add(base)

scene.add(humanoid)

const loader = new GLTFLoader()
loader.load(
  'https://threejs.org/examples/models/gltf/RobotExpressive.glb',
  (gltf) => {
    const robot = gltf.scene
    robot.scale.set(0.6, 0.6, 0.6)
    robot.position.set(0, -0.4, 0)
    humanoid.visible = false
    scene.add(robot)
    if (gltf.animations?.length) {
      robotMixer = new THREE.AnimationMixer(robot)
      const clip = gltf.animations.find((animation) => animation.name.includes('Wave')) || gltf.animations[0]
      if (clip) {
        robotMixer.clipAction(clip).play()
      }
    }
  },
  undefined,
  () => {
    humanoid.visible = true
  }
)

const coffeeFlow = createCoffeeFlow(scene)
const linesToBeans = createLinesToBeans(scene)
const sectionAccents = createSectionAccents(scene)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.7,
  0.6,
  0.85
)
const isMobile = window.matchMedia('(max-width: 768px)').matches
if (!isMobile) {
  composer.addPass(bloomPass)
}
let highQuality = !isMobile

const sectionVisuals = {
  home: { bloom: 0.7, fill: 0.8, ambient: 0.6 },
  about: { bloom: 0.55, fill: 0.6, ambient: 0.55 },
  business: { bloom: 0.75, fill: 0.9, ambient: 0.6 },
  revenue: { bloom: 0.9, fill: 1.0, ambient: 0.55 },
  advantages: { bloom: 0.8, fill: 0.85, ambient: 0.6 },
  growth: { bloom: 0.7, fill: 0.75, ambient: 0.5 },
  market: { bloom: 0.65, fill: 0.7, ambient: 0.55 },
  investment: { bloom: 1.0, fill: 1.1, ambient: 0.5 },
  team: { bloom: 0.6, fill: 0.65, ambient: 0.55 },
  contact: { bloom: 0.75, fill: 0.8, ambient: 0.6 },
  signup: { bloom: 0.7, fill: 0.8, ambient: 0.6 },
}

const applySectionVisuals = (sectionId) => {
  const target = sectionVisuals[sectionId]
  if (!target) return
  if (bloomPass.enabled) {
    gsap.to(bloomPass, { strength: target.bloom, duration: 1.0, ease: 'power2.out' })
  }
  gsap.to(fillLight, { intensity: target.fill, duration: 1.0, ease: 'power2.out' })
  gsap.to(ambientLight, { intensity: target.ambient, duration: 1.0, ease: 'power2.out' })
}

const parallaxLayers = [
  { object: humanoid, depth: 0.35, base: humanoid.position.clone() },
  { object: coffeeFlow.points, depth: 0.2, base: coffeeFlow.points.position.clone() },
  { object: linesToBeans.points, depth: 0.1, base: linesToBeans.points.position.clone() },
]

const coffeeTrail = createCoffeeTrail(scene)

const setQuality = (isHigh) => {
  highQuality = isHigh
  bloomPass.enabled = isHigh
  coffeeFlow.points.visible = isHigh
  linesToBeans.points.visible = isHigh
  coffeeTrail.points.visible = isHigh
  if (!isHigh && sectionAccents) {
    sectionAccents.setActive('')
  }
}

const clock = new THREE.Clock()

const onResize = () => {
  const { innerWidth, innerHeight } = window
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setSize(innerWidth, innerHeight)
}

window.addEventListener('resize', onResize)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let scrollProgress = 0
let aboutMorphProgress = 0
let sectionMetrics = []
let heroIntroDone = prefersReducedMotion
const cameraState = {
  x: camera.position.x,
  y: camera.position.y,
  z: camera.position.z,
  lookX: 0,
  lookY: 0.6,
  lookZ: 0,
}

const cameraTargets = {
  home: { x: 0.4, y: 1.35, z: 3.6, lookX: 0, lookY: 0.6, lookZ: 0 },
  about: { x: -0.3, y: 1.2, z: 3.1, lookX: 0, lookY: 0.4, lookZ: 0 },
  business: { x: 0.8, y: 1.0, z: 3.0, lookX: 0.2, lookY: 0.3, lookZ: 0 },
  revenue: { x: -0.8, y: 1.0, z: 3.2, lookX: -0.2, lookY: 0.2, lookZ: 0 },
  advantages: { x: 0.4, y: 0.9, z: 2.9, lookX: 0, lookY: 0.4, lookZ: 0 },
  growth: { x: -0.4, y: 1.1, z: 3.3, lookX: 0, lookY: 0.5, lookZ: 0 },
  market: { x: 0.6, y: 1.0, z: 3.1, lookX: 0, lookY: 0.3, lookZ: 0 },
  investment: { x: -0.6, y: 1.2, z: 3.0, lookX: 0, lookY: 0.4, lookZ: 0 },
  team: { x: 0.2, y: 1.0, z: 3.4, lookX: 0, lookY: 0.5, lookZ: 0 },
  contact: { x: 0, y: 1.3, z: 3.7, lookX: 0, lookY: 0.6, lookZ: 0 },
}

const transitionCamera = (sectionId) => {
  const target = cameraTargets[sectionId]
  if (!target) return
  gsap.to(cameraState, {
    ...target,
    duration: 1.4,
    ease: 'power3.out',
  })
}

const animate = () => {
  const elapsed = clock.getElapsedTime()
  humanoid.rotation.y = elapsed * 0.35
  humanoid.rotation.x = Math.sin(elapsed * 0.5) * 0.08
  leftArmJoint.rotation.z = Math.sin(elapsed * 1.2) * 0.35 - 0.4
  leftArmJoint.rotation.x = Math.cos(elapsed * 0.8) * 0.15
  rightArmJoint.rotation.z = Math.sin(elapsed * 1.1 + 1.2) * 0.25 + 0.6
  rightArmJoint.rotation.x = Math.cos(elapsed * 0.6) * 0.2

  if (!prefersReducedMotion && heroIntroDone) {
    const drift = scrollProgress - 0.5
    camera.position.x = cameraState.x + drift * 0.3
    camera.position.y = cameraState.y - scrollProgress * 0.4
    camera.position.z = cameraState.z - scrollProgress * 0.3
    camera.lookAt(cameraState.lookX, cameraState.lookY, cameraState.lookZ)
  }

  parallaxLayers.forEach((layer) => {
    const offset = (scrollProgress - 0.5) * layer.depth * 3.5
    layer.object.position.y = layer.base.y - offset
    layer.object.position.x = layer.base.x + Math.sin(scrollProgress * Math.PI * 2) * layer.depth * 0.3
  })

  if (coffeeFlow) {
    if (highQuality) {
      coffeeFlow.update(elapsed, scrollProgress)
    }
  }

  if (linesToBeans) {
    if (highQuality) {
      linesToBeans.update(elapsed, aboutMorphProgress)
    }
  }

  if (sectionAccents) {
    if (highQuality) {
      sectionAccents.update(elapsed)
    }
  }

  if (coffeeTrail) {
    if (highQuality) {
      coffeeTrail.update()
    }
  }

  if (robotMixer) {
    robotMixer.update(clock.getDelta())
  }

  composer.render()
  requestAnimationFrame(animate)
}

animate()

const menuToggle = document.querySelector('#menu-toggle')
const menuPanel = document.querySelector('#menu-panel')
const menuLinks = document.querySelectorAll('[data-scroll]')
const sections = document.querySelectorAll('.section')
const cursor = document.querySelector('#cursor')
const cursorLabel = document.querySelector('#cursor-label')
const scrollIndicatorBar = document.querySelector('.scroll-indicator-bar')
const snapshotButton = document.querySelector('#snapshot-btn')
const soundToggle = document.querySelector('#sound-toggle')
const qualityToggle = document.querySelector('#quality-toggle')
const signupForm = document.querySelector('#signup-form')
const signupFollowers = document.querySelector('#signup-followers')
const signupFollowersHelp = document.querySelector('#signup-followers-help')
const signupAccent = document.querySelector('#signup-accent')
const signupPreview = document.querySelector('#signup-preview')
const signupStatus = document.querySelector('#signup-status')
const customizerCanvas = document.querySelector('#customizer-canvas')
const customizer = customizerCanvas ? createCustomizerPreview(customizerCanvas) : null
const customizerButtons = document.querySelectorAll('.customizer-btn')
const customizerMaterial = document.querySelector('#customizer-material')
const customizerSnapshot = document.querySelector('#customizer-snapshot')
const contactForm = document.querySelector('#contact-form')
const contactStatus = document.querySelector('#contact-status')
const signupBurst = document.querySelector('#signup-burst')
const sfx = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_b61a4f3c09.mp3?filename=coffee-pour-ambient-113367.mp3')
sfx.volume = 0.15
sfx.preload = 'auto'
let sfxMuted = false

const setMenuOpen = (isOpen) => {
  menuPanel.classList.toggle('is-open', isOpen)
  menuToggle.setAttribute('aria-expanded', String(isOpen))
  menuPanel.setAttribute('aria-hidden', String(!isOpen))
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuPanel.classList.contains('is-open')
  setMenuOpen(!isOpen)
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuOpen(false)
  }
})

const setActiveSection = (hash) => {
  const targetId = (hash || '#home').replace('#', '')
  sections.forEach((section) => {
    section.classList.toggle('is-active', section.id === targetId)
  })
  transitionCamera(targetId)
  applySectionVisuals(targetId)
  if (sectionAccents) {
    sectionAccents.setActive(targetId)
  }
}

const scrollToTarget = (hash) => {
  const target = document.querySelector(hash)
  if (!target) return
  target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

menuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href')
    if (href?.startsWith('#')) {
      event.preventDefault()
      setMenuOpen(false)
      history.pushState(null, '', href)
      setActiveSection(href)
      scrollToTarget(href)
    }
  })
})

window.addEventListener('hashchange', () => {
  setActiveSection(window.location.hash)
})

setActiveSection(window.location.hash)

const updateScrollProgress = () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
  aboutMorphProgress = getSectionProgress('about')
  if (scrollIndicatorBar) {
    scrollIndicatorBar.style.transform = `translateY(${scrollProgress * 60}%)`
  }
}

let scrollTicking = false
const onScroll = () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress()
      scrollTicking = false
    })
    scrollTicking = true
  }
}

const updateSectionMetrics = () => {
  sectionMetrics = Array.from(sections).map((section) => ({
    id: section.id,
    top: section.offsetTop,
    height: section.offsetHeight,
  }))
}

const getSectionProgress = (id) => {
  const metric = sectionMetrics.find((section) => section.id === id)
  if (!metric) return 0
  const start = metric.top - window.innerHeight * 0.2
  const end = metric.top + metric.height * 0.6
  const progress = (window.scrollY - start) / (end - start)
  return Math.min(Math.max(progress, 0), 1)
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sections.forEach((section) => section.classList.remove('is-active'))
        entry.target.classList.add('is-active')
        transitionCamera(entry.target.id)
        applySectionVisuals(entry.target.id)
        if (sectionAccents) {
          sectionAccents.setActive(entry.target.id)
        }
        revealSection(entry.target)
      }
    })
  },
  { threshold: 0.5 }
)

sections.forEach((section) => observer.observe(section))
window.addEventListener('scroll', onScroll, { passive: true })
updateScrollProgress()
updateSectionMetrics()
window.addEventListener('resize', updateSectionMetrics)

const splitText = (element) => {
  const words = element.textContent.trim().split(' ')
  element.textContent = ''
  words.forEach((word, index) => {
    const span = document.createElement('span')
    span.className = 'split-word'
    span.textContent = word
    element.appendChild(span)
    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(' '))
    }
  })
}

const revealSection = (section) => {
  const revealItems = section.querySelectorAll('[data-reveal]')
  revealItems.forEach((item) => {
    if (item.dataset.revealed === 'true') return
    item.dataset.revealed = 'true'
    gsap.fromTo(
      item,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.05,
      }
    )
  })
}

const runHeroIntro = () => {
  if (prefersReducedMotion) return
  document.querySelectorAll('[data-split]').forEach(splitText)

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to(
    cameraState,
    { x: 0.4, y: 1.35, z: 3.6, duration: 2.0, ease: 'power2.out' },
    0
  )
    .to(keyLight.position, { x: 3.2, y: 5.2, z: 2.2, duration: 1.8 }, 0.1)
    .to(ambientLight, { intensity: 0.45, duration: 1.6 }, 0.1)
    .to(keyLight, { intensity: 1.2, duration: 1.4 }, 0.2)
  tl.from('.hero-glow', { opacity: 0, scale: 0.9, duration: 1.4 }, 0)
    .from(
      '.hero-title .split-word',
      { yPercent: 120, opacity: 0, stagger: 0.05, duration: 0.8 },
      0.1
    )
    .from(
      '.hero-subtitle .split-word',
      { yPercent: 120, opacity: 0, stagger: 0.03, duration: 0.6 },
      0.35
    )
    .from(
      '.eyebrow .split-word',
      { yPercent: 120, opacity: 0, stagger: 0.02, duration: 0.5 },
      0.25
    )
    .from('.hero-cta .button', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, 0.6)
    .eventCallback('onComplete', () => {
      heroIntroDone = true
      transitionCamera('home')
    })
}

runHeroIntro()

if (!prefersReducedMotion && cursor) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 })
  window.addEventListener('mousemove', (event) => {
    gsap.to(cursor, {
      x: event.clientX,
      y: event.clientY,
      duration: 0.2,
      ease: 'power3.out',
    })
  })

  const setCursorState = (label) => {
    cursorLabel.textContent = label
    cursor.classList.toggle('is-active', Boolean(label))
  }

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => setCursorState('Brew'))
    el.addEventListener('mouseleave', () => setCursorState('Scroll'))
  })
}

const playSfx = () => {
  if (sfxMuted) return
  try {
    sfx.currentTime = 0
    sfx.play()
  } catch {
    // Autoplay restrictions can block; ignore silently.
  }
}

window.addEventListener('mousemove', (event) => {
  const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2
  const normalizedY = -(event.clientY / window.innerHeight - 0.5) * 2
  if (highQuality) {
    coffeeTrail.addPoint(normalizedX * 2.4, normalizedY * 1.4)
  }
})

document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', playSfx)
})

if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    sfxMuted = !sfxMuted
    soundToggle.classList.toggle('is-muted', sfxMuted)
    soundToggle.setAttribute('aria-pressed', String(sfxMuted))
    soundToggle.textContent = sfxMuted ? 'SFX: Off' : 'SFX: On'
  })
}

if (qualityToggle) {
  qualityToggle.addEventListener('click', () => {
    const nextQuality = !highQuality
    setQuality(nextQuality)
    qualityToggle.setAttribute('aria-pressed', String(!nextQuality))
    qualityToggle.textContent = nextQuality ? 'Quality: High' : 'Quality: Low'
  })
  setQuality(highQuality)
}

const triggerSignupBurst = () => {
  if (!signupBurst) return
  signupBurst.innerHTML = ''
  const count = 12
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span')
    signupBurst.appendChild(dot)
    const angle = (Math.PI * 2 * i) / count
    gsap.fromTo(
      dot,
      { opacity: 1, x: 0, y: 0 },
      {
        x: Math.cos(angle) * 40,
        y: Math.sin(angle) * 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      }
    )
  }
}

if (signupAccent && signupPreview) {
  signupAccent.addEventListener('input', (event) => {
    signupPreview.style.setProperty('--preview-accent', event.target.value)
    if (customizer) {
      customizer.setColor(event.target.value)
    }
  })
}

if (customizerButtons.length && customizer) {
  customizerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      customizerButtons.forEach((btn) => btn.classList.remove('is-active'))
      button.classList.add('is-active')
      customizer.setSelectedPart(button.dataset.part)
    })
  })
  customizerButtons[0].classList.add('is-active')
}

if (customizerMaterial && customizer) {
  customizerMaterial.addEventListener('change', (event) => {
    customizer.setMaterialPreset(event.target.value)
  })
}

if (customizerSnapshot && customizer) {
  customizerSnapshot.addEventListener('click', () => {
    const dataUrl = customizer.snapshot()
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `starbots-customizer-${Date.now()}.png`
    link.click()
  })
}

if (signupFollowers && signupFollowersHelp) {
  signupFollowers.addEventListener('input', (event) => {
    const count = Number(event.target.value || 0)
    if (count > 0 && count < 1000000) {
      signupFollowersHelp.textContent = 'Creators with 1M+ followers are prioritized.'
    } else {
      signupFollowersHelp.textContent = ''
    }
  })
}

if (signupForm && signupStatus) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(signupForm)
    const data = Object.fromEntries(formData.entries())
    console.log('Creator signup', data)
    signupStatus.textContent = 'Application received. We will reach out soon.'
    triggerSignupBurst()
    signupForm.reset()
    if (signupPreview) {
      signupPreview.style.setProperty('--preview-accent', '#9ef1ff')
    }
  })
}

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(contactForm)
    const data = Object.fromEntries(formData.entries())
    console.log('Contact inquiry', data)
    contactStatus.textContent = 'Thanks! We will reply within 2 business days.'
    contactForm.reset()
  })
}

const showSnapshotToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'snapshot-toast'
  toast.textContent = message
  document.body.appendChild(toast)
  gsap.to(toast, { opacity: 1, duration: 0.3 })
  gsap.to(toast, {
    opacity: 0,
    duration: 0.4,
    delay: 2.0,
    onComplete: () => toast.remove(),
  })
}

if (snapshotButton) {
  snapshotButton.addEventListener('click', () => {
    const dataUrl = renderer.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `starbots-snapshot-${Date.now()}.png`
    link.click()
    showSnapshotToast('Snapshot saved')
  })
}

window.addEventListener('beforeunload', () => {
  renderer.dispose()
})
