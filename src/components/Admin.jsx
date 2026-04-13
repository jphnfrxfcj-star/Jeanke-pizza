import { useState, useEffect } from 'react'
import { Clock, ClipboardList, ShoppingBasket, ChefHat, TrendingUp, Settings, Menu } from 'lucide-react'
import config from '../data/config.json'
import staticPizzas from '../data/pizzas.json'

const INPUT = "w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors"

const ALLERGENS = [
  { key: 'gluten',       label: 'Gluten' },
  { key: 'melk',         label: 'Melk' },
  { key: 'eieren',       label: 'Eieren' },
  { key: 'vis',          label: 'Vis' },
  { key: 'schaaldieren', label: 'Schaaldieren' },
  { key: 'soja',         label: 'Soja' },
  { key: 'noten',        label: 'Noten' },
  { key: 'pinda',        label: 'Pinda' },
  { key: 'sesam',        label: 'Sesam' },
  { key: 'selderij',     label: 'Selderij' },
  { key: 'mosterd',      label: 'Mosterd' },
  { key: 'sulfiet',      label: 'Sulfieten' },
  { key: 'lupine',       label: 'Lupine' },
  { key: 'weekdieren',   label: 'Weekdieren' },
]

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminPw') === config.adminPassword)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('orders')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (password === config.adminPassword) { sessionStorage.setItem('adminPw', password); setAuthed(true) }
    else alert('Verkeerd wachtwoord')
  }

  if (!authed) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white border border-parchment p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">Jeanke's Pizza</p>
          <h1 className="font-serif text-2xl italic text-ink">Beheer</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Wachtwoord" className={INPUT} autoFocus />
          <button type="submit" className="btn-primary w-full">Inloggen</button>
        </form>
      </div>
    </div>
  )

  const pw = config.adminPassword

  const tabs = [
    { key: 'dag',          label: 'Dag',           Icon: Clock },
    { key: 'orders',       label: 'Bestellingen',  Icon: ClipboardList },
    { key: 'boodschappen', label: 'Boodschappen',  Icon: ShoppingBasket },
    { key: 'pizzas',       label: "Pizza's",       Icon: ChefHat },
    { key: 'winst',        label: 'Winst',         Icon: TrendingUp },
    { key: 'opening',      label: 'Instellingen',  Icon: Settings },
  ]

  function navigate(key) { setTab(key); setMenuOpen(false) }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-parchment sticky top-0 h-screen">
        <div className="bg-olive px-5 py-6">
          <p className="font-sans text-xs text-cream/50 tracking-widest uppercase">Beheer</p>
          <h1 className="font-serif text-xl italic text-cream mt-0.5">{config.storeName}</h1>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-sans transition-colors text-left cursor-pointer ${tab === t.key ? 'text-olive bg-olive/5 border-l-2 border-olive' : 'text-ink hover:bg-parchment/50 border-l-2 border-transparent'}`}>
              <t.Icon size={16} className="shrink-0" />{t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-parchment px-5 py-4">
          <a href="/" className="font-sans text-sm text-warm-gray hover:text-ink transition-colors">← Terug naar shop</a>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden bg-olive text-cream sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} className="p-1 -ml-1 cursor-pointer">
              <Menu size={20} className="text-cream/80" />
            </button>
            <div className="text-center">
              <h1 className="font-serif text-lg italic leading-none">{config.storeName}</h1>
              <p className="font-sans text-[10px] text-cream/50 tracking-widest uppercase mt-0.5">{tabs.find(t => t.key === tab)?.label}</p>
            </div>
            <a href="/" className="font-sans text-xs text-cream/60 hover:text-cream tracking-widest uppercase transition-colors">← Shop</a>
          </div>
        </header>

        {/* Desktop page title bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-parchment bg-white">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Beheer</p>
            <h2 className="font-serif text-2xl italic text-ink mt-0.5">{tabs.find(t => t.key === tab)?.label}</h2>
          </div>
          <a href="/" className="font-sans text-xs text-warm-gray hover:text-ink tracking-widest uppercase transition-colors">← Terug naar shop</a>
        </div>

        {/* Mobile drawer overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
            <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col shadow-xl">
              <div className="bg-olive px-5 py-5">
                <p className="font-sans text-xs text-cream/50 tracking-widest uppercase">Beheer</p>
                <h2 className="font-serif text-xl italic text-cream mt-0.5">{config.storeName}</h2>
              </div>
              <nav className="flex-1 py-2">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => navigate(t.key)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-sans transition-colors text-left cursor-pointer ${tab === t.key ? 'text-olive bg-olive/5 border-l-2 border-olive' : 'text-ink hover:bg-parchment/50 border-l-2 border-transparent'}`}>
                    <t.Icon size={17} className="shrink-0" />{t.label}
                  </button>
                ))}
              </nav>
              <div className="border-t border-parchment px-5 py-4">
                <a href="/" className="font-sans text-sm text-warm-gray hover:text-ink transition-colors">← Terug naar shop</a>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 lg:px-8 py-6 pb-10 max-w-3xl w-full overflow-hidden">
          {tab === 'dag'          && <DagTab          password={pw} />}
          {tab === 'orders'       && <OrdersTab       password={pw} />}
          {tab === 'boodschappen' && <BoodschappenTab password={pw} />}
          {tab === 'pizzas'       && <PizzasTab       password={pw} />}
          {tab === 'opening'      && <OpeningTab      password={pw} />}
          {tab === 'winst'        && <WinstTab        password={pw} />}
        </div>

      </div>
    </div>
  )
}

// ─── Dag ───────────────────────────────────────────────────────────────────

function DagTab({ password }) {
  const [orders, setOrders] = useState([])
  const [pizzas, setPizzas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState({}) // "key_pizzaName_idx" → bool

  useEffect(() => {
    Promise.all([
      fetch('/api/orders', { headers: { 'x-admin-password': password } }).then(r => r.json()),
      fetch('/api/pizzas').then(r => r.json()),
    ]).then(([ord, piz]) => {
      setOrders(Array.isArray(ord) ? ord : [])
      setPizzas(Array.isArray(piz) ? piz : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = [...orders]
    .filter(o => o.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  // Parse order string into list of { name, qty } items
  function parseItems(orderStr) {
    const items = []
    if (!orderStr) return items
    orderStr.split(', ').forEach(part => {
      const m = part.match(/^(\d+)x (.+) \([€$£]/)
      if (!m) return
      const qty = parseInt(m[1], 10)
      const name = m[2].trim()
      for (let i = 0; i < qty; i++) items.push({ name, idx: i })
    })
    return items
  }

  function toggleCheck(key, name, idx) {
    const id = `${key}__${name}__${idx}`
    setChecked(c => ({ ...c, [id]: !c[id] }))
  }
  function isChecked(key, name, idx) { return !!checked[`${key}__${name}__${idx}`] }

  // Group orders by timeslot
  const byTime = todayOrders.reduce((acc, o) => {
    const t = o.time; if (!acc[t]) acc[t] = []; acc[t].push(o); return acc
  }, {})

  if (loading) return <LoadingCards />

  if (!todayOrders.length) return (
    <div className="text-center py-16">
      <p className="font-sans text-sm text-warm-gray">Geen bestellingen voor vandaag.</p>
      <p className="font-sans text-xs text-warm-gray-light mt-1">{formatLongDate(today)}</p>
    </div>
  )

  // Overall progress
  const allItems = todayOrders.flatMap(o => parseItems(o.order).map((it, i) => ({ key: o.key, ...it })))
  const doneCount = allItems.filter(it => isChecked(it.key, it.name, it.idx)).length

  return (
    <div className="space-y-1">
      {/* Progress bar */}
      <div className="bg-white border border-parchment p-4 mb-4">
        <div className="flex justify-between text-xs font-sans text-warm-gray mb-2">
          <span>{formatLongDate(today)}</span>
          <span>{doneCount} / {allItems.length} klaar</span>
        </div>
        <div className="w-full bg-parchment h-1.5">
          <div className="bg-olive h-1.5 transition-all duration-300"
            style={{ width: `${allItems.length ? (doneCount / allItems.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Timeline per timeslot */}
      {Object.entries(byTime).map(([time, slotOrders]) => {
        const slotItems = slotOrders.flatMap(o => parseItems(o.order).map(it => ({ key: o.key, ...it })))
        const slotDone = slotItems.filter(it => isChecked(it.key, it.name, it.idx)).length
        const allDone = slotDone === slotItems.length

        return (
          <div key={time} className={`bg-white border transition-colors ${allDone ? 'border-olive/40 opacity-60' : 'border-parchment'}`}>
            {/* Slot header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${allDone ? 'border-olive/20 bg-olive/5' : 'border-parchment'}`}>
              <div className="flex items-center gap-3">
                <span className={`font-serif text-xl ${allDone ? 'text-olive' : 'text-ink'}`}>{time}</span>
                <span className="font-sans text-xs text-warm-gray">{slotOrders.length} best. · {slotItems.length} pizza's</span>
              </div>
              {allDone && <span className="font-sans text-xs text-olive tracking-wide uppercase">Klaar</span>}
            </div>

            {/* Orders in this slot */}
            {slotOrders.map(order => {
              const items = parseItems(order.order)
              const orderDone = items.every(it => isChecked(order.key, it.name, it.idx))
              return (
                <div key={order.key} className={`border-b border-parchment last:border-0 ${orderDone ? 'bg-parchment/20' : ''}`}>
                  <div className="px-4 pt-3 pb-1">
                    <p className={`font-serif text-base ${orderDone ? 'text-warm-gray line-through' : 'text-ink'}`}>{order.name}</p>
                  </div>
                  <div className="px-4 pb-3 space-y-1">
                    {items.map((it, i) => {
                      const done = isChecked(order.key, it.name, it.idx)
                      return (
                        <button key={i} onClick={() => toggleCheck(order.key, it.name, it.idx)}
                          className="w-full flex items-center gap-3 py-1.5 text-left">
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-olive border-olive' : 'border-warm-gray-light'}`}>
                            {done && <span className="text-cream text-[10px] leading-none">✓</span>}
                          </span>
                          <span className={`font-sans text-sm transition-colors ${done ? 'line-through text-warm-gray-light' : 'text-ink'}`}>{it.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {doneCount === allItems.length && allItems.length > 0 && (
        <div className="text-center py-6">
          <p className="font-serif text-xl italic text-olive">Alle pizza's klaar!</p>
        </div>
      )}
    </div>
  )
}

// ─── Orders ────────────────────────────────────────────────────────────────

function OrdersTab({ password }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', order: '', total: '' })
  const [pastOpen, setPastOpen] = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/orders', { headers: { 'x-admin-password': password } })
      .then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function startEdit(order) {
    setEditing(order)
    setEditForm({ name: order.name, email: order.email, order: order.order, total: order.total })
  }

  async function saveEdit(e) {
    e.preventDefault()
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ key: editing.key, ...editForm }),
    })
    setEditing(null)
    load()
  }

  async function cancelOrder(key) {
    if (!confirm('Bestelling annuleren?')) return
    await fetch('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ key }) })
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = [...orders].filter(o => o.date >= today).sort((a,b) => a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
  const past     = [...orders].filter(o => o.date <  today).sort((a,b) => b.date.localeCompare(a.date)||b.time.localeCompare(a.time))

  if (loading) return <LoadingCards />
  if (!orders.length) return <Empty icon="📭" text="Nog geen bestellingen" />

  // Group upcoming by date
  const upcomingByDate = upcoming.reduce((acc, o) => {
    if (!acc[o.date]) acc[o.date] = []
    acc[o.date].push(o)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && <section className="space-y-5">
        {Object.entries(upcomingByDate).map(([date, dayOrders]) => (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>{formatLongDate(date)}</SectionLabel>
              <span className="font-sans text-xs text-warm-gray mb-3">{dayOrders.length} best.</span>
            </div>
            <div className="space-y-3">{dayOrders.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} onEdit={startEdit} />)}</div>
          </div>
        ))}
      </section>}
      {past.length > 0 && (
        <section>
          <button onClick={() => setPastOpen(v => !v)}
            className="w-full flex items-center justify-between mb-3 group">
            <span className="font-sans text-xs tracking-widest uppercase text-warm-gray">Voorbij ({past.length})</span>
            <span className="font-sans text-xs text-warm-gray-light group-hover:text-warm-gray transition-colors">{pastOpen ? '▲ Inklappen' : '▼ Uitklappen'}</span>
          </button>
          {pastOpen && (
            <div className="space-y-3 opacity-60">
              {past.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} onEdit={startEdit} />)}
            </div>
          )}
        </section>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50">
          <div className="bg-cream w-full sm:max-w-sm max-h-[92vh] overflow-y-auto">
            <div className="bg-olive px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif italic text-cream text-lg">Bestelling wijzigen</h3>
                <p className="font-sans text-xs text-cream/60 mt-0.5">{editing.time} · {formatShortDate(editing.date)}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-cream/50 hover:text-cream text-2xl leading-none">×</button>
            </div>
            <form onSubmit={saveEdit} className="p-5 space-y-3">
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Naam</label>
                <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">E-mail</label>
                <input type="email" required value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Bestelling</label>
                <textarea required rows={3} value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))}
                  className={INPUT + ' resize-none'} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Totaal</label>
                <input required value={editForm.total} onChange={e => setEditForm(f => ({ ...f, total: e.target.value }))} className={INPUT} />
              </div>
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

// ─── Boodschappen ──────────────────────────────────────────────────────────

function parsePizzaCounts(orderStr) {
  const counts = {}
  if (!orderStr) return counts
  orderStr.split(', ').forEach(item => {
    const m = item.match(/^(\d+)x (.+) \([€$£]/)
    if (!m) return
    const qty = parseInt(m[1], 10)
    const name = m[2].trim()
    counts[name] = (counts[name] || 0) + qty
  })
  return counts
}

function normName(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim() }

function BoodschappenTab({ password }) {
  const [orders, setOrders] = useState([])
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/orders', { headers: { 'x-admin-password': password } }).then(r => r.json()),
      fetch('/api/pizzas').then(r => r.json()),
    ]).then(([ord, piz]) => {
      setOrders(Array.isArray(ord) ? ord : [])
      setPizzas(Array.isArray(piz) ? piz : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = orders.filter(o => o.date >= today)
  const upcomingDates = [...new Set(upcoming.map(o => o.date))].sort()

  const pizzaIngMap = Object.fromEntries(
    pizzas.map(p => [normName(p.name), Array.isArray(p.ingredients) ? p.ingredients : []])
  )

  function ingredientsForDate(date) {
    const totals = {}
    const unmatched = new Set()
    upcoming.filter(o => o.date === date).forEach(o => {
      Object.entries(parsePizzaCounts(o.order)).forEach(([pizzaName, qty]) => {
        const key = normName(pizzaName)
        const ings = pizzaIngMap[key]
        if (!ings) { unmatched.add(pizzaName); return }
        ings.forEach(ing => { totals[ing] = (totals[ing] || 0) + qty })
      })
    })
    return { items: Object.entries(totals).sort((a, b) => b[1] - a[1]), unmatched: [...unmatched] }
  }

  function pizzasForDate(date) {
    const totals = {}
    upcoming.filter(o => o.date === date).forEach(o => {
      Object.entries(parsePizzaCounts(o.order)).forEach(([name, qty]) => {
        totals[name] = (totals[name] || 0) + qty
      })
    })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }

  if (loading) return <LoadingCards />
  if (!upcomingDates.length) return <Empty icon="🛒" text="Geen aankomende bestellingen" />

  return <ShoppingList dates={upcomingDates} ingredientsForDate={ingredientsForDate} pizzasForDate={pizzasForDate} />
}

function ShoppingList({ dates, ingredientsForDate, pizzasForDate }) {
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const [showPizzas, setShowPizzas] = useState(false)

  const storageKey = `boodschappen_${selectedDate}`

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} }
  })

  // Reload from localStorage when date changes
  function selectDate(date) {
    setSelectedDate(date)
    setShowPizzas(false)
    try { setChecked(JSON.parse(localStorage.getItem(`boodschappen_${date}`) || '{}')) } catch { setChecked({}) }
  }

  function toggle(name) {
    setChecked(prev => {
      const next = { ...prev, [name]: !prev[name] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function reset() {
    setChecked({})
    try { localStorage.removeItem(storageKey) } catch {}
  }

  const { items: ingredients, unmatched } = ingredientsForDate(selectedDate)
  const pizzas = pizzasForDate(selectedDate)
  const doneCount = Object.values(checked).filter(Boolean).length
  const totalPizzas = pizzas.reduce((s, [, n]) => s + n, 0)

  return (
    <div className="bg-white border border-parchment">
      <div className="px-4 py-3 border-b border-parchment flex items-center justify-between gap-2">
        <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Boodschappenlijst</p>
        <span className="font-sans text-xs text-warm-gray">{doneCount}/{ingredients.length} afgevinkt</span>
      </div>

      {dates.length > 1 && (
        <div className="flex border-b border-parchment overflow-x-auto">
          {dates.map(date => (
            <button key={date} onClick={() => selectDate(date)}
              className={`flex-1 px-3 py-2.5 font-sans text-xs whitespace-nowrap transition-colors ${selectedDate === date ? 'bg-olive text-cream' : 'text-warm-gray hover:bg-parchment/50'}`}>
              {formatShortDate(date)}
            </button>
          ))}
        </div>
      )}

      {ingredients.length === 0 ? (
        <p className="px-4 py-4 font-sans text-sm text-warm-gray italic">Geen ingrediënten gevonden. Controleer of de pizza's ingrediënten hebben ingesteld.</p>
      ) : (
        <div className="divide-y divide-parchment">
          {ingredients.map(([name, qty]) => {
            const done = !!checked[name]
            return (
              <button key={name} onClick={() => toggle(name)}
                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors active:bg-parchment/40 ${done ? 'bg-parchment/30' : ''}`}>
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-olive border-olive' : 'border-warm-gray-light'}`}>
                  {done && <span className="text-cream text-xs leading-none">✓</span>}
                </span>
                <span className={`font-sans text-base flex-1 transition-colors ${done ? 'line-through text-warm-gray-light' : 'text-ink'}`}>{name}</span>
                <span className={`font-serif text-xl shrink-0 transition-colors ${done ? 'text-warm-gray-light' : 'text-olive'}`}>{qty}×</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="px-4 py-3 border-t border-parchment space-y-2">
        {/* Pizza breakdown toggle */}
        <button onClick={() => setShowPizzas(v => !v)}
          className="w-full flex items-center justify-between font-sans text-xs text-warm-gray hover:text-ink transition-colors">
          <span>{totalPizzas} pizza's · {pizzas.length} soorten</span>
          <span>{showPizzas ? '▲' : '▼'}</span>
        </button>
        {showPizzas && (
          <div className="space-y-1 pt-1">
            {pizzas.map(([name, qty]) => (
              <div key={name} className="flex justify-between font-sans text-xs text-warm-gray">
                <span>{name}</span><span>{qty}×</span>
              </div>
            ))}
          </div>
        )}
        {/* Unmatched pizza names — naam in bestelling ≠ naam in database */}
        {unmatched.length > 0 && (
          <div className="pt-1 border-t border-parchment">
            <p className="font-sans text-xs text-wine mb-1">Ingrediënten onbekend voor:</p>
            {unmatched.map(name => (
              <p key={name} className="font-sans text-xs text-warm-gray">· {name}</p>
            ))}
            <p className="font-sans text-[10px] text-warm-gray-light mt-1">Controleer of de naam in de Pizza's-tab exact overeenkomt.</p>
          </div>
        )}
        {doneCount > 0 && (
          <button onClick={reset} className="font-sans text-xs text-wine hover:text-wine-light transition-colors">
            Reset afvinklijst
          </button>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, onCancel, onEdit }) {
  return (
    <div className="bg-white border border-parchment p-4">
      <div className="flex items-start gap-3">
        <div className="bg-olive text-cream px-3 py-2 text-center shrink-0 min-w-[64px]">
          <div className="font-serif text-lg leading-none">{order.time}</div>
          <div className="font-sans text-xs text-cream/60 mt-0.5">{formatShortDate(order.date)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-serif text-base text-ink">{order.name}</p>
              <p className="font-sans text-xs text-warm-gray truncate">{order.email}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => onEdit(order)} className="text-warm-gray-light hover:text-olive transition-colors p-1" title="Wijzigen">✎</button>
              <button onClick={() => onCancel(order.key)} className="text-warm-gray-light hover:text-wine transition-colors p-1" title="Annuleren">✕</button>
            </div>
          </div>
          <p className="font-sans text-sm text-warm-gray mt-2 leading-relaxed break-words">{order.order}</p>
          <p className="font-serif text-base text-wine mt-1">{order.total}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Pizzas ────────────────────────────────────────────────────────────────

function PizzasTab({ password }) {
  const [pizzas, setPizzas] = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', ingredients: [], allergens: [], price: '', emoji: '🍕', imageUrl: '' })
  const [ingInput, setIngInput] = useState('')
  const [newIngInput, setNewIngInput] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/pizzas').then(r => r.json()),
      fetch('/api/ingredients').then(r => r.json()),
    ]).then(async ([d, ings]) => {
      const list = d.length ? d : staticPizzas
      if (!d.length) {
        await fetch('/api/pizzas', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(staticPizzas) })
      }
      setPizzas(list)
      setAllIngredients(Array.isArray(ings) ? ings : [])
      setLoading(false)
    }).catch(() => { setPizzas(staticPizzas); setLoading(false) })
  }, [])

  function saveIngredients(updated) {
    setAllIngredients(updated)
    fetch('/api/ingredients', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(updated) })
  }

  async function save(list) {
    const res = await fetch('/api/pizzas', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(list) })
    if (!res.ok) { const b = await res.json().catch(()=>({})); alert(`Opslaan mislukt (${res.status}): ${b.error||'onbekende fout'}`); return }
    setPizzas(list)
  }

  function startEdit(p) {
    setEditing(p.id)
    const ings = Array.isArray(p.ingredients) ? p.ingredients : (p.description ? p.description.split(', ') : [])
    setForm({ name: p.name, ingredients: ings, allergens: Array.isArray(p.allergens) ? p.allergens : [], price: String(p.price), emoji: p.emoji, imageUrl: p.imageUrl||'' })
    setIngInput('')
  }
  function startNew() { setEditing('new'); setForm({ name:'', ingredients:[], allergens:[], price:'', emoji:'🍕', imageUrl:'' }); setIngInput('') }

  // allIngredients is now { name, cost }[] — form.ingredients stays string[]
  function toggleIngredient(name) {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.includes(name)
        ? f.ingredients.filter(i => i !== name)
        : [...f.ingredients, name]
    }))
  }
  function addCustomIngredient() {
    const val = ingInput.trim().toLowerCase()
    if (!val) return
    if (!allIngredients.some(i => i.name === val)) {
      saveIngredients([...allIngredients, { name: val, cost: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
    }
    if (!form.ingredients.includes(val)) setForm(f => ({ ...f, ingredients: [...f.ingredients, val] }))
    setIngInput('')
  }
  function removeIngredientFromList(name) {
    saveIngredients(allIngredients.filter(i => i.name !== name))
  }
  function addToGlobalList() {
    const val = newIngInput.trim().toLowerCase()
    if (!val || allIngredients.some(i => i.name === val)) return
    saveIngredients([...allIngredients, { name: val, cost: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
    setNewIngInput('')
  }

  async function saveEdit(e) {
    e.preventDefault()
    const updated = { ...form, price: parseFloat(form.price), description: form.ingredients.join(', '), allergens: form.allergens }
    let newList
    if (editing === 'new') { const maxId = pizzas.reduce((m,p) => Math.max(m,p.id), 0); newList = [...pizzas, { id: maxId+1, ...updated }] }
    else newList = pizzas.map(p => p.id===editing ? {...p,...updated} : p)
    await save(newList); setEditing(null)
  }

  async function deletePizza(id) { if (!confirm('Pizza verwijderen?')) return; await save(pizzas.filter(p => p.id!==id)) }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-3">
      {pizzas.map(pizza => (
        <div key={pizza.id} className="bg-white border border-parchment flex items-center gap-3 overflow-hidden">
          {pizza.imageUrl
            ? <img src={pizza.imageUrl} alt={pizza.name} className="w-16 h-16 object-cover shrink-0" />
            : <div className="w-16 h-16 bg-parchment flex items-center justify-center text-3xl shrink-0">{pizza.emoji}</div>
          }
          <div className="flex-1 min-w-0 py-3 pr-0">
            <p className="font-serif text-ink">{pizza.name}</p>
            <p className="font-sans text-xs text-warm-gray truncate">
              {Array.isArray(pizza.ingredients) ? pizza.ingredients.join(', ') : pizza.description}
            </p>
            <p className="font-sans text-xs text-wine mt-0.5">€{pizza.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-1 p-3 shrink-0">
            <button onClick={() => startEdit(pizza)} className="font-sans text-xs text-ink bg-parchment px-3 py-1.5 hover:bg-gold/20 transition-colors">Bewerk</button>
            <button onClick={() => deletePizza(pizza.id)} className="font-sans text-xs text-wine bg-wine/5 px-3 py-1.5 hover:bg-wine/10 transition-colors">Verwijder</button>
          </div>
        </div>
      ))}

      <button onClick={startNew} className="btn-primary w-full">+ Pizza toevoegen</button>

      {/* Globale ingrediëntenlijst beheren */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Ingrediëntenlijst</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-1 mb-3">
            {allIngredients.map(ing => (
              <span key={ing.name} className="bg-parchment text-xs text-ink px-2 py-1 flex items-center gap-1">
                {ing.name}
                <button type="button" onClick={() => removeIngredientFromList(ing.name)} className="text-warm-gray hover:text-wine leading-none">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input value={newIngInput} onChange={e=>setNewIngInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToGlobalList() } }}
              placeholder="Ingrediënt toevoegen..." className={INPUT + ' flex-1 text-xs'} />
            <button type="button" onClick={addToGlobalList} className="px-3 bg-parchment border border-parchment text-ink text-sm hover:border-olive transition-colors">+</button>
          </div>
        </div>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50">
          <div className="bg-cream w-full sm:max-w-sm max-h-[92vh] overflow-y-auto">
            <div className="bg-olive px-5 py-4 flex justify-between items-center">
              <h3 className="font-serif italic text-cream text-lg">{editing==='new' ? 'Nieuwe pizza' : 'Bewerken'}</h3>
              <button onClick={()=>setEditing(null)} className="text-cream/50 hover:text-cream text-2xl">×</button>
            </div>
            <form onSubmit={saveEdit} className="p-5 space-y-3">
              <div className="flex gap-2">
                <input value={form.emoji} onChange={e=>setForm(f=>({...f,emoji:e.target.value}))} placeholder="🍕"
                  className="w-14 border border-parchment bg-white px-2 py-3 text-center text-2xl focus:outline-none focus:border-olive" />
                <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Naam" className={INPUT+" flex-1"} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-2">Ingrediënten</label>
                {/* Selecteerbare chips van de globale lijst */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {allIngredients.map(ing => (
                    <button type="button" key={ing.name} onClick={() => toggleIngredient(ing.name)}
                      className={`text-xs px-2.5 py-1 border transition-colors ${form.ingredients.includes(ing.name) ? 'bg-olive text-cream border-olive' : 'bg-white text-ink border-parchment hover:border-olive'}`}>
                      {ing.name}
                    </button>
                  ))}
                </div>
                {/* Nieuw ingrediënt toevoegen aan de globale lijst */}
                <div className="flex gap-1">
                  <input value={ingInput} onChange={e=>setIngInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomIngredient() } }}
                    placeholder="Nieuw ingrediënt..." className={INPUT + ' flex-1 text-xs'} />
                  <button type="button" onClick={addCustomIngredient} className="px-3 bg-parchment border border-parchment text-ink text-sm hover:border-olive transition-colors">+</button>
                </div>
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-2">Allergenen</label>
                <div className="flex flex-wrap gap-1">
                  {ALLERGENS.map(a => {
                    const active = form.allergens.includes(a.key)
                    return (
                      <button type="button" key={a.key}
                        onClick={() => setForm(f => ({ ...f, allergens: active ? f.allergens.filter(k => k !== a.key) : [...f.allergens, a.key] }))}
                        className={`text-xs px-2.5 py-1 border transition-colors ${active ? 'bg-wine text-cream border-wine' : 'bg-white text-ink border-parchment hover:border-wine/40'}`}>
                        {a.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="Foto URL (optioneel)" className={INPUT} />
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Verkoopprijs</label>
                <input required type="number" step="0.50" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="€" className={INPUT} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">Opslaan</button>
                <button type="button" onClick={()=>setEditing(null)} className="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Opening Days ──────────────────────────────────────────────────────────

function OpeningTab({ password }) {
  const [days, setDays]       = useState([])
  const [regs, setRegs]       = useState({ count: 0, max: 20, openFrom: 16, registrationDate: '', registrationOpen: false })
  const [regList, setRegList] = useState([])
  const [newDate, setNewDate] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [regDate, setRegDate] = useState('')
  const [savingCfg, setSavingCfg] = useState(false)
  const [siteSettings, setSiteSettings] = useState({ openingHour: 17, closingHour: 22, pizzasPerSlot: 3 })
  const [savingSettings, setSavingSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  function load() {
    Promise.all([
      fetch('/api/opening-days').then(r=>r.json()),
      fetch('/api/register').then(r=>r.json()),
      fetch('/api/register/list', { headers: {'x-admin-password': password} }).then(r=>r.json()).catch(()=>[]),
      fetch('/api/settings').then(r=>r.json()),
    ]).then(([d, r, rl, s]) => {
      setDays(d)
      setRegs(r)
      setRegDate(r.registrationDate || '')
      setRegList(Array.isArray(rl) ? rl : [])
      setSiteSettings(s)
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  async function saveSettings(e) {
    e.preventDefault(); setSavingSettings(true)
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(siteSettings) })
    setSavingSettings(false)
  }

  async function saveRegConfig(e) {
    e.preventDefault(); setSavingCfg(true)
    await fetch('/api/register', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ registrationDate: regDate, max: regs.max, openFrom: regs.openFrom, registrationOpen: regs.registrationOpen }) })
    setSavingCfg(false); load()
  }

  async function toggleRegistrationOpen() {
    const newVal = !regs.registrationOpen
    await fetch('/api/register', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ registrationOpen: newVal }) })
    setRegs(r => ({ ...r, registrationOpen: newVal }))
  }

  async function deleteRegistration(email) {
    if (!confirm(`Inschrijving van ${email} verwijderen?`)) return
    await fetch('/api/register', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ email }) })
    load()
  }

  async function addDay(e) {
    e.preventDefault()
    if (!newDate) return
    const res = await fetch('/api/opening-days', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ date: newDate, label: newLabel }) })
    if (res.ok) { setNewDate(''); setNewLabel(''); load() }
  }

  async function removeDay(date) {
    if (!confirm('Openingsdag verwijderen?')) return
    await fetch('/api/opening-days', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ date }) })
    load()
  }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-5">

      {/* Modus schakelaar */}
      <div className="bg-white border border-parchment px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm font-medium text-ink">
            {regs.registrationOpen ? 'Registratiemodus actief' : 'Bestelmodus actief'}
          </p>
          <p className="font-sans text-xs text-warm-gray mt-0.5">
            {regs.registrationOpen ? 'Bezoekers zien de inschrijvingspagina' : 'Bezoekers zien het menu en kunnen bestellen'}
          </p>
        </div>
        <button onClick={toggleRegistrationOpen}
          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${regs.registrationOpen ? 'bg-olive' : 'bg-wine'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${regs.registrationOpen ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Openingsuren en capaciteit */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Openingsuren & capaciteit</p>
        </div>
        <form onSubmit={saveSettings} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Van</label>
              <div className="flex items-center border border-parchment bg-cream">
                <input type="number" min="0" max="23" value={siteSettings.openingHour}
                  onChange={e=>setSiteSettings(s=>({...s, openingHour: Number(e.target.value)}))}
                  className="w-full px-2 py-3 text-sm text-ink bg-transparent focus:outline-none min-w-0" />
                <span className="pr-2 text-warm-gray text-sm shrink-0">u</span>
              </div>
            </div>
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Tot</label>
              <div className="flex items-center border border-parchment bg-cream">
                <input type="number" min="0" max="23" value={siteSettings.closingHour}
                  onChange={e=>setSiteSettings(s=>({...s, closingHour: Number(e.target.value)}))}
                  className="w-full px-2 py-3 text-sm text-ink bg-transparent focus:outline-none min-w-0" />
                <span className="pr-2 text-warm-gray text-sm shrink-0">u</span>
              </div>
            </div>
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Max/slot</label>
              <div className="flex items-center border border-parchment bg-cream">
                <input type="number" min="1" max="10" value={siteSettings.pizzasPerSlot}
                  onChange={e=>setSiteSettings(s=>({...s, pizzasPerSlot: Number(e.target.value)}))}
                  className="w-full px-2 py-3 text-sm text-ink bg-transparent focus:outline-none min-w-0" />
                <span className="pr-2 text-warm-gray text-sm shrink-0">p</span>
              </div>
            </div>
          </div>
          <p className="font-sans text-xs text-warm-gray italic">
            Vanaf {siteSettings.pizzasPerSlot + 1} pizza's worden automatisch {2} tijdslots gereserveerd.
          </p>
          <button type="submit" disabled={savingSettings} className="btn-primary w-full">
            {savingSettings ? 'Bezig...' : 'Opslaan'}
          </button>
        </form>
      </div>

      {/* Registratie configuratie */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Registratie voor openingsdag</p>
        </div>
        <form onSubmit={saveRegConfig} className="px-5 py-4 space-y-3">
          <p className="font-sans text-xs text-warm-gray italic">Kies de openingsdag waarvoor mensen kunnen inschrijven. Deze datum staat duidelijk vermeld op de registratiepagina.</p>
          {days.length > 0 ? (
            <div className="space-y-1">
              {days.map(d => (
                <label key={d.date} className={`flex items-center gap-2 px-4 py-3 border cursor-pointer transition-colors ${regDate === d.date ? 'border-olive bg-olive/5' : 'border-parchment hover:border-olive/40'}`}>
                  <input type="radio" name="regDate" value={d.date} checked={regDate === d.date} onChange={e=>setRegDate(e.target.value)} className="accent-olive shrink-0" />
                  <span className="font-sans text-sm text-ink min-w-0 break-words">{formatLongDate(d.date)}{d.label ? <span className="text-warm-gray text-xs"> — {d.label}</span> : null}</span>
                </label>
              ))}
              <label className={`flex items-center gap-2 px-4 py-3 border cursor-pointer transition-colors ${regDate === '' ? 'border-olive bg-olive/5' : 'border-parchment hover:border-olive/40'}`}>
                <input type="radio" name="regDate" value="" checked={regDate === ''} onChange={()=>setRegDate('')} className="accent-olive shrink-0" />
                <span className="font-sans text-sm text-warm-gray italic">Geen datum tonen</span>
              </label>
            </div>
          ) : (
            <p className="font-sans text-xs text-wine italic">Voeg eerst een openingsdag toe hieronder.</p>
          )}
          <button type="submit" disabled={savingCfg} className="btn-primary w-full">{savingCfg ? 'Bezig...' : 'Opslaan'}</button>
        </form>
      </div>

      {/* Registraties teller */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment flex items-center justify-between">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Gereserveerde pizza's</p>
          <span className={`font-serif text-lg ${regs.count >= regs.openFrom ? 'text-olive' : 'text-wine'}`}>
            {regs.count} / {regs.max}
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="w-full bg-parchment h-2 mb-3 relative">
            <div className="absolute top-0 bottom-0 w-px bg-gold/70 z-10"
              style={{ left: `${(regs.openFrom / regs.max) * 100}%` }} />
            <div className="bg-olive h-2 transition-all" style={{ width: `${Math.min(100, (regs.count/regs.max)*100)}%` }} />
          </div>
          <p className="font-sans text-xs text-warm-gray">
            {regs.count >= regs.max ? 'Volzet'
              : regs.count >= regs.openFrom ? `Open — nog ${regs.max - regs.count} plaatsen vrij`
              : `Nog ${regs.openFrom - regs.count} pizza's nodig om te openen`}
          </p>
          <p className="font-sans text-xs text-warm-gray-light mt-1">Opent vanaf {regs.openFrom} · max {regs.max} pizza's</p>
        </div>
      </div>

      {/* Registratielijst */}
      {regList.length > 0 && (
        <div className="bg-white border border-parchment">
          <div className="px-5 py-4 border-b border-parchment">
            <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Ingeschreven ({regList.length})</p>
          </div>
          <ul className="divide-y divide-parchment">
            {regList.map((r, i) => (
              <li key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm text-ink">{r.name}</p>
                  <p className="font-sans text-xs text-warm-gray truncate">{r.email}</p>
                </div>
                <span className="font-serif text-wine shrink-0">{r.pizzas || 1}×</span>
                <button onClick={() => deleteRegistration(r.email)} className="text-warm-gray-light hover:text-wine transition-colors shrink-0 p-1">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Openingsdagen */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Openingsdagen</p>
        </div>
        {days.length === 0
          ? <p className="px-5 py-4 font-sans text-sm text-warm-gray italic">Nog geen openingsdagen gepland.</p>
          : <ul className="divide-y divide-parchment">
              {days.map(d => (
                <li key={d.date} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-ink">{formatLongDate(d.date)}</p>
                    {d.label && <p className="font-sans text-xs text-warm-gray">{d.label}</p>}
                  </div>
                  <button onClick={() => removeDay(d.date)} className="text-warm-gray-light hover:text-wine transition-colors shrink-0 p-1">✕</button>
                </li>
              ))}
            </ul>
        }
        <form onSubmit={addDay} className="px-5 py-4 border-t border-parchment space-y-2">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Dag toevoegen</p>
          <input type="date" required value={newDate} onChange={e=>setNewDate(e.target.value)} className={INPUT} />
          <input type="text" value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Optionele notitie (bv. 'Zomer editie')" className={INPUT} />
          <button type="submit" className="btn-primary w-full">Dag toevoegen</button>
        </form>
      </div>
    </div>
  )
}

// ─── Winst ─────────────────────────────────────────────────────────────────

const COST_LABELS = {
  hout:  { label: 'Hout / oven', icon: '🪵' },
  bloem: { label: 'Bloem (deeg)', icon: '🌾' },
  saus:  { label: 'Tomatensaus', icon: '🍅' },
  kaas:  { label: 'Kaas',        icon: '🧀' },
}

function WinstTab({ password }) {
  const [pizzas, setPizzas]         = useState([])
  const [ingredients, setIngredients] = useState([])
  const [baseCosts, setBaseCosts]   = useState({ hout: 0.50, bloem: 0.30, saus: 0.40, kaas: 1.20 })
  const [openingDays, setOpeningDays] = useState([])
  const [orders, setOrders]         = useState([])
  const [expenses, setExpenses]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [savingBase, setSavingBase] = useState(false)
  const [savedBase, setSavedBase]   = useState(false)
  const [addingFor, setAddingFor]   = useState(null) // date string
  const [expForm, setExpForm]       = useState({ description: '', amount: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/pizzas').then(r => r.json()),
      fetch('/api/ingredients').then(r => r.json()),
      fetch('/api/costs').then(r => r.json()),
      fetch('/api/opening-days').then(r => r.json()),
      fetch('/api/orders', { headers: { 'x-admin-password': password } }).then(r => r.json()),
      fetch('/api/expenses', { headers: { 'x-admin-password': password } }).then(r => r.json()),
    ]).then(([p, ings, c, days, ord, exp]) => {
      setPizzas(p.length ? p : staticPizzas)
      setIngredients(Array.isArray(ings) ? ings : [])
      setBaseCosts(c)
      setOpeningDays(days)
      setOrders(Array.isArray(ord) ? ord : [])
      setExpenses(Array.isArray(exp) ? exp : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const baseCostTotal = Object.values(baseCosts).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const ingMap = Object.fromEntries(ingredients.map(i => [i.name, parseFloat(i.cost) || 0]))

  function estimatedCost(pizza) {
    const ingCost = (Array.isArray(pizza.ingredients) ? pizza.ingredients : [])
      .reduce((s, name) => s + (ingMap[name] || 0), 0)
    return baseCostTotal + ingCost
  }

  function parseTotal(str) {
    return parseFloat((str || '').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
  }

  async function saveBaseCosts(e) {
    e.preventDefault(); setSavingBase(true)
    await fetch('/api/costs', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(baseCosts) })
    setSavingBase(false); setSavedBase(true); setTimeout(() => setSavedBase(false), 2000)
  }

  async function saveIngCost(name, val) {
    const updated = ingredients.map(i => i.name === name ? { ...i, cost: parseFloat(val) || 0 } : i)
    setIngredients(updated)
    await fetch('/api/ingredients', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(updated) })
  }

  async function addExpense(date) {
    if (!expForm.description || !expForm.amount) return
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ date, description: expForm.description, amount: parseFloat(expForm.amount) }),
    })
    const entry = await res.json()
    setExpenses(prev => [...prev, entry])
    setExpForm({ description: '', amount: '' })
    setAddingFor(null)
  }

  async function deleteExpense(id) {
    await fetch('/api/expenses', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ id }) })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-6">

      {/* ── Per avond ── */}
      <div>
        <SectionLabel>Per avond</SectionLabel>
        {openingDays.length === 0
          ? <div className="bg-white border border-parchment p-5 text-center">
              <p className="font-sans text-sm text-warm-gray italic">Nog geen openingsdagen gepland.</p>
            </div>
          : [...openingDays].sort((a, b) => a.date.localeCompare(b.date)).map(day => {
              const dayOrders  = orders.filter(o => o.date === day.date)
              const revenue    = dayOrders.reduce((s, o) => s + parseTotal(o.total), 0)
              const dayExp     = expenses.filter(e => e.date === day.date)
              const totalExp   = dayExp.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
              const result     = revenue - totalExp
              return (
                <div key={day.date} className="bg-white border border-parchment mb-3">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-parchment flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-ink break-words">{formatLongDate(day.date)}</p>
                      {day.label && <p className="font-sans text-xs text-warm-gray">{day.label}</p>}
                    </div>
                    <span className={`font-serif text-lg shrink-0 ${result >= 0 ? 'text-olive' : 'text-wine'}`}>
                      {result >= 0 ? '+' : ''}€{result.toFixed(2)}
                    </span>
                  </div>
                  {/* Samenvatting */}
                  <div className="px-4 py-3 space-y-1 border-b border-parchment">
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-warm-gray">Omzet</span>
                      <span className="font-serif text-ink">
                        €{revenue.toFixed(2)}
                        <span className="font-sans text-xs text-warm-gray ml-1">({dayOrders.length} best.)</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-warm-gray">Uitgaven</span>
                      <span className="font-serif text-ink">−€{totalExp.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Uitgavenlijst */}
                  {dayExp.length > 0 && (
                    <ul className="divide-y divide-parchment border-b border-parchment">
                      {dayExp.map(exp => (
                        <li key={exp.id} className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="font-sans text-xs text-ink min-w-0 truncate">{exp.description}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-sans text-xs text-warm-gray">€{parseFloat(exp.amount).toFixed(2)}</span>
                            <button onClick={() => deleteExpense(exp.id)} className="text-warm-gray-light hover:text-wine leading-none">✕</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Uitgave toevoegen */}
                  {addingFor === day.date ? (
                    <div className="px-4 py-3 space-y-2">
                      <input value={expForm.description}
                        onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Omschrijving (bv. mozzarella 2kg)" className={INPUT + ' text-sm'} />
                      <div className="flex gap-2">
                        <div className="flex items-center border border-parchment bg-cream flex-1">
                          <span className="px-2 text-warm-gray text-sm shrink-0">€</span>
                          <input type="number" step="0.01" min="0" value={expForm.amount}
                            onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                            placeholder="0.00" className="flex-1 px-2 py-3 text-sm focus:outline-none bg-transparent min-w-0" />
                        </div>
                        <button onClick={() => addExpense(day.date)} className="btn-primary px-4">+</button>
                        <button onClick={() => { setAddingFor(null); setExpForm({ description: '', amount: '' }) }}
                          className="btn-secondary px-3">×</button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <button onClick={() => { setAddingFor(day.date); setExpForm({ description: '', amount: '' }) }}
                        className="font-sans text-xs text-warm-gray hover:text-olive transition-colors">
                        + Uitgave toevoegen
                      </button>
                    </div>
                  )}
                </div>
              )
            })
        }
      </div>

      {/* ── Per pizza — geschatte marge ── */}
      <div>
        <SectionLabel>Per pizza — geschatte marge</SectionLabel>
        <div className="space-y-2">
          {pizzas.map(pizza => {
            const est    = estimatedCost(pizza)
            const margin = pizza.price - est
            const pct    = pizza.price > 0 ? (margin / pizza.price) * 100 : 0
            return (
              <div key={pizza.id} className="bg-white border border-parchment p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg shrink-0">{pizza.emoji}</span>
                  <span className="font-serif text-ink flex-1 min-w-0 truncate">{pizza.name}</span>
                  <span className={`font-sans text-xs px-2 py-0.5 shrink-0 ${pct >= 40 ? 'bg-olive/10 text-olive' : 'bg-wine/10 text-wine'}`}>{pct.toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-parchment/50 p-2">
                    <div className="font-sans text-[10px] text-warm-gray uppercase tracking-wide mb-0.5">Geschat</div>
                    <div className="font-serif text-base text-ink">€{est.toFixed(2)}</div>
                  </div>
                  <div className="bg-parchment/50 p-2">
                    <div className="font-sans text-[10px] text-warm-gray uppercase tracking-wide mb-0.5">Prijs</div>
                    <div className="font-serif text-base text-ink">€{pizza.price.toFixed(2)}</div>
                  </div>
                  <div className={`p-2 ${margin >= 0 ? 'bg-olive/10' : 'bg-wine/10'}`}>
                    <div className="font-sans text-[10px] text-warm-gray uppercase tracking-wide mb-0.5">Winst</div>
                    <div className={`font-serif text-base ${margin >= 0 ? 'text-olive' : 'text-wine'}`}>€{margin.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="font-sans text-xs text-warm-gray mt-2 italic">Geschatte kostprijs = basiskosten + som ingrediëntkosten. Verkoopprijs stel je zelf in bij Pizza's.</p>
      </div>

      {/* ── Kostprijs ingrediënten ── */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Kostprijs ingrediënten</p>
          <p className="font-sans text-xs text-warm-gray mt-1 italic">Kostprijs per portie/stuk. Wijzigingen worden automatisch opgeslagen.</p>
        </div>
        <div className="divide-y divide-parchment">
          {ingredients.map(ing => (
            <div key={ing.name} className="flex items-center gap-3 px-4 py-2">
              <span className="flex-1 font-sans text-sm text-ink">{ing.name}</span>
              <div className="flex items-center border border-parchment w-24 shrink-0">
                <span className="px-2 py-2 bg-parchment/50 text-warm-gray text-xs">€</span>
                <input type="number" step="0.05" min="0"
                  value={ing.cost > 0 ? ing.cost : ''}
                  onChange={e => setIngredients(prev => prev.map(i => i.name === ing.name ? { ...i, cost: e.target.value } : i))}
                  onBlur={e => saveIngCost(ing.name, e.target.value)}
                  placeholder="0.00"
                  className="w-full py-2 px-2 text-sm text-right focus:outline-none bg-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Basiskosten ── */}
      <div className="bg-white border border-parchment p-5">
        <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-1">Basiskosten per pizza</p>
        <p className="font-sans text-xs text-warm-gray mb-4 italic">Vaste kosten die voor elke pizza gelden (deeg, saus, oven).</p>
        <form onSubmit={saveBaseCosts} className="space-y-3">
          {Object.entries(COST_LABELS).map(([key, { label, icon }]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xl w-7">{icon}</span>
              <span className="flex-1 font-sans text-sm text-warm-gray">{label}</span>
              <div className="flex items-center border border-parchment w-24 shrink-0">
                <span className="px-2 py-2 bg-parchment/50 text-warm-gray text-xs">€</span>
                <input type="number" step="0.05" min="0" value={baseCosts[key]}
                  onChange={e => setBaseCosts(c => ({ ...c, [key]: e.target.value }))}
                  className="w-full py-2 px-2 text-sm text-right focus:outline-none bg-white" />
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-parchment">
            <span className="font-sans text-xs text-warm-gray uppercase tracking-wide">Totaal basis</span>
            <span className="font-serif text-ink">€{baseCostTotal.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={savingBase} className="btn-primary w-full">
            {savedBase ? '✓ Opgeslagen' : savingBase ? 'Bezig...' : 'Opslaan'}
          </button>
        </form>
      </div>

    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function LoadingCards() {
  return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white border border-parchment h-20 animate-pulse motion-reduce:animate-none"/>)}</div>
}
function Empty({ icon, text }) {
  return <div className="text-center py-16"><div className="text-5xl mb-3 opacity-40">{icon}</div><p className="font-sans text-sm text-warm-gray">{text}</p></div>
}
function SectionLabel({ children }) {
  return <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-3">{children}</p>
}
function formatShortDate(d) { return new Date(d).toLocaleDateString('nl-BE',{day:'numeric',month:'short'}) }
function formatLongDate(d)  { return new Date(d).toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) }
