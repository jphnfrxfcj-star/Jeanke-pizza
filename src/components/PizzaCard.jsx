import { useRef, useState } from 'react'

export default function PizzaCard({ pizza, quantity, onAdd, onRemove, currency, showOrder = true }) {
  const btnRef = useRef(null)
  const [pulse, setPulse] = useState(false)

  const handleAdd = () => {
    onAdd(pizza)
    setPulse(true)
    setTimeout(() => setPulse(false), 500)
    const rect = btnRef.current?.getBoundingClientRect()
    const cart = document.getElementById('cart-target')
    if (rect && cart) {
      const cRect = cart.getBoundingClientRect()
      const flyer = document.createElement('div')
      flyer.className = 'fixed z-[60] w-6 h-6 rounded-full bg-wine pointer-events-none shadow-lg'
      flyer.style.left = (rect.left + rect.width / 2 - 12) + 'px'
      flyer.style.top = (rect.top + rect.height / 2 - 12) + 'px'
      flyer.style.transition = 'all 650ms cubic-bezier(.6,-0.1,.4,1.2)'
      document.body.appendChild(flyer)
      requestAnimationFrame(() => {
        flyer.style.left = (cRect.left + cRect.width / 2 - 12) + 'px'
        flyer.style.top = (cRect.top + cRect.height / 2 - 12) + 'px'
        flyer.style.transform = 'scale(0.3)'
        flyer.style.opacity = '0'
      })
      setTimeout(() => flyer.remove(), 700)
    }
  }

  const num = String(pizza.id).padStart(2, '0')
  const ingredients = Array.isArray(pizza.ingredients) ? pizza.ingredients : []
  const isHot = pizza.emoji === '🌶️' || /hot/i.test(pizza.name)
  const hasBurrata = ingredients.some(i => /burrata/i.test(i))

  return (
    <li
      className={`group py-5 px-2 flex items-start gap-4 sm:gap-6 hover:bg-parchment/30 transition-colors border-b border-dotted border-parchment last:border-b-0 ${pulse ? 'bg-wine/5' : ''}`}
    >
      {/* N° badge */}
      <span className="font-serif italic text-warm-gray text-sm leading-none shrink-0 mt-1 tabular-nums">N°{num}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-serif text-lg text-ink leading-tight">{pizza.name}</h3>
          {isHot && <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-wine">Pittig</span>}
          {pizza.suggestion && !isHot && <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-wine">Suggestie</span>}
          {hasBurrata && !pizza.suggestion && !isHot && <span className="font-sans text-[10px] italic text-warm-gray">Burrata</span>}
        </div>
        <p className="font-sans text-xs italic text-warm-gray leading-relaxed mt-1">
          {ingredients.length > 0 ? ingredients.join(', ') : pizza.description}
        </p>
        {pizza.allergens?.length > 0 && (
          <p className="font-sans text-[10px] text-warm-gray-light tracking-wide mt-1">
            <span className="not-italic uppercase">Allergenen:</span> {pizza.allergens.join(' · ')}
          </p>
        )}
      </div>

      {/* Price + controls */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-serif text-lg text-wine tabular-nums whitespace-nowrap">
          {currency}{pizza.price.toFixed(2)}
        </span>
        {showOrder && (
          quantity === 0 ? (
            <button ref={btnRef} onClick={handleAdd}
              className="font-sans text-[10px] tracking-[0.2em] uppercase border border-warm-gray-light text-ink px-3 py-2 hover:bg-wine hover:text-cream hover:border-wine transition-colors whitespace-nowrap">
              Toevoegen
            </button>
          ) : (
            <div className="flex items-center gap-2" ref={btnRef}>
              <button onClick={() => onRemove(pizza)} className="w-7 h-7 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center transition-colors">−</button>
              <span className="font-serif text-base w-4 text-center">{quantity}</span>
              <button onClick={handleAdd} className="w-7 h-7 bg-wine hover:bg-wine-light text-cream flex items-center justify-center transition-colors">+</button>
            </div>
          )
        )}
      </div>
    </li>
  )
}
