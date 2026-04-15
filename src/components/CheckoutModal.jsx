import { useState, useEffect } from 'react'
import { Wine } from 'lucide-react'

export default function CheckoutModal({ items, wineCart = [], wines = [], wijnEnabled = false, onAddWine, onRemoveWine, slots, onClose, onSuccess, onAdd, onRemove, currency, settings }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(slots[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then(d => { setBookedSlots(d); setSlotsLoading(false) })
      .catch(() => setSlotsLoading(false))
  }, [])

  const pizzasPerSlot = settings?.pizzasPerSlot ?? 3
  const totalPizzas = items.reduce((sum, i) => sum + i.quantity, 0)
  const slotsNeeded = Math.ceil(totalPizzas / pizzasPerSlot)
  const pizzaTotal = items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0)
  const wineTotal  = wineCart.reduce((sum, i) => sum + i.wine.price * i.quantity, 0)
  const total = pizzaTotal + wineTotal

  const cartIngredients = items.flatMap(i => Array.isArray(i.pizza.ingredients) ? i.pizza.ingredients : [])
  const suggestedWines = wijnEnabled && cartIngredients.length > 0
    ? wines.filter(w => w.tags?.some(tag =>
        cartIngredients.some(ing => ing.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ing.toLowerCase()))
      ))
    : []
  function wineQty(id) { return wineCart.find(i => i.wine.id === id)?.quantity ?? 0 }
  const availableDates = [...new Set(slots.map(s => s.date))]
  const slotsForDate = slots.filter(s => s.date === selectedDate)
  const orderText = [
    ...items.map(i => `${i.quantity}x ${i.pizza.name} (${currency}${(i.pizza.price * i.quantity).toFixed(2)})`),
    ...wineCart.map(i => `${i.quantity}x ${i.wine.name} (${currency}${(i.wine.price * i.quantity).toFixed(2)})`),
  ].join(', ')

  function isBooked(date, time) { return bookedSlots.includes(`${date}_${time}`) }

  function isGroupAvailable(slotIdx) {
    for (let i = 0; i < slotsNeeded; i++) {
      const s = slotsForDate[slotIdx + i]
      if (!s || isBooked(selectedDate, s.time)) return false
    }
    return true
  }

  function isInSelectedRange(time) {
    if (!selectedSlot) return false
    const idx = slotsForDate.findIndex(s => s.time === selectedSlot)
    return slotsForDate.slice(idx, idx + slotsNeeded).some(s => s.time === time)
  }

  function getSelectedTimeslots() {
    const idx = slotsForDate.findIndex(s => s.time === selectedSlot)
    return slotsForDate.slice(idx, idx + slotsNeeded).map(s => s.time)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSlot) { setError('Kies een tijdslot.'); return }
    setError(''); setLoading(true)
    try {
      const timeslots = getSelectedTimeslots()
      const slotRes = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, timeslots, name, email, order: orderText, total: `${currency}${total.toFixed(2)}` }),
      })
      if (slotRes.status === 409) {
        setError('Dit tijdslot is net geboekt. Kies een ander.')
        setBookedSlots(prev => [...prev, `${selectedDate}_${selectedSlot}`])
        setSelectedSlot('')
        setLoading(false)
        return
      }
      if (!slotRes.ok) throw new Error('Slot booking failed')
      const slotData = await slotRes.json()

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'confirmation',
          name, email,
          order: orderText,
          date: selectedDate,
          timeslot: selectedSlot,
          total: `${currency}${total.toFixed(2)}`,
          cancelToken: slotData.cancelToken,
        }),
      }).catch(() => {})

      onSuccess({ name, email, date: selectedDate, timeslot: selectedSlot, timeslots, total })
    } catch (err) {
      console.error('Submit error:', err)
      setError('Er ging iets mis. Probeer opnieuw.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-cream w-full sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="bg-olive px-6 py-5 flex items-start justify-between">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold/70 mb-1">Bevestig</p>
            <h2 className="font-serif text-2xl text-cream italic">Uw bestelling</h2>
          </div>
          <button onClick={onClose} className="text-cream/50 hover:text-cream text-2xl leading-none mt-1">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order summary */}
          <div className="border border-parchment bg-white">
            <div className="px-4 py-3 border-b border-parchment">
              <p className="font-sans text-xs tracking-widest uppercase text-warm-gray">Overzicht</p>
            </div>
            <ul className="divide-y divide-parchment">
              {items.map(({ pizza, quantity }) => (
                <li key={pizza.id} className="px-4 py-2 flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink">{pizza.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onRemove(pizza)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                    <span className="font-sans text-sm w-4 text-center">{quantity}</span>
                    <button type="button" onClick={() => onAdd(pizza)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                  </div>
                  <span className="text-sm text-wine w-14 text-right">{currency}{(pizza.price * quantity).toFixed(2)}</span>
                </li>
              ))}
              {wineCart.map(({ wine, quantity }) => (
                <li key={`w-${wine.id}`} className="px-4 py-2 flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink">{wine.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onRemoveWine?.(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                    <span className="font-sans text-sm w-4 text-center">{quantity}</span>
                    <button type="button" onClick={() => onAddWine?.(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                  </div>
                  <span className="text-sm text-wine w-14 text-right">{currency}{(wine.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            {suggestedWines.length > 0 && (
              <div className="border-t-2 border-wine">
                <div className="px-4 py-2.5 bg-wine/5 flex items-center gap-2">
                  <Wine size={13} className="text-wine" />
                  <p className="font-sans text-xs tracking-widest uppercase text-wine font-semibold">Wijn erbij?</p>
                </div>
                <ul className="divide-y divide-wine/10 bg-wine/5">
                  {suggestedWines.map(wine => {
                    const qty = wineQty(wine.id)
                    return (
                      <li key={wine.id} className="px-4 py-2 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-ink">{wine.name}</p>
                          {wine.description && <p className="font-sans text-xs text-warm-gray truncate">{wine.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {qty === 0 ? (
                            <button type="button" onClick={() => onAddWine?.(wine)}
                              className="font-sans text-xs border border-wine text-wine px-3 py-1 hover:bg-wine hover:text-cream transition-colors">
                              {currency}{wine.price.toFixed(2)}
                            </button>
                          ) : (
                            <>
                              <button type="button" onClick={() => onRemoveWine?.(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                              <span className="font-sans text-sm w-4 text-center">{qty}</span>
                              <button type="button" onClick={() => onAddWine?.(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                              <span className="font-sans text-xs text-wine w-14 text-right">{currency}{(wine.price * qty).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="px-4 py-3 border-t border-parchment flex justify-between">
              <span className="font-sans text-xs tracking-widest uppercase text-warm-gray">Totaal</span>
              <span className="font-serif text-lg text-wine">{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date */}
            {availableDates.length > 1 && (
              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Datum</label>
                <div className="flex gap-2 flex-wrap">
                  {availableDates.map(date => (
                    <button type="button" key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
                      className={`px-4 py-2 text-xs font-sans tracking-wide border transition-colors ${selectedDate === date ? 'bg-olive text-cream border-olive' : 'bg-white text-ink border-parchment hover:border-olive'}`}>
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time slots */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-sans text-xs tracking-widest uppercase text-warm-gray">Tijdslot</label>
                {slotsNeeded > 1 && (
                  <span className="font-sans text-xs text-warm-gray italic">
                    {totalPizzas} pizza's · {slotsNeeded} slots ({slotsNeeded * 15} min)
                  </span>
                )}
              </div>
              {slotsLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-9 bg-parchment animate-pulse motion-reduce:animate-none" />
                  ))}
                </div>
              ) : slotsForDate.length === 0 ? (
                <p className="text-sm text-wine italic">Geen tijdsloten beschikbaar.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {slotsForDate.map((slot, idx) => {
                    const booked = isBooked(selectedDate, slot.time)
                    const groupOk = !booked && isGroupAvailable(idx)
                    const inRange = isInSelectedRange(slot.time)
                    return (
                      <button type="button" key={slot.time}
                        disabled={!groupOk && !inRange}
                        onClick={() => groupOk && setSelectedSlot(slot.time)}
                        className={`py-2.5 text-xs font-sans border transition-colors ${
                          inRange ? 'bg-olive text-cream border-olive'
                          : !groupOk ? 'bg-parchment/50 text-warm-gray-light border-parchment cursor-not-allowed line-through'
                          : 'bg-white text-ink border-parchment hover:border-olive'
                        }`}
                      >{slot.time}</button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Naam</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Uw naam"
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
            </div>

            {/* Email */}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="uw@email.be"
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
            </div>

            {error && <p className="text-xs text-wine italic">{error}</p>}

            <button type="submit" disabled={loading || slotsLoading} className="btn-primary w-full">
              {loading ? 'Even geduld...' : 'Bestelling bevestigen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })
}
