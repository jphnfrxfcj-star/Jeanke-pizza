import { useState, useMemo, useEffect } from 'react'
import PizzaCard from './components/PizzaCard'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Admin from './components/Admin'
import Cancel from './components/Cancel'
import config from './data/config.json'
import staticPizzas from './data/pizzas.json'

function generateSlotsForDates(openingDates, config, settings) {
  const slots = []
  const now = new Date()
  const openingHour = settings?.openingHour ?? config.openingHour
  const closingHour = settings?.closingHour ?? config.closingHour
  for (const { date } of openingDates) {
    const d = new Date(date + 'T00:00:00')
    if (new Date(date + 'T23:59:59') < now) continue
    const dateStr = date
    const start = new Date(d); start.setHours(openingHour, 0, 0, 0)
    const end   = new Date(d); end.setHours(closingHour, 0, 0, 0)
    const cursor = new Date(start)
    while (cursor < end) {
      if (cursor > new Date(now.getTime() + 15 * 60 * 1000)) {
        slots.push({ date: dateStr, time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) })
      }
      cursor.setMinutes(cursor.getMinutes() + config.slotIntervalMinutes)
    }
  }
  return slots
}

export default function App() {
  const path = window.location.pathname
  if (path === '/beheer') return <Admin />
  if (path === '/annuleer') return <Cancel />
  return <Shop />
}

function Shop() {
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [pizzas, setPizzas] = useState([])
  const [openingDays, setOpeningDays] = useState(null) // null = loading
  const [registration, setRegistration] = useState(null)
  const [settings, setSettings] = useState(null)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPizzas, setRegPizzas] = useState(1)
  const [regStatus, setRegStatus] = useState('') // '' | 'loading' | 'success' | 'duplicate' | 'error'

  useEffect(() => {
    fetch('/api/pizzas')
      .then(r => r.json())
      .then(data => setPizzas(data.length ? data : staticPizzas))
      .catch(() => setPizzas(staticPizzas))
  }, [])

  useEffect(() => {
    fetch('/api/opening-days')
      .then(r => r.json())
      .then(days => {
        const now = new Date()
        const future = days.filter(d => new Date(d.date + 'T23:59:59') >= now)
        setOpeningDays(future)
      })
      .catch(() => setOpeningDays([]))
    fetch('/api/register')
      .then(r => r.json())
      .then(setRegistration)
      .catch(() => {})
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => setSettings({}))
  }, [])

  const slots = useMemo(() => {
    if (!openingDays || openingDays.length === 0) return []
    return generateSlotsForDates(openingDays, config, settings)
  }, [openingDays, settings])

  function addToCart(pizza) {
    setCart(prev => {
      const ex = prev.find(i => i.pizza.id === pizza.id)
      if (ex) return prev.map(i => i.pizza.id === pizza.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { pizza, quantity: 1 }]
    })
  }
  function removeFromCart(pizza) {
    setCart(prev => {
      const ex = prev.find(i => i.pizza.id === pizza.id)
      if (!ex) return prev
      if (ex.quantity === 1) return prev.filter(i => i.pizza.id !== pizza.id)
      return prev.map(i => i.pizza.id === pizza.id ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }
  function getQuantity(id) { return cart.find(i => i.pizza.id === id)?.quantity ?? 0 }
  function handleSuccess(order) { setSuccessOrder(order); setShowCheckout(false); setCart([]) }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  async function handleRegister(e) {
    e.preventDefault()
    setRegStatus('loading')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, pizzas: regPizzas }),
      })
      const data = await res.json()
      if (res.status === 409) { setRegStatus('duplicate'); return }
      if (!res.ok) { setRegStatus('error'); return }
      setRegistration(prev => ({ ...prev, count: data.count, max: data.max, openFrom: data.openFrom }))
      setRegStatus('success')
      // Bevestigingsmail naar inschrijver
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'registration', name: regName, email: regEmail, pizzas: regPizzas, registrationDate: registration?.registrationDate }),
      }).catch(() => {})
      if (data.reached) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'threshold', count: data.count, threshold: data.openFrom }),
        }).catch(() => {})
      }
    } catch { setRegStatus('error') }
  }

  const showRegistration = registration?.registrationOpen === true

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <header className="bg-olive text-cream">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 text-center relative">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-wide">
            Jeanke's Pizza
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gold/40" />
            <span className="text-gold text-lg">✦</span>
            <div className="h-px w-12 bg-gold/40" />
          </div>
          <p className="font-serif italic text-cream/60 text-sm mt-2">
            Piccola pizzeria artigianale
          </p>

        </div>

        {/* Nav strip */}
        {!showRegistration && openingDays && openingDays.length > 0 && (
          <div className="border-t border-cream/10">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2 flex items-center justify-between">
              <span className="font-sans text-xs text-cream/40 tracking-wide">
                Ophaaluren {settings?.openingHour ?? config.openingHour}:00 – {settings?.closingHour ?? config.closingHour}:00
              </span>
              <span className="font-sans text-xs text-cream/40 tracking-wide">
                Elke {config.slotIntervalMinutes} min een slot
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {openingDays === null || registration === null ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin" />
          </div>
        ) : showRegistration ? (
          <div className="max-w-lg mx-auto">
            <div className="divider mb-4">Interesse lijst</div>
            {registration?.registrationDate && (
              <p className="font-serif italic text-center text-warm-gray mb-8">
                Registreer voor{' '}
                <strong className="text-ink not-italic">
                  {new Date(registration.registrationDate + 'T12:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </p>
            )}

            <div className="bg-white border border-parchment mb-8">
              <div className="px-6 py-5 border-b border-parchment text-center">
                <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Gereserveerde pizza's</p>
                {registration ? (
                  <>
                    <p className="font-serif text-4xl text-ink mb-1">
                      {registration.count}<span className="text-warm-gray text-2xl">/{registration.max}</span>
                    </p>
                    <div className="mt-4 h-2 bg-parchment rounded-full overflow-hidden relative">
                      {/* Open-from marker */}
                      <div className="absolute top-0 bottom-0 w-px bg-gold/60 z-10"
                        style={{ left: `${(registration.openFrom / registration.max) * 100}%` }} />
                      <div
                        className="h-full bg-olive transition-all duration-500"
                        style={{ width: `${Math.min(100, (registration.count / registration.max) * 100)}%` }}
                      />
                    </div>
                    <p className="font-sans text-xs text-warm-gray mt-2">
                      {registration.count < registration.openFrom
                        ? `Nog ${registration.openFrom - registration.count} pizza's nodig om te openen`
                        : registration.count < registration.max
                        ? `Open — nog ${registration.max - registration.count} plaatsen vrij`
                        : 'Volzet'}
                    </p>
                  </>
                ) : (
                  <div className="w-6 h-6 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto my-2" />
                )}
              </div>

              <div className="px-6 py-5">
                <p className="font-serif italic text-warm-gray text-sm text-center mb-6">
                  Schrijf u in en ontvang een bericht zodra we openen.
                </p>

                {regStatus === 'success' ? (
                  <div className="text-center py-4">
                    <p className="font-serif italic text-ink text-lg mb-1">Inschrijving ontvangen!</p>
                    <p className="font-sans text-xs text-warm-gray">We sturen u een bericht zodra het zover is.</p>
                    <p className="font-sans text-xs text-warm-gray-light mt-1">Niet ontvangen? Controleer uw spam-map.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Naam</label>
                      <input
                        type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                        placeholder="Uw naam"
                        className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">E-mail</label>
                      <input
                        type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        placeholder="uw@email.be"
                        className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Aantal pizza's</label>
                      <div className="flex border border-parchment">
                        <button type="button" onClick={() => setRegPizzas(p => Math.max(1, p - 1))}
                          className="px-4 py-3 text-ink hover:bg-parchment transition-colors text-lg leading-none">−</button>
                        <span className="flex-1 flex items-center justify-center font-serif text-lg text-ink border-x border-parchment">{regPizzas}</span>
                        <button type="button" onClick={() => setRegPizzas(p => Math.min(10, p + 1))}
                          className="px-4 py-3 text-ink hover:bg-parchment transition-colors text-lg leading-none">+</button>
                      </div>
                    </div>
                    {regStatus === 'duplicate' && (
                      <p className="font-sans text-xs text-wine italic">Dit e-mailadres is al ingeschreven.</p>
                    )}
                    {regStatus === 'error' && (
                      <p className="font-sans text-xs text-wine italic">Er ging iets mis. Probeer opnieuw.</p>
                    )}
                    <button type="submit" disabled={regStatus === 'loading'} className="btn-primary w-full">
                      {regStatus === 'loading' ? 'Even geduld...' : 'Inschrijven'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Still show the menu below */}
            <div className="divider mb-7">Il Menù</div>
            <p className="font-sans text-xs text-warm-gray text-center mb-6 tracking-wide">
              Een voorproefje van ons aanbod
            </p>
            {pizzas.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-parchment animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pizzas.map(pizza => (
                  <PizzaCard key={pizza.id} pizza={pizza} quantity={0} onAdd={() => {}} onRemove={() => {}} currency={config.currency} showOrder={false} />
                ))}
              </div>
            )}
          </div>

        ) : successOrder ? (
          /* Success */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-5xl mb-5">🎉</div>
            <div className="divider mb-6">Grazie mille</div>
            <h2 className="font-serif text-3xl italic mb-3">Bestelling geplaatst!</h2>
            <p className="font-sans text-warm-gray text-sm mb-1">
              Bedankt, <strong className="text-ink">{successOrder.name}</strong>.
            </p>
            <p className="font-sans text-warm-gray text-sm mb-1">
              Uw pizza's zijn klaar om <strong className="text-ink">{successOrder.timeslot}</strong>.
            </p>
            <p className="font-sans text-warm-gray-light text-xs mt-3 mb-1">
              Bevestiging verstuurd naar {successOrder.email}
            </p>
            <p className="font-sans text-warm-gray-light text-xs mb-8">
              Niet ontvangen? Controleer uw spam-map.
            </p>
            <button onClick={() => setSuccessOrder(null)} className="btn-primary">
              Nieuwe bestelling
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Menu */}
            <div className="lg:col-span-2">
              {openingDays.length > 0 && (
                <div className="mb-6 bg-white border border-parchment px-5 py-4">
                  <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Openingsdagen</p>
                  <div className="flex flex-wrap gap-2">
                    {openingDays.map(d => (
                      <span key={d.date} className="bg-olive/10 border border-olive/20 text-olive text-xs font-sans px-3 py-1.5">
                        {new Date(d.date + 'T12:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {d.label && <span className="ml-1 text-warm-gray">— {d.label}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="divider mb-7">Il Menù</div>
              {pizzas.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-64 bg-parchment animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pizzas.map(pizza => (
                    <PizzaCard
                      key={pizza.id}
                      pizza={pizza}
                      quantity={getQuantity(pizza.id)}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                      currency={config.currency}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="divider mb-5 lg:block hidden">Bestelling</div>
                <Cart
                  items={cart}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onCheckout={() => setShowCheckout(true)}
                  currency={config.currency}
                  hasSlots={slots.length > 0}
                />
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-parchment mt-16 py-8" />

      {/* Floating cart button — mobile, fixed bottom */}
      {cartCount > 0 && !showRegistration && slots.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center z-20 px-6">
          <button onClick={() => setShowCheckout(true)}
            className="bg-wine text-cream px-6 py-3.5 font-sans text-sm tracking-widest uppercase flex items-center gap-3 shadow-lg w-full max-w-xs justify-center">
            <span>Winkelmandje</span>
            <span className="bg-cream text-wine font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center">{cartCount}</span>
          </button>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          items={cart}
          slots={slots}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
          currency={config.currency}
          settings={settings}
        />
      )}
    </div>
  )
}
