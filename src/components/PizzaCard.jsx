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
        <p className="font-sans text-xs text-warm-gray italic leading-relaxed mb-4 flex-1">{pizza.description}</p>

        <div className={`flex items-center pt-3 border-t border-parchment ${showOrder ? 'justify-between' : ''}`}>
          <span className="font-serif text-lg text-wine">{currency}{pizza.price.toFixed(2)}</span>
          {showOrder && (
            quantity === 0 ? (
              <button onClick={() => onAdd(pizza)} className="btn-primary">Toevoegen</button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => onRemove(pizza)} className="w-8 h-8 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center text-lg transition-colors">−</button>
                <span className="font-serif text-lg w-4 text-center">{quantity}</span>
                <button onClick={() => onAdd(pizza)} className="w-8 h-8 bg-wine hover:bg-wine-light text-cream flex items-center justify-center text-lg transition-colors">+</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
