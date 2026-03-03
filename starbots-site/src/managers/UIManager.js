import gsap from 'gsap'
import { createCustomizerPreview } from '../components/customizer.js'
import { initForms } from '../utils/forms.js'
import { runtimeConfig } from '../config/runtimeConfig.js'
import { ASSET_PATHS } from '../config/assets.js'

export class UIManager {
  /**
   * @param {{ sceneManager: import('./SceneManager.js').SceneManager, prefersReducedMotion: boolean }} options
   */
  constructor({ sceneManager, prefersReducedMotion }) {
    this.sceneManager = sceneManager
    this.prefersReducedMotion = prefersReducedMotion

    this.menuToggle = document.querySelector('#menu-toggle')
    this.menuPanel = document.querySelector('#menu-panel')
    this.menuLinks = document.querySelectorAll('[data-scroll]')
    this.sections = document.querySelectorAll('.section')
    this.cursor = document.querySelector('#cursor')
    this.cursorLabel = document.querySelector('#cursor-label')
    this.scrollIndicatorBar = document.querySelector('.scroll-indicator-bar')
    this.snapshotButton = document.querySelector('#snapshot-btn')
    this.soundToggle = document.querySelector('#sound-toggle')
    this.qualityToggle = document.querySelector('#quality-toggle')
    this.signupForm = document.querySelector('#signup-form')
    this.signupFollowers = document.querySelector('#signup-followers')
    this.signupFollowersHelp = document.querySelector('#signup-followers-help')
    this.signupAccent = document.querySelector('#signup-accent')
    this.signupPreview = document.querySelector('#signup-preview')
    this.signupStatus = document.querySelector('#signup-status')
    this.customizerCanvas = document.querySelector('#customizer-canvas')
    this.customizerButtons = document.querySelectorAll('.customizer-btn')
    this.customizerMaterial = document.querySelector('#customizer-material')
    this.customizerSnapshot = document.querySelector('#customizer-snapshot')
    this.contactForm = document.querySelector('#contact-form')
    this.contactStatus = document.querySelector('#contact-status')
    this.signupBurst = document.querySelector('#signup-burst')

    this.customizer = this.customizerCanvas ? createCustomizerPreview(this.customizerCanvas) : null

    this.sfx = new Audio(ASSET_PATHS.sfxAudio)
    this.sfx.volume = 0.15
    this.sfx.preload = 'auto'
    this.sfxMuted = false
  }

  init({ scrollManager }) {
    this.scrollManager = scrollManager
    this.setupMenu()
    this.setupCursor()
    this.setupAudio()
    this.setupQualityToggle()
    this.setupCustomizer()
    this.setupForms()
    this.setupSnapshot()
    this.setupHeroIntro()

    window.addEventListener('mousemove', (event) => {
      const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2
      const normalizedY = -(event.clientY / window.innerHeight - 0.5) * 2
      this.sceneManager.addTrailPoint(normalizedX * 2.4, normalizedY * 1.4)
    })

    window.addEventListener('hashchange', () => {
      this.setActiveSection(window.location.hash)
    })

    this.setActiveSection(window.location.hash)
  }

  setupMenu() {
    if (!this.menuToggle || !this.menuPanel) return

    const setMenuOpen = (isOpen) => {
      this.menuPanel.classList.toggle('is-open', isOpen)
      this.menuToggle.setAttribute('aria-expanded', String(isOpen))
      this.menuPanel.setAttribute('aria-hidden', String(!isOpen))
    }

    this.menuToggle.addEventListener('click', () => {
      const isOpen = this.menuPanel.classList.contains('is-open')
      setMenuOpen(!isOpen)
    })

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    })

    this.menuLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href')
        if (href?.startsWith('#')) {
          event.preventDefault()
          setMenuOpen(false)
          history.pushState(null, '', href)
          this.setActiveSection(href)
          this.scrollManager.scrollToTarget(href)
        }
      })
    })
  }

  setActiveSection(hash) {
    const targetId = (hash || '#home').replace('#', '')
    this.sections.forEach((section) => {
      section.classList.toggle('is-active', section.id === targetId)
    })
    this.sceneManager.transitionCamera(targetId)
    this.sceneManager.applySectionVisuals(targetId)
    this.sceneManager.setActiveSection(targetId)
  }

  setupCursor() {
    if (this.prefersReducedMotion || !this.cursor) return
    gsap.set(this.cursor, { xPercent: -50, yPercent: -50 })
    window.addEventListener('mousemove', (event) => {
      gsap.to(this.cursor, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.2,
        ease: 'power3.out',
      })
    })

    const setCursorState = (label) => {
      this.cursorLabel.textContent = label
      this.cursor.classList.toggle('is-active', Boolean(label))
    }

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => setCursorState('Brew'))
      el.addEventListener('mouseleave', () => setCursorState('Scroll'))
    })
  }

  setupAudio() {
    const playSfx = () => {
      if (this.sfxMuted) return
      try {
        this.sfx.currentTime = 0
        this.sfx.play()
      } catch {
        // Autoplay restrictions can block; ignore silently.
      }
    }

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', playSfx)
    })

    if (this.soundToggle) {
      this.soundToggle.addEventListener('click', () => {
        this.sfxMuted = !this.sfxMuted
        this.soundToggle.classList.toggle('is-muted', this.sfxMuted)
        this.soundToggle.setAttribute('aria-pressed', String(this.sfxMuted))
        this.soundToggle.textContent = this.sfxMuted ? 'SFX: Off' : 'SFX: On'
      })
    }
  }

  setupQualityToggle() {
    if (!this.qualityToggle) return
    this.qualityToggle.addEventListener('click', () => {
      const nextQuality = !this.sceneManager.highQuality
      this.sceneManager.setQuality(nextQuality)
      this.qualityToggle.setAttribute('aria-pressed', String(!nextQuality))
      this.qualityToggle.textContent = nextQuality ? 'Quality: High' : 'Quality: Low'
    })
    this.sceneManager.setQuality(this.sceneManager.highQuality)
  }

  setupCustomizer() {
    if (this.customizerButtons.length && this.customizer) {
      this.customizerButtons.forEach((button) => {
        button.addEventListener('click', () => {
          this.customizerButtons.forEach((btn) => btn.classList.remove('is-active'))
          button.classList.add('is-active')
          this.customizer.setSelectedPart(button.dataset.part)
        })
      })
      this.customizerButtons[0].classList.add('is-active')
    }

    if (this.customizerMaterial && this.customizer) {
      this.customizerMaterial.addEventListener('change', (event) => {
        this.customizer.setMaterialPreset(event.target.value)
      })
    }

    if (this.customizerSnapshot && this.customizer) {
      this.customizerSnapshot.addEventListener('click', () => {
        const dataUrl = this.customizer.snapshot()
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `starbots-customizer-${Date.now()}.png`
        link.click()
      })
    }
  }

  setupForms() {
    initForms({
      signupForm: this.signupForm,
      signupStatus: this.signupStatus,
      signupPreview: this.signupPreview,
      signupAccent: this.signupAccent,
      signupFollowers: this.signupFollowers,
      signupFollowersHelp: this.signupFollowersHelp,
      customizer: this.customizer,
      triggerSignupBurst: () => this.triggerSignupBurst(),
      contactForm: this.contactForm,
      contactStatus: this.contactStatus,
    })
  }

  triggerSignupBurst() {
    if (!this.signupBurst) return
    this.signupBurst.innerHTML = ''
    const count = 12
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span')
      this.signupBurst.appendChild(dot)
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

  setupSnapshot() {
    if (!this.snapshotButton) return
    this.snapshotButton.addEventListener('click', () => {
      const dataUrl = this.sceneManager.captureSnapshot()
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `starbots-snapshot-${Date.now()}.png`
      link.click()
      this.showSnapshotToast('Snapshot saved')
    })
  }

  showSnapshotToast(message) {
    const toast = document.createElement('div')
    toast.className = 'snapshot-toast'
    toast.textContent = message
    document.body.appendChild(toast)
    gsap.to(toast, { opacity: 1, duration: 0.3 })
    gsap.to(toast, {
      opacity: 0,
      duration: 0.4,
      delay: runtimeConfig.snapshotToastDuration / 1000,
      onComplete: () => toast.remove(),
    })
  }

  setupHeroIntro() {
    if (this.prefersReducedMotion) return
    document.querySelectorAll('[data-split]').forEach((element) => this.splitText(element))

    const timeline = this.sceneManager.playHeroIntro()
    timeline
      .from('.hero-glow', { opacity: 0, scale: 0.9, duration: 1.4 }, 0)
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
        this.sceneManager.setHeroIntroDone(true)
        this.sceneManager.transitionCamera('home')
      })
  }

  splitText(element) {
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

  revealSection(section) {
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

  updateScrollIndicator(scrollProgress) {
    if (this.scrollIndicatorBar) {
      this.scrollIndicatorBar.style.transform = `translateY(${scrollProgress * 60}%)`
    }
  }
}
