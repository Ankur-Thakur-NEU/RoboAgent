import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { createCoffeeFlow } from './scenes/coffeeFlow.js'
import { createLinesToBeans } from './scenes/linesToBeans.js'

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
keyLight.position.set(2, 4, 3)
scene.add(keyLight)

const humanoid = new THREE.Group()

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x8ed1ff, metalness: 0.2, roughness: 0.4 })
)
head.position.y = 1.4
humanoid.add(head)

const torso = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.45, 1.0, 6, 12),
  new THREE.MeshStandardMaterial({ color: 0x1d2330, metalness: 0.6, roughness: 0.3 })
)
torso.position.y = 0.5
humanoid.add(torso)

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 0.9, 0.35, 32),
  new THREE.MeshStandardMaterial({ color: 0x2b3546, metalness: 0.5, roughness: 0.5 })
)
base.position.y = -0.2
humanoid.add(base)

scene.add(humanoid)

const coffeeFlow = createCoffeeFlow(scene)
const linesToBeans = createLinesToBeans(scene)

const parallaxLayers = [
  { object: humanoid, depth: 0.35, base: humanoid.position.clone() },
  { object: coffeeFlow.points, depth: 0.2, base: coffeeFlow.points.position.clone() },
  { object: linesToBeans.points, depth: 0.1, base: linesToBeans.points.position.clone() },
]

const clock = new THREE.Clock()

const onResize = () => {
  const { innerWidth, innerHeight } = window
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', onResize)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let scrollProgress = 0
let aboutMorphProgress = 0
let sectionMetrics = []
let heroIntroDone = prefersReducedMotion
const cameraBase = camera.position.clone()

const animate = () => {
  const elapsed = clock.getElapsedTime()
  humanoid.rotation.y = elapsed * 0.35
  humanoid.rotation.x = Math.sin(elapsed * 0.5) * 0.08

  if (!prefersReducedMotion && heroIntroDone) {
    const drift = scrollProgress - 0.5
    camera.position.x = cameraBase.x + drift * 0.8
    camera.position.y = cameraBase.y - scrollProgress * 1.4
    camera.position.z = cameraBase.z - scrollProgress * 0.9
    camera.lookAt(0, 0.6, 0)
  }

  parallaxLayers.forEach((layer) => {
    const offset = (scrollProgress - 0.5) * layer.depth * 3.5
    layer.object.position.y = layer.base.y - offset
    layer.object.position.x = layer.base.x + Math.sin(scrollProgress * Math.PI * 2) * layer.depth * 0.3
  })

  if (coffeeFlow) {
    coffeeFlow.update(elapsed, scrollProgress)
  }

  if (linesToBeans) {
    linesToBeans.update(elapsed, aboutMorphProgress)
  }

  renderer.render(scene, camera)
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
      }
    })
  },
  { threshold: 0.5 }
)

sections.forEach((section) => observer.observe(section))
window.addEventListener('scroll', updateScrollProgress, { passive: true })
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

const runHeroIntro = () => {
  if (prefersReducedMotion) return
  document.querySelectorAll('[data-split]').forEach(splitText)

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to(
    camera.position,
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
      cameraBase.copy(camera.position)
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
