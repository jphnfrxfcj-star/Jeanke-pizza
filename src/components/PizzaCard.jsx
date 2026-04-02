export default function PizzaCard({ pizza, quantity, onAdd, onRemove, currency }) {
  return (
    <div className="card flex flex-col">
      <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 flex items-center justify-center text-6xl">
        {pizza.emoji}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-pizza-brown">{pizza.name}</h3>
          <span className="font-bold text-pizza-red text-lg ml-2 shrink-0">
            {currency}{pizza.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 flex-1">{pizza.description}</p>

        <div className="flex items-center justify-between mt-auto">
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(pizza)}
              className="btn-primary w-full"
            >
              + Toevoegen
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => onRemove(pizza)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-pizza-brown font-bold text-lg flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="font-bold text-pizza-brown text-lg flex-1 text-center">
                {quantity}
              </span>
              <button
                onClick={() => onAdd(pizza)}
                className="w-9 h-9 rounded-full bg-pizza-red hover:bg-pizza-red-dark text-white font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
