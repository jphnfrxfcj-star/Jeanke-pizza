import { useState } from 'react'
import { Check } from 'lucide-react'
import ServicePage, { ServiceSection, StatusBadge, ctaLabel } from './ServicePage'
import InquiryForm from './InquiryForm'
import { useServices } from '../lib/useServices'
import config from '../data/config.json'

/** Stukprijs, of null wanneer die niet zinnig te berekenen is. */
function unitPrice(pkg) {
  const price = Number(pkg.price)
  const count = Number(pkg.pizzas)
  if (!Number.isFinite(price) || !Number.isFinite(count) || count <= 0) return null
  return (price / count).toFixed(2)
}

export default function PizzaBox() {
  const data = useServices().box
  const [selected, setSelected] = useState('')

  const concept = data.mode === 'concept'
  const packages = data.packages || []

  const options = packages.map(p => ({
    value: p.id,
    label: concept
      ? `${p.name} — ${p.pizzas} pizza's`
      : `${p.name} — ${p.pizzas} pizza's · ${config.currency}${p.price}`,
  }))

  function choose(id) {
    setSelected(id)
    document.getElementById('box-aanvraag')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ServicePage service={data}>

      {/* ── Pakketten ── */}
      <ServiceSection title="De boxen" caption="Kies de maat die bij uw tafel past.">
        <div className="grid sm:grid-cols-3 gap-px bg-parchment border border-parchment">
          {packages.map(pkg => (
            <div key={pkg.id} className="relative bg-cream p-6 flex flex-col text-center">
              {pkg.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-wine text-cream font-sans text-[9px] tracking-[0.24em] uppercase px-3 py-1">
                  Meest gekozen
                </span>
              )}
              <p className="font-serif text-2xl text-ink leading-tight mt-2">{pkg.name}</p>
              <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-2">{pkg.serves}</p>

              {pkg.status && <p className="mt-3"><StatusBadge status={pkg.status} /></p>}

              {concept ? (
                <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray-light mt-5">
                  Prijs volgt{pkg.pizzas ? ` · ${pkg.pizzas} pizza's` : ''}
                </p>
              ) : (
                <>
                  <p className="font-serif text-4xl text-wine tabular-nums mt-5">
                    {config.currency}{pkg.price}
                  </p>
                  <p className="font-sans text-[11px] text-warm-gray-light mt-1 tabular-nums">
                    {pkg.pizzas ? `${pkg.pizzas} pizza's` : ''}
                    {/* Stukprijs alleen tonen als hij te berekenen valt — anders
                        kwam er "€Infinity" of "€NaN" op de klantpagina */}
                    {unitPrice(pkg) && ` · ${config.currency}${unitPrice(pkg)} per stuk`}
                  </p>
                </>
              )}

              <p className="font-serif italic text-sm text-warm-gray leading-relaxed mt-5 flex-1">
                {pkg.description}
              </p>

              <button
                onClick={() => choose(pkg.id)}
                className={`mt-6 font-sans text-[10px] tracking-[0.24em] uppercase px-4 py-2.5 border transition-colors ${
                  selected === pkg.id
                    ? 'bg-wine text-cream border-wine'
                    : 'border-warm-gray-light text-ink hover:bg-wine hover:text-cream hover:border-wine'
                }`}
              >
                {ctaLabel({ selected: selected === pkg.id, status: pkg.status, concept, fallback: 'Kies deze box' })}
              </button>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* ── Inhoud ── */}
      <ServiceSection tone="parchment" title="In de box" caption="Alles voorbereid, niets te veel.">
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-xl mx-auto">
          {(data.contents || []).map(item => (
            <li key={item} className="flex items-start gap-3">
              <Check size={14} className="text-wine mt-1 shrink-0" />
              <span className="font-sans text-sm text-ink leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </ServiceSection>

      {/* ── Zo werkt het ── */}
      <ServiceSection title="Zo werkt het" caption="Van bestelling tot bord in drie stappen.">
        <ol className="grid sm:grid-cols-3 gap-8">
          {(data.steps || []).map(step => (
            <li key={step.n} className="text-center">
              <span className="font-serif italic text-3xl text-gold">{step.n}</span>
              <p className="font-serif text-lg text-ink mt-2">{step.title}</p>
              <p className="font-sans text-sm text-warm-gray leading-relaxed mt-2">{step.text}</p>
            </li>
          ))}
        </ol>

        {data.tip && (
          <div className="mt-10 border border-dashed border-parchment px-5 py-4 max-w-xl mx-auto">
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{data.tip.label}</p>
            <p className="font-serif italic text-sm text-warm-gray leading-relaxed">{data.tip.text}</p>
          </div>
        )}
      </ServiceSection>

      {/* ── Aanvraag ── */}
      <section id="box-aanvraag" className="relative bg-parchment/50 border-t border-parchment scroll-mt-20 overflow-hidden">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <div className="text-center mb-8">
            <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
              <span className="h-px w-6 bg-gold/40" />
              <span>{concept ? 'Interesselijst' : 'Box reserveren'}</span>
              <span className="h-px w-6 bg-gold/40" />
            </div>
            <p className="font-serif italic text-warm-gray text-sm mt-3 max-w-md mx-auto">
              {concept
                ? 'De boxen zijn nog in voorbereiding. Laat uw mailadres na, dan hoort u het zodra ze te bestellen zijn.'
                : 'Laat weten welke box u wil en wanneer u hem komt halen. We bevestigen per mail.'}
            </p>
          </div>

          <InquiryForm
            type="box"
            options={options}
            optionLabel="Welke box"
            preselect={selected}
            fields={{ date: !concept }}
            messageLabel="Toppings of opmerkingen"
            messagePlaceholder="Bijvoorbeeld: twee keer vegetarisch, geen ansjovis, glutenvrij deeg mogelijk?"
            submitLabel={concept ? 'Houd mij op de hoogte' : 'Box reserveren'}
            successText={concept
              ? 'U staat op de lijst. Zodra de boxen te bestellen zijn, laten we het weten.'
              : 'We bevestigen uw box en een ophaalmoment per mail, meestal binnen één werkdag.'}
          />
        </div>
      </section>

    </ServicePage>
  )
}
