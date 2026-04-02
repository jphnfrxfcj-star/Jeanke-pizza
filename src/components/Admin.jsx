import { useState, useEffect } from 'react'
import config from '../data/config.json'
import staticPizzas from '../data/pizzas.json'

const INPUT = "w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors"

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminPw') === config.adminPassword)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('orders')

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

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="bg-olive text-cream sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg italic">{config.storeName}</h1>
            <p className="font-sans text-xs text-cream/50 tracking-widest uppercase">Beheer</p>
          </div>
          <a href="/" className="font-sans text-xs text-cream/60 hover:text-cream tracking-widest uppercase transition-colors">← Shop</a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {tab === 'orders'  && <OrdersTab password={pw} />}
        {tab === 'pizzas'  && <PizzasTab password={pw} />}
        {tab === 'opening' && <OpeningTab password={pw} />}
        {tab === 'winst'   && <WinstTab  password={pw} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-parchment z-10">
        <div className="max-w-2xl mx-auto flex">
          {[
            { key: 'orders',  label: 'Bestellingen', icon: '📋' },
            { key: 'pizzas',  label: "Pizza's",      icon: '🍕' },
            { key: 'opening', label: 'Planning',     icon: '📅' },
            { key: 'winst',   label: 'Winst',        icon: '💰' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-sans font-medium transition-colors ${tab === t.key ? 'text-wine' : 'text-warm-gray'}`}>
              <span className="text-xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// ─── Orders ────────────────────────────────────────────────────────────────

function OrdersTab({ password }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch('/api/orders', { headers: { 'x-admin-password': password } })
      .then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function cancelOrder(key) {
    if (!confirm('Bestelling annuleren?')) return
    await fetch('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ key }) })
    load()
  }

  const today    = new Date().toISOString().split('T')[0]
  const upcoming = [...orders].filter(o => o.date >= today).sort((a,b) => a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
  const past     = [...orders].filter(o => o.date <  today).sort((a,b) => b.date.localeCompare(a.date)||b.time.localeCompare(a.time))

  if (loading) return <LoadingCards />
  if (!orders.length) return <Empty icon="📭" text="Nog geen bestellingen" />

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && <section>
        <SectionLabel>Aankomend ({upcoming.length})</SectionLabel>
        <div className="space-y-3">{upcoming.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} />)}</div>
      </section>}
      {past.length > 0 && <section>
        <SectionLabel>Voorbij</SectionLabel>
        <div className="space-y-3 opacity-60">{past.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} />)}</div>
      </section>}
    </div>
  )
}

function OrderCard({ order, onCancel }) {
  return (
    <div className="bg-white border border-parchment p-4">
      <div className="flex items-start gap-3">
        <div className="bg-olive text-cream px-3 py-2 text-center shrink-0 min-w-[64px]">
          <div className="font-serif text-lg leading-none">{order.time}</div>
          <div className="font-sans text-xs text-cream/60 mt-0.5">{formatShortDate(order.date)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-serif text-base text-ink">{order.name}</p>
              <p className="font-sans text-xs text-warm-gray">{order.email}</p>
            </div>
            <button onClick={() => onCancel(order.key)} className="text-warm-gray-light hover:text-wine transition-colors p-1 shrink-0">✕</button>
          </div>
          <p className="font-sans text-sm text-warm-gray mt-2 leading-relaxed">{order.order}</p>
          <p className="font-serif text-base text-wine mt-1">{order.total}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Pizzas ────────────────────────────────────────────────────────────────

function PizzasTab({ password }) {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', emoji: '🍕', imageUrl: '', toppingCost: '' })

  useEffect(() => {
    fetch('/api/pizzas').then(r => r.json())
      .then(d => { setPizzas(d.length ? d : staticPizzas); setLoading(false) })
      .catch(() => { setPizzas(staticPizzas); setLoading(false) })
  }, [])

  async function save(list) {
    const res = await fetch('/api/pizzas', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(list) })
    if (!res.ok) { const b = await res.json().catch(()=>({})); alert(`Opslaan mislukt (${res.status}): ${b.error||'onbekende fout'}`); return }
    setPizzas(list)
  }

  function startEdit(p) { setEditing(p.id); setForm({ name: p.name, description: p.description, price: String(p.price), emoji: p.emoji, imageUrl: p.imageUrl||'', toppingCost: String(p.toppingCost??'') }) }
  function startNew()   { setEditing('new'); setForm({ name:'', description:'', price:'', emoji:'🍕', imageUrl:'', toppingCost:'' }) }

  async function saveEdit(e) {
    e.preventDefault()
    const updated = { ...form, price: parseFloat(form.price), toppingCost: form.toppingCost ? parseFloat(form.toppingCost) : 0 }
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
            <p className="font-sans text-xs text-warm-gray truncate">{pizza.description}</p>
            <p className="font-sans text-xs text-wine mt-0.5">€{pizza.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-1 p-3 shrink-0">
            <button onClick={() => startEdit(pizza)} className="font-sans text-xs text-ink bg-parchment px-3 py-1.5 hover:bg-gold/20 transition-colors">Bewerk</button>
            <button onClick={() => deletePizza(pizza.id)} className="font-sans text-xs text-wine bg-wine/5 px-3 py-1.5 hover:bg-wine/10 transition-colors">Verwijder</button>
          </div>
        </div>
      ))}

      <button onClick={startNew} className="btn-primary w-full">+ Pizza toevoegen</button>

      {editing !== null && (
        <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50">
          <div className="bg-cream w-full sm:max-w-sm">
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
              <input required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Ingrediënten" className={INPUT} />
              <input value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="Foto URL (optioneel)" className={INPUT} />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Verkoopprijs</label>
                  <input required type="number" step="0.50" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="€" className={INPUT} />
                </div>
                <div className="flex-1">
                  <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Belegkosten</label>
                  <input type="number" step="0.10" min="0" value={form.toppingCost} onChange={e=>setForm(f=>({...f,toppingCost:e.target.value}))} placeholder="€" className={INPUT} />
                </div>
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
  const [days, setDays]   = useState([])
  const [regs, setRegs]   = useState({ count: 0, threshold: 20 })
  const [regList, setRegList] = useState([])
  const [newDate, setNewDate] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [loading, setLoading]   = useState(true)

  function load() {
    Promise.all([
      fetch('/api/opening-days').then(r=>r.json()),
      fetch('/api/register').then(r=>r.json()),
      fetch('/api/orders', { headers: {'x-admin-password': password} }).then(r=>r.json()).catch(()=>[]),
    ]).then(([d, r]) => { setDays(d); setRegs(r); setLoading(false) })
  }
  useEffect(() => {
    load()
    fetch('/api/register').then(r=>r.json()).then(setRegs)
  }, [])

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
      {/* Registraties */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment flex items-center justify-between">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Inschrijvingen</p>
          <span className={`font-serif text-lg ${regs.count >= regs.threshold ? 'text-olive' : 'text-wine'}`}>
            {regs.count} / {regs.threshold}
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="w-full bg-parchment h-2 mb-3">
            <div className="bg-olive h-2 transition-all" style={{ width: `${Math.min(100, (regs.count/regs.threshold)*100)}%` }} />
          </div>
          {regs.count >= regs.threshold
            ? <p className="font-sans text-xs text-olive">✓ Drempel bereikt — plan een openingsdag!</p>
            : <p className="font-sans text-xs text-warm-gray">{regs.threshold - regs.count} inschrijvingen nog nodig</p>
          }
        </div>
      </div>

      {/* Openingsdagen */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-parchment">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Openingsdagen</p>
        </div>
        {days.length === 0
          ? <p className="px-5 py-4 font-sans text-sm text-warm-gray italic">Nog geen openingsdagen gepland.</p>
          : <ul className="divide-y divide-parchment">
              {days.map(d => (
                <li key={d.date} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-ink">{formatLongDate(d.date)}</p>
                    {d.label && <p className="font-sans text-xs text-warm-gray">{d.label}</p>}
                  </div>
                  <button onClick={() => removeDay(d.date)} className="text-warm-gray-light hover:text-wine transition-colors text-lg px-2">✕</button>
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
  const [pizzas, setPizzas] = useState([])
  const [costs, setCosts]   = useState({ hout:0.50, bloem:0.30, saus:0.40, kaas:1.20 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    Promise.all([fetch('/api/pizzas').then(r=>r.json()), fetch('/api/costs').then(r=>r.json())])
      .then(([p,c]) => { setPizzas(p.length?p:staticPizzas); setCosts(c); setLoading(false) })
      .catch(() => { setPizzas(staticPizzas); setLoading(false) })
  }, [])

  async function saveCosts(e) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/costs', { method:'PUT', headers:{'Content-Type':'application/json','x-admin-password':password}, body:JSON.stringify(costs) })
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false), 2000)
  }

  const baseCost = Object.values(costs).reduce((s,v) => s+(parseFloat(v)||0), 0)
  if (loading) return <LoadingCards />

  return (
    <div className="space-y-5">
      <div className="bg-white border border-parchment p-5">
        <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-4">Basiskosten per pizza</p>
        <form onSubmit={saveCosts} className="space-y-3">
          {Object.entries(COST_LABELS).map(([key,{label,icon}]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xl w-7">{icon}</span>
              <span className="flex-1 font-sans text-sm text-warm-gray">{label}</span>
              <div className="flex items-center border border-parchment w-24">
                <span className="px-2 py-2 bg-parchment/50 text-warm-gray text-xs">€</span>
                <input type="number" step="0.05" min="0" value={costs[key]} onChange={e=>setCosts(c=>({...c,[key]:e.target.value}))}
                  className="w-full py-2 px-2 text-sm text-right focus:outline-none bg-white" />
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-parchment">
            <span className="font-sans text-xs text-warm-gray uppercase tracking-wide">Totaal basis</span>
            <span className="font-serif text-ink">€{baseCost.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saved?'✓ Opgeslagen':saving?'Bezig...':'Opslaan'}</button>
        </form>
      </div>

      <div className="bg-white border border-parchment p-5">
        <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-4">Winst per pizza</p>
        <div className="space-y-3">
          {pizzas.map(pizza => {
            const tc = parseFloat(pizza.toppingCost)||0
            const cost = baseCost+tc
            const profit = pizza.price-cost
            const margin = pizza.price>0?(profit/pizza.price)*100:0
            return (
              <div key={pizza.id} className="border border-parchment p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{pizza.emoji}</span>
                  <span className="font-serif flex-1 text-ink">{pizza.name}</span>
                  <span className={`font-sans text-xs px-2 py-0.5 ${margin>=50?'bg-olive/10 text-olive':'bg-wine/10 text-wine'}`}>{margin.toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-parchment/50 p-2"><div className="text-warm-gray">Prijs</div><div className="font-serif text-ink">€{pizza.price.toFixed(2)}</div></div>
                  <div className="bg-parchment/50 p-2"><div className="text-warm-gray">Kosten</div><div className="font-serif text-ink">€{cost.toFixed(2)}</div></div>
                  <div className={`p-2 ${profit>=0?'bg-olive/10':'bg-wine/10'}`}><div className="text-warm-gray">Winst</div><div className={`font-serif ${profit>=0?'text-olive':'text-wine'}`}>€{profit.toFixed(2)}</div></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function LoadingCards() {
  return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white border border-parchment h-20 animate-pulse"/>)}</div>
}
function Empty({ icon, text }) {
  return <div className="text-center py-16"><div className="text-5xl mb-3 opacity-40">{icon}</div><p className="font-sans text-sm text-warm-gray">{text}</p></div>
}
function SectionLabel({ children }) {
  return <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-3">{children}</p>
}
function formatShortDate(d) { return new Date(d).toLocaleDateString('nl-BE',{day:'numeric',month:'short'}) }
function formatLongDate(d)  { return new Date(d).toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) }
