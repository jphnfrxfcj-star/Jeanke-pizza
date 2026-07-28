import { useState } from 'react'
import PaperTexture from './PaperTexture'

/**
 * Gedeelde footer met nieuwsbriefinschrijving.
 *
 * Props:
 *   extraBottomPadding — bool. Ruimte laten voor de mobiele winkelmandbalk.
 */
export default function SiteFooter({ extraBottomPadding = false }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('') // '' | 'loading' | 'success' | 'duplicate' | 'error'

  async function handleSignup(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 409) { setStatus('duplicate'); return }
      if (!res.ok) { setStatus('error'); return }
      setStatus('success')
      setEmail('')
    } catch { setStatus('error') }
  }

  return (
    <footer className="relative bg-cream border-t border-parchment">
      <PaperTexture />
      <div className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-14 ${extraBottomPadding ? 'lg:pb-14 pb-28' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          <div>
            <p className="font-serif italic text-2xl text-ink">Jeanke's</p>
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray mt-1">Secret Pizza · Pizzeria artigianale</p>
            <p className="font-serif italic text-warm-gray text-sm mt-4 leading-relaxed max-w-xs">
              Vers deeg, houtoven, en een portie Italiaanse <em>allegria</em>.
            </p>
          </div>

          <div>
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Aanbod</p>
            <ul className="space-y-2 font-sans text-xs text-warm-gray">
              <li><a href="/box" className="hover:text-wine transition-colors">Pizza box</a></li>
              <li><a href="/catering" className="hover:text-wine transition-colors">Catering</a></li>
              <li><a href="/workshops" className="hover:text-wine transition-colors">Workshops</a></li>
              <li><a href="/ovens" className="hover:text-wine transition-colors">Gozney &amp; Ooni ovens</a></li>
            </ul>
          </div>

          <div>
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Navigatie</p>
            <ul className="space-y-2 font-sans text-xs text-warm-gray">
              <li><a href="/#menu" className="hover:text-wine transition-colors">Il Menù</a></li>
              <li><a href="/#wijn" className="hover:text-wine transition-colors">La Cantina</a></li>
              <li><a href="/#racconto" className="hover:text-wine transition-colors">Il Racconto</a></li>
            </ul>
          </div>

          <div>
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Nieuwsbrief</p>
            <p className="font-serif italic text-warm-gray text-xs leading-relaxed mb-4">
              Blijf op de hoogte van onze volgende pizza-avonden.
            </p>
            {status === 'success' ? (
              <div className="border border-dashed border-parchment px-4 py-3">
                <p className="font-serif italic text-sm text-ink">Ingeschreven!</p>
                <p className="font-sans text-[11px] text-warm-gray mt-1">We houden u op de hoogte.</p>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status) setStatus('') }}
                  placeholder="uw@email.be"
                  aria-label="E-mailadres voor de nieuwsbrief"
                  className="w-full border border-parchment bg-cream px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-olive transition-colors"
                />
                {status === 'duplicate' && (
                  <p className="font-sans text-[11px] text-wine italic">Al ingeschreven.</p>
                )}
                {status === 'error' && (
                  <p className="font-sans text-[11px] text-wine italic">Er ging iets mis. Probeer opnieuw.</p>
                )}
                <button type="submit" disabled={status === 'loading'} className="btn-primary text-xs py-2.5">
                  {status === 'loading' ? 'Even geduld...' : 'Inschrijven'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-dashed border-parchment flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray-light">
            © {new Date().getFullYear()} Jeanke's Pizza · Secret Pizza
          </p>
          <p className="font-serif italic text-xs text-warm-gray-light">
            Con amore, uit de houtoven.
          </p>
        </div>
      </div>
    </footer>
  )
}
