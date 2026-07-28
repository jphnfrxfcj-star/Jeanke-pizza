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
 * Reageert op service.mode:
 *   live    — gewone pagina
 *   concept — badge onder de intro; de pagina zelf verbergt prijzen
 *   off     — hero blijft staan, inhoud maakt plaats voor een bericht, zodat
 *             bestaande links en zoekresultaten niet doodlopen
 *
 * Props:
 *   service  — object uit src/data/services.json
 *   children — de secties van de pagina
 */
export default function ServicePage({ service, children }) {
  const isOff = service.mode === 'off'
  const badge = service.mode === 'concept' ? service.conceptBadge : null
  // Eén keer bij het openen naar boven. Dit stond eerder in dezelfde effect
  // als de meta-tags, waardoor de pagina terugsprong naar boven op het moment
  // dat /api/services binnenkwam — precies wanneer de bezoeker al aan het
  // scrollen was.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = service.metaTitle
    setMeta('description', service.metaDescription)
    setCanonical(service.route)
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
        {/* Weinig padding onderaan: de eerste sectie brengt zelf al ruimte mee */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-4 sm:pt-14 sm:pb-6 text-center">
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

      <main className="relative">
        {isOff ? (
          <section className="relative bg-parchment/50 border-y border-parchment overflow-hidden">
            <PaperTexture />
            <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-10 py-16 text-center">
              <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
                <span className="h-px w-6 bg-gold/40" />
                <span>Even niet</span>
                <span className="h-px w-6 bg-gold/40" />
              </div>
              <p className="font-serif italic text-warm-gray text-base leading-relaxed mt-5">
                {service.offNotice}
              </p>
              <a href="/" className="btn-primary inline-block mt-8">Naar de pizzeria</a>
            </div>
          </section>
        ) : children}
      </main>

      <SiteFooter />
    </div>
  )
}

/**
 * Plaatshouder voor een prijs die nog niet vaststaat.
 *
 * Het alternatief — vast de waarde uit services.json tonen — laat de prijs
 * zichtbaar verspringen zodra de beheerde versie binnenkomt. Beter even niets
 * dan even iets verkeerds, zeker bij een bedrag.
 */
export function PriceSkeleton({ className = 'h-8 w-20' }) {
  return (
    <span
      role="status"
      aria-label="Prijs wordt geladen"
      className={`inline-block bg-parchment/70 animate-pulse motion-reduce:animate-none align-middle ${className}`}
    />
  )
}

const STATUS_LABELS = {
  nieuw:         { label: 'Nieuw',       cls: 'border-gold/50 text-gold' },
  'op-aanvraag': { label: 'Op aanvraag', cls: 'border-warm-gray-light text-warm-gray' },
  volzet:        { label: 'Volzet',      cls: 'border-wine/40 text-wine' },
}

/** Kleine statusbadge op een formule, box, workshop of ovenmodel. */
export function StatusBadge({ status }) {
  const meta = STATUS_LABELS[status]
  if (!meta) return null
  return (
    <span className={`inline-block border px-2 py-0.5 font-sans text-[9px] tracking-[0.2em] uppercase whitespace-nowrap ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

/**
 * Tekst op de keuzeknop van een item. Volzet en conceptmodus winnen van het
 * standaardlabel, zodat een bezoeker nooit "Offerte aanvragen" leest bij iets
 * dat nog niet te koop is.
 */
export function ctaLabel({ selected, status, concept, fallback }) {
  if (selected) return 'Gekozen ✓'
  if (status === 'volzet') return 'Op de wachtlijst'
  if (concept) return 'Houd mij op de hoogte'
  return fallback
}

/** Sectiekop binnen een dienstenpagina. */
export function ServiceSection({ title, caption, id, children, tone = 'cream' }) {
  const bg = tone === 'parchment' ? 'bg-parchment/50 border-y border-parchment' : ''
  return (
    <section id={id} className={`relative scroll-mt-20 ${bg} overflow-hidden`}>
      {tone === 'parchment' && <PaperTexture />}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
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
