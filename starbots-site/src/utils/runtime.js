export const initVisibilityPause = (onPause, onResume) => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (typeof onPause === 'function') onPause()
    } else {
      if (typeof onResume === 'function') onResume()
    }
  })
}
