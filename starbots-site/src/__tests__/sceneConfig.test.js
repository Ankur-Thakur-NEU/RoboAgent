import { describe, expect, it } from 'vitest'
import { cameraTargets, sectionVisuals } from '../config/sceneConfig.js'

describe('sceneConfig', () => {
  it('exports expected section keys', () => {
    const keys = Object.keys(sectionVisuals)
    expect(keys).toContain('home')
    expect(keys).toContain('about')
    expect(keys).toContain('signup')
  })

  it('exports camera targets for core sections', () => {
    const keys = Object.keys(cameraTargets)
    expect(keys).toContain('home')
    expect(keys).toContain('contact')
  })
})
