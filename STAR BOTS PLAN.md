# STÅRBOTS Website Plan

## Goals
- Build an immersive 3D marketing site inspired by Lusion-style interaction patterns (dark, scroll-driven WebGL, custom cursor, particles) without copying layouts or code.
- Showcase the STÅRBOTS concept and investment opportunity.
- Provide a creator sign-up flow with 3D customizer tie-in.

## Step-by-step (with Lusion-inspired cues)
1. Project setup (Vite + Three.js + GSAP), base scene, folder structure, and full-screen canvas.
2. Site structure + navigation with an overlay menu, section-based routing, and scroll indicator.
3. Home hero with cinematic 3D background, bold title reveal, and CTA cluster.
4. Content sections with split typography, staggered word reveals, and scroll-synced WebGL.
5. 3D customizer for bot barista + shop designs with color/material swaps.
6. Dedicated /signup page with form + customizer embed.
7. Contact page + footer effects (cursor trails, subtle particles) and performance optimizations.
8. Deployment and polish (meta, a11y, animation timing, and overall feel).

## Lusion-inspired design cues (use as reference, not a copy)
- Dark, cinematic palette with soft gradients and sparse highlights.
- Full-screen canvas behind UI, with UI layered on top.
- Animated typography: word-by-word or line-by-line reveals on scroll.
- Minimal header with logo left, action buttons right, overlay menu.
- Custom cursor that changes state on links/buttons.
- Scroll indicator and subtle micro-ornaments (crosses, dots, lines).

## Step 1 output
- Vite project scaffolded in starbots-site.
- Dependencies: three, gsap, simplex-noise, dat.gui.
- Folder structure for scenes, shaders, assets, components.
- Fullscreen WebGL canvas.
- Basic Three.js scene with rotating humanoid placeholder.

## Ready-to-use checklist
- `npm run dev` starts without errors.
- Fullscreen canvas renders and resizes.
- Placeholder humanoid rotates smoothly.
- Scenes and assets folders are in place.
