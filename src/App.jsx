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

    const start = new Date(date)
    start.setHours(config.openingHour, 0, 0, 0)
    const end = new Date(date)
    end.setHours(config.closingHour, 0, 0, 0)

    const cursor = new Date(start)
    while (cursor < end) {
      if (dayOffset === 0) {
        const cutoff = new Date(now.getTime() + 15 * 60 * 1000)
        if (cursor > cutoff) {
          slots.push({
            date: dateStr,
            time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
          })
        }
      } else {
        slots.push({
          date: dateStr,
          time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
        })
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
      const existing = prev.find(i => i.pizza.id === pizza.id)
      if (existing) return prev.map(i => i.pizza.id === pizza.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { pizza, quantity: 1 }]
    })
  }

  function removeFromCart(pizza) {
    setCart(prev => {
      const existing = prev.find(i => i.pizza.id === pizza.id)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter(i => i.pizza.id !== pizza.id)
      return prev.map(i => i.pizza.id === pizza.id ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  function getQuantity(pizzaId) {
    return cart.find(i => i.pizza.id === pizzaId)?.quantity ?? 0
  }

  function handleSuccess(order) {
    setSuccessOrder(order)
    setShowCheckout(false)
    setCart([])
  }

  return (
    <div className="min-h-screen">
      <header className="bg-pizza-red text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍕</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{config.storeName}</h1>
              <p className="text-red-200 text-sm">Vers uit de oven, voor jou besteld</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="md:hidden bg-white text-pizza-red font-bold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              🛒 <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {successOrder ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-pizza-brown mb-2">Bestelling geplaatst!</h2>
            <p className="text-gray-600 mb-1">Bedankt, <strong>{successOrder.name}</strong>!</p>
            <p className="text-gray-600 mb-1">Jouw pizza's zijn klaar om <strong>{successOrder.timeslot}</strong>.</p>
            <p className="text-gray-500 text-sm mb-6">Een bevestiging is verstuurd naar <strong>{successOrder.email}</strong>.</p>
            <button onClick={() => setSuccessOrder(null)} className="btn-primary">Nieuwe bestelling</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-pizza-brown mb-4">Onze pizza's</h2>
              {pizzas.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="card h-64 animate-pulse bg-gray-100" />
                  ))}
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
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Cart
                  items={cart}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onCheckout={() => setShowCheckout(true)}
                  currency={config.currency}
                />
                <p className="text-xs text-gray-400 text-center mt-3">
                  Ophaaluren: {config.openingHour}:00 – {config.closingHour}:00
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

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

