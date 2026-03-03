import { describe, expect, it } from 'vitest'
import { ScrollManager } from '../managers/ScrollManager.js'

describe('ScrollManager', () => {
  it('computes section progress within range', () => {
    const manager = new ScrollManager({
      sections: [],
      prefersReducedMotion: true,
      onScrollProgress: () => {},
      onSectionActive: () => {},
    })

    manager.sectionMetrics = [
      { id: 'about', top: 200, height: 400 },
    ]

    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true })

    const progress = manager.getSectionProgress('about')
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })
})
