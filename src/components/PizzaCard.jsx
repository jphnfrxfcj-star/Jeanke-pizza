import { useRef, useState } from 'react'

/**
 * PizzaCard — restyled
 *
 * Drop-in replacement for the existing component. Keeps the same prop contract:
 *   { pizza, quantity, onAdd, onRemove, currency, showOrder = true }
 *
 * Changes vs previous version:
 *  - Typographic "tile" instead of <img> (handles missing imageUrl gracefully)
 *  - N° index badge + corner stamp
 *  - Badges: "Pittig" (Hot Stekke), "Suggestie" (pizza.suggestion), "Burrata" (ingredient)
 *  - Fly-to-cart animation hook on add: animates a 24px wine dot toward #cart-target
 *  - Add-pulse ring
 */
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
    <article
      className={`group relative bg-white border border-parchment hover:border-gold/40 transition-all duration-500 flex flex-col hover:shadow-[0_14px_40px_-22px_rgba(28,20,16,0.35)] ${pulse ? 'ring-2 ring-wine/30' : ''}`}
    >
      {isHot && (
        <div className="absolute top-3 left-3 z-10 font-sans text-[10px] uppercase tracking-[0.18em] bg-wine text-cream px-2 py-1">
          Pittig
        </div>
      )}
      {pizza.suggestion && !isHot && (
        <div className="absolute top-3 left-3 z-10 font-sans text-[10px] uppercase tracking-[0.18em] bg-wine text-cream px-2 py-1">
          Suggestie
        </div>
      )}
      {hasBurrata && !pizza.suggestion && !isHot && (
        <div className="absolute top-3 left-3 z-10 font-sans italic text-[11px] text-gold-light bg-ink/80 px-2 py-1">
          Burrata
        </div>
      )}

      <PizzaTile pizza={pizza} num={num} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-serif italic text-xs text-warm-gray leading-none shrink-0">N° {num}</span>
          <span className="h-px flex-1 bg-parchment" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-ink mb-2 leading-tight">{pizza.name}</h3>
        <p className="font-sans text-xs text-warm-gray italic leading-relaxed mb-3 flex-1">
          {ingredients.length > 0 ? ingredients.join(', ') : pizza.description}
        </p>
        {pizza.allergens?.length > 0 && (
          <p className="font-sans text-[10px] text-warm-gray-light tracking-wide mb-3">
            <span className="not-italic uppercase">Allergenen:</span> {pizza.allergens.join(' · ')}
          </p>
        )}

        <div className={`flex items-center pt-3 border-t border-parchment ${showOrder ? 'justify-between' : ''}`}>
          <span className="font-serif text-lg text-wine whitespace-nowrap">
            {currency}{pizza.price.toFixed(2)}
          </span>
          {showOrder && (
            quantity === 0 ? (
              <button ref={btnRef} onClick={handleAdd} className="btn-primary py-2 px-4">Toevoegen</button>
            ) : (
              <div className="flex items-center gap-2" ref={btnRef}>
                <button
                  onClick={() => onRemove(pizza)}
                  className="w-7 h-7 border border-warm-gray-light text-ink hover:border-ink flex items-center justify-center transition-colors"
                >−</button>
                <span className="font-serif text-base w-5 text-center">{quantity}</span>
                <button
                  onClick={handleAdd}
                  className="w-7 h-7 bg-wine hover:bg-wine-light text-cream flex items-center justify-center transition-colors"
                >+</button>
              </div>
            )
          )}
        </div>
      </div>
    </article>
  )
}

/** Typographic pizza tile — no photo. Renders the imageUrl if present, otherwise a serif initial + circular wordmark. */
function PizzaTile({ pizza, num }) {
  if (pizza.imageUrl) {
    return (
      <div className="h-36 overflow-hidden border-b border-parchment">
        <img src={pizza.imageUrl} alt={pizza.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
      </div>
    )
  }

  const tones = [
    { bg: '#F7F3EC', ink: '#A0522D' }, // tomato
    { bg: '#F7F3EC', ink: '#3D4A2D' }, // basil
    { bg: '#F7F3EC', ink: '#BFA06A' }, // gold
    { bg: '#EDE5D8', ink: '#8A7E72' }, // cream
  ]
  const toneMap = [0, 1, 2, 0, 1, 2, 3, 0, 1, 0, 2]
  const t = tones[toneMap[(pizza.id - 1) % toneMap.length]]
  const initial = pizza.name.replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase()

  return (
    <div className="h-36 overflow-hidden border-b border-parchment relative" style={{ background: t.bg }}>
      <div className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-700">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g style={{ color: t.ink }} opacity="0.18">
            <circle cx="200" cy="120" r="96" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="200" cy="120" r="80" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
            <circle cx="200" cy="120" r="62" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </g>
          <defs>
            <path id={`arc-${pizza.id}`} d="M 200,120 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
          </defs>
          <text style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9px', letterSpacing: '4px', fill: t.ink, opacity: 0.7 }}>
            <textPath href={`#arc-${pizza.id}`} startOffset="0">
              {`· ${pizza.name.toUpperCase()} · N° ${num} · JEANKE'S · `}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif italic select-none leading-none" style={{ color: t.ink, fontSize: '120px', opacity: 0.95 }}>
            {initial}
          </span>
        </div>
        <div className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.18em]" style={{ color: t.ink, opacity: 0.6 }}>
          N°{num}
        </div>
      </div>
    </div>
  )
}
