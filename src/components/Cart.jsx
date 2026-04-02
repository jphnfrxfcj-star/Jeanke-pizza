export default function Cart({ items, onAdd, onRemove, onCheckout, currency }) {
  const total = items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="border border-parchment p-8 text-center">
        <div className="text-3xl mb-3 opacity-40">🛒</div>
        <p className="font-serif italic text-warm-gray text-sm">Uw mandje is leeg</p>
        <p className="font-sans text-xs text-warm-gray-light mt-1 tracking-wide">Voeg pizza's toe om te bestellen</p>
      </div>
    )
  }

  return (
    <div className="border border-parchment bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-parchment flex items-center justify-between">
        <h2 className="font-serif text-lg text-ink">Uw bestelling</h2>
        <span className="font-sans text-xs bg-wine text-cream px-2 py-0.5 tracking-widest">
          {itemCount} {itemCount === 1 ? 'stuk' : 'stuks'}
        </span>
      </div>

      {/* Items */}
      <ul className="divide-y divide-parchment">
        {items.map(({ pizza, quantity }) => (
          <li key={pizza.id} className="px-5 py-3 flex items-center gap-3">
            <span className="text-lg">{pizza.emoji}</span>
            <span className="flex-1 font-sans text-sm text-ink">{pizza.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(pizza)}
                className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors"
              >
                −
              </button>
              <span className="font-sans text-sm w-4 text-center">{quantity}</span>
              <button
                onClick={() => onAdd(pizza)}
                className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors"
              >
                +
              </button>
            </div>
            <span className="font-sans text-sm text-wine w-14 text-right">
              {currency}{(pizza.price * quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="px-5 py-4 border-t border-parchment flex justify-between items-center">
        <span className="font-sans text-xs tracking-widest uppercase text-warm-gray">Totaal</span>
        <span className="font-serif text-xl text-ink">{currency}{total.toFixed(2)}</span>
      </div>

      <div className="p-5 pt-0">
        <button onClick={onCheckout} className="btn-primary w-full text-center">
          Bestelling plaatsen →
        </button>
      </div>
    </div>
  )
}
