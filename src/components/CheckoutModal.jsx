import { useState, useEffect } from 'react'

export default function CheckoutModal({ items, slots, onClose, onSuccess, currency }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(slots[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    fetch('/api/slots').then(r => r.json()).then(setBookedSlots).catch(() => {})
  }, [])

  const total = items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0)
  const availableDates = [...new Set(slots.map(s => s.date))]
  const slotsForDate = slots.filter(s => s.date === selectedDate)
  const orderText = items.map(i => `${i.quantity}x ${i.pizza.name} (${currency}${(i.pizza.price * i.quantity).toFixed(2)})`).join(', ')

  function isBooked(date, time) { return bookedSlots.includes(`${date}_${time}`) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSlot) { setError('Kies een tijdslot.'); return }
    setError(''); setLoading(true)
    try {
      const slotRes = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, timeslot: selectedSlot, name, email, order: orderText, total: `${currency}${total.toFixed(2)}` }),
      })
      if (slotRes.status === 409) {
        setError('Dit tijdslot is net geboekt. Kies een ander.'); setBookedSlots(prev => [...prev, `${selectedDate}_${selectedSlot}`]); setSelectedSlot(''); setLoading(false); return
      }
      if (!slotRes.ok) throw new Error('Slot booking failed')
      const slotData = await slotRes.json()

      // Send confirmation email (fire-and-forget, don't block on failure)
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

      onSuccess({ name, email, date: selectedDate, timeslot: selectedSlot, total })
    } catch (err) {
      console.error('Submit error:', err)
      setError('Er ging iets mis. Probeer opnieuw.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-cream w-full sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
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
                <li key={pizza.id} className="px-4 py-2 flex justify-between text-sm">
                  <span className="text-ink">{quantity}× {pizza.name}</span>
                  <span className="text-wine">{currency}{(pizza.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
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
                      className={`px-4 py-2 text-xs font-sans tracking-wide border transition-colors ${selectedDate === date ? 'bg-olive text-cream border-olive' : 'bg-white text-ink border-parchment hover:border-olive'}`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time slots */}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">Tijdslot</label>
              {slotsForDate.length === 0 ? (
                <p className="text-sm text-wine italic">Geen tijdsloten beschikbaar.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {slotsForDate.map(slot => {
                    const booked = isBooked(selectedDate, slot.time)
                    return (
                      <button type="button" key={slot.time} disabled={booked}
                        onClick={() => !booked && setSelectedSlot(slot.time)}
                        className={`py-2.5 text-xs font-sans border transition-colors ${
                          booked ? 'bg-parchment/50 text-warm-gray-light border-parchment cursor-not-allowed line-through'
                          : selectedSlot === slot.time ? 'bg-olive text-cream border-olive'
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
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors" />
            </div>

            {/* Email */}
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-warm-gray mb-2">E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="uw@email.be"
                className="w-full border border-parchment bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors" />
            </div>

            {error && <p className="text-xs text-wine italic">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Een moment...' : 'Bestelling bevestigen'}
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
