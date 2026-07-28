import { useState } from 'react'
import { Check } from 'lucide-react'
import ServicePage, { ServiceSection, StatusBadge, ctaLabel } from './ServicePage'
import InquiryForm from './InquiryForm'
import { useServices } from '../lib/useServices'
import config from '../data/config.json'

export default function Catering() {
  const data = useServices().catering
  const [selected, setSelected] = useState('')

  const concept = data.mode === 'concept'
  const formulas = data.formulas || []

  const options = formulas.map(f => ({
    value: f.id,
    label: !concept && f.pricePerPerson
      ? `${f.name} — vanaf ${config.currency}${f.pricePerPerson} p.p.`
      : `${f.name} — op maat`,
  }))

  function choose(id) {
    setSelected(id)
    document.getElementById('catering-aanvraag')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <ServicePage service={data}>

      {/* ── Formules ── */}
      <ServiceSection title="De formules" caption="Van receptie tot volledig avondmaal.">
        <div className="space-y-px bg-parchment border border-parchment">
          {/* Kaarten zijn wit, niet cream: op mobiel staan ze volle breedte
              op een cream pagina en gingen ze op in de achtergrond. */}
          {formulas.map(formula => (
            <div key={formula.id} className="bg-white p-6 sm:p-7">
              {/* Zelfde opzet als de workshopkaarten: naam links, prijs rechts
                  op dezelfde regel, ook op mobiel. Vandaar geen flex-wrap. */}
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-2xl text-ink leading-tight">{formula.name}</h3>
                {concept ? (
                  <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray-light whitespace-nowrap shrink-0">
                    Prijs volgt
                  </span>
                ) : formula.pricePerPerson ? (
                  <span className="font-serif text-2xl text-wine tabular-nums whitespace-nowrap shrink-0">
                    {config.currency}{formula.pricePerPerson}
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray ml-1.5">p.p.</span>
                  </span>
                ) : (
                  <span className="font-serif italic text-lg text-wine whitespace-nowrap shrink-0">Op maat</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1.5">
                <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray">
                  {formula.guests} · {formula.duration}
                </p>
                <StatusBadge status={formula.status} />
              </div>

              <p className="font-serif italic text-warm-gray leading-relaxed mt-4">{formula.description}</p>

              <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {(formula.includes || []).map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={13} className="text-wine mt-1 shrink-0" />
                    <span className="font-sans text-sm text-ink">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(formula.id)}
                className={`mt-6 font-sans text-[10px] tracking-[0.24em] uppercase px-4 py-2.5 border transition-colors ${
                  selected === formula.id
                    ? 'bg-wine text-cream border-wine'
                    : 'border-warm-gray-light text-ink hover:bg-wine hover:text-cream hover:border-wine'
                }`}
              >
                {ctaLabel({ selected: selected === formula.id, status: formula.status, concept, fallback: 'Deze formule aanvragen' })}
              </button>
            </div>
          ))}
        </div>

        {!concept && (
          <p className="font-sans text-xs text-warm-gray-light italic text-center mt-5 leading-relaxed">
            Vanafprijzen per persoon, inclusief deeg, ingrediënten, bakker en materiaal.
            Drank is niet inbegrepen.
          </p>
        )}
      </ServiceSection>

      {/* ── Praktisch ── */}
      <ServiceSection tone="parchment" title="Praktisch" caption="Wat we nodig hebben om bij u te bakken.">
        <ul className="max-w-xl mx-auto divide-y divide-dotted divide-parchment border-y border-parchment">
          {(data.practical || []).map(item => (
            <li key={item} className="py-3.5 flex items-start gap-3">
              <span className="text-gold mt-1 text-xs shrink-0">✦</span>
              <span className="font-sans text-sm text-ink leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </ServiceSection>

      {/* ── Aanvraag ── */}
      <section id="catering-aanvraag" className="relative bg-ink text-cream scroll-mt-20 overflow-hidden">
        <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="catering-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#BFA06A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#catering-dots)" />
        </svg>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <div className="text-center mb-8">
            <div className="flex items-center gap-3 justify-center font-sans text-[10px] tracking-[0.32em] uppercase text-gold">
              <span className="h-px w-6 bg-gold/40" />
              <span>{concept ? 'Interesselijst' : 'Datum vastleggen'}</span>
              <span className="h-px w-6 bg-gold/40" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight mt-4">
              {concept ? (
                <>Interesse in <span className="italic text-gold">onze catering</span>?</>
              ) : (
                <>Wanneer mogen we <span className="italic text-gold">komen bakken</span>?</>
              )}
            </h2>
            <p className="font-sans text-sm text-cream/60 leading-relaxed mt-4 max-w-md mx-auto">
              {concept
                ? 'We zijn de cateringformules nog aan het uitwerken. Laat iets weten, dan nemen we contact op zodra we boekingen aannemen.'
                : 'Geef ons uw datum en het aantal gasten door. U krijgt een voorstel op maat, vrijblijvend.'}
            </p>
          </div>

          <InquiryForm
            type="catering"
            options={options}
            optionLabel="Formule"
            preselect={selected}
            fields={{ date: true, dateRequired: !concept, guests: true, location: true }}
            messageLabel="Vertel ons over uw feest"
            messagePlaceholder="Wat voor gelegenheid, hoe laat wil u eten, zijn er allergieën of vegetariërs?"
            submitLabel={concept ? 'Houd mij op de hoogte' : 'Vrijblijvend voorstel vragen'}
            successText={concept
              ? 'U staat op de lijst. Zodra we cateringboekingen aannemen, laten we het weten.'
              : 'We nemen uw datum door en sturen u een voorstel op maat, meestal binnen twee werkdagen.'}
          />
        </div>
      </section>

    </ServicePage>
  )
}
