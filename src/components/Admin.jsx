import { useState, useEffect } from 'react'
import { Clock, ClipboardList, ShoppingBasket, ChefHat, TrendingUp, Settings, Menu, Wine, LayoutDashboard, LogOut, Search, X } from 'lucide-react'
import config from '../data/config.json'
import staticPizzas from '../data/pizzas.json'
import PaperTexture from './PaperTexture'

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
  const [authed, setAuthed] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPw')
    if (!stored) { setAuthChecking(false); return }
    fetch('/api/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: stored }),
    })
      .then(r => { if (r.ok) setAuthed(true) })
      .catch(() => {})
      .finally(() => setAuthChecking(false))
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { sessionStorage.setItem('adminPw', password); setAuthed(true) }
      else alert('Verkeerd wachtwoord')
    } catch { alert('Verbindingsfout. Probeer opnieuw.') }
    finally { setLoginLoading(false) }
  }

  if (authChecking) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin motion-reduce:animate-none" />
    </div>
  )

  if (!authed) return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-4 overflow-hidden">
      <PaperTexture />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-4">
            <span className="h-px w-6 bg-gold/40" />
            <span className="font-serif italic text-wine tracking-normal text-sm leading-none">N° ✦</span>
            <span>·</span>
            <span>Beheer</span>
            <span className="h-px w-6 bg-gold/40" />
          </div>
          <p className="font-serif italic text-4xl text-ink leading-none">Jeanke<span className="text-wine">'</span>s</p>
          <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray mt-2">Pizzeria · Beheerportaal</p>
        </div>
        <div className="bg-white border border-parchment">
          <div className="px-6 py-5 border-b border-dashed border-parchment text-center">
            <p className="font-serif italic text-warm-gray text-sm">Alleen voor personeel</p>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-2">Wachtwoord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={INPUT} autoFocus />
            </div>
            <button type="submit" disabled={loginLoading} className="btn-primary w-full">
              {loginLoading ? 'Even geduld...' : 'Inloggen'}
            </button>
          </form>
        </div>
        <p className="text-center font-serif italic text-xs text-warm-gray-light mt-6">
          <a href="/" className="hover:text-wine transition-colors">← Terug naar de winkel</a>
        </p>
      </div>
    </div>
  )

  const pw = sessionStorage.getItem('adminPw')

  const tabs = [
    { key: 'dashboard',    label: 'Dashboard',     Icon: LayoutDashboard, group: 'daily' },
    { key: 'dag',          label: 'Dag',           Icon: Clock,           group: 'daily' },
    { key: 'orders',       label: 'Bestellingen',  Icon: ClipboardList,   group: 'daily' },
    { key: 'boodschappen', label: 'Boodschappen',  Icon: ShoppingBasket,  group: 'daily' },
    { key: 'pizzas',       label: "Pizza's",       Icon: ChefHat,         group: 'config' },
    { key: 'wijnen',       label: 'Wijnen',        Icon: Wine,            group: 'config' },
    { key: 'winst',        label: 'Winst',         Icon: TrendingUp,      group: 'config' },
    { key: 'opening',      label: 'Instellingen',  Icon: Settings,        group: 'config' },
  ]

  function logout() {
    sessionStorage.removeItem('adminPw')
    setAuthed(false)
    setPassword('')
  }

  function navigate(key) { setTab(key); setMenuOpen(false) }

  const currentTab = tabs.find(t => t.key === tab)

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-cream border-r border-parchment sticky top-0 h-screen">
        <div className="px-6 py-7 border-b border-dashed border-parchment">
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-1">N° ✦ · Beheer</p>
          <h1 className="font-serif italic text-2xl text-ink leading-tight">Jeanke<span className="text-wine">'</span>s</h1>
          <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-1">Pizzeria · Beheer</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {tabs.map((t, i) => {
            const active = tab === t.key
            const prevGroup = i > 0 ? tabs[i - 1].group : null
            return (
              <div key={t.key}>
                {prevGroup && prevGroup !== t.group && (
                  <div className="px-6 my-3 border-t border-dotted border-parchment" />
                )}
                <button onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm font-sans text-left cursor-pointer transition-colors group ${active ? 'text-wine' : 'text-ink hover:text-wine'}`}>
                  <t.Icon size={15} className="shrink-0" />
                  <span className={active ? 'tracking-wide' : ''}>{t.label}</span>
                  {active && <span className="ml-auto text-wine">·</span>}
                </button>
              </div>
            )
          })}
        </nav>
        <div className="border-t border-dashed border-parchment px-6 py-4 flex items-center justify-between gap-3">
          <a href="/" className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">← Shop</a>
          <button onClick={logout} aria-label="Uitloggen" title="Uitloggen"
            className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">
            <LogOut size={12} />
            Uit
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-cream/85 backdrop-blur-md border-b border-parchment">
          <div className="px-4 h-14 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} aria-label="Menu openen" className="p-2 -ml-2 text-ink hover:text-wine transition-colors cursor-pointer">
              <Menu size={18} />
            </button>
            <div className="text-center">
              <p className="font-serif italic text-base text-ink leading-none">Jeanke<span className="text-wine">'</span>s</p>
              <p className="font-sans text-[9px] text-gold tracking-[0.28em] uppercase mt-1">{currentTab?.label}</p>
            </div>
            <a href="/" className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">← Shop</a>
          </div>
        </header>

        {/* Desktop page title bar */}
        <div className="hidden lg:flex items-center justify-between px-10 py-8 border-b border-parchment bg-cream">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold">Beheer</p>
              <h2 className="font-serif text-3xl italic text-ink leading-tight mt-0.5">{currentTab?.label}</h2>
            </div>
          </div>
          <a href="/" className="font-sans text-[11px] text-warm-gray hover:text-wine tracking-[0.24em] uppercase transition-colors">← Terug naar shop</a>
        </div>

        {/* Mobile drawer overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
            <div className="relative w-72 max-w-[82vw] bg-cream h-full flex flex-col shadow-xl">
              <div className="px-6 py-6 border-b border-dashed border-parchment">
                <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-1">N° ✦ · Beheer</p>
                <h2 className="font-serif italic text-2xl text-ink leading-tight">Jeanke<span className="text-wine">'</span>s</h2>
                <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-1">Pizzeria · Beheer</p>
              </div>
              <nav className="flex-1 py-4 overflow-y-auto">
                {tabs.map((t, i) => {
                  const active = tab === t.key
                  const prevGroup = i > 0 ? tabs[i - 1].group : null
                  return (
                    <div key={t.key}>
                      {prevGroup && prevGroup !== t.group && (
                        <div className="px-6 my-3 border-t border-dotted border-parchment" />
                      )}
                      <button onClick={() => navigate(t.key)}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-sans text-left cursor-pointer transition-colors ${active ? 'text-wine' : 'text-ink hover:text-wine'}`}>
                        <t.Icon size={16} className="shrink-0" />
                        {t.label}
                        {active && <span className="ml-auto text-wine">·</span>}
                      </button>
                    </div>
                  )
                })}
              </nav>
              <div className="border-t border-dashed border-parchment px-6 py-4 flex items-center justify-between gap-3">
                <a href="/" className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">← Shop</a>
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">
                  <LogOut size={12} />
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 lg:px-8 py-6 pb-10 w-full overflow-hidden">
          {tab === 'dashboard'    && <DashboardTab    password={pw} onNavigate={setTab} />}
          {tab === 'dag'          && <DagTab          password={pw} />}
          {tab === 'orders'       && <OrdersTab       password={pw} />}
          {tab === 'boodschappen' && <BoodschappenTab password={pw} />}
          {tab === 'pizzas'       && <PizzasTab       password={pw} />}
          {tab === 'wijnen'       && <WijnenTab       password={pw} />}
          {tab === 'opening'      && <OpeningTab      password={pw} />}
          {tab === 'winst'        && <WinstTab        password={pw} />}
        </div>

      </div>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

function parseTotal(totalStr) {
  if (!totalStr) return 0
  const m = String(totalStr).match(/[\d]+[.,]?[\d]*/)
  if (!m) return 0
  return parseFloat(m[0].replace(',', '.')) || 0
}

function parseQty(orderStr) {
  let qty = 0
  if (!orderStr) return qty
  orderStr.split(', ').forEach(part => {
    const m = part.match(/^(\d+)x /)
    if (m) qty += parseInt(m[1], 10)
  })
  return qty
}

function DashboardTab({ password, onNavigate }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetch('/api/orders', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter(o => o.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
  const upcoming = orders.filter(o => o.date > today)

  const revenueToday = todayOrders.reduce((s, o) => s + parseTotal(o.total), 0)
  const pizzasToday = todayOrders.reduce((s, o) => s + parseQty(o.order), 0)

  const nowHM = now.toTimeString().slice(0, 5)
  const nextSlot = todayOrders.find(o => o.time >= nowHM)
  const currentSlot = [...todayOrders].reverse().find(o => o.time <= nowHM)
  const futureSlotLabel = nextSlot ? nextSlot.time : '—'

  // Upcoming grouped
  const upcomingByDate = upcoming.reduce((acc, o) => {
    if (!acc[o.date]) acc[o.date] = { count: 0, revenue: 0, pizzas: 0 }
    acc[o.date].count += 1
    acc[o.date].revenue += parseTotal(o.total)
    acc[o.date].pizzas += parseQty(o.order)
    return acc
  }, {})
  const upcomingDates = Object.entries(upcomingByDate).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 5)

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <div>
        <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-1">Buongiorno</p>
        <h3 className="font-serif italic text-3xl text-ink leading-tight">{formatLongDate(today)}</h3>
        <p className="font-serif italic text-sm text-warm-gray mt-1">
          {todayOrders.length === 0 ? 'Nog geen bestellingen vandaag.' : `${todayOrders.length} ${todayOrders.length === 1 ? 'bestelling' : 'bestellingen'} in de oven.`}
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Bestellingen" value={todayOrders.length} hint="vandaag" />
        <KpiTile label="Omzet" value={`€${revenueToday.toFixed(2)}`} hint="vandaag" />
        <KpiTile label="Pizza's" value={pizzasToday} hint="te bakken" />
        <KpiTile label="Volgend slot" value={futureSlotLabel} hint={nextSlot ? nextSlot.name : 'geen meer'} />
      </div>

      {/* Today's timeline */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-parchment flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Vandaag</p>
          </div>
          <button onClick={() => onNavigate('dag')}
            className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">
            Bakkerij →
          </button>
        </div>
        {todayOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-serif italic text-sm text-warm-gray">Geen bestellingen voor vandaag.</p>
          </div>
        ) : (
          <ul className="divide-y divide-dotted divide-parchment">
            {todayOrders.map(o => {
              const isNext = nextSlot && nextSlot.key === o.key
              const isPast = o.time < nowHM && !(currentSlot && currentSlot.key === o.key)
              return (
                <li key={o.key} className={`px-5 py-3 flex items-center gap-4 ${isPast ? 'opacity-50' : ''}`}>
                  <span className={`font-serif tabular-nums text-lg w-14 ${isNext ? 'text-wine' : 'text-ink'}`}>{o.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-ink truncate">{o.name}</p>
                    <p className="font-serif italic text-xs text-warm-gray truncate">{o.order}</p>
                  </div>
                  <span className="font-serif text-sm text-wine tabular-nums shrink-0">{o.total}</span>
                  {isNext && (
                    <span className="font-sans text-[9px] tracking-[0.24em] uppercase text-wine shrink-0">Volgende</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Upcoming days */}
      {upcomingDates.length > 0 && (
        <div className="bg-white border border-parchment">
          <div className="px-5 py-4 border-b border-dashed border-parchment flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
              <span className="h-px w-5 bg-gold/40" />
              <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Komende dagen</p>
            </div>
            <button onClick={() => onNavigate('orders')}
              className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray hover:text-wine transition-colors">
              Alle bestellingen →
            </button>
          </div>
          <ul className="divide-y divide-dotted divide-parchment">
            {upcomingDates.map(([date, s]) => (
              <li key={date} className="px-5 py-3 flex items-center gap-4">
                <span className="font-serif italic text-sm text-ink flex-1 truncate">{formatLongDate(date)}</span>
                <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray tabular-nums">{s.count} best.</span>
                <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray tabular-nums hidden sm:inline">{s.pizzas} pz</span>
                <span className="font-serif text-sm text-wine tabular-nums w-20 text-right">€{s.revenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction label="Boodschappen" onClick={() => onNavigate('boodschappen')} />
        <QuickAction label="Pizza's" onClick={() => onNavigate('pizzas')} />
        <QuickAction label="Wijnen" onClick={() => onNavigate('wijnen')} />
        <QuickAction label="Instellingen" onClick={() => onNavigate('opening')} />
      </div>
    </div>
  )
}

function KpiTile({ label, value, hint }) {
  return (
    <div className="bg-white border border-parchment px-4 py-4">
      <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray">{label}</p>
      <p className="font-serif text-3xl text-ink tabular-nums leading-none mt-2">{value}</p>
      {hint && <p className="font-serif italic text-[11px] text-warm-gray mt-2 truncate">{hint}</p>}
    </div>
  )
}

function QuickAction({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="border border-parchment bg-white hover:border-wine hover:text-wine transition-colors px-4 py-3 font-sans text-[11px] tracking-[0.24em] uppercase text-ink text-left">
      {label} →
    </button>
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
    <div className="text-center py-20">
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto text-gold/40" aria-hidden="true">
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3" />
      </svg>
      <p className="font-serif italic text-warm-gray mt-4 text-sm">Geen bestellingen voor vandaag.</p>
      <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray-light mt-2">{formatLongDate(today)}</p>
    </div>
  )

  // Overall progress
  const allItems = todayOrders.flatMap(o => parseItems(o.order).map((it, i) => ({ key: o.key, ...it })))
  const doneCount = allItems.filter(it => isChecked(it.key, it.name, it.idx)).length

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="bg-white border border-parchment px-5 py-4">
        <div className="flex justify-between items-baseline mb-3">
          <span className="font-serif italic text-sm text-ink">{formatLongDate(today)}</span>
          <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray tabular-nums">{doneCount} / {allItems.length} klaar</span>
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
          <div key={time} className={`bg-white border transition-opacity ${allDone ? 'border-olive/40 opacity-60' : 'border-parchment'}`}>
            {/* Slot header */}
            <div className={`px-5 py-3 flex items-center justify-between border-b border-dashed ${allDone ? 'border-olive/20' : 'border-parchment'}`}>
              <div className="flex items-baseline gap-3">
                <span className={`font-serif text-2xl leading-none ${allDone ? 'text-olive' : 'text-wine'}`}>{time}</span>
                <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray">
                  {slotOrders.length} best. · {slotItems.length} pizza's
                </span>
              </div>
              {allDone && <span className="font-sans text-[10px] text-olive tracking-[0.24em] uppercase">Klaar</span>}
            </div>

            {/* Orders in this slot */}
            {slotOrders.map(order => {
              const items = parseItems(order.order)
              const orderDone = items.every(it => isChecked(order.key, it.name, it.idx))
              return (
                <div key={order.key} className={`border-b border-dotted border-parchment last:border-0 ${orderDone ? 'bg-parchment/20' : ''}`}>
                  <div className="px-5 pt-3 pb-1">
                    <p className={`font-serif text-base ${orderDone ? 'text-warm-gray line-through' : 'text-ink'}`}>{order.name}</p>
                  </div>
                  <div className="px-5 pb-3 space-y-1">
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
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-gold/70 mb-3">
            <span className="h-px w-12 bg-gold/30" />
            <span>✦</span>
            <span className="h-px w-12 bg-gold/30" />
          </div>
          <p className="font-serif italic text-2xl text-olive">Alle pizza's klaar!</p>
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
  const [query, setQuery] = useState('')

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

  function matchesQuery(o) {
    if (!query.trim()) return true
    const q = query.toLowerCase().trim()
    return (
      (o.name || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.order || '').toLowerCase().includes(q) ||
      (o.date || '').includes(q) ||
      (o.time || '').includes(q)
    )
  }

  const filtered = orders.filter(matchesQuery)
  const upcoming = [...filtered].filter(o => o.date >= today).sort((a,b) => a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
  const past     = [...filtered].filter(o => o.date <  today).sort((a,b) => b.date.localeCompare(a.date)||b.time.localeCompare(a.time))

  // KPI strip based on all orders (not filtered)
  const todayOrders = orders.filter(o => o.date === today)
  const upcomingAll = orders.filter(o => o.date >= today)
  const revenueUpcoming = upcomingAll.reduce((s, o) => s + parseTotal(o.total), 0)
  const pizzasUpcoming = upcomingAll.reduce((s, o) => s + parseQty(o.order), 0)

  if (loading) return <LoadingCards />
  if (!orders.length) return <Empty text="Nog geen bestellingen" />

  // Group upcoming by date
  const upcomingByDate = upcoming.reduce((acc, o) => {
    if (!acc[o.date]) acc[o.date] = []
    acc[o.date].push(o)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Vandaag" value={todayOrders.length} hint={todayOrders.length === 1 ? 'bestelling' : 'bestellingen'} />
        <KpiTile label="Komend" value={upcomingAll.length} hint="incl. vandaag" />
        <KpiTile label="Pizza's" value={pizzasUpcoming} hint="komend" />
        <KpiTile label="Omzet" value={`€${revenueUpcoming.toFixed(2)}`} hint="komend" />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-light pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Zoek op naam, e-mail, pizza, datum…"
          className="w-full bg-white border border-parchment pl-9 pr-9 py-2.5 text-sm text-ink focus:outline-none focus:border-olive transition-colors font-sans"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Wissen"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-gray-light hover:text-wine p-1">
            <X size={14} />
          </button>
        )}
      </div>

      {query && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="font-serif italic text-warm-gray text-sm">Geen bestellingen gevonden voor "{query}"</p>
        </div>
      )}

      {upcoming.length > 0 && <section className="space-y-8">
        {Object.entries(upcomingByDate).map(([date, dayOrders]) => (
          <div key={date}>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-serif italic text-wine text-sm leading-none shrink-0">N° ·</span>
                <span className="h-px w-5 bg-gold/40 shrink-0" />
                <span className="font-sans text-[11px] tracking-[0.28em] uppercase text-warm-gray truncate">{formatLongDate(date)}</span>
                <span className="h-px flex-1 bg-gold/20" />
              </div>
              <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray shrink-0 tabular-nums">{dayOrders.length} best.</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{dayOrders.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} onEdit={startEdit} />)}</div>
          </div>
        ))}
      </section>}
      {past.length > 0 && (
        <section>
          <button onClick={() => setPastOpen(v => !v)}
            className="w-full flex items-center justify-between mb-4 group">
            <span className="font-sans text-[11px] tracking-[0.28em] uppercase text-warm-gray">Voorbij ({past.length})</span>
            <span className="font-serif italic text-sm text-warm-gray-light group-hover:text-wine transition-colors">{pastOpen ? '▲ Inklappen' : '▼ Uitklappen'}</span>
          </button>
          {pastOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 opacity-60">
              {past.map(o => <OrderCard key={o.key} order={o} onCancel={cancelOrder} onEdit={startEdit} />)}
            </div>
          )}
        </section>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-cream w-full sm:max-w-sm max-h-[92vh] overflow-y-auto border border-parchment">
            <div className="px-5 py-5 border-b border-dashed border-parchment flex justify-between items-start gap-3">
              <div>
                <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-1">N° · Bewerken</p>
                <h3 className="font-serif italic text-2xl text-ink leading-tight">Bestelling wijzigen</h3>
                <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mt-1">{editing.time} · {formatShortDate(editing.date)}</p>
              </div>
              <button onClick={() => setEditing(null)} aria-label="Sluiten" className="text-warm-gray-light hover:text-wine text-2xl leading-none -mt-1">×</button>
            </div>
            <form onSubmit={saveEdit} className="p-5 space-y-3">
              <div>
                <label className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray block mb-2">Naam</label>
                <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray block mb-2">E-mail</label>
                <input type="email" required value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray block mb-2">Bestelling</label>
                <textarea required rows={3} value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))}
                  className={INPUT + ' resize-none'} />
              </div>
              <div>
                <label className="font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray block mb-2">Totaal</label>
                <input required value={editForm.total} onChange={e => setEditForm(f => ({ ...f, total: e.target.value }))} className={INPUT} />
              </div>
              <div className="flex gap-2 pt-2">
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

function normName(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents (é → e, ï → i, …)
    .replace(/['’`´]/g, '')             // strip apostrophes
    .replace(/\s+/g, ' ')
    .trim()
}

// Loose categorisation for the shopping list. Keyword-based so it also works
// for onbekende/vrij ingetikte ingrediënten. First match wins.
const SHOP_CATEGORIES = [
  { key: 'vlees',    label: 'Vlees & vis',      keywords: ['ham', 'salami', 'spek', 'prosciutto', 'pancetta', 'worst', 'chorizo', 'kip', 'tonijn', 'zalm', 'ansjovis', 'vis', 'gehakt', 'bacon', 'speck', 'kalkoen', 'vlees'] },
  { key: 'kaas',     label: 'Kaas & zuivel',    keywords: ['kaas', 'mozzarella', 'parmezaan', 'parmigiano', 'gorgonzola', 'ricotta', 'feta', 'pecorino', 'burrata', 'gruyere', 'cheddar', 'mascarpone', 'room', 'boter', 'melk', 'yoghurt'] },
  { key: 'groente',  label: 'Groenten & fruit', keywords: ['tomaat', 'ui', 'knoflook', 'look', 'paprika', 'champignon', 'olijf', 'aubergine', 'courgette', 'spinazie', 'rucola', 'artisjok', 'kappertjes', 'prei', 'peper', 'basilicum', 'oregano', 'tijm', 'rozemarijn', 'peterselie', 'kruid', 'ananas', 'vijg', 'peer'] },
  { key: 'basis',    label: 'Basis & saus',     keywords: ['bloem', 'deeg', 'saus', 'tomatensaus', 'passata', 'olie', 'olijfolie', 'zout', 'suiker', 'gist', 'pesto', 'balsamico', 'azijn'] },
]

function categoryFor(name) {
  const n = normName(name)
  for (const c of SHOP_CATEGORIES) {
    if (c.keywords.some(k => n.includes(k))) return c
  }
  return { key: 'overig', label: 'Overig', keywords: [] }
}

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
  if (!upcomingDates.length) return <Empty text="Geen aankomende bestellingen" />

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
      <div className="px-5 py-4 border-b border-dashed border-parchment flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
          <span className="h-px w-5 bg-gold/40" />
          <p className="font-sans text-[11px] tracking-[0.28em] uppercase text-warm-gray">Boodschappenlijst</p>
        </div>
        <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray tabular-nums">{doneCount}/{ingredients.length}</span>
      </div>

      {dates.length > 1 && (
        <div className="flex border-b border-parchment overflow-x-auto">
          {dates.map(date => (
            <button key={date} onClick={() => selectDate(date)}
              className={`flex-1 px-3 py-3 font-sans text-[11px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors ${selectedDate === date ? 'bg-wine text-cream' : 'text-warm-gray hover:bg-parchment/50'}`}>
              {formatShortDate(date)}
            </button>
          ))}
        </div>
      )}

      {ingredients.length === 0 ? (
        <p className="px-5 py-6 font-serif italic text-sm text-warm-gray text-center">Geen ingrediënten gevonden. Controleer of de pizza's ingrediënten hebben ingesteld.</p>
      ) : (
        (() => {
          const grouped = ingredients.reduce((acc, [name, qty]) => {
            const cat = categoryFor(name)
            if (!acc[cat.key]) acc[cat.key] = { label: cat.label, items: [] }
            acc[cat.key].items.push([name, qty])
            return acc
          }, {})
          const catOrder = ['vlees', 'kaas', 'groente', 'basis', 'overig']
          return (
            <div>
              {catOrder.filter(k => grouped[k]).map(k => {
                const group = grouped[k]
                const groupDone = group.items.filter(([n]) => checked[n]).length
                return (
                  <div key={k}>
                    <div className="px-5 py-2 bg-parchment/40 flex items-center justify-between border-t border-dotted border-parchment first:border-t-0">
                      <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray">{group.label}</p>
                      <span className="font-sans text-[10px] tabular-nums text-warm-gray-light">{groupDone}/{group.items.length}</span>
                    </div>
                    <div className="divide-y divide-dotted divide-parchment">
                      {group.items.map(([name, qty]) => {
                        const done = !!checked[name]
                        return (
                          <button key={name} onClick={() => toggle(name)}
                            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-parchment/40 ${done ? 'bg-parchment/30' : ''}`}>
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-olive border-olive' : 'border-warm-gray-light'}`}>
                              {done && <span className="text-cream text-xs leading-none">✓</span>}
                            </span>
                            <span className={`font-sans text-base flex-1 capitalize transition-colors ${done ? 'line-through text-warm-gray-light' : 'text-ink'}`}>{name}</span>
                            <span className={`font-serif text-xl shrink-0 tabular-nums transition-colors ${done ? 'text-warm-gray-light' : 'text-wine'}`}>{qty}×</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()
      )}

      <div className="px-5 py-4 border-t border-dashed border-parchment space-y-3">
        {/* Pizza breakdown toggle */}
        <button onClick={() => setShowPizzas(v => !v)}
          className="w-full flex items-center justify-between font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray hover:text-wine transition-colors">
          <span>{totalPizzas} pizza's · {pizzas.length} soorten</span>
          <span className="font-serif italic tracking-normal text-sm normal-case">{showPizzas ? '▲' : '▼'}</span>
        </button>
        {showPizzas && (
          <ul className="space-y-1 pt-1">
            {pizzas.map(([name, qty]) => (
              <li key={name} className="flex justify-between font-sans text-xs text-warm-gray">
                <span>{name}</span><span className="tabular-nums">{qty}×</span>
              </li>
            ))}
          </ul>
        )}
        {/* Unmatched pizza names — naam in bestelling ≠ naam in database */}
        {unmatched.length > 0 && (
          <div className="pt-3 border-t border-dotted border-parchment">
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-wine mb-2">Ingrediënten onbekend voor</p>
            {unmatched.map(name => (
              <p key={name} className="font-serif italic text-xs text-warm-gray">· {name}</p>
            ))}
            <p className="font-sans text-[10px] text-warm-gray-light mt-2">Controleer of de naam in de Pizza's-tab exact overeenkomt.</p>
          </div>
        )}
        {doneCount > 0 && (
          <button onClick={reset} className="font-sans text-[11px] tracking-[0.24em] uppercase text-wine hover:text-wine-light transition-colors">
            Reset afvinklijst
          </button>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, onCancel, onEdit }) {
  return (
    <div className="bg-white border border-parchment hover:border-gold/40 transition-colors">
      <div className="flex items-stretch">
        <div className="px-4 py-3 text-center shrink-0 min-w-[72px] border-r border-dashed border-parchment flex flex-col items-center justify-center">
          <div className="font-serif text-2xl text-wine leading-none tabular-nums">{order.time}</div>
          <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-1.5">{formatShortDate(order.date)}</div>
        </div>
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-serif text-base text-ink leading-tight">{order.name}</p>
              <p className="font-sans text-xs text-warm-gray truncate mt-0.5">{order.email}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => onEdit(order)} aria-label="Wijzigen" className="text-warm-gray-light hover:text-wine transition-colors p-1">✎</button>
              <button onClick={() => onCancel(order.key)} aria-label="Annuleren" className="text-warm-gray-light hover:text-wine transition-colors p-1">✕</button>
            </div>
          </div>
          <p className="font-sans text-xs italic text-warm-gray mt-2 leading-relaxed break-words">{order.order}</p>
          <p className="font-serif text-base text-wine mt-1.5 tabular-nums">{order.total}</p>
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
    setForm({ name: p.name, ingredients: ings, allergens: Array.isArray(p.allergens) ? p.allergens : [], price: String(p.price), emoji: p.emoji, imageUrl: p.imageUrl||'', suggestion: !!p.suggestion })
    setIngInput('')
  }
  function startNew() { setEditing('new'); setForm({ name:'', ingredients:[], allergens:[], price:'', emoji:'🍕', imageUrl:'', suggestion: false }); setIngInput('') }

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
    const updated = { ...form, price: parseFloat(form.price), description: form.ingredients.join(', '), allergens: form.allergens, suggestion: form.suggestion }
    let newList
    if (editing === 'new') { const maxId = pizzas.reduce((m,p) => Math.max(m,p.id), 0); newList = [...pizzas, { id: maxId+1, ...updated }] }
    else newList = pizzas.map(p => p.id===editing ? {...p,...updated} : p)
    await save(newList); setEditing(null)
  }

  async function deletePizza(id) { if (!confirm('Pizza verwijderen?')) return; await save(pizzas.filter(p => p.id!==id)) }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {pizzas.map(pizza => (
        <div key={pizza.id} className="bg-white border border-parchment flex items-stretch gap-3 overflow-hidden">
          {pizza.imageUrl
            ? <img src={pizza.imageUrl} alt={pizza.name} className="w-20 h-auto object-cover shrink-0" />
            : <div className="w-20 bg-parchment flex items-center justify-center text-3xl shrink-0 border-r border-dashed border-warm-gray-light/50">{pizza.emoji}</div>
          }
          <div className="flex-1 min-w-0 py-3 pr-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif text-ink">{pizza.name}</p>
              {pizza.suggestion && <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-wine/10 text-wine px-2 py-0.5">Suggestie</span>}
            </div>
            <p className="font-sans text-xs italic text-warm-gray truncate mt-0.5">
              {Array.isArray(pizza.ingredients) ? pizza.ingredients.join(' · ') : pizza.description}
            </p>
            <p className="font-serif text-wine mt-1 tabular-nums">€{pizza.price.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-1 p-3 shrink-0 border-l border-dashed border-warm-gray-light/50">
            <button onClick={() => startEdit(pizza)} className="font-sans text-[10px] tracking-[0.2em] uppercase text-ink bg-parchment px-3 py-1.5 hover:bg-gold/20 transition-colors">Bewerk</button>
            <button onClick={() => deletePizza(pizza.id)} className="font-sans text-[10px] tracking-[0.2em] uppercase text-wine bg-wine/5 px-3 py-1.5 hover:bg-wine/10 transition-colors">Verwijder</button>
          </div>
        </div>
      ))}
      </div>

      <button onClick={startNew} className="btn-primary w-full">+ Pizza toevoegen</button>

      {/* Globale ingrediëntenlijst beheren */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
          <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
          <span className="h-px w-5 bg-gold/40" />
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Ingrediëntenlijst</p>
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
            <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/60 flex justify-between items-center bg-cream">
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
                <span className="h-px w-5 bg-gold/40" />
                <h3 className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">{editing==='new' ? 'Nieuwe pizza' : 'Bewerken'}</h3>
              </div>
              <button onClick={()=>setEditing(null)} className="text-warm-gray hover:text-wine text-2xl leading-none">×</button>
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
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.suggestion} onChange={e=>setForm(f=>({...f,suggestion:e.target.checked}))} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.suggestion ? 'bg-wine' : 'bg-parchment'}`} />
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.suggestion ? 'left-5' : 'left-0.5'}`} />
                </div>
                <div>
                  <p className="font-sans text-sm text-ink">Suggestie</p>
                  <p className="font-sans text-xs text-warm-gray">Verschijnt als suggestie bovenaan het menu</p>
                </div>
              </label>
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

// ─── Wijnen ────────────────────────────────────────────────────────────────

function WijnenTab({ password }) {
  const [wines, setWines]           = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState({ name: '', type: 'rood', price: '', description: '', tags: [] })

  useEffect(() => {
    Promise.all([
      fetch('/api/wines').then(r => r.json()),
      fetch('/api/ingredients').then(r => r.json()),
    ]).then(([w, ings]) => {
      setWines(Array.isArray(w) ? w : [])
      setAllIngredients(Array.isArray(ings) ? ings : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function save(list) {
    await fetch('/api/wines', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify(list) })
    setWines(list)
  }

  function startEdit(w) {
    setEditing(w.id)
    setForm({ name: w.name, type: w.type, price: String(w.price), description: w.description || '', tags: w.tags || [] })
  }
  function startNew() { setEditing('new'); setForm({ name: '', type: 'rood', price: '', description: '', tags: [] }) }

  async function saveEdit(e) {
    e.preventDefault()
    const updated = { ...form, price: parseFloat(form.price) }
    let newList
    if (editing === 'new') { const maxId = wines.reduce((m, w) => Math.max(m, w.id), 0); newList = [...wines, { id: maxId + 1, ...updated }] }
    else newList = wines.map(w => w.id === editing ? { ...w, ...updated } : w)
    await save(newList); setEditing(null)
  }

  async function deleteWine(id) {
    if (!confirm('Wijn verwijderen?')) return
    await save(wines.filter(w => w.id !== id))
  }

  const TYPE_STYLE = {
    rood: 'bg-wine/10 text-wine',
    wit:  'bg-gold/20 text-warm-gray',
    rosé: 'bg-pink-50 text-pink-400',
  }

  if (loading) return <LoadingCards />

  return (
    <div className="space-y-5">
      {wines.length === 0 && <Empty icon="🍷" text="Nog geen wijnen toegevoegd" />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {wines.map(wine => (
          <div key={wine.id} className="bg-white border border-parchment flex items-stretch gap-3 overflow-hidden">
            <div className="flex-1 min-w-0 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-serif text-ink">{wine.name}</p>
                <span className={`font-sans text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 ${TYPE_STYLE[wine.type] || ''}`}>{wine.type}</span>
              </div>
              {wine.description && <p className="font-sans text-xs italic text-warm-gray mt-0.5">{wine.description}</p>}
              <p className="font-serif text-wine mt-1 tabular-nums">€{wine.price.toFixed(2)}</p>
              {wine.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {wine.tags.map(tag => <span key={tag} className="font-sans text-[10px] bg-parchment text-warm-gray px-1.5 py-0.5">{tag}</span>)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 p-3 shrink-0 border-l border-dashed border-warm-gray-light/50">
              <button onClick={() => startEdit(wine)} className="font-sans text-[10px] tracking-[0.2em] uppercase text-ink bg-parchment px-3 py-1.5 hover:bg-gold/20 transition-colors">Bewerk</button>
              <button onClick={() => deleteWine(wine.id)} className="font-sans text-[10px] tracking-[0.2em] uppercase text-wine bg-wine/5 px-3 py-1.5 hover:bg-wine/10 transition-colors">Verwijder</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={startNew} className="btn-primary w-full">+ Wijn toevoegen</button>

      {editing !== null && (
        <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50">
          <div className="bg-cream w-full sm:max-w-sm max-h-[92vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/60 flex justify-between items-center bg-cream">
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
                <span className="h-px w-5 bg-gold/40" />
                <h3 className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">{editing === 'new' ? 'Nieuwe wijn' : 'Bewerken'}</h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-warm-gray hover:text-wine text-2xl leading-none">×</button>
            </div>
            <form onSubmit={saveEdit} className="p-5 space-y-3">
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Naam</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Chianti Classico" className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-2">Type</label>
                <div className="flex gap-2">
                  {['rood', 'wit', 'rosé'].map(t => (
                    <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 text-xs font-sans border transition-colors capitalize ${form.type === t ? 'bg-olive text-cream border-olive' : 'bg-white text-ink border-parchment hover:border-olive'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Omschrijving</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Droge Italiaanse rode wijn" className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-1">Prijs</label>
                <input required type="number" step="0.50" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="€" className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray block mb-2">Past bij</label>
                <p className="font-sans text-xs text-warm-gray italic mb-2">Selecteer ingrediënten waarmee deze wijn past</p>
                <div className="flex flex-wrap gap-1">
                  {allIngredients.map(ing => {
                    const active = form.tags.includes(ing.name)
                    return (
                      <button type="button" key={ing.name}
                        onClick={() => setForm(f => ({ ...f, tags: active ? f.tags.filter(t => t !== ing.name) : [...f.tags, ing.name] }))}
                        className={`text-xs px-2.5 py-1 border transition-colors ${active ? 'bg-wine text-cream border-wine' : 'bg-white text-ink border-parchment hover:border-wine/40'}`}>
                        {ing.name}
                      </button>
                    )
                  })}
                </div>
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

// ─── Opening Days ──────────────────────────────────────────────────────────

function OpeningTab({ password }) {
  const [days, setDays]       = useState([])
  const [regs, setRegs]       = useState({ count: 0, max: 20, openFrom: 16, registrationDate: '', registrationOpen: false })
  const [regList, setRegList] = useState([])
  const [newDate, setNewDate] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [regDate, setRegDate] = useState('')
  const [savingCfg, setSavingCfg] = useState(false)
  const [siteSettings, setSiteSettings] = useState({ openingHour: 17, closingHour: 22, pizzasPerSlot: 3, wijnEnabled: false })
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
    <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

      {/* ── Left column ── */}
      <div className="space-y-5">

      {/* Modus schakelaar */}
      <div className="bg-white border border-parchment px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <span className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Modus</span>
          </div>
          <p className="font-serif text-ink text-lg leading-tight">
            {regs.registrationOpen ? 'Registratiemodus' : 'Bestelmodus'}
          </p>
          <p className="font-sans text-xs italic text-warm-gray mt-0.5">
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
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
          <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
          <span className="h-px w-5 bg-gold/40" />
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Openingsuren & capaciteit</p>
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
          <label className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="font-sans text-sm text-ink">Wijnsectie tonen</p>
              <p className="font-sans text-xs text-warm-gray mt-0.5">Wijn­aanbevelingen zichtbaar in het winkelmandje</p>
            </div>
            <button type="button" onClick={() => setSiteSettings(s => ({ ...s, wijnEnabled: !s.wijnEnabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${siteSettings.wijnEnabled ? 'bg-wine' : 'bg-parchment'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${siteSettings.wijnEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
          <button type="submit" disabled={savingSettings} className="btn-primary w-full">
            {savingSettings ? 'Bezig...' : 'Opslaan'}
          </button>
        </form>
      </div>

      </div>{/* end left column */}

      {/* ── Right column ── */}
      <div className="space-y-5">

      {/* Registratie configuratie */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
          <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
          <span className="h-px w-5 bg-gold/40" />
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Registratie voor openingsdag</p>
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
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Gereserveerde pizza's</p>
          </div>
          <span className={`font-serif text-lg tabular-nums shrink-0 ${regs.count >= regs.openFrom ? 'text-olive' : 'text-wine'}`}>
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
          <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Ingeschreven ({regList.length})</p>
          </div>
          <ul>
            {regList.map((r, i) => (
              <li key={i} className="px-5 py-3 flex items-center gap-3 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-ink">{r.name}</p>
                  <p className="font-sans text-xs italic text-warm-gray truncate">{r.email}</p>
                </div>
                <span className="font-serif text-wine shrink-0 tabular-nums">{r.pizzas || 1}×</span>
                <button onClick={() => deleteRegistration(r.email)} className="text-warm-gray-light hover:text-wine transition-colors shrink-0 p-1">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Openingsdagen */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
          <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
          <span className="h-px w-5 bg-gold/40" />
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Openingsdagen</p>
        </div>
        {days.length === 0
          ? <p className="px-5 py-4 font-serif italic text-sm text-warm-gray">Nog geen openingsdagen gepland.</p>
          : <ul>
              {days.map(d => (
                <li key={d.date} className="px-5 py-3 flex items-center justify-between gap-3 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
                  <div className="min-w-0">
                    <p className="font-serif text-ink">{formatLongDate(d.date)}</p>
                    {d.label && <p className="font-sans text-xs italic text-warm-gray">{d.label}</p>}
                  </div>
                  <button onClick={() => removeDay(d.date)} className="text-warm-gray-light hover:text-wine transition-colors shrink-0 p-1">✕</button>
                </li>
              ))}
            </ul>
        }
        <form onSubmit={addDay} className="px-5 py-4 border-t border-dashed border-warm-gray-light/50 space-y-2">
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray mb-2">Dag toevoegen</p>
          <input type="date" required value={newDate} onChange={e=>setNewDate(e.target.value)} className={INPUT} />
          <input type="text" value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Optionele notitie (bv. 'Zomer editie')" className={INPUT} />
          <button type="submit" className="btn-primary w-full">Dag toevoegen</button>
        </form>
      </div>

      </div>{/* end right column */}
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
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

      {/* ── Left column: Per avond ── */}
      <div className="space-y-6">
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
                  <div className="px-4 py-3 border-b border-dashed border-warm-gray-light/50 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-serif italic text-wine text-xs leading-none">N° ·</span>
                        <span className="h-px w-4 bg-gold/40" />
                      </div>
                      <p className="font-serif text-ink break-words">{formatLongDate(day.date)}</p>
                      {day.label && <p className="font-sans text-xs italic text-warm-gray">{day.label}</p>}
                    </div>
                    <span className={`font-serif text-xl shrink-0 tabular-nums ${result >= 0 ? 'text-olive' : 'text-wine'}`}>
                      {result >= 0 ? '+' : ''}€{result.toFixed(2)}
                    </span>
                  </div>
                  {/* Samenvatting */}
                  <div className="px-4 py-3 space-y-1 border-b border-dashed border-warm-gray-light/50">
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-warm-gray">Omzet</span>
                      <span className="font-serif text-ink tabular-nums">
                        €{revenue.toFixed(2)}
                        <span className="font-sans text-xs italic text-warm-gray ml-1">({dayOrders.length} best.)</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-warm-gray">Uitgaven</span>
                      <span className="font-serif text-ink tabular-nums">−€{totalExp.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Uitgavenlijst */}
                  {dayExp.length > 0 && (
                    <ul className="border-b border-dashed border-warm-gray-light/50">
                      {dayExp.map(exp => (
                        <li key={exp.id} className="px-4 py-2 flex items-center justify-between gap-2 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
                          <span className="font-sans text-xs text-ink min-w-0 truncate">{exp.description}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-sans text-xs text-warm-gray tabular-nums">€{parseFloat(exp.amount).toFixed(2)}</span>
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
                        className="font-serif italic text-sm text-warm-gray hover:text-wine transition-colors">
                        + Uitgave toevoegen
                      </button>
                    </div>
                  )}
                </div>
              )
            })
        }
      </div>

      </div>{/* end left column */}

      {/* ── Right column: Marge + Kosten ── */}
      <div className="space-y-6">
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
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dotted border-warm-gray-light/40">
                  <span className="text-lg shrink-0">{pizza.emoji}</span>
                  <span className="font-serif text-ink flex-1 min-w-0 truncate">{pizza.name}</span>
                  <span className={`font-sans text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 shrink-0 tabular-nums ${pct >= 40 ? 'bg-olive/10 text-olive' : 'bg-wine/10 text-wine'}`}>{pct.toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-parchment/50 p-2">
                    <div className="font-sans text-[9px] text-warm-gray uppercase tracking-[0.2em] mb-0.5">Geschat</div>
                    <div className="font-serif text-base text-ink tabular-nums">€{est.toFixed(2)}</div>
                  </div>
                  <div className="bg-parchment/50 p-2">
                    <div className="font-sans text-[9px] text-warm-gray uppercase tracking-[0.2em] mb-0.5">Prijs</div>
                    <div className="font-serif text-base text-ink tabular-nums">€{pizza.price.toFixed(2)}</div>
                  </div>
                  <div className={`p-2 ${margin >= 0 ? 'bg-olive/10' : 'bg-wine/10'}`}>
                    <div className="font-sans text-[9px] text-warm-gray uppercase tracking-[0.2em] mb-0.5">Winst</div>
                    <div className={`font-serif text-base tabular-nums ${margin >= 0 ? 'text-olive' : 'text-wine'}`}>€{margin.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="font-serif italic text-xs text-warm-gray mt-3">Geschatte kostprijs = basiskosten + som ingrediëntkosten. Verkoopprijs stel je zelf in bij Pizza's.</p>
      </div>

      {/* ── Kostprijs ingrediënten ── */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50">
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Kostprijs ingrediënten</p>
          </div>
          <p className="font-serif italic text-xs text-warm-gray mt-2">Kostprijs per portie/stuk. Wijzigingen worden automatisch opgeslagen.</p>
          <p className="font-serif italic text-xs text-wine mt-1">Let op: ingrediënten die al in de basiskosten zitten (bv. kaas/mozzarella, saus/tomatensaus) hier op €0 laten om dubbeltelling te vermijden.</p>
        </div>
        <div>
          {ingredients.map(ing => (
            <div key={ing.name} className="flex items-center gap-3 px-4 py-2 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
              <span className="flex-1 font-sans text-sm text-ink capitalize">{ing.name}</span>
              <div className="flex items-center border border-parchment w-24 shrink-0">
                <span className="px-2 py-2 bg-parchment/50 text-warm-gray text-xs">€</span>
                <input type="number" step="0.05" min="0"
                  value={ing.cost > 0 ? ing.cost : ''}
                  onChange={e => setIngredients(prev => prev.map(i => i.name === ing.name ? { ...i, cost: e.target.value } : i))}
                  onBlur={e => saveIngCost(ing.name, e.target.value)}
                  placeholder="0.00"
                  className="w-full py-2 px-2 text-sm text-right focus:outline-none bg-white tabular-nums" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Basiskosten ── */}
      <div className="bg-white border border-parchment">
        <div className="px-5 py-4 border-b border-dashed border-warm-gray-light/50">
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-5 bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Basiskosten per pizza</p>
          </div>
          <p className="font-serif italic text-xs text-warm-gray mt-2">Vaste kosten die voor elke pizza gelden (deeg, saus, oven).</p>
        </div>
        <form onSubmit={saveBaseCosts} className="p-5 space-y-3">
          {Object.entries(COST_LABELS).map(([key, { label, icon }]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xl w-7">{icon}</span>
              <span className="flex-1 font-sans text-sm text-warm-gray">{label}</span>
              <div className="flex items-center border border-parchment w-24 shrink-0">
                <span className="px-2 py-2 bg-parchment/50 text-warm-gray text-xs">€</span>
                <input type="number" step="0.05" min="0" value={baseCosts[key]}
                  onChange={e => setBaseCosts(c => ({ ...c, [key]: e.target.value }))}
                  className="w-full py-2 px-2 text-sm text-right focus:outline-none bg-white tabular-nums" />
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-dashed border-warm-gray-light/50">
            <span className="font-sans text-[10px] text-warm-gray uppercase tracking-[0.2em]">Totaal basis</span>
            <span className="font-serif text-ink tabular-nums">€{baseCostTotal.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={savingBase} className="btn-primary w-full">
            {savedBase ? '✓ Opgeslagen' : savingBase ? 'Bezig...' : 'Opslaan'}
          </button>
        </form>
      </div>

      </div>{/* end right column */}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function LoadingCards() {
  return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-white border border-parchment h-20 animate-pulse motion-reduce:animate-none"/>)}</div>
}
function Empty({ text }) {
  return (
    <div className="text-center py-20">
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto text-gold/40" aria-hidden="true">
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3" />
      </svg>
      <p className="font-serif italic text-warm-gray mt-4 text-sm">{text}</p>
    </div>
  )
}
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 font-sans text-[10px] tracking-[0.32em] uppercase text-gold mb-4">
      <span className="font-serif italic text-wine tracking-normal text-sm leading-none">N° ·</span>
      <span className="h-px w-5 bg-gold/40" />
      <span className="text-warm-gray">{children}</span>
      <span className="h-px flex-1 bg-gold/20" />
    </div>
  )
}
function formatShortDate(d) { return new Date(d).toLocaleDateString('nl-BE',{day:'numeric',month:'short'}) }
function formatLongDate(d)  { return new Date(d).toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) }
