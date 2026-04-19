import { useState, useEffect } from 'react'

export default function Cancel() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!token) { setStatus('not_found'); return }
    fetch(`/api/cancel?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { setOrder(data); setStatus('found') })
      .catch(code => setStatus(code === 404 ? 'not_found' : 'error'))
  }, [token])

  async function handleCancel() {
    if (!confirm('Zeker dat u wilt annuleren?')) return
    const res = await fetch(`/api/cancel?token=${token}`, { method: 'DELETE' })
    setStatus(res.ok ? 'cancelled' : 'error')
  }

  const dateFormatted = order
    ? new Date(order.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const orderItems = order?.order
    ? order.order.split(', ').map(item => {
        const m = item.match(/^(\d+)x (.+?) \((.+?)\)$/)
        return m ? { qty: m[1], name: m[2], price: m[3] } : { qty: '', name: item, price: '' }
      })
    : []

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

        {status === 'found' && order && (
          <div className="bg-white border border-parchment">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-dashed border-warm-gray-light/50">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
                <span className="h-px w-5 bg-gold/40" />
                <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Uw bestelling</p>
              </div>
              <p className="font-serif text-xl text-ink mt-2">{order.name}</p>
            </div>

            {/* Datum + tijdslot */}
            <div className="px-6 py-4 border-b border-dashed border-warm-gray-light/50 space-y-0">
              <div className="flex justify-between items-baseline py-2.5 border-b border-dotted border-warm-gray-light/40">
                <span className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray">Datum</span>
                <span className="font-serif text-sm text-ink">{dateFormatted}</span>
              </div>
              <div className="flex justify-between items-baseline py-2.5">
                <span className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray">Tijdslot</span>
                <span className="font-serif text-sm text-ink tabular-nums">{order.time}</span>
              </div>
            </div>

            {/* Order items */}
            <div className="px-6 py-4 border-b border-dashed border-warm-gray-light/50">
              <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mb-3">Bestelling</p>
              <ul>
                {orderItems.map((item, i) => (
                  <li key={i} className="flex items-baseline gap-3 py-2 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
                    <span className="font-serif text-wine text-sm tabular-nums shrink-0">{item.qty}×</span>
                    <span className="font-serif text-ink text-sm flex-1">{item.name}</span>
                    <span className="font-serif text-ink text-sm tabular-nums shrink-0">{item.price}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-dashed border-warm-gray-light/50">
                <span className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray">Totaal</span>
                <span className="font-serif text-wine text-xl tabular-nums">{order.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-3">
              <button onClick={handleCancel} className="btn-primary w-full">
                Bestelling annuleren
              </button>
              <a href="/" className="btn-secondary w-full text-center block">
                Terug naar shop
              </a>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="bg-white border border-parchment p-8 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto text-gold/50 mb-5" aria-hidden="true">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M13 20l5 5 9-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="font-serif text-2xl italic text-ink mb-2">Geannuleerd</h2>
            <p className="font-serif italic text-sm text-warm-gray mb-6">Uw bestelling is geannuleerd. Het tijdslot is terug vrijgegeven.</p>
            <a href="/" className="btn-primary inline-block">Nieuwe bestelling</a>
          </div>
        )}

        {(status === 'not_found' || status === 'error') && (
          <div className="bg-white border border-parchment p-8 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto text-gold/40 mb-5" aria-hidden="true">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.4" />
            </svg>
            <h2 className="font-serif text-xl italic text-ink mb-2">
              {status === 'error' ? 'Er ging iets mis' : 'Niet gevonden'}
            </h2>
            <p className="font-serif italic text-sm text-warm-gray mb-6">
              {status === 'error' ? 'Probeer opnieuw via de link in uw e-mail.' : 'Deze bestelling bestaat niet of is al geannuleerd.'}
            </p>
            <a href="/" className="btn-primary inline-block">Naar shop</a>
          </div>
        )}

      </div>
    </div>
  )
}
