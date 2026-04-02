import { useState, useMemo, useEffect } from 'react'
import PizzaCard from './components/PizzaCard'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Admin from './components/Admin'
import config from './data/config.json'
import staticPizzas from './data/pizzas.json'

function generateSlots(config) {
  const slots = []
  const now = new Date()
  for (let dayOffset = 0; dayOffset <= config.daysAhead; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const dateStr = date.toISOString().split('T')[0]
    const start = new Date(date); start.setHours(config.openingHour, 0, 0, 0)
    const end   = new Date(date); end.setHours(config.closingHour, 0, 0, 0)
    const cursor = new Date(start)
    while (cursor < end) {
      if (dayOffset === 0) {
        if (cursor > new Date(now.getTime() + 15 * 60 * 1000))
          slots.push({ date: dateStr, time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) })
      } else {
        slots.push({ date: dateStr, time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) })
      }
      cursor.setMinutes(cursor.getMinutes() + config.slotIntervalMinutes)
    }
  }
  return slots
}

export default function App() {
  if (window.location.pathname === '/beheer') return <Admin />
  return <Shop />
}

function Shop() {
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [pizzas, setPizzas] = useState([])
  const slots = useMemo(() => generateSlots(config), [])

  useEffect(() => {
    fetch('/api/pizzas')
      .then(r => r.json())
      .then(data => setPizzas(data.length ? data : staticPizzas))
      .catch(() => setPizzas(staticPizzas))
  }, [])

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

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <header className="bg-olive text-cream">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center relative">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">
            Handgemaakt · Artisanaal · Vers uit de oven
          </p>
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

          {/* Mobile cart button */}
          {cartCount > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="lg:hidden absolute right-6 top-1/2 -translate-y-1/2 bg-wine text-cream px-4 py-2 font-sans text-xs tracking-widest uppercase flex items-center gap-2"
            >
              🛒 {cartCount}
            </button>
          )}
        </div>

        {/* Nav strip */}
        <div className="border-t border-cream/10">
          <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
            <span className="font-sans text-xs text-cream/40 tracking-wide">
              Ophaaluren {config.openingHour}:00 – {config.closingHour}:00
            </span>
            <span className="font-sans text-xs text-cream/40 tracking-wide">
              Elke {config.slotIntervalMinutes} min een slot
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {successOrder ? (
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
            <p className="font-sans text-warm-gray-light text-xs mt-3 mb-8">
              Bevestiging verstuurd naar {successOrder.email}
            </p>
            <button onClick={() => setSuccessOrder(null)} className="btn-primary">
              Nieuwe bestelling
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Menu */}
            <div className="lg:col-span-2">
              <div className="divider mb-7">Il Menù</div>
              {pizzas.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-64 bg-parchment animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                />
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-parchment mt-16 py-8 text-center">
        <p className="font-serif italic text-warm-gray-light text-sm">
          Con amore — Jeanke's Pizza
        </p>
      </footer>

      {showCheckout && (
        <CheckoutModal
          items={cart}
          slots={slots}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
          currency={config.currency}
        />
      )}
    </div>
  )
}
