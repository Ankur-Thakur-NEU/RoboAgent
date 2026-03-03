# STÅRBOTS Frontend

## Designer Checklist
1. Export your model as `.glb`.
2. Place files in:
   - `src/assets/models/` for models
   - `src/assets/textures/` for textures
   - `src/shaders/` for shaders
3. Update `src/config/assets.js` if filenames change.
4. Run `npm run dev` and refresh.

## Asset Config
- Models: `ASSET_PATHS.baristaModel`, `ASSET_PATHS.customizerModel`
- Textures: `ASSET_PATHS.coffeeBeanTexture`
- Shaders: `ASSET_SHADERS.linesToBeansVertex`, `ASSET_SHADERS.linesToBeansFragment`

## Local Dev
- `npm install`
- `npm run dev`
