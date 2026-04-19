import { Wine, Pizza } from 'lucide-react'

/**
 * Cart — restyled (receipt feel)
 *
 * Drop-in replacement, keeps the same prop contract:
 *   { items, onAdd, onRemove, onCheckout, currency, hasSlots,
 *     wines, wineCart, onAddWine, onRemoveWine, wijnEnabled }
 *
 * Changes:
 *  - Dashed dividers + order code + N° header for "printed receipt" feel
 *  - Empty state uses ornament instead of emoji cart
 *  - id="cart-target" on the outer element so PizzaCard's fly-to-cart can find it
 *  - Totals split into Pizza's / Wijn sub-lines when both present
 *  - Italic "Afrekenen aan de deur" caption under submit
 */
export default function Cart({
  items,
  onAdd,
  onRemove,
  onCheckout,
  currency,
  hasSlots = true,
  slotsLoading = false,
  wines = [],
  wineCart = [],
  onAddWine,
  onRemoveWine,
  wijnEnabled = false,
}) {
  const pizzaTotal = items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0)
  const wineTotal = wineCart.reduce((sum, item) => sum + item.wine.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const cartIngredients = items.flatMap(i => Array.isArray(i.pizza.ingredients) ? i.pizza.ingredients : [])
  const suggestedWines = wijnEnabled && cartIngredients.length > 0
    ? wines.filter(w => w.tags?.some(tag =>
        cartIngredients.some(ing => ing.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ing.toLowerCase()))
      ))
    : []
  const wineQty = (id) => wineCart.find(i => i.wine.id === id)?.quantity ?? 0

  if (items.length === 0) {
    return (
      <div id="cart-target" className="border border-parchment bg-white">
        <div className="px-5 pt-5 pb-4 border-b border-dashed border-parchment">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-warm-gray font-sans">
            <span className="font-serif italic text-wine text-base leading-none">N° ★</span>
            <span className="h-px w-6 bg-warm-gray-light" />
            <span>Il Conto</span>
          </div>
          <h2 className="font-serif text-2xl text-ink mt-3">Uw mandje</h2>
          <p className="font-sans italic text-xs text-warm-gray">Nog leeg — kies een pizza.</p>
        </div>
        <div className="p-8 text-center">
          <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto text-gold/40">
            <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.3" />
          </svg>
          <p className="font-serif italic text-warm-gray mt-4 text-sm">La tavola aspetta.</p>
          <p className="font-sans text-xs text-warm-gray-light mt-1 tracking-wide">Voeg pizza's toe om te bestellen</p>
        </div>
      </div>
    )
  }

  return (
    <div id="cart-target" className="border border-parchment bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-dashed border-parchment">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-warm-gray font-sans">
          <span className="font-serif italic text-wine text-base leading-none">N° ★</span>
          <span className="h-px w-6 bg-warm-gray-light" />
          <span>Il Conto</span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <h2 className="font-serif text-2xl text-ink">Uw bestelling</h2>
          <span className="font-sans text-xs bg-wine text-cream px-2 py-0.5 tracking-widest">
            {itemCount} {itemCount === 1 ? 'stuk' : 'stuks'}
          </span>
        </div>
      </div>

      {/* Pizza items */}
      <div className="border-b border-dashed border-parchment">
        <div className="px-5 py-2 flex items-center gap-2">
          <Pizza size={12} className="text-warm-gray" />
          <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-warm-gray">Pizza's</p>
        </div>
        <ul className="divide-y divide-dotted divide-parchment">
          {items.map(({ pizza, quantity }) => (
            <li key={pizza.id} className="px-5 py-3 flex items-center gap-3">
              <span className="flex-1 font-sans text-sm text-ink truncate">{pizza.name}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onRemove(pizza)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                <span className="font-sans text-sm w-4 text-center">{quantity}</span>
                <button onClick={() => onAdd(pizza)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
              </div>
              <span className="font-serif text-sm text-ink w-16 text-right tabular-nums whitespace-nowrap">
                {currency}{(pizza.price * quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Wines already in cart */}
      {wineCart.length > 0 && (
        <div className="border-b border-dashed border-parchment">
          <div className="px-5 py-2 bg-wine/[0.06] flex items-center gap-2">
            <Wine size={12} className="text-wine" />
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-wine">Wijn</p>
          </div>
          <ul className="divide-y divide-dotted divide-wine/10 bg-wine/[0.03]">
            {wineCart.map(({ wine, quantity }) => (
              <li key={wine.id} className="px-5 py-3 flex items-center gap-3">
                <span className="flex-1 font-sans text-sm italic text-ink truncate">{wine.name}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onRemoveWine(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                  <span className="font-sans text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => onAddWine(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                </div>
                <span className="font-serif text-sm text-wine w-16 text-right tabular-nums whitespace-nowrap">
                  {currency}{(wine.price * quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Wine suggestions (not yet in cart) */}
      {wijnEnabled && suggestedWines.length > 0 && (
        <div className="border-t-2 border-wine">
          <div className="px-5 py-3 bg-wine/[0.08] flex items-center gap-2">
            <Wine size={14} className="text-wine" />
            <p className="font-sans text-xs tracking-widest uppercase text-wine font-semibold">Wijn erbij?</p>
          </div>
          <ul className="divide-y divide-wine/10 bg-wine/[0.04]">
            {suggestedWines.map(wine => {
              const qty = wineQty(wine.id)
              return (
                <li key={wine.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-ink">{wine.name}</p>
                    {wine.description && <p className="font-sans text-xs text-warm-gray italic truncate">{wine.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qty === 0 ? (
                      <button onClick={() => onAddWine(wine)} className="font-sans text-xs border border-wine text-wine px-3 py-1 hover:bg-wine hover:text-cream transition-colors whitespace-nowrap">
                        {currency}{wine.price.toFixed(2)}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => onRemoveWine(wine)} className="w-6 h-6 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-xs transition-colors">−</button>
                        <span className="font-sans text-sm w-4 text-center">{qty}</span>
                        <button onClick={() => onAddWine(wine)} className="w-6 h-6 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-xs transition-colors">+</button>
                        <span className="font-sans text-xs text-wine w-14 text-right tabular-nums whitespace-nowrap">
                          {currency}{(wine.price * qty).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Totals */}
      <div className="px-5 pt-4 pb-5 border-t border-dashed border-parchment">
        {wineTotal > 0 && (
          <>
            <div className="flex items-baseline justify-between mb-1 font-sans text-xs text-warm-gray">
              <span>Pizza's</span>
              <span className="tabular-nums">{currency}{pizzaTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-1 font-sans text-xs text-warm-gray">
              <span>Wijn</span>
              <span className="tabular-nums">{currency}{wineTotal.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-ink/10">
          <span className="font-sans text-xs tracking-widest uppercase text-warm-gray">Totaal</span>
          <span className="font-serif text-2xl text-wine tabular-nums">
            {currency}{(pizzaTotal + wineTotal).toFixed(2)}
          </span>
        </div>

        {hasSlots ? (
          <>
            <button onClick={onCheckout} className="btn-primary w-full mt-5">Bestelling plaatsen →</button>
            <p className="text-center mt-3 font-sans italic text-[11px] text-warm-gray">Afrekenen aan de deur</p>
          </>
        ) : slotsLoading ? (
          <button disabled className="btn-primary w-full mt-5 opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
            <span className="w-3 h-3 border border-cream/60 border-t-cream rounded-full animate-spin" />
            Beschikbaarheid laden…
          </button>
        ) : (
          <div className="text-center mt-5">
            <p className="font-sans text-xs text-wine italic">Geen tijdsloten beschikbaar.</p>
            <p className="font-sans text-xs text-warm-gray mt-1">Controleer later voor nieuwe data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
