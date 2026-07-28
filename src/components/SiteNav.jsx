import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useServices } from '../lib/useServices'

/**
 * Gedeelde topnavigatie voor de shop en de dienstenpagina's.
 *
 * Diensten die in het beheer op "uit" staan verdwijnen hier vanzelf.
 *
 * Props:
 *   open     — bool | null. Toont de status-stip ("Open" / "Gesloten").
 *              null verbergt de stip (op pagina's waar bestellen niet speelt).
 *   current  — pathname van de actieve pagina, bv. "/catering"
 */

const SERVICE_NAV = [
  { key: 'box',       label: 'Box' },
  { key: 'catering',  label: 'Catering' },
  { key: 'workshops', label: 'Workshops' },
  { key: 'ovens',     label: 'Ovens' },
]

export default function SiteNav({ open = null, current = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const services = useServices()

  const NAV_LINKS = [
    { href: '/#menu', label: 'Menù', match: '/' },
    ...SERVICE_NAV
      .filter(({ key }) => services[key]?.mode !== 'off')
      .map(({ key, label }) => ({ href: services[key].route, label, match: services[key].route })),
  ]

  return (
    <nav className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-parchment">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-4">
        <a href="/#top" className="flex items-baseline gap-2 group shrink-0">
          <span className="font-serif italic text-xl text-ink group-hover:text-wine transition-colors">Jeanke's</span>
          <span className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray hidden sm:inline">Secret Pizza</span>
        </a>

        <div className="flex items-center gap-5">
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

          {open !== null && (
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2 w-2 ${open ? '' : 'opacity-40'}`}>
                {open && <span className="absolute inline-flex h-full w-full rounded-full bg-olive opacity-60 animate-ping motion-reduce:animate-none" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${open ? 'bg-olive' : 'bg-warm-gray-light'}`} />
              </span>
              <span className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray hidden sm:inline">
                {open ? 'Open' : 'Gesloten'}
              </span>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-nav-panel"
            aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
            className="lg:hidden -mr-2 p-2 text-ink hover:text-wine transition-colors"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="site-nav-panel" className="lg:hidden border-t border-dashed border-parchment bg-cream">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={current === link.match ? 'page' : undefined}
                className={`block py-2.5 font-sans text-xs tracking-[0.24em] uppercase border-b border-dotted border-parchment last:border-0 transition-colors ${
                  current === link.match ? 'text-wine' : 'text-ink hover:text-wine'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
