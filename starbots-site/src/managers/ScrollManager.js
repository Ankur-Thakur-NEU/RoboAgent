export class ScrollManager {
  /**
   * @param {{
   *  sections: NodeListOf<HTMLElement>,
   *  prefersReducedMotion: boolean,
   *  onScrollProgress: (state: { scrollProgress: number, aboutMorphProgress: number }) => void,
   *  onSectionActive: (sectionId: string, sectionEl: HTMLElement) => void,
   *  threshold?: number
   * }} options
   */
  constructor({ sections, prefersReducedMotion, onScrollProgress, onSectionActive, threshold }) {
    this.sections = Array.from(sections)
    this.prefersReducedMotion = prefersReducedMotion
    this.onScrollProgress = onScrollProgress
    this.onSectionActive = onSectionActive
    this.threshold = threshold
    this.sectionMetrics = []
    this.scrollTicking = false

    this.updateSectionMetrics = this.updateSectionMetrics.bind(this)
    this.onScroll = this.onScroll.bind(this)
  }

  start() {
    this.updateSectionMetrics()
    this.updateScrollProgress()

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setActiveSection(`#${entry.target.id}`)
            if (typeof this.onSectionActive === 'function') {
              this.onSectionActive(entry.target.id, entry.target)
            }
          }
        })
      },
      { threshold: this.threshold ?? 0.5 }
    )

    this.sections.forEach((section) => this.observer.observe(section))
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.updateSectionMetrics)
  }

  updateScrollProgress() {
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
    const aboutMorphProgress = this.getSectionProgress('about')
    if (typeof this.onScrollProgress === 'function') {
      this.onScrollProgress({ scrollProgress, aboutMorphProgress })
    }
  }

  onScroll() {
    if (!this.scrollTicking) {
      window.requestAnimationFrame(() => {
        this.updateScrollProgress()
        this.scrollTicking = false
      })
      this.scrollTicking = true
    }
  }

  updateSectionMetrics() {
    this.sectionMetrics = this.sections.map((section) => ({
      id: section.id,
      top: section.offsetTop,
      height: section.offsetHeight,
    }))
  }

  getSectionProgress(id) {
    const metric = this.sectionMetrics.find((section) => section.id === id)
    if (!metric) return 0
    const start = metric.top - window.innerHeight * 0.2
    const end = metric.top + metric.height * 0.6
    const progress = (window.scrollY - start) / (end - start)
    return Math.min(Math.max(progress, 0), 1)
  }

  setActiveSection(hash) {
    const targetId = (hash || '#home').replace('#', '')
    this.sections.forEach((section) => {
      section.classList.toggle('is-active', section.id === targetId)
    })
  }

  scrollToTarget(hash) {
    const target = document.querySelector(hash)
    if (!target) return
    target.scrollIntoView({ behavior: this.prefersReducedMotion ? 'auto' : 'smooth' })
  }

  dispose() {
    if (this.observer) {
      this.observer.disconnect()
    }
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.updateSectionMetrics)
  }
}
