import { useState } from 'react'
import { Check } from 'lucide-react'
import ServicePage, { ServiceSection } from './ServicePage'
import InquiryForm from './InquiryForm'
import services from '../data/services.json'
import config from '../data/config.json'

const data = services.catering

export default function Catering() {
  const [selected, setSelected] = useState('')

  const options = data.formulas.map(f => ({
    value: f.id,
    label: f.pricePerPerson
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
          {data.formulas.map(formula => (
            <div key={formula.id} className="bg-cream p-6 sm:p-7">
              {/* Zelfde opzet als de workshopkaarten: naam links, prijs rechts
                  op dezelfde regel, ook op mobiel. Vandaar geen flex-wrap. */}
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-2xl text-ink leading-tight">{formula.name}</h3>
                {formula.pricePerPerson ? (
                  <span className="font-serif text-2xl text-wine tabular-nums whitespace-nowrap shrink-0">
                    {config.currency}{formula.pricePerPerson}
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray ml-1.5">p.p.</span>
                  </span>
                ) : (
                  <span className="font-serif italic text-lg text-wine whitespace-nowrap shrink-0">Op maat</span>
                )}
              </div>

              <p className="font-sans text-[10px] tracking-[0.24em] uppercase text-warm-gray mt-1.5">
                {formula.guests} · {formula.duration}
              </p>

              <p className="font-serif italic text-warm-gray leading-relaxed mt-4">{formula.description}</p>

              <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {formula.includes.map(item => (
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
                {selected === formula.id ? 'Gekozen ✓' : 'Deze formule aanvragen'}
              </button>
            </div>
          ))}
        </div>

        <p className="font-sans text-xs text-warm-gray-light italic text-center mt-5 leading-relaxed">
          Vanafprijzen per persoon, inclusief deeg, ingrediënten, bakker en materiaal.
          Drank is niet inbegrepen.
        </p>
      </ServiceSection>

      {/* ── Praktisch ── */}
      <ServiceSection tone="parchment" title="Praktisch" caption="Wat we nodig hebben om bij u te bakken.">
        <ul className="max-w-xl mx-auto divide-y divide-dotted divide-parchment border-y border-parchment">
          {data.practical.map(item => (
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
              <span>Datum vastleggen</span>
              <span className="h-px w-6 bg-gold/40" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight mt-4">
              Wanneer mogen we <span className="italic text-gold">komen bakken</span>?
            </h2>
            <p className="font-sans text-sm text-cream/60 leading-relaxed mt-4 max-w-md mx-auto">
              Geef ons uw datum en het aantal gasten door. U krijgt een voorstel op maat, vrijblijvend.
            </p>
          </div>

          <InquiryForm
            type="catering"
            options={options}
            optionLabel="Formule"
            preselect={selected}
            fields={{ date: true, dateRequired: true, guests: true, location: true }}
            messageLabel="Vertel ons over uw feest"
            messagePlaceholder="Wat voor gelegenheid, hoe laat wil u eten, zijn er allergieën of vegetariërs?"
            submitLabel="Vrijblijvend voorstel vragen"
            successText="We nemen uw datum door en sturen u een voorstel op maat, meestal binnen twee werkdagen."
          />
        </div>
      </section>

    </ServicePage>
  )
}
