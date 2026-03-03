import * as THREE from 'three'

export const captureSnapshot = (renderer, scene, camera) => {
  const size = renderer.getSize(new THREE.Vector2())
  const target = new THREE.WebGLRenderTarget(size.x, size.y)
  const prevTarget = renderer.getRenderTarget()
  renderer.setRenderTarget(target)
  renderer.render(scene, camera)
  const buffer = new Uint8Array(size.x * size.y * 4)
  renderer.readRenderTargetPixels(target, 0, 0, size.x, size.y, buffer)
  renderer.setRenderTarget(prevTarget)
  target.dispose()

  const canvas2d = document.createElement('canvas')
  canvas2d.width = size.x
  canvas2d.height = size.y
  const ctx = canvas2d.getContext('2d')
  if (!ctx) return renderer.domElement.toDataURL('image/png')

  const imageData = ctx.createImageData(size.x, size.y)
  for (let y = 0; y < size.y; y += 1) {
    const srcRow = (size.y - y - 1) * size.x * 4
    const dstRow = y * size.x * 4
    imageData.data.set(buffer.subarray(srcRow, srcRow + size.x * 4), dstRow)
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas2d.toDataURL('image/png')
}
