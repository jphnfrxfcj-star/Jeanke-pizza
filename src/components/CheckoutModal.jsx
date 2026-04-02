import { useState } from 'react'

export default function CheckoutModal({ items, slots, onClose, onSuccess, currency }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(slots[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0)

  const availableDates = [...new Set(slots.map(s => s.date))]
  const slotsForDate = slots.filter(s => s.date === selectedDate)

  const orderText = items
    .map(i => `${i.quantity}x ${i.pizza.name} (${currency}${(i.pizza.price * i.quantity).toFixed(2)})`)
    .join(', ')

  function encode(data) {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSlot) {
      setError('Kies een tijdslot.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'pizza-order',
          'bot-field': '',
          name,
          email,
          date: selectedDate,
          timeslot: selectedSlot,
          order: orderText,
          total: `${currency}${total.toFixed(2)}`,
        }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      onSuccess({ name, email, date: selectedDate, timeslot: selectedSlot, total })
    } catch (err) {
      console.error('Form submit error:', err)
      setError('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-pizza-brown">Bestelling bevestigen</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Order summary */}
          <div className="bg-pizza-cream rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-pizza-brown mb-2">Jouw bestelling:</p>
            <ul className="space-y-1">
              {items.map(({ pizza, quantity }) => (
                <li key={pizza.id} className="flex justify-between text-sm text-gray-600">
                  <span>{quantity}× {pizza.name}</span>
                  <span className="font-medium">{currency}{(pizza.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-orange-200 mt-2 pt-2 flex justify-between font-bold text-pizza-red">
              <span>Totaal</span>
              <span>{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date picker */}
            {availableDates.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-pizza-brown mb-1">Datum</label>
                <div className="flex gap-2 flex-wrap">
                  {availableDates.map(date => (
                    <button
                      type="button"
                      key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedDate === date
                          ? 'bg-pizza-red text-white border-pizza-red'
                          : 'bg-white text-pizza-brown border-gray-200 hover:border-pizza-red'
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time slot */}
            <div>
              <label className="block text-sm font-semibold text-pizza-brown mb-1">Tijdslot</label>
              {slotsForDate.length === 0 ? (
                <p className="text-sm text-red-500">Geen tijdsloten beschikbaar voor deze datum.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slotsForDate.map(slot => (
                    <button
                      type="button"
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSlot === slot.time
                          ? 'bg-pizza-red text-white border-pizza-red'
                          : 'bg-white text-pizza-brown border-gray-200 hover:border-pizza-red'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-pizza-brown mb-1">Naam</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jouw naam"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-pizza-brown mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jouw@email.be"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Bezig...' : 'Bevestig bestelling'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })
}
