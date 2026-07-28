/**
 * Tijdslotberekening — gedeeld tussen de shop (die de slots nodig heeft om te
 * kunnen bestellen) en de topnavigatie (die alleen wil weten of er nog een slot
 * vrij is, voor de "Open"/"Gesloten"-stip).
 *
 * Woordelijk overgenomen uit App.jsx, zodat de twee niet uit elkaar groeien.
 */

export function fmtTime(h, m) {
  return `${h}:${String(m ?? 0).padStart(2, '0')}`
}

export function generateSlotsForDates(openingDates, config, settings) {
  const slots = []
  const now = new Date()
  const openingHour   = settings?.openingHour   ?? config.openingHour
  const openingMinute = settings?.openingMinute  ?? 0
  const closingHour   = settings?.closingHour    ?? config.closingHour
  const closingMinute = settings?.closingMinute  ?? 0
  for (const { date } of openingDates) {
    const d = new Date(date + 'T00:00:00')
    if (new Date(date + 'T23:59:59') < now) continue
    const dateStr = date
    const start = new Date(d); start.setHours(openingHour, openingMinute, 0, 0)
    const end   = new Date(d); end.setHours(closingHour, closingMinute, 0, 0)
    const cursor = new Date(start)
    while (cursor < end) {
      if (cursor > new Date(now.getTime() + 15 * 60 * 1000)) {
        slots.push({ date: dateStr, time: cursor.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }) })
      }
      cursor.setMinutes(cursor.getMinutes() + (settings?.slotIntervalMinutes ?? config.slotIntervalMinutes))
    }
  }
  return slots
}
