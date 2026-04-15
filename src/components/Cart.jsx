import { Wine } from 'lucide-react'

export default function Cart({ items, onAdd, onRemove, onCheckout, currency, hasSlots = true, wines = [], wineCart = [], onAddWine, onRemoveWine, wijnEnabled = false }) {
  const total = items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0)
  const wineTotal = wineCart.reduce((sum, item) => sum + item.wine.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Pairing logic
  const cartIngredients = items.flatMap(i => Array.isArray(i.pizza.ingredients) ? i.pizza.ingredients : [])
  const suggestedWines = wijnEnabled && cartIngredients.length > 0
    ? wines.filter(w => w.tags?.some(tag =>
        cartIngredients.some(ing => ing.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ing.toLowerCase()))
      ))
    : []

  function wineQty(id) { return wineCart.find(i => i.wine.id === id)?.quantity ?? 0 }

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

      {/* Pizza items */}
      <ul className="divide-y divide-parchment">
        {items.map(({ pizza, quantity }) => (
          <li key={pizza.id} className="px-5 py-3 flex items-center gap-3">
            <span className="text-lg">{pizza.emoji}</span>
            <span className="flex-1 font-sans text-sm text-ink">{pizza.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onRemove(pizza)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
              <span className="font-sans text-sm w-4 text-center">{quantity}</span>
              <button onClick={() => onAdd(pizza)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
            </div>
            <span className="font-sans text-sm text-wine w-14 text-right">{currency}{(pizza.price * quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* Wine suggestions */}
      {wijnEnabled && suggestedWines.length > 0 && (
        <div className="border-t-2 border-wine">
          <div className="px-5 py-3 bg-wine/8 flex items-center gap-2">
            <Wine size={14} className="text-wine" />
            <p className="font-sans text-xs tracking-widest uppercase text-wine font-semibold">Wijn erbij?</p>
          </div>
          <ul className="divide-y divide-wine/10 bg-wine/5">
            {suggestedWines.map(wine => {
              const qty = wineQty(wine.id)
              return (
                <li key={wine.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-ink">{wine.name}</p>
                    {wine.description && <p className="font-sans text-xs text-warm-gray truncate">{wine.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qty === 0 ? (
                      <button onClick={() => onAddWine(wine)} className="font-sans text-xs border border-wine text-wine px-3 py-1 hover:bg-wine hover:text-cream transition-colors">
                        {currency}{wine.price.toFixed(2)}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => onRemoveWine(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                        <span className="font-sans text-sm w-4 text-center">{qty}</span>
                        <button onClick={() => onAddWine(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
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

      {/* Wine cart items (wines added but not in suggestions) */}
      {wineCart.length > 0 && (
        <div className="border-t border-parchment">
          <ul className="divide-y divide-parchment">
            {wineCart.filter(({ wine }) => !suggestedWines.some(w => w.id === wine.id)).map(({ wine, quantity }) => (
              <li key={wine.id} className="px-5 py-3 flex items-center gap-3">
                <span className="flex-1 font-sans text-sm text-ink">{wine.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onRemoveWine(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                  <span className="font-sans text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => onAddWine(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                </div>
                <span className="font-sans text-sm text-wine w-14 text-right">{currency}{(wine.price * quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Total */}
      <div className="px-5 py-4 border-t border-parchment flex justify-between items-center">
        <span className="font-sans text-xs tracking-widest uppercase text-warm-gray">Totaal</span>
        <span className="font-serif text-xl text-ink">{currency}{(total + wineTotal).toFixed(2)}</span>
      </div>

      <div className="p-5 pt-0">
        {hasSlots ? (
          <button onClick={onCheckout} className="btn-primary w-full text-center">Bestelling plaatsen →</button>
        ) : (
          <div className="text-center py-2">
            <p className="font-sans text-xs text-wine italic">Geen tijdsloten beschikbaar.</p>
            <p className="font-sans text-xs text-warm-gray mt-1">Controleer later voor nieuwe data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
