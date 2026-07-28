import { useState, useEffect } from 'react'
import staticServices from '../data/services.json'

/**
 * Diensten laden uit /api/services, met src/data/services.json als basis.
 *
 * De opgeslagen versie wordt óver de statische gelegd, per dienst en per veld.
 * Zo blijven velden die later in code bijkomen werken, ook als de bewaarde
 * blob nog van vóór die wijziging is.
 *
 * De fetch wordt gedeeld tussen alle componenten die de hook gebruiken, zodat
 * nav, teasers en pagina samen één netwerkverzoek doen.
 */

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

export function useServices() {
  const [services, setServices] = useState(() => cache || staticServices)

  useEffect(() => {
    if (cache) return
    if (!inflight) {
      inflight = fetch('/api/services')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
    }
    let alive = true
    inflight.then(stored => {
      cache = mergeServices(staticServices, stored)
      if (alive) setServices(cache)
    })
    return () => { alive = false }
  }, [])

  return services
}

/** Diensten die zichtbaar mogen zijn in navigatie en teasers. */
export function visibleServices(services) {
  return Object.entries(services)
    .filter(([, s]) => s.mode !== 'off')
    .map(([key, s]) => ({ key, ...s }))
}
