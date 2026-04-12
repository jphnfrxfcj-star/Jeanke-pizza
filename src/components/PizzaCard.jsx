export default function PizzaCard({ pizza, quantity, onAdd, onRemove, currency, showOrder = true }) {
  return (
    <div className="bg-white border border-parchment hover:border-gold/40 transition-colors duration-300 flex flex-col">
      {pizza.imageUrl && (
        <div className="h-44 overflow-hidden">
          <img src={pizza.imageUrl} alt={pizza.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-xl font-semibold text-ink mb-1">{pizza.name}</h3>
        <p className="font-sans text-xs text-warm-gray italic leading-relaxed mb-4 flex-1">
          {Array.isArray(pizza.ingredients) ? pizza.ingredients.join(', ') : pizza.description}
        </p>

        <div className={`flex items-center pt-3 border-t border-parchment ${showOrder ? 'justify-between' : ''}`}>
          <span className="font-serif text-lg text-wine">{currency}{pizza.price.toFixed(2)}</span>
          {showOrder && (
            quantity === 0 ? (
              <button onClick={() => onAdd(pizza)} className="btn-primary py-2 px-4">Toevoegen</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(pizza)} className="w-7 h-7 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center transition-colors cursor-pointer">−</button>
                <span className="font-serif text-base w-4 text-center">{quantity}</span>
                <button onClick={() => onAdd(pizza)} className="w-7 h-7 bg-wine hover:bg-wine-light text-cream flex items-center justify-center transition-colors cursor-pointer">+</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
