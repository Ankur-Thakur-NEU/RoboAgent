// DESIGNER NOTE: Replace asset files under src/assets/ and update paths here.
// If you keep the same filenames, no code changes are needed.

import linesToBeansVertex from '../shaders/linesToBeans.vert?raw'
import linesToBeansFragment from '../shaders/linesToBeans.frag?raw'

export const ASSET_PATHS = {
  baristaModel: new URL('../assets/models/barista.glb', import.meta.url).href,
  customizerModel: new URL('../assets/models/customizer.glb', import.meta.url).href,
  coffeeBeanTexture: new URL('../assets/textures/coffee-bean.jpg', import.meta.url).href,
  sfxAudio: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_b61a4f3c09.mp3?filename=coffee-pour-ambient-113367.mp3',
}

export const ASSET_SHADERS = {
  linesToBeansVertex,
  linesToBeansFragment,
}
