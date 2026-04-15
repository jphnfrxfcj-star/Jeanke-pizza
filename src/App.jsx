import { useState, useMemo, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
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
  const [wineCart, setWineCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [pizzas, setPizzas] = useState([])
  const [wines, setWines] = useState([])
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
      .then(s => { setSettings(s); if (s.wijnEnabled) fetch('/api/wines').then(r => r.json()).then(d => setWines(Array.isArray(d) ? d : [])).catch(() => {}) })
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
  function handleSuccess(order) { setSuccessOrder(order); setShowCheckout(false); setCart([]); setWineCart([]) }
  function clearCart() { setCart([]); setWineCart([]) }

  function addWine(wine) {
    setWineCart(prev => {
      const ex = prev.find(i => i.wine.id === wine.id)
      if (ex) return prev.map(i => i.wine.id === wine.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { wine, quantity: 1 }]
    })
  }
  function removeWine(wine) {
    setWineCart(prev => {
      const ex = prev.find(i => i.wine.id === wine.id)
      if (!ex) return prev
      if (ex.quantity === 1) return prev.filter(i => i.wine.id !== wine.id)
      return prev.map(i => i.wine.id === wine.id ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

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
      <header className="relative text-cream overflow-hidden">
        {/* Hero image + overlay */}
        <div className="absolute inset-0">
          <img src="/hero.jpg" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-14 sm:py-20 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-wide drop-shadow-md">
            Jeanke's Pizza
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gold/50" />
            <span className="text-gold text-lg">✦</span>
            <div className="h-px w-12 bg-gold/50" />
          </div>
          <p className="font-serif italic text-cream/70 text-sm mt-2 drop-shadow-sm">
            Piccola pizzeria artigianale
          </p>

          {/* Info pills */}
          {!showRegistration && openingDays && openingDays.length > 0 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-7">
              <span className="bg-black/40 border border-white/15 text-cream/85 font-sans text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap">
                · Ophaaluren {settings?.openingHour ?? config.openingHour}:00 – {settings?.closingHour ?? config.closingHour}:00
              </span>
              <span className="bg-black/40 border border-white/15 text-cream/85 font-sans text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap">
                · Elke {config.slotIntervalMinutes} min een tijdslot
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Announcement bar */}
      {!showRegistration && openingDays && openingDays.length > 0 && (
        <div className="bg-wine text-cream">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 text-center">
            <p className="font-sans text-xs tracking-wide">
              <span className="font-bold">Volgende besteldag:</span>{' '}
              {new Date(openingDays[0].date + 'T12:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {openingDays[0].label && <span className="text-cream/70"> — {openingDays[0].label}</span>}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {openingDays === null || registration === null ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin motion-reduce:animate-none" />
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
                        className="h-full bg-wine transition-all duration-500"
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
                  <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin motion-reduce:animate-none mx-auto my-2" />
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
                        className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">E-mail</label>
                      <input
                        type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        placeholder="uw@email.be"
                        className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
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
              Uw pizza's zijn klaar om{' '}
              <strong className="text-ink">
                {successOrder.timeslots?.length > 1
                  ? successOrder.timeslots[successOrder.timeslots.length - 1]
                  : successOrder.timeslot}
              </strong>.
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
                <div className="mb-8">
                  <p className="font-sans text-xs tracking-widest uppercase text-wine mb-1">Besteldag</p>
                  <h2 className="font-serif text-3xl text-ink">
                    {new Date(openingDays[0].date + 'T12:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  {openingDays[0].label && (
                    <p className="font-sans text-sm text-warm-gray mt-1">{openingDays[0].label}</p>
                  )}
                  {openingDays.length > 1 && (
                    <p className="font-sans text-xs text-warm-gray-light mt-2">
                      + {openingDays.length - 1} andere besteldag{openingDays.length > 2 ? 'en' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Suggesties */}
              {(() => {
                const suggestions = pizzas.filter(p => p.suggestion)
                if (!suggestions.length) return null
                return (
                  <div className="mb-10 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-6 py-8 lg:py-6 bg-parchment/50 border-y lg:border border-parchment">
                    <div className="divider mb-6">Suggesties</div>
                    <div className={`grid gap-4 ${suggestions.length >= 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {suggestions.map(pizza => (
                        <div key={pizza.id} className="bg-white border border-parchment border-t-2 border-t-wine flex overflow-hidden">
                          {pizza.imageUrl && (
                            <img src={pizza.imageUrl} alt={pizza.name} className="w-28 shrink-0 object-cover" />
                          )}
                          <div className="p-4 flex flex-col flex-1 min-w-0">
                            <h3 className="font-serif text-xl font-semibold text-ink mb-1">{pizza.name}</h3>
                          <p className="font-sans text-xs text-warm-gray italic leading-relaxed flex-1">
                            {Array.isArray(pizza.ingredients) ? pizza.ingredients.join(', ') : pizza.description}
                          </p>
                          {pizza.allergens?.length > 0 && (
                            <p className="font-sans text-[10px] text-warm-gray-light tracking-wide mt-1">
                              <span className="not-italic uppercase">Allergenen:</span> {pizza.allergens.join(' · ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-parchment">
                            <span className="font-serif text-lg text-wine">{config.currency}{pizza.price.toFixed(2)}</span>
                            {getQuantity(pizza.id) === 0
                              ? <button onClick={() => addToCart(pizza)} className="btn-primary py-1.5 px-3">Toevoegen</button>
                              : <div className="flex items-center gap-2">
                                  <button onClick={() => removeFromCart(pizza)} className="w-7 h-7 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center transition-colors">−</button>
                                  <span className="font-serif text-base w-4 text-center">{getQuantity(pizza.id)}</span>
                                  <button onClick={() => addToCart(pizza)} className="w-7 h-7 bg-wine hover:bg-wine-light text-cream flex items-center justify-center transition-colors">+</button>
                                </div>
                            }
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              <div className="divider mb-7">Il Menù</div>
              {pizzas.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-64 bg-parchment animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pizzas.filter(p => !p.suggestion).map(pizza => (
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

              {/* Wijnkaart */}
              {settings?.wijnEnabled && wines.length > 0 && (
                <>
                  <div className="divider mt-10 mb-7">Wijnkaart</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wines.map(wine => {
                      const qty = wineCart.find(i => i.wine.id === wine.id)?.quantity ?? 0
                      return (
                        <div key={wine.id} className="border border-parchment bg-white p-4 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-serif text-lg text-ink">{wine.name}</p>
                              {wine.type && <p className="font-sans text-xs text-warm-gray uppercase tracking-widest mt-0.5">{wine.type}</p>}
                            </div>
                            <span className="font-serif text-lg text-wine shrink-0">{config.currency}{wine.price.toFixed(2)}</span>
                          </div>
                          {wine.description && <p className="font-sans text-xs text-warm-gray leading-relaxed flex-1">{wine.description}</p>}
                          <div className="flex justify-end mt-1">
                            {qty === 0 ? (
                              <button onClick={() => addWine(wine)} className="btn-primary py-1.5 px-3">Toevoegen</button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeWine(wine)} className="w-7 h-7 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center transition-colors">−</button>
                                <span className="font-serif text-base w-4 text-center">{qty}</span>
                                <button onClick={() => addWine(wine)} className="w-7 h-7 bg-wine hover:bg-wine-light text-cream flex items-center justify-center transition-colors">+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
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
                  wines={wines}
                  wineCart={wineCart}
                  onAddWine={addWine}
                  onRemoveWine={removeWine}
                  wijnEnabled={!!settings?.wijnEnabled}
                />
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer — extra padding on mobile for floating cart bar */}
      <footer className="border-t border-parchment mt-16 py-8 lg:pb-8 pb-20" />

      {/* Floating cart button — mobile, fixed bottom */}
      {!showRegistration && slots.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
          <div className={`flex items-stretch bg-cream transition-colors ${cartCount > 0 ? 'border-t-2 border-wine' : 'border-t border-parchment'}`}>
            <button onClick={() => setShowCheckout(true)} disabled={cartCount === 0}
              className={`flex-1 flex items-center justify-between px-6 py-4 font-sans text-sm tracking-widest uppercase transition-colors
                ${cartCount > 0 ? 'text-ink' : 'text-warm-gray cursor-default'}`}>
              <span>Winkelmandje</span>
              {cartCount > 0
                ? <span className="bg-wine text-cream font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center">{cartCount}</span>
                : <span className="font-sans text-xs normal-case text-warm-gray-light">Leeg</span>
              }
            </button>
            {cartCount > 0 && (
              <button onClick={clearCart}
                className="px-5 border-l border-parchment text-warm-gray hover:text-wine transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {showCheckout && cart.length > 0 && (
        <CheckoutModal
          items={cart}
          wineCart={wineCart}
          wines={wines}
          wijnEnabled={!!settings?.wijnEnabled}
          onAddWine={addWine}
          onRemoveWine={removeWine}
          slots={slots}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
          onAdd={addToCart}
          onRemove={removeFromCart}
          currency={config.currency}
          settings={settings}
        />
      )}
    </div>
  )
}
