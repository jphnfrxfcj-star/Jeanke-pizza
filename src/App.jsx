import { useState, useMemo, useEffect } from 'react'
import { Trash2, Wine, MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react'
import PizzaCard from './components/PizzaCard'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Admin from './components/Admin'
import Cancel from './components/Cancel'
import PaperTexture from './components/PaperTexture'
import SectionLabel from './components/SectionLabel'
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
      .then(data => setPizzas(Array.isArray(data) && data.length ? data : staticPizzas))
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
      .catch(() => setRegistration({ registrationOpen: false }))
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
  const loading = openingDays === null || registration === null

  return (
    <div className="min-h-screen bg-cream text-ink relative overflow-x-hidden">

      {/* ═══════ TopNav ═══════ */}
      {/* PLACEHOLDER: TopNav */}

      {/* ═══════ AnnouncementBar (ticker) ═══════ */}
      {/* PLACEHOLDER: AnnouncementBar */}

      {/* ═══════ Hero ═══════ */}
      {/* PLACEHOLDER: Hero */}

      {/* ═══════ Main content ═══════ */}
      <main className="relative">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin motion-reduce:animate-none" />
          </div>
        ) : showRegistration ? (
          <RegistrationView
            registration={registration}
            pizzas={pizzas}
            regName={regName} setRegName={setRegName}
            regEmail={regEmail} setRegEmail={setRegEmail}
            regPizzas={regPizzas} setRegPizzas={setRegPizzas}
            regStatus={regStatus}
            onRegister={handleRegister}
            currency={config.currency}
          />
        ) : successOrder ? (
          <SuccessView order={successOrder} onReset={() => setSuccessOrder(null)} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Menu column */}
            <div className="lg:col-span-2 space-y-14">
              {/* PLACEHOLDER: Suggestions */}
              {/* PLACEHOLDER: Menu */}
              {/* PLACEHOLDER: WineRow */}
            </div>

            {/* Cart column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
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

      {/* ═══════ Story (Il Racconto) ═══════ */}
      {/* PLACEHOLDER: Story */}

      {/* ═══════ Footer ═══════ */}
      {/* PLACEHOLDER: Footer */}

      {/* ═══════ MobileCartBar ═══════ */}
      {/* PLACEHOLDER: MobileCartBar */}

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

/* ───────────────────────── Sub-views ───────────────────────── */

function RegistrationView({ registration, pizzas, regName, setRegName, regEmail, setRegEmail, regPizzas, setRegPizzas, regStatus, onRegister, currency }) {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-10 py-14">
      <SectionLabel n="01" title="Interesse lijst" />
      {registration?.registrationDate && (
        <p className="font-serif italic text-center text-warm-gray mt-6 mb-8">
          Registreer voor{' '}
          <strong className="text-ink not-italic">
            {new Date(registration.registrationDate + 'T12:00:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </strong>
        </p>
      )}

      <div className="bg-white border border-parchment mb-8">
        <div className="px-6 py-5 border-b border-dashed border-parchment text-center">
          <p className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-1">Gereserveerde pizza's</p>
          <p className="font-serif text-4xl text-ink mb-1">
            {registration.count}<span className="text-warm-gray text-2xl">/{registration.max}</span>
          </p>
          <div className="mt-4 h-2 bg-parchment rounded-full overflow-hidden relative">
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
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-2">Naam</label>
                <input type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                  placeholder="Uw naam"
                  className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-2">E-mail</label>
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  placeholder="uw@email.be"
                  className="w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="block font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-2">Aantal pizza's</label>
                <div className="flex border border-parchment">
                  <button type="button" onClick={() => setRegPizzas(p => Math.max(1, p - 1))}
                    className="px-4 py-3 text-ink hover:bg-parchment transition-colors text-lg leading-none">−</button>
                  <span className="flex-1 flex items-center justify-center font-serif text-lg text-ink border-x border-parchment">{regPizzas}</span>
                  <button type="button" onClick={() => setRegPizzas(p => Math.min(10, p + 1))}
                    className="px-4 py-3 text-ink hover:bg-parchment transition-colors text-lg leading-none">+</button>
                </div>
              </div>
              {regStatus === 'duplicate' && <p className="font-sans text-xs text-wine italic">Dit e-mailadres is al ingeschreven.</p>}
              {regStatus === 'error' && <p className="font-sans text-xs text-wine italic">Er ging iets mis. Probeer opnieuw.</p>}
              <button type="submit" disabled={regStatus === 'loading'} className="btn-primary w-full">
                {regStatus === 'loading' ? 'Even geduld...' : 'Inschrijven'}
              </button>
            </form>
          )}
        </div>
      </div>

      <SectionLabel n="02" title="Il Menù" caption="Een voorproefje van ons aanbod" />
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pizzas.length === 0
          ? [1,2,3,4].map(i => <div key={i} className="h-64 bg-parchment animate-pulse" />)
          : pizzas.map(pizza => (
              <PizzaCard key={pizza.id} pizza={pizza} quantity={0} onAdd={() => {}} onRemove={() => {}} currency={currency} showOrder={false} />
            ))}
      </div>
    </div>
  )
}

function SuccessView({ order, onReset }) {
  return (
    <div className="max-w-md mx-auto text-center px-4 py-24">
      <div className="text-5xl mb-5">🎉</div>
      <SectionLabel n="✓" title="Grazie mille" />
      <h2 className="font-serif text-3xl italic mt-5 mb-3">Bestelling geplaatst!</h2>
      <p className="font-sans text-warm-gray text-sm mb-1">
        Bedankt, <strong className="text-ink">{order.name}</strong>.
      </p>
      <p className="font-sans text-warm-gray text-sm mb-1">
        Uw pizza's zijn klaar om{' '}
        <strong className="text-ink">
          {order.timeslots?.length > 1 ? order.timeslots[order.timeslots.length - 1] : order.timeslot}
        </strong>.
      </p>
      <p className="font-sans text-warm-gray-light text-xs mt-3 mb-1">
        Bevestiging verstuurd naar {order.email}
      </p>
      <p className="font-sans text-warm-gray-light text-xs mb-8">
        Niet ontvangen? Controleer uw spam-map.
      </p>
      <button onClick={onReset} className="btn-primary">Nieuwe bestelling</button>
    </div>
  )
}
