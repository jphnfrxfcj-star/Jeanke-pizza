import { useState, useEffect, useRef } from 'react'
import { Wine, Pizza } from 'lucide-react'

export default function CheckoutModal({ items, wineCart = [], wines = [], wijnEnabled = false, onAddWine, onRemoveWine, slots, onClose, onSuccess, onAdd, onRemove, currency, settings }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(slots[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const dialogRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector('button')?.focus()
    function onKeyDown(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKeyDown) }
  }, [onClose])

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
  function wineQty(id) { return wineCart.find(i => i.wine.id === id)?.quantity ?? 0 }
  const suggestedWines = wijnEnabled && cartIngredients.length > 0
    ? wines.filter(w =>
        wineQty(w.id) === 0 &&
        w.tags?.some(tag =>
          cartIngredients.some(ing => ing.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ing.toLowerCase()))
        ))
    : []
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
    <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="checkout-title"
        className="bg-cream w-full sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-dashed border-warm-gray-light/60 flex items-start justify-between bg-cream">
          <div className="flex items-center gap-3">
            <span className="font-serif italic text-wine text-sm leading-none">N° ·</span>
            <span className="h-px w-6 bg-gold/40" />
            <div>
              <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold">Bevestig</p>
              <h2 id="checkout-title" className="font-serif text-2xl text-ink italic leading-tight mt-0.5">Uw bestelling</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Sluiten" className="text-warm-gray hover:text-wine text-2xl leading-none mt-1 transition-colors">×</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Order summary */}
          <div className="border border-parchment bg-white">
            <div className="px-4 py-3 border-b border-dashed border-warm-gray-light/50 flex items-center gap-3">
              <span className="font-serif italic text-wine text-xs leading-none">N° ·</span>
              <span className="h-px w-4 bg-gold/40" />
              <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Overzicht</p>
            </div>
            {/* Pizza section */}
            <div className="border-b border-dashed border-warm-gray-light/50">
              <div className="px-4 py-2 flex items-center gap-2">
                <Pizza size={12} className="text-warm-gray" />
                <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray">Pizza's</p>
              </div>
              <ul>
                {items.map(({ pizza, quantity }) => (
                  <li key={pizza.id} className="px-4 py-2.5 flex items-center gap-3 border-t border-dotted border-warm-gray-light/40">
                    <span className="flex-1 font-serif text-sm text-ink">{pizza.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" aria-label={`Minder ${pizza.name}`} onClick={() => onRemove(pizza)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                      <span className="font-sans text-sm w-4 text-center tabular-nums" aria-label={`${quantity} stuks`}>{quantity}</span>
                      <button type="button" aria-label={`Meer ${pizza.name}`} onClick={() => onAdd(pizza)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                    </div>
                    <span className="font-serif text-sm text-wine w-16 text-right tabular-nums shrink-0">{currency}{(pizza.price * quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wine section */}
            {wineCart.length > 0 && (
              <div className="border-b border-dashed border-warm-gray-light/50">
                <div className="px-4 py-2 flex items-center gap-2">
                  <Wine size={12} className="text-warm-gray" />
                  <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray">Wijn</p>
                </div>
                <ul>
                  {wineCart.map(({ wine, quantity }) => (
                    <li key={`w-${wine.id}`} className="px-4 py-2.5 flex items-center gap-3 border-t border-dotted border-wine/20">
                      <span className="flex-1 font-serif text-sm italic text-ink">{wine.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => onRemoveWine?.(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                        <span className="font-sans text-sm w-4 text-center tabular-nums">{quantity}</span>
                        <button type="button" onClick={() => onAddWine?.(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                      </div>
                      <span className="font-serif text-sm text-wine w-16 text-right tabular-nums shrink-0">{currency}{(wine.price * quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Wine suggestions */}
            {suggestedWines.length > 0 && (
              <div className="border-t border-dashed border-warm-gray-light/50">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-dotted border-warm-gray-light/40">
                  <Wine size={13} className="text-wine shrink-0" />
                  <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-wine">Wijn erbij?</p>
                </div>
                <ul>
                  {suggestedWines.map(wine => {
                    const qty = wineQty(wine.id)
                    return (
                      <li key={wine.id} className="px-4 py-2.5 flex items-center gap-3 border-b border-dotted border-warm-gray-light/40 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-ink">{wine.name}</p>
                          {wine.description && <p className="font-sans text-xs italic text-warm-gray truncate mt-0.5">{wine.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {qty === 0 ? (
                            <button type="button" onClick={() => onAddWine?.(wine)}
                              className="font-sans text-[10px] tracking-[0.2em] uppercase border border-warm-gray-light text-ink px-3 py-1.5 hover:bg-wine hover:text-cream hover:border-wine transition-colors tabular-nums">
                              {currency}{wine.price.toFixed(2)}
                            </button>
                          ) : (
                            <>
                              <button type="button" onClick={() => onRemoveWine?.(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                              <span className="font-sans text-sm w-4 text-center tabular-nums">{qty}</span>
                              <button type="button" onClick={() => onAddWine?.(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                              <span className="font-serif text-sm text-wine w-16 text-right tabular-nums">{currency}{(wine.price * qty).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Totaal */}
            <div className="px-4 py-3 border-t border-dashed border-warm-gray-light/50 flex justify-between items-center">
              <span className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Totaal</span>
              <span className="font-serif text-xl text-wine tabular-nums">{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Date */}
            {availableDates.length > 1 && (
              <div>
                <label className="block font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray mb-2">Datum</label>
                <div className="flex gap-2 flex-wrap">
                  {availableDates.map(date => (
                    <button type="button" key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
                      className={`px-4 py-2 font-sans text-xs tracking-wide border transition-colors ${selectedDate === date ? 'bg-wine text-cream border-wine' : 'bg-white text-ink border-parchment hover:border-wine/40'}`}>
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time slots */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray">Tijdslot</label>
                {slotsNeeded > 1 && (
                  <span className="font-serif italic text-xs text-warm-gray">
                    {totalPizzas} pizza's · {slotsNeeded} slots ({slotsNeeded * (settings?.slotIntervalMinutes ?? 15)} min)
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
                <p className="font-serif italic text-sm text-wine">Geen tijdsloten beschikbaar.</p>
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
                        className={`py-2.5 font-sans text-xs border transition-colors ${
                          inRange ? 'bg-wine text-cream border-wine'
                          : !groupOk ? 'bg-parchment/50 text-warm-gray-light border-parchment cursor-not-allowed line-through'
                          : 'bg-white text-ink border-parchment hover:border-wine/40'
                        }`}
                      >{slot.time}</button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray mb-2">Naam</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Uw naam"
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
            </div>

            {/* Email */}
            <div>
              <label className="block font-sans text-[10px] tracking-[0.32em] uppercase text-warm-gray mb-2">E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="uw@email.be"
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold transition-colors" />
            </div>

            {error && <p className="font-serif italic text-sm text-wine">{error}</p>}

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
