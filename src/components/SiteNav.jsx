import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { useServices } from '../lib/useServices'
import { useOpenStatus } from '../lib/useOpenStatus'
import PaperTexture from './PaperTexture'

/**
 * Gedeelde topnavigatie voor de shop en de dienstenpagina's.
 *
 * Diensten die in het beheer op "uit" staan verdwijnen hier vanzelf.
 *
 * Mobiel opent het menu als overlay over de pagina, niet als paneel dat de
 * inhoud omlaag duwt. Volgt hetzelfde patroon als CheckoutModal: role=dialog,
 * aria-modal, scroll-lock, Escape sluit, focus blijft binnen de overlay en
 * keert daarna terug naar de knop.
 *
 * De overlay gaat via een portal naar document.body. Dat moet: de nav heeft
 * backdrop-blur, en zo'n filter maakt van het element een containing block
 * voor position:fixed kinderen. Binnen de nav zou de overlay dus in die balk
 * van 56px gepropt worden in plaats van het scherm te vullen.
 *
 * De "Open"/"Gesloten"-status heeft op elke breedte een woord bij de stip. Een
 * kaal bolletje zonder label leest als een meldingsbadge, niet als openingstijd.
 *
 * Props:
 *   open     — bool | null. Geef mee als de pagina de slots zelf al berekent
 *              (de shop doet dat); anders zoekt de nav het zelf op.
 *   current  — pathname van de actieve pagina, bv. "/catering"
 */

const SERVICE_NAV = [
  { key: 'box',       label: 'Box' },
  { key: 'catering',  label: 'Catering' },
  { key: 'workshops', label: 'Workshops' },
  { key: 'ovens',     label: 'Ovens' },
]

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function SiteNav({ open = null, current = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const services = useServices()
  const overlayRef = useRef(null)
  const buttonRef = useRef(null)

  // De shop geeft de status mee; alleen als die ontbreekt zoeken we hem zelf
  // op, anders zou de homepage alles dubbel ophalen.
  const fetched = useOpenStatus(open === null)
  // Onbekend telt als gesloten, zodat er meteen een label staat.
  const status = (open !== null ? open : fetched) === true

  const NAV_LINKS = [
    { href: '/#menu', label: 'Menù', match: '/' },
    ...SERVICE_NAV
      .filter(({ key }) => services[key]?.route && services[key].mode !== 'off')
      .map(({ key, label }) => ({ href: services[key].route, label, match: services[key].route })),
  ]

  useEffect(() => {
    if (!menuOpen) return
    const opener = buttonRef.current
    document.body.style.overflow = 'hidden'
    // Focus op de dialoog zelf, niet op de eerste link. Anders ziet "Menù"
    // eruit alsof hij al gekozen is, en tekenen sommige browsers (Safari) hun
    // eigen blauwe ring rond een link die programmatisch focus krijgt.
    overlayRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') { setMenuOpen(false); return }
      if (e.key !== 'Tab') return
      // Focus binnen de overlay houden
      // De sluitknop staat in de nav, de links in de overlay: samen vormen
      // ze de kring waar de focus in blijft.
      const items = [opener, ...(overlayRef.current?.querySelectorAll('a[href], button') ?? [])].filter(Boolean)
      if (!items.length) return
      // De hele cyclus zelf sturen, niet alleen de randen. De overlay hangt via
      // een portal achteraan in body terwijl de knop in de nav staat, dus de
      // natuurlijke tabvolgorde loopt daartussen door de hele pagina heen.
      e.preventDefault()
      const idx = items.indexOf(document.activeElement)
      const laatste = items.length - 1
      const volgende = e.shiftKey
        ? (idx <= 0 ? laatste : idx - 1)
        : (idx === -1 || idx === laatste ? 0 : idx + 1)
      items[volgende].focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus()
    }
  }, [menuOpen])

  const statusLabel = (
    <span className="flex items-center gap-2 shrink-0">
      <span className={`relative flex h-2 w-2 ${status ? '' : 'opacity-40'}`}>
        {status && <span className="absolute inline-flex h-full w-full rounded-full bg-olive opacity-60 animate-ping motion-reduce:animate-none" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status ? 'bg-olive' : 'bg-warm-gray-light'}`} />
      </span>
      {/* Het langste label reserveert de breedte, zodat "Open" en "Gesloten"
          elkaar kunnen aflossen zonder de nav te verschuiven. Een vaste
          rem-waarde zou breken bij een andere letter. */}
      <span className="grid font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray">
        <span aria-hidden="true" className="col-start-1 row-start-1 invisible">Gesloten</span>
        <span className="col-start-1 row-start-1 whitespace-nowrap">{status ? 'Open' : 'Gesloten'}</span>
      </span>
    </span>
  )

  return (
    <nav className={`sticky top-0 z-30 border-b border-parchment ${
      // Doorschijnend tijdens het scrollen, maar dicht zodra de overlay open
      // staat — anders zie je de pagina door de balk heen schemeren.
      menuOpen ? 'bg-cream' : 'bg-cream/80 backdrop-blur-md'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
        <a href="/#top" className="flex items-baseline gap-2 group shrink-0">
          <span className="font-serif italic text-xl text-ink group-hover:text-wine transition-colors">Jeanke's</span>
          <span className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray hidden sm:inline">Secret Pizza</span>
        </a>

        <div className="flex items-center gap-4 sm:gap-5">
          <div className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                aria-current={current === link.match ? 'page' : undefined}
                className={`font-sans text-xs tracking-[0.24em] uppercase transition-colors ${
                  current === link.match ? 'text-wine' : 'text-ink hover:text-wine'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Op de smalste schermen wint de knop het van het statuslabel */}
          <span className="hidden min-[380px]:flex">{statusLabel}</span>

          {/* -mr-3 trekt het vergrote raakvlak naar de schermrand toe, zodat de
              knop optisch op zijn plek blijft staan */}
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-nav-overlay"
            aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
            className="lg:hidden -mr-3 w-11 h-11 flex items-center justify-center text-ink hover:text-wine transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && createPortal(
        <div
          id="site-nav-overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigatie"
          tabIndex={-1}
          className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-cream overflow-y-auto overscroll-contain focus:outline-none animate-[fadeIn_150ms_ease-out] motion-reduce:animate-none"
        >
          <PaperTexture />
          <div className="relative flex min-h-full flex-col px-6 pt-8 pb-10">
            <ul className="my-auto">
              {NAV_LINKS.map((link, i) => {
                const actief = current === link.match
                return (
                  <li key={link.href} className="border-b border-dotted border-parchment last:border-0">
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={actief ? 'page' : undefined}
                      className="flex items-baseline gap-4 py-4 group"
                    >
                      {/* w-12 zodat "N° III" en "N° IV" niet over twee regels breken */}
                      <span className="font-serif italic text-sm text-gold w-12 shrink-0 whitespace-nowrap">
                        N° {ROMAN[i]}
                      </span>
                      <span className={`font-serif text-3xl leading-tight transition-colors ${
                        actief ? 'text-wine' : 'text-ink group-hover:text-wine'
                      }`}>
                        {link.label}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>

            {/* De status staat normaal in de balk, die zichtbaar blijft zolang
                de overlay open is — twee keer "Open" op één scherm leest als
                een fout. Onder 380px is daar geen plaats voor, en dan neemt de
                overlay het over. Zo ziet elke bezoeker hem ergens. */}
            <div className="mt-10 pt-6 border-t border-dashed border-parchment flex items-center justify-center gap-4">
              <span className="min-[380px]:hidden">{statusLabel}</span>
              <span className="font-serif italic text-xs text-warm-gray-light">Con amore, uit de houtoven.</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  )
}
