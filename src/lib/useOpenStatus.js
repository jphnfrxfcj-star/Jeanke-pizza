import { useState, useEffect } from 'react'
import { generateSlotsForDates } from './slots'
import config from '../data/config.json'

/**
 * Is er nog een tijdslot vrij om te bestellen?
 *
 * Alleen bedoeld voor de dienstenpagina's, waar de shopstate niet bestaat maar
 * de nav wel dezelfde "Open"/"Gesloten"-stip moet tonen. De shop zelf berekent
 * de slots al en geeft het antwoord als prop mee aan SiteNav, zodat daar geen
 * tweede keer wordt opgehaald.
 *
 * Geeft null zolang het antwoord nog niet bekend is. De nav houdt dan de plek
 * al vrij, zodat er niets verspringt wanneer de data binnenkomt.
 */

let cache = null
let inflight = null

export function useOpenStatus() {
  const [open, setOpen] = useState(() => cache)

  useEffect(() => {
    if (cache !== null) return
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
  }, [])

  return open
}
