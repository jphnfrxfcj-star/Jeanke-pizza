export default function Cart({ items, onAdd, onRemove, onCheckout, currency }) {
  const total = items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-4xl mb-2">🛒</div>
        <p className="text-gray-400 font-medium">Je winkelmandje is leeg</p>
        <p className="text-sm text-gray-400 mt-1">Voeg pizza's toe om te bestellen</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold text-pizza-brown text-lg mb-4 flex items-center gap-2">
        <span>🛒</span> Winkelmandje
        <span className="ml-auto bg-pizza-red text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount}
        </span>
      </h2>

      <ul className="space-y-3 mb-4">
        {items.map(({ pizza, quantity }) => (
          <li key={pizza.id} className="flex items-center gap-2">
            <span className="text-xl">{pizza.emoji}</span>
            <span className="flex-1 text-sm font-medium text-pizza-brown">{pizza.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(pizza)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-pizza-brown font-bold text-sm flex items-center justify-center"
              >
                −
              </button>
              <span className="w-4 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => onAdd(pizza)}
                className="w-6 h-6 rounded-full bg-pizza-red hover:bg-pizza-red-dark text-white font-bold text-sm flex items-center justify-center"
              >
                +
              </button>
            </div>
            <span className="text-sm font-semibold text-pizza-red w-14 text-right">
              {currency}{(pizza.price * quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-100 pt-3 mb-4">
        <div className="flex justify-between font-bold text-pizza-brown">
          <span>Totaal</span>
          <span className="text-pizza-red">{currency}{total.toFixed(2)}</span>
        </div>
      </div>

      <button onClick={onCheckout} className="btn-primary w-full">
        Bestelling plaatsen →
      </button>
    </div>
  )
}
