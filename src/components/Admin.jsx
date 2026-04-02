import { useState, useEffect } from 'react'
import config from '../data/config.json'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('orders')

  function handleLogin(e) {
    e.preventDefault()
    if (password === config.adminPassword) {
      setAuthed(true)
      sessionStorage.setItem('adminPw', password)
    } else {
      alert('Verkeerd wachtwoord')
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('adminPw')
    if (saved === config.adminPassword) setAuthed(true)
  }, [])

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🍕</div>
            <h1 className="text-xl font-bold text-pizza-brown">Beheer</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">Inloggen</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-pizza-red text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <h1 className="text-xl font-bold">{config.storeName} — Beheer</h1>
          </div>
          <a href="/" className="text-red-200 hover:text-white text-sm">← Terug naar shop</a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {['orders', 'pizzas'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t ? 'bg-pizza-red text-white' : 'bg-white text-pizza-brown border border-gray-200 hover:border-pizza-red'
              }`}
            >
              {t === 'orders' ? '📋 Bestellingen' : '🍕 Pizza\'s'}
            </button>
          ))}
        </div>

        {tab === 'orders' && <OrdersTab password={password || config.adminPassword} />}
        {tab === 'pizzas' && <PizzasTab password={password || config.adminPassword} />}
      </div>
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
      .then(data => { setOrders(data); setLoading(false) })
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
  const todayOrders = orders.filter(o => o.date === today).sort((a, b) => a.time.localeCompare(b.time))
  const futureOrders = orders.filter(o => o.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  if (loading) return <p className="text-gray-400 text-sm">Laden...</p>

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-gray-400">Nog geen bestellingen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {todayOrders.length > 0 && (
        <section>
          <h2 className="font-bold text-pizza-brown mb-3">Vandaag</h2>
          <OrderList orders={todayOrders} onCancel={cancelOrder} />
        </section>
      )}
      {futureOrders.length > 0 && (
        <section>
          <h2 className="font-bold text-pizza-brown mb-3">Komende dagen</h2>
          <OrderList orders={futureOrders} onCancel={cancelOrder} />
        </section>
      )}
    </div>
  )
}

function OrderList({ orders, onCancel }) {
  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.key} className="bg-white rounded-xl p-4 shadow-sm flex gap-4 items-start">
          <div className="bg-pizza-red text-white rounded-lg px-3 py-2 text-center shrink-0 min-w-[60px]">
            <div className="font-bold text-lg leading-tight">{order.time}</div>
            <div className="text-xs text-red-200">{formatShortDate(order.date)}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-pizza-brown">{order.name}</p>
            <p className="text-sm text-gray-500">{order.email}</p>
            <p className="text-sm text-gray-600 mt-1">{order.order}</p>
            <p className="text-sm font-bold text-pizza-red mt-1">{order.total}</p>
          </div>
          <button
            onClick={() => onCancel(order.key)}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
            title="Annuleren"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

function PizzasTab({ password }) {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // pizza id or 'new'
  const [form, setForm] = useState({ name: '', description: '', price: '', emoji: '🍕' })

  useEffect(() => {
    fetch('/api/pizzas')
      .then(r => r.json())
      .then(data => { setPizzas(data); setLoading(false) })
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

  if (loading) return <p className="text-gray-400 text-sm">Laden...</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pizzas.map(pizza => (
          <div key={pizza.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-3xl">{pizza.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-pizza-brown">{pizza.name}</p>
              <p className="text-xs text-gray-400 truncate">{pizza.description}</p>
              <p className="text-sm font-bold text-pizza-red">€{pizza.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(pizza)} className="text-gray-400 hover:text-pizza-brown transition-colors">✏️</button>
              <button onClick={() => deletePizza(pizza.id)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={startNew} className="btn-primary">+ Pizza toevoegen</button>

      {editing !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-pizza-brown text-lg mb-4">
              {editing === 'new' ? 'Nieuwe pizza' : 'Pizza bewerken'}
            </h3>
            <form onSubmit={saveEdit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  placeholder="Emoji"
                  className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-center text-xl focus:outline-none focus:ring-2 focus:ring-pizza-red"
                />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Naam"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
                />
              </div>
              <input
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ingrediënten"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
              <input
                required
                type="number"
                step="0.50"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Prijs (€)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">Opslaan</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
}
