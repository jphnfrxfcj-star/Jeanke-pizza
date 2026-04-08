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

  const tabs = [
    { key: 'orders',  label: 'Bestellingen', icon: '📋' },
    { key: 'pizzas',  label: "Pizza's",      icon: '🍕' },
    { key: 'opening', label: 'Planning',     icon: '📅' },
    { key: 'winst',   label: 'Winst',        icon: '💰' },
  ]

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      {/* Header */}
      <header className="bg-olive text-cream sticky top-0 z-20">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg italic">{config.storeName}</h1>
            <p className="font-sans text-xs text-cream/50 tracking-widest uppercase">Beheer</p>
          </div>
          <a href="/" className="font-sans text-xs text-cream/60 hover:text-cream tracking-widest uppercase transition-colors">← Shop</a>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 bg-white border-r border-parchment sticky top-[61px] h-[calc(100vh-61px)]">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-sans border-b border-parchment transition-colors text-left ${tab === t.key ? 'bg-olive/5 text-olive border-l-2 border-l-olive' : 'text-warm-gray hover:bg-parchment/50 border-l-2 border-l-transparent'}`}>
              <span className="text-xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full px-4 md:px-8 py-5 pb-24 md:pb-8 max-w-2xl md:max-w-3xl overflow-hidden">
          {tab === 'orders'  && <OrdersTab password={pw} />}
          {tab === 'pizzas'  && <PizzasTab password={pw} />}
          {tab === 'opening' && <OpeningTab password={pw} />}
          {tab === 'winst'   && <WinstTab  password={pw} />}
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-parchment z-10">
        <div className="flex">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 font-sans font-medium transition-colors text-[10px] sm:text-xs ${tab === t.key ? 'text-wine' : 'text-warm-gray'}`}>
              <span className="text-lg sm:text-xl">{t.icon}</span>{t.label}
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

  // Parse "2x Burrata (€25.00), 1x Margherita (€12.50)" → { Burrata: 2, Margherita: 1 }
  function parsePizzaCounts(orderStr) {
    const counts = {}
    if (!orderStr) return counts
    const re = /(\d+)x ([^(]+?)\s*\(/g
    let m
    while ((m = re.exec(orderStr)) !== null) {
      const qty = parseInt(m[1], 10)
      const name = m[2].trim()
      counts[name] = (counts[name] || 0) + qty
    }
    return counts
  }

  const pizzaSummary = (() => {
    const totals = {}
    upcoming.forEach(o => {
      const counts = parsePizzaCounts(o.order)
      Object.entries(counts).forEach(([name, qty]) => { totals[name] = (totals[name] || 0) + qty })
    })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  })()

  if (loading) return <LoadingCards />
  if (!orders.length) return <Empty icon="📭" text="Nog geen bestellingen" />

  return (
    <div className="space-y-6">
      {pizzaSummary.length > 0 && (
        <div className="bg-white border border-parchment p-4">
          <p className="font-sans text-xs tracking-widest uppercase text-warm-gray mb-3">
            Boodschappenlijst ({pizzaSummary.reduce((s,[,n])=>s+n,0)} pizza's)
          </p>
          <div className="space-y-2">
            {pizzaSummary.map(([name, qty]) => (
              <div key={name} className="flex items-center justify-between gap-3">
                <span className="font-sans text-sm text-ink">{name}</span>
                <span className="font-serif text-lg text-olive leading-none">{qty}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [form, setForm] = useState({ name: '', ingredients: [], price: '', emoji: '🍕', imageUrl: '', toppingCost: '' })
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
    setForm({ name: p.name, ingredients: ings, price: String(p.price), emoji: p.emoji, imageUrl: p.imageUrl||'' })
    setIngInput('')
  }
  function startNew() { setEditing('new'); setForm({ name:'', ingredients:[], price:'', emoji:'🍕', imageUrl:'' }); setIngInput('') }

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
    const updated = { ...form, price: parseFloat(form.price), description: form.ingredients.join(', ') }
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
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-parchment/50 p-2">
                    <div className="text-warm-gray">Geschat</div>
                    <div className="font-serif text-ink">€{est.toFixed(2)}</div>
                  </div>
                  <div className="bg-parchment/50 p-2">
                    <div className="text-warm-gray">Prijs</div>
                    <div className="font-serif text-ink">€{pizza.price.toFixed(2)}</div>
                  </div>
                  <div className={`p-2 ${margin >= 0 ? 'bg-olive/10' : 'bg-wine/10'}`}>
                    <div className="text-warm-gray">Winst</div>
                    <div className={`font-serif ${margin >= 0 ? 'text-olive' : 'text-wine'}`}>€{margin.toFixed(2)}</div>
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
