import { useState, useEffect } from 'react'

export default function Cancel() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading') // loading | found | not_found | cancelled | error

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

  const dateFormatted = order ? new Date(order.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">Jeanke's Pizza</p>
          <h1 className="font-serif text-3xl italic text-ink">Bestelling annuleren</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-10 bg-gold/30" />
            <span className="text-gold text-sm">✦</span>
            <div className="h-px w-10 bg-gold/30" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto" />
          </div>
        )}

        {status === 'found' && order && (
          <div className="bg-white border border-parchment">
            <div className="px-6 py-5 border-b border-parchment">
              <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Uw bestelling</p>
              <p className="font-serif text-xl text-ink">{order.name}</p>
            </div>
            <div className="px-6 py-4 space-y-2 border-b border-parchment">
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Datum</span>
                <span className="text-ink font-medium">{dateFormatted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Tijdslot</span>
                <span className="text-ink font-medium">{order.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Bestelling</span>
                <span className="text-ink text-right max-w-[60%]">{order.order}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-parchment">
                <span className="text-warm-gray">Totaal</span>
                <span className="font-serif text-wine text-lg">{order.total}</span>
              </div>
            </div>
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
            <div className="text-4xl mb-4">✓</div>
            <h2 className="font-serif text-2xl italic text-ink mb-2">Geannuleerd</h2>
            <p className="font-sans text-sm text-warm-gray mb-6">Uw bestelling is geannuleerd. Het tijdslot is terug vrijgegeven.</p>
            <a href="/" className="btn-primary inline-block">Nieuwe bestelling</a>
          </div>
        )}

        {(status === 'not_found') && (
          <div className="bg-white border border-parchment p-8 text-center">
            <div className="text-4xl mb-4 opacity-30">✗</div>
            <h2 className="font-serif text-xl italic text-ink mb-2">Niet gevonden</h2>
            <p className="font-sans text-sm text-warm-gray mb-6">Deze bestelling bestaat niet of is al geannuleerd.</p>
            <a href="/" className="btn-primary inline-block">Naar shop</a>
          </div>
        )}
      </div>
    </div>
  )
}
