import { useState, useEffect } from 'react'
import staticServices from '../data/services.json'

/**
 * Diensten laden uit /api/services, met src/data/services.json als basis.
 *
 * De opgeslagen versie wordt óver de statische gelegd, per dienst en per veld.
 * Zo blijven velden die later in code bijkomen werken, ook als de bewaarde
 * blob nog van vóór die wijziging is.
 *
 * Geeft { services, resolved } terug. `resolved` is false zolang het antwoord
 * onderweg is en de getoonde waarden dus nog uit het bestand komen. Pagina's
 * gebruiken dat om prijzen even achter te houden: een bezoeker die €58 naar
 * €64 ziet springen vertrouwt het bedrag niet meer.
 *
 * De uitkomst gaat in sessionStorage, zodat alleen de allereerste pagina van
 * een bezoek hoeft te wachten en navigeren daarna meteen klopt.
 *
 * De fetch wordt gedeeld tussen alle componenten die de hook gebruiken, zodat
 * nav, teasers en pagina samen één netwerkverzoek doen.
 */

const CACHE_KEY = 'jeanke_services'

let cache = null
let inflight = null

export function mergeServices(base, stored) {
  if (!stored || typeof stored !== 'object') return base
  const merged = { ...base }
  for (const key of Object.keys(base)) {
    if (stored[key] && typeof stored[key] === 'object') {
      merged[key] = { ...base[key], ...stored[key] }
    }
  }
  return merged
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? mergeServices(staticServices, JSON.parse(raw)) : null
  } catch { return null }
}

export function useServices() {
  const [state, setState] = useState(() => {
    if (cache) return { services: cache, resolved: true }
    const uitCache = readCache()
    if (uitCache) { cache = uitCache; return { services: uitCache, resolved: true } }
    return { services: staticServices, resolved: false }
  })

  useEffect(() => {
    if (!inflight) {
      inflight = fetch('/api/services')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
        .then(stored => {
          try {
            if (stored && typeof stored === 'object') {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(stored))
            }
          } catch { /* privémodus of vol: dan gewoon elke keer opnieuw ophalen */ }
          cache = mergeServices(staticServices, stored)
          return cache
        })
    }
    let alive = true
    // Mislukt de fetch, dan valt hij terug op het bestand en is hij evengoed
    // "resolved" — anders zouden de prijzen eeuwig verborgen blijven.
    inflight.then(services => { if (alive) setState({ services, resolved: true }) })
    return () => { alive = false }
  }, [])

  return state
}

/** Diensten die zichtbaar mogen zijn in navigatie en teasers. */
export function visibleServices(services) {
  return Object.entries(services)
    .filter(([, s]) => s.mode !== 'off')
    .map(([key, s]) => ({ key, ...s }))
}
