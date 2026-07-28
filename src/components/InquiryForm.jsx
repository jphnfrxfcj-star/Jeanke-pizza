import { useState, useEffect } from 'react'

const INPUT = "w-full border border-parchment bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-olive transition-colors"
const LABEL = "block font-sans text-[11px] tracking-[0.24em] uppercase text-warm-gray mb-2"

/**
 * Aanvraagformulier voor box, catering, workshops en ovens.
 * Bewaart de aanvraag via /api/inquiries. Die function verstuurt de
 * bevestigingsmails zelf, server-side — de browser raakt /api/send-email niet aan.
 *
 * Props:
 *   type         — 'box' | 'catering' | 'workshop' | 'oven'
 *   options      — [{ value, label }] voor de keuzelijst (optioneel)
 *   optionLabel  — label boven de keuzelijst, bv. "Formule"
 *   preselect    — value die van buitenaf geselecteerd wordt (bv. na klik op een kaart)
 *   fields       — { date, guests, location } welke extra velden getoond worden
 *   messageLabel / messagePlaceholder
 *   submitLabel  — tekst op de knop
 *   successText  — bevestigingstekst na verzenden
 */
export default function InquiryForm({
  type,
  options = [],
  optionLabel = 'Formule',
  preselect = '',
  fields = {},
  messageLabel = 'Uw vraag of opmerking',
  messagePlaceholder = 'Vertel ons kort wat u in gedachten hebt.',
  submitLabel = 'Aanvraag versturen',
  successText = 'We nemen zo snel mogelijk contact met u op.',
}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', option: preselect,
    date: '', guests: '', location: '', message: '', website: '',
  })
  const [status, setStatus] = useState('') // '' | 'loading' | 'success' | 'error'

  useEffect(() => {
    if (preselect) setForm(f => ({ ...f, option: preselect }))
  }, [preselect])

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (status === 'error' || status === 'busy') setStatus('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')

    const payload = {
      type,
      name: form.name,
      email: form.email,
      phone: form.phone,
      option: form.option,
      // Leesbare naam meesturen als hint; de server zoekt hem zelf op en
      // gebruikt deze alleen als dat niet lukt.
      optionLabel: options.find(o => o.value === form.option)?.label || '',
      date: fields.date ? form.date : '',
      guests: fields.guests ? form.guests : '',
      location: fields.location ? form.location : '',
      message: form.message,
      website: form.website,
    }

    try {
      // De bevestigingsmails verstuurt /api/inquiries zelf, server-side.
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 429) { setStatus('busy'); return }
      if (!res.ok) { setStatus('error'); return }
      setStatus('success')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="bg-ivory border-y sm:border border-parchment -mx-4 sm:mx-0 px-6 py-10 text-center">
        <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 56 56" className="text-wine" aria-hidden="true">
            <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <text x="28" y="33" textAnchor="middle" fontSize="16" fontFamily="serif" fill="currentColor">✓</text>
          </svg>
        </div>
        <p className="font-serif italic text-2xl text-ink mb-2">Grazie mille!</p>
        <p className="font-sans text-sm text-warm-gray leading-relaxed max-w-sm mx-auto">{successText}</p>
        <p className="font-sans text-xs text-warm-gray-light mt-4">
          Een bevestiging is onderweg. Niet ontvangen? Kijk ook in uw spammap.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      /* Volle schermbreedte op mobiel: -mx-4 heft de px-4 van de sectie op.
         De zijranden vervallen dan, want die zouden tegen de schermrand
         plakken; boven en onder blijven ze staan als afbakening. */
      className="bg-ivory border-y sm:border border-parchment -mx-4 sm:mx-0"
    >
      <div className="px-5 sm:px-6 py-5 border-b border-dashed border-parchment">
        <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-gold">Aanvraag</p>
        <p className="font-serif italic text-xl text-ink mt-1">Laat iets van u horen</p>
      </div>

      <div className="px-5 sm:px-6 py-6 space-y-4">
        {/* Honeypot — verborgen voor mensen, zichtbaar voor bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor={`website-${type}`}>Laat dit veld leeg</label>
          <input id={`website-${type}`} type="text" tabIndex={-1} autoComplete="off"
            value={form.website} onChange={e => set('website', e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`name-${type}`} className={LABEL}>Naam</label>
            <input id={`name-${type}`} type="text" required maxLength={100} className={INPUT}
              placeholder="Uw naam" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label htmlFor={`email-${type}`} className={LABEL}>E-mail</label>
            <input id={`email-${type}`} type="email" required maxLength={254} className={INPUT}
              placeholder="uw@email.be" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`phone-${type}`} className={LABEL}>Telefoon <span className="normal-case tracking-normal text-warm-gray-light">(optioneel)</span></label>
            <input id={`phone-${type}`} type="tel" maxLength={40} className={INPUT}
              placeholder="04xx xx xx xx" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          {options.length > 0 && (
            <div>
              <label htmlFor={`option-${type}`} className={LABEL}>{optionLabel}</label>
              <select id={`option-${type}`} className={INPUT} value={form.option} onChange={e => set('option', e.target.value)}>
                <option value="">Nog geen voorkeur</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {(fields.date || fields.guests) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.date && (
              <div>
                <label htmlFor={`date-${type}`} className={LABEL}>
                  Gewenste datum {!fields.dateRequired && <span className="normal-case tracking-normal text-warm-gray-light">(optioneel)</span>}
                </label>
                <input id={`date-${type}`} type="date" className={INPUT} required={!!fields.dateRequired}
                  value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            )}
            {fields.guests && (
              <div>
                <label htmlFor={`guests-${type}`} className={LABEL}>Aantal personen</label>
                <input id={`guests-${type}`} type="number" min="1" max="1000" className={INPUT}
                  placeholder="bv. 40" value={form.guests} onChange={e => set('guests', e.target.value)} />
              </div>
            )}
          </div>
        )}

        {fields.location && (
          <div>
            <label htmlFor={`location-${type}`} className={LABEL}>Locatie</label>
            <input id={`location-${type}`} type="text" maxLength={120} className={INPUT}
              placeholder="Gemeente of adres van het feest" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
        )}

        <div>
          <label htmlFor={`message-${type}`} className={LABEL}>{messageLabel}</label>
          <textarea id={`message-${type}`} rows={4} maxLength={2000} className={`${INPUT} resize-y`}
            placeholder={messagePlaceholder} value={form.message} onChange={e => set('message', e.target.value)} />
        </div>

        {status === 'error' && (
          <p className="font-sans text-xs text-wine italic">Er ging iets mis bij het versturen. Probeer opnieuw of mail ons rechtstreeks.</p>
        )}
        {status === 'busy' && (
          <p className="font-sans text-xs text-wine italic">Er komen nu veel aanvragen binnen. Probeer het over een paar minuten nog eens.</p>
        )}

        <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
          {status === 'loading' ? 'Versturen...' : submitLabel}
        </button>

        <p className="font-sans text-[11px] text-warm-gray-light leading-relaxed text-center">
          We gebruiken uw gegevens enkel om deze aanvraag te beantwoorden.
        </p>
      </div>
    </form>
  )
}
