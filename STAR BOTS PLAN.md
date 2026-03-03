# STÅRBOTS Website Plan

## Goals
- Build an immersive 3D marketing site inspired by Lusion-style interaction patterns (dark, scroll-driven WebGL, custom cursor, particles) without copying layouts or code.
- Showcase the STÅRBOTS concept and investment opportunity.
- Provide a creator sign-up flow with 3D customizer tie-in.

## Step-by-step (with Lusion-inspired cues)
1. Project setup (Vite + Three.js + GSAP), base scene, folder structure, and full-screen canvas.
2. Site structure + navigation with an overlay menu, section-based routing, and scroll indicator.
3. Home hero with cinematic 3D background, bold title reveal, and CTA cluster.
4. Advanced scroll + per-section WebGL accents, post-processing, and content integration.
5. 3D customizer for bot barista + shop designs with color/material swaps.
6. Dedicated /signup page with form + customizer embed.
7. Contact page + global effects (cursor trails, audio, particles) and performance optimizations.
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

## Current progress
- Step 1: Done.
- Step 2: Done (nav, overlay menu, sections, custom cursor, scroll indicator).
- Step 3: Done (hero text reveal, glow, camera/lighting drift).
- Step 4: In progress (scroll progress, coffee-flow particles, parallax, lines-to-beans morph).

## Step 4 completion plan (start now)
- Camera transitions: GSAP-driven camera position/rotation per section.
- WebGL accents per section:
	- Business: rotating bean icons.
	- Revenue: glowing streams/lines.
	- Advantages: humanoid differentiation animation.
	- Growth: phased particle timeline.
	- Market: orbiting target avatars.
	- Investment: asset growth bloom.
	- Team: orbiting headshot placeholders.
- Content integration: include full STÅRBOTS copy verbatim with staggered reveals.
- Investor invites: add banners/CTAs (EB-5 pathways) in Business/Investment/Contact.
- Visual upgrades: EffectComposer with BloomPass; optional GodRays for dramatic lighting.
- Theme: coffee colors (0x8B4513 beans, 0xFFD700 glow), steam curls, more particles using InstancedMesh.
- Output: update main.js, create new scene modules under src/scenes, adjust style.css.

## Step 5 plan (customizer)
- Add src/components/customizer.js with GLTFLoader (RobotExpressive GLB) and primitive fallback.
- Raycaster selection and dat.gui controls for color/material/accessories.
- Shop layout (counter, floor, signage) with adjustable transforms.
- Steam particles + glow; export snapshot for sharing.

## Step 6 plan (signup)
- Add /signup (or #signup) with creator form and 3D preview.
- Validate follower count and mock social connect.
- Tie form fields to customizer colors/materials.
- Submit to mock endpoint and show success particle burst.

## Step 7 plan (contact + global)
- Enhance contact form with investor/creator/franchise dropdown.
- Global footer mouse trail (coffee particles).
- Responsiveness and perf toggles (lower particles on mobile).
- Accessibility pass and ambient audio hooks.

## Step 8 plan (polish + deploy)
- Ensure all content is verbatim.
- Final theming (coffee gradients, neon glows, shader pulses).
- Build/test; deploy to Vercel with routing config.
