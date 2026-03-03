export const initForms = ({
  signupForm,
  signupStatus,
  signupPreview,
  signupAccent,
  signupFollowers,
  signupFollowersHelp,
  customizer,
  triggerSignupBurst,
  contactForm,
  contactStatus,
}) => {
  if (signupAccent && signupPreview) {
    signupAccent.addEventListener('input', (event) => {
      signupPreview.style.setProperty('--preview-accent', event.target.value)
      if (customizer) {
        customizer.setColor(event.target.value)
      }
    })
  }

  if (signupFollowers && signupFollowersHelp) {
    signupFollowers.addEventListener('input', (event) => {
      const count = Number(event.target.value || 0)
      if (count > 0 && count < 1000000) {
        signupFollowersHelp.textContent = 'Creators with 1M+ followers are prioritized.'
      } else {
        signupFollowersHelp.textContent = ''
      }
    })
  }

  if (signupForm && signupStatus) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const formData = new FormData(signupForm)
      const data = Object.fromEntries(formData.entries())
      if (import.meta.env.DEV) {
        console.log('Creator signup', data)
      }
      signupStatus.textContent = 'Application received. We will reach out soon.'
      if (typeof triggerSignupBurst === 'function') {
        triggerSignupBurst()
      }
      signupForm.reset()
      if (signupPreview) {
        signupPreview.style.setProperty('--preview-accent', '#9ef1ff')
      }
    })
  }

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const formData = new FormData(contactForm)
      const data = Object.fromEntries(formData.entries())
      if (import.meta.env.DEV) {
        console.log('Contact inquiry', data)
      }
      contactStatus.textContent = 'Thanks! We will reply within 2 business days.'
      contactForm.reset()
    })
  }
}
