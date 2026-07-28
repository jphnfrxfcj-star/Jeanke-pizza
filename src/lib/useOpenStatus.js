import { useState, useEffect } from 'react'
import { generateSlotsForDates } from './slots'
import config from '../data/config.json'

/**
 * Is er nog een tijdslot vrij om te bestellen?
 *
 * Alleen bedoeld voor de dienstenpagina's, waar de shopstate niet bestaat maar
 * de nav wel dezelfde "Open"/"Gesloten"-stip moet tonen.
 *
 * De shop berekent de slots zelf en geeft het antwoord als prop mee aan
 * SiteNav. Daarom de `enabled`-schakelaar: zonder die vlag zou de nav op de
 * homepage /api/opening-days en /api/settings een tweede keer ophalen.
 *
 * Geeft null zolang het antwoord onbekend is. De nav toont dan "Gesloten" —
 * de veilige kant, want beter niets beloven dan een gesloten avond als open
 * aankondigen.
 */

let cache = null
let inflight = null

export function useOpenStatus(enabled = true) {
  const [open, setOpen] = useState(() => cache)

  useEffect(() => {
    if (!enabled || cache !== null) return
    if (!inflight) {
      inflight = Promise.all([
        fetch('/api/opening-days').then(r => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/settings').then(r => (r.ok ? r.json() : null)).catch(() => null),
      ]).then(([days, settings]) => {
        const now = new Date()
        const future = Array.isArray(days)
          ? days.filter(d => new Date(d.date + 'T23:59:59') >= now)
          : []
        return generateSlotsForDates(future, config, settings).length > 0
      })
    }
    let alive = true
    inflight.then(result => {
      cache = result
      if (alive) setOpen(result)
    })
    return () => { alive = false }
  }, [enabled])

  return open
}
