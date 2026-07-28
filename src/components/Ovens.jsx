import { useState, useEffect } from 'react'
import { Flame, Thermometer, Ruler } from 'lucide-react'
import ServicePage, { ServiceSection } from './ServicePage'
import InquiryForm from './InquiryForm'
import services from '../data/services.json'
import config from '../data/config.json'

const data = services.ovens
const BRANDS = ['Alle', ...data.brands.map(b => b.name)]

export default function Ovens() {
  // 'concept' → interesselijst zonder prijzen. 'live' → richtprijzen en offerteaanvraag.
  // Om te schakelen: /beheer → Instellingen → Ovenaanbod.
  const [mode, setMode] = useState('concept')
  const [brand, setBrand] = useState('Alle')
  const [selected, setSelected] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => { if (s?.ovensMode === 'live') setMode('live') })
      .catch(() => {})
  }, [])

  const isLive = mode === 'live'
  const models = brand === 'Alle' ? data.models : data.models.filter(m => m.brand === brand)

  const options = data.models.map(m => ({
    value: m.id,
    label: `${m.brand} ${m.name}${isLive ? ` — vanaf ${config.currency}${m.priceFrom}` : ''}`,
  }))

  function choose(id) {
    setSelected(id)
    document.getElementById('oven-aanvraag')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ServicePage service={data} badge={isLive ? null : 'Aanbod in voorbereiding'}>

      {/* ── Merken ── */}
      <ServiceSection title="De merken" caption="Twee huizen, elk met hun eigen karakter.">
        <div className="grid sm:grid-cols-2 gap-px bg-parchment border border-parchment">
          {data.brands.map(b => (
            <div key={b.name} className="bg-cream p-6 text-center">
              <p className="font-serif text-2xl text-ink">{b.name}</p>
              <span className="block h-px w-10 bg-gold/40 mx-auto my-4" />
              <p className="font-sans text-sm text-warm-gray leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* ── Modellen ── */}
      <ServiceSection tone="parchment" title="De modellen" caption="Wat we in huis willen halen, en voor wie het bedoeld is.">
        <div className="flex items-center justify-center gap-2 mb-8">
          {BRANDS.map(b => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              aria-pressed={brand === b}
              className={`font-sans text-[10px] tracking-[0.24em] uppercase px-3.5 py-2 border transition-colors ${
                brand === b
                  ? 'bg-ink text-cream border-ink'
                  : 'border-warm-gray-light text-ink hover:border-ink'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-parchment border border-parchment">
          {models.map(model => (
            <div key={model.id} className="bg-cream p-6 flex flex-col">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-gold">{model.brand}</p>
                  <h3 className="font-serif text-xl text-ink leading-tight mt-0.5">{model.name}</h3>
                </div>
                {isLive ? (
                  <span className="text-right shrink-0">
                    <span className="block font-serif text-xl text-wine tabular-nums whitespace-nowrap">
                      {config.currency}{model.priceFrom}
                    </span>
                    <span className="block font-sans text-[9px] tracking-[0.2em] uppercase text-warm-gray-light mt-0.5">
                      vanaf
                    </span>
                  </span>
                ) : (
                  <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-warm-gray-light text-right shrink-0 whitespace-nowrap">
                    Prijs volgt
                  </span>
                )}
              </div>

              <p className="font-serif italic text-sm text-warm-gray leading-relaxed mt-4 flex-1">
                {model.description}
              </p>

              <dl className="mt-5 space-y-2 border-t border-dotted border-parchment pt-4">
                <div className="flex items-center gap-2.5">
                  <Flame size={13} className="text-wine shrink-0" />
                  <dt className="sr-only">Brandstof</dt>
                  <dd className="font-sans text-xs text-ink">{model.fuel}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Thermometer size={13} className="text-wine shrink-0" />
                  <dt className="sr-only">Maximumtemperatuur</dt>
                  <dd className="font-sans text-xs text-ink">{model.maxTemp}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Ruler size={13} className="text-wine shrink-0" />
                  <dt className="sr-only">Capaciteit</dt>
                  <dd className="font-sans text-xs text-ink">{model.capacity}</dd>
                </div>
              </dl>

              <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-4">
                Geschikt voor: {model.bestFor}
              </p>

              <button
                onClick={() => choose(model.id)}
                className={`mt-5 font-sans text-[10px] tracking-[0.24em] uppercase px-4 py-2.5 border transition-colors ${
                  selected === model.id
                    ? 'bg-wine text-cream border-wine'
                    : 'border-warm-gray-light text-ink hover:bg-wine hover:text-cream hover:border-wine'
                }`}
              >
                {selected === model.id
                  ? 'Gekozen ✓'
                  : isLive ? 'Offerte aanvragen' : 'Houd mij op de hoogte'}
              </button>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* ── Aanvraag ── */}
      <section id="oven-aanvraag" className="relative bg-cream border-t border-parchment scroll-mt-20">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <div className="text-center mb-8">
            <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
              <span className="h-px w-6 bg-gold/40" />
              <span>{isLive ? 'Offerte aanvragen' : 'Interesselijst'}</span>
              <span className="h-px w-6 bg-gold/40" />
            </div>
            <p className="font-serif italic text-warm-gray text-sm mt-3 max-w-md mx-auto">
              {isLive
                ? 'Laat weten welk model u overweegt, dan bezorgen we u prijs en levertermijn.'
                : 'Zet uzelf op de lijst. U hoort van ons zodra we kunnen leveren — vrijblijvend, geen bestelling.'}
            </p>
          </div>

          <InquiryForm
            type="oven"
            options={options}
            optionLabel="Welk model"
            preselect={selected}
            messageLabel="Waar wil u de oven zetten?"
            messagePlaceholder="Bijvoorbeeld: op het terras, vooral voor het gezin in het weekend. Twijfel tussen gas en hout."
            submitLabel={isLive ? 'Offerte aanvragen' : 'Houd mij op de hoogte'}
            successText={isLive
              ? 'We bezorgen u prijs en levertermijn, meestal binnen twee werkdagen.'
              : 'U staat op de lijst. Zodra ons ovenaanbod rond is, bent u een van de eersten die het hoort.'}
          />

          <p className="font-sans text-[11px] text-warm-gray-light italic leading-relaxed text-center mt-6 max-w-lg mx-auto">
            {data.disclaimer}
          </p>
          <p className="font-sans text-[11px] text-warm-gray-light leading-relaxed text-center mt-3 max-w-lg mx-auto">
            Gozney en Ooni zijn merknamen van hun respectieve eigenaars. Jeanke's Pizza is
            geen officiële verdeler zolang dat hier niet uitdrukkelijk vermeld staat.
          </p>
        </div>
      </section>

    </ServicePage>
  )
}
