import { useEffect } from 'react'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import PaperTexture from './PaperTexture'

function setMeta(name, content) {
  if (!content) return
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(path) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `https://www.secretpizza.be${path}`)
}

/**
 * Gedeelde opmaak voor de dienstenpagina's (box, catering, workshops, ovens).
 * Zet titel, meta-description en canonical, en tekent nav, hero en footer.
 *
 * Props:
 *   service  — object uit src/data/services.json
 *   badge    — optionele melding onder de intro, bv. "Aanbod in voorbereiding"
 *   children — de secties van de pagina
 */
export default function ServicePage({ service, badge, children }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = service.metaTitle
    setMeta('description', service.metaDescription)
    setCanonical(service.route)
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => { document.title = previousTitle }
  }, [service])

  return (
    <div className="min-h-screen bg-cream text-ink relative overflow-x-clip">
      <SiteNav current={service.route} />

      {/* Kruimelpad — terugweg naar de shop, los van de leesflow van de hero */}
      <nav aria-label="Kruimelpad" className="relative bg-cream border-b border-parchment/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2.5 font-sans text-[10px] tracking-[0.24em] uppercase">
          <a href="/" className="text-warm-gray hover:text-wine transition-colors">
            ← Pizzeria
          </a>
          <span className="text-gold/50" aria-hidden="true">/</span>
          <span className="text-ink truncate">{service.eyebrow}</span>
        </div>
      </nav>

      <header className="relative bg-cream overflow-hidden">
        <PaperTexture />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-12 sm:pt-16 sm:pb-16 text-center">
          <div className="flex items-center justify-center gap-3 font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-5">
            <span className="h-px w-6 bg-gold/40" />
            <span className="font-serif italic text-wine tracking-normal text-sm leading-none">N° {service.num}</span>
            <span>·</span>
            <span>{service.eyebrow}</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>

          <h1 className="font-serif text-[clamp(2.25rem,7vw,4rem)] leading-[1.05] tracking-tight text-ink">
            {service.title}
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-wine mt-3">{service.tagline}</p>

          <p className="font-sans text-sm sm:text-base text-warm-gray leading-relaxed mt-6 max-w-xl mx-auto">
            {service.intro}
          </p>

          {badge && (
            <p className="inline-block mt-7 border border-dashed border-gold/60 px-4 py-1.5 font-sans text-[10px] tracking-[0.28em] uppercase text-gold">
              {badge}
            </p>
          )}
        </div>
      </header>

      <main className="relative">{children}</main>

      <SiteFooter />
    </div>
  )
}

/** Sectiekop binnen een dienstenpagina. */
export function ServiceSection({ title, caption, id, children, tone = 'cream' }) {
  const bg = tone === 'parchment' ? 'bg-parchment/50 border-y border-parchment' : ''
  return (
    <section id={id} className={`relative scroll-mt-20 ${bg} overflow-hidden`}>
      {tone === 'parchment' && <PaperTexture />}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
            <span className="h-px w-6 bg-gold/40" />
            <span>{title}</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>
          {caption && <p className="font-serif italic text-warm-gray text-sm max-w-xl">{caption}</p>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
