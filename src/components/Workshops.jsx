import { useState } from 'react'
import { Check } from 'lucide-react'
import ServicePage, { ServiceSection, StatusBadge, ctaLabel, PriceSkeleton } from './ServicePage'
import InquiryForm from './InquiryForm'
import { useServices } from '../lib/useServices'
import config from '../data/config.json'

export default function Workshops() {
  const { services, resolved } = useServices()
  const data = services.workshops
  const [selected, setSelected] = useState('')

  const concept = data.mode === 'concept'
  const types = data.types || []

  // Geen prijs in de keuzelijst zolang die niet vaststaat — zie PizzaBox.
  const toonPrijs = resolved && !concept
  const options = types.map(t => ({
    value: t.id,
    label: !toonPrijs ? t.name
      : t.price ? `${t.name} — ${config.currency}${t.price} p.p.`
      : `${t.name} — op maat`,
  }))

  function choose(id) {
    setSelected(id)
    document.getElementById('workshop-aanvraag')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ServicePage service={data}>

      {/* ── Workshops ── */}
      <ServiceSection title="De workshops" caption="Vier formules, altijd in kleine groep.">
        {/* Mobiel losse kaarten met ruimte ertussen, vanaf sm een strak raster */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-px sm:bg-parchment sm:border sm:border-parchment">
          {/* Kaarten staan op ivory — zie tailwind.config.js voor de
              papierschaal parchment → cream → ivory. */}
          {types.map(workshop => (
            <div key={workshop.id} className="bg-ivory border border-parchment sm:border-0 p-6 flex flex-col">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl text-ink leading-tight">{workshop.name}</h3>
                {concept ? (
                  <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray-light whitespace-nowrap shrink-0">
                    Prijs volgt
                  </span>
                ) : !resolved ? (
                  <PriceSkeleton className="h-7 w-14" />
                ) : workshop.price ? (
                  <span className="font-serif text-2xl text-wine tabular-nums whitespace-nowrap shrink-0">
                    {config.currency}{workshop.price}
                  </span>
                ) : (
                  <span className="font-serif italic text-base text-wine whitespace-nowrap shrink-0">Op maat</span>
                )}
              </div>

              <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-2">
                {workshop.level} · {workshop.duration}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1">
                <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray-light">
                  {workshop.groupSize}
                </p>
                <StatusBadge status={workshop.status} />
              </div>

              <p className="font-serif italic text-sm text-warm-gray leading-relaxed mt-4">
                {workshop.description}
              </p>

              <ul className="mt-4 space-y-1.5 flex-1">
                {(workshop.includes || []).map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={13} className="text-wine mt-0.5 shrink-0" />
                    <span className="font-sans text-xs text-ink leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(workshop.id)}
                className={`mt-6 font-sans text-[10px] tracking-[0.24em] uppercase px-4 py-2.5 border transition-colors ${
                  selected === workshop.id
                    ? 'bg-wine text-cream border-wine'
                    : 'border-warm-gray-light text-ink hover:bg-wine hover:text-cream hover:border-wine'
                }`}
              >
                {ctaLabel({ selected: selected === workshop.id, status: workshop.status, concept, fallback: 'Deze workshop aanvragen' })}
              </button>
            </div>
          ))}
        </div>

        {!concept && (
          <p className="font-sans text-xs text-warm-gray-light italic text-center mt-5 leading-relaxed">
            Prijzen per persoon, inclusief alle ingrediënten en drank tijdens de workshop.
            Een cadeaubon voor een workshop kan ook — vermeld het bij uw aanvraag.
          </p>
        )}
      </ServiceSection>

      {/* ── Verloop ── */}
      <ServiceSection tone="parchment" title="Hoe het gaat" caption="Geen demonstratie waar u naar kijkt — u staat zelf aan de tafel.">
        <div className="max-w-xl mx-auto space-y-5">
          {(data.flow || []).map((step, i) => (
            <div key={step.title} className="flex gap-5">
              <span className="font-serif italic text-2xl text-gold tabular-nums shrink-0 w-8 text-right leading-tight">{i + 1}</span>
              <div className="border-l border-dotted border-parchment pl-5 pb-1">
                <p className="font-serif text-lg text-ink leading-tight">{step.title}</p>
                <p className="font-sans text-sm text-warm-gray leading-relaxed mt-1">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* ── Aanvraag ── */}
      <section id="workshop-aanvraag" className="relative bg-cream border-t border-parchment scroll-mt-20">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <div className="text-center mb-8">
            <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
              <span className="h-px w-6 bg-gold/40" />
              <span>{concept ? 'Interesselijst' : 'Plaats reserveren'}</span>
              <span className="h-px w-6 bg-gold/40" />
            </div>
            <p className="font-serif italic text-warm-gray text-sm mt-3 max-w-md mx-auto">
              {concept
                ? 'De workshops zijn nog in voorbereiding. Laat iets weten, dan bent u erbij zodra de eerste reeks opengaat.'
                : 'Workshops gaan door zodra de groep vol is. Laat weten met hoeveel u komt, dan stellen we een datum voor.'}
            </p>
          </div>

          <InquiryForm
            type="workshop"
            options={options}
            optionLabel="Welke workshop"
            preselect={selected}
            fields={{ date: !concept, guests: true }}
            messageLabel="Uw vraag of opmerking"
            messagePlaceholder="Bijvoorbeeld: vrijdagavond komt best uit, één deelnemer eet glutenvrij."
            submitLabel={concept ? 'Houd mij op de hoogte' : 'Plaats aanvragen'}
            successText={concept
              ? 'U staat op de lijst. Zodra de eerste reeks opengaat, hoort u het.'
              : 'We kijken na welke data vrij zijn en komen bij u terug met een voorstel.'}
          />
        </div>
      </section>

    </ServicePage>
  )
}
