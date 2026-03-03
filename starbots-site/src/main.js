import './style.css'
import { SceneManager } from './managers/SceneManager.js'
import { ScrollManager } from './managers/ScrollManager.js'
import { UIManager } from './managers/UIManager.js'
import { initVisibilityPause } from './utils/runtime.js'
import { runtimeConfig } from './config/runtimeConfig.js'

const bootstrap = async () => {
  const canvas = document.querySelector('#webgl')
  const prefersReducedMotion = window.matchMedia(runtimeConfig.reducedMotionQuery).matches

  const sceneManager = await new SceneManager({ canvas, prefersReducedMotion }).init()
  sceneManager.start()

  const uiManager = new UIManager({ sceneManager, prefersReducedMotion })

  const scrollManager = new ScrollManager({
    sections: document.querySelectorAll('.section'),
    prefersReducedMotion,
    threshold: runtimeConfig.scrollThreshold,
    onScrollProgress: ({ scrollProgress, aboutMorphProgress }) => {
      sceneManager.setScrollState({ scrollProgress, aboutMorphProgress })
      uiManager.updateScrollIndicator(scrollProgress)
    },
    onSectionActive: (sectionId, sectionEl) => {
      sceneManager.transitionCamera(sectionId)
      sceneManager.applySectionVisuals(sectionId)
      sceneManager.setActiveSection(sectionId)
      uiManager.revealSection(sectionEl)
    },
  })

  uiManager.init({ scrollManager })
  scrollManager.start()

  initVisibilityPause(
    () => sceneManager.pause(),
    () => sceneManager.resume()
  )

  window.addEventListener('beforeunload', () => {
    scrollManager.dispose()
    sceneManager.dispose()
  })
}

bootstrap()
