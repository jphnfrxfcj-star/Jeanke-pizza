import { useState, useEffect } from 'react'

export default function Unsubscribe() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [status, setStatus] = useState('loading')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!token) { setStatus('no_token'); return }
    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${encodeURIComponent(token)}`,
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setName(data.name || ''); setStatus('done') }
        else setStatus('not_found')
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] tracking-[0.36em] uppercase text-gold mb-3">Jeanke's Pizza</p>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/40 block" />
            <span className="text-gold text-xs">✦</span>
            <span className="h-px w-8 bg-gold/40 block" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="text-center py-16">
            <div className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto motion-reduce:animate-none" />
          </div>
        )}

        {status === 'done' && (
          <div className="bg-white border border-parchment p-8 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto text-gold/50 mb-5" aria-hidden="true">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M13 20l5 5 9-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="font-serif text-2xl italic text-ink mb-3">Uitgeschreven</h2>
            <p className="font-serif italic text-sm text-warm-gray mb-2">
              {name ? `${name}, u` : 'U'} bent uitgeschreven van onze nieuwsbrief.
            </p>
            <p className="font-serif italic text-sm text-warm-gray mb-8">
              Jammer u te zien gaan — tot ziens aan de deur.
            </p>
            <a href="/" className="btn-primary inline-block">Naar de shop</a>
          </div>
        )}

        {(status === 'not_found' || status === 'no_token') && (
          <div className="bg-white border border-parchment p-8 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto text-gold/40 mb-5" aria-hidden="true">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.4" />
            </svg>
            <h2 className="font-serif text-xl italic text-ink mb-2">Niet gevonden</h2>
            <p className="font-serif italic text-sm text-warm-gray mb-6">
              Deze uitschrijflink is ongeldig of al eerder gebruikt.
            </p>
            <a href="/" className="btn-primary inline-block">Naar de shop</a>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white border border-parchment p-8 text-center">
            <h2 className="font-serif text-xl italic text-ink mb-2">Er ging iets mis</h2>
            <p className="font-serif italic text-sm text-warm-gray mb-6">Probeer opnieuw via de link in uw e-mail.</p>
            <a href="/" className="btn-primary inline-block">Naar de shop</a>
          </div>
        )}

      </div>
    </div>
  )
}
