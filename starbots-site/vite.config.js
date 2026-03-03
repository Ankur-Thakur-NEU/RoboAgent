import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/examples/jsm/postprocessing')) {
            return 'three-post'
          }
          if (id.includes('node_modules/three/examples/jsm/loaders')) {
            return 'three-loaders'
          }
          if (id.includes('node_modules/three')) {
            return 'three-core'
          }
          if (id.includes('node_modules/gsap')) {
            return 'gsap'
          }
          return undefined
        },
      },
    },
  },
})
