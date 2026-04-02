import { useState, useEffect } from 'react'
import config from '../data/config.json'

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('adminPw') === config.adminPassword
  )
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('orders')

  function handleLogin(e) {
    e.preventDefault()
    if (password === config.adminPassword) {
      sessionStorage.setItem('adminPw', password)
      setAuthed(true)
    } else {
      alert('Verkeerd wachtwoord')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🍕</div>
            <h1 className="text-xl font-bold text-pizza-brown">Beheer</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pizza-red"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full py-3 text-base">
              Inloggen
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-pizza-red text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg leading-tight">{config.storeName}</h1>
            <p className="text-red-200 text-xs">Beheer</p>
          </div>
          <a href="/" className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
            ← Shop
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {tab === 'orders' && <OrdersTab password={config.adminPassword} />}
        {tab === 'pizzas' && <PizzasTab password={config.adminPassword} />}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-pb z-10">
        <div className="max-w-2xl mx-auto flex">
          {[
            { key: 'orders', label: 'Bestellingen', icon: '📋' },
            { key: 'pizzas', label: "Pizza's", icon: '🍕' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                tab === t.key ? 'text-pizza-red' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function OrdersTab({ password }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch('/api/orders', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function cancelOrder(key) {
    if (!confirm('Bestelling annuleren?')) return
    await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ key }),
    })
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = [...orders]
    .filter(o => o.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const past = [...orders]
    .filter(o => o.date < today)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))

  if (loading) return <LoadingCards />

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-gray-400 font-medium">Nog geen bestellingen</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Aankomend ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map(order => (
              <OrderCard key={order.key} order={order} onCancel={cancelOrder} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Voorbij
          </h2>
          <div className="space-y-3 opacity-60">
            {past.map(order => (
              <OrderCard key={order.key} order={order} onCancel={cancelOrder} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function OrderCard({ order, onCancel }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-pizza-red text-white rounded-xl px-3 py-2 text-center shrink-0 min-w-[64px]">
          <div className="font-bold text-lg leading-none">{order.time}</div>
          <div className="text-xs text-red-200 mt-0.5">{formatShortDate(order.date)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-pizza-brown text-base">{order.name}</p>
              <p className="text-sm text-gray-400">{order.email}</p>
            </div>
            <button
              onClick={() => onCancel(order.key)}
              className="text-gray-200 hover:text-red-400 transition-colors p-1 shrink-0"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{order.order}</p>
          <p className="text-base font-bold text-pizza-red mt-1">{order.total}</p>
        </div>
      </div>
    </div>
  )
}

function PizzasTab({ password }) {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', emoji: '🍕' })

  useEffect(() => {
    fetch('/api/pizzas')
      .then(r => r.json())
      .then(data => { setPizzas(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function save(updatedList) {
    await fetch('/api/pizzas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(updatedList),
    })
    setPizzas(updatedList)
  }

  function startEdit(pizza) {
    setEditing(pizza.id)
    setForm({ name: pizza.name, description: pizza.description, price: String(pizza.price), emoji: pizza.emoji })
  }

  function startNew() {
    setEditing('new')
    setForm({ name: '', description: '', price: '', emoji: '🍕' })
  }

  async function saveEdit(e) {
    e.preventDefault()
    const updated = { ...form, price: parseFloat(form.price) }
    let newList
    if (editing === 'new') {
      const maxId = pizzas.reduce((m, p) => Math.max(m, p.id), 0)
      newList = [...pizzas, { id: maxId + 1, ...updated }]
    } else {
      newList = pizzas.map(p => p.id === editing ? { ...p, ...updated } : p)
    }
    await save(newList)
    setEditing(null)
  }

  async function deletePizza(id) {
    if (!confirm('Pizza verwijderen?')) return
    await save(pizzas.filter(p => p.id !== id))
  }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-3">
      {pizzas.map(pizza => (
        <div key={pizza.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <span className="text-4xl shrink-0">{pizza.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-pizza-brown">{pizza.name}</p>
            <p className="text-sm text-gray-400 truncate">{pizza.description}</p>
            <p className="text-sm font-bold text-pizza-red">€{pizza.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => startEdit(pizza)}
              className="bg-gray-100 hover:bg-gray-200 text-pizza-brown rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Bewerk
            </button>
            <button
              onClick={() => deletePizza(pizza.id)}
              className="bg-red-50 hover:bg-red-100 text-red-400 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Verwijder
            </button>
          </div>
        </div>
      ))}

      <button onClick={startNew} className="btn-primary w-full py-3 text-base">
        + Pizza toevoegen
      </button>

      {/* Edit sheet */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6">
            <h3 className="font-bold text-pizza-brown text-lg mb-5">
              {editing === 'new' ? '+ Nieuwe pizza' : 'Pizza bewerken'}
            </h3>
            <form onSubmit={saveEdit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  placeholder="🍕"
                  className="w-16 border border-gray-200 rounded-xl px-2 py-3 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-pizza-red"
                />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Naam"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pizza-red"
                />
              </div>
              <input
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ingrediënten"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
              <input
                required
                type="number"
                step="0.50"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Prijs (€)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1 py-3 text-base">Opslaan</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1 py-3 text-base">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingCards() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
      ))}
    </div>
  )
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
}
