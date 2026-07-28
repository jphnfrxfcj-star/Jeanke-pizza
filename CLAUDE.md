# Jeanke's Pizza — Claude briefing

## Project
React + Vite + Tailwind CSS v3, hosted on Netlify.
Branch voor nieuwe design: `claude/new-design` (push hier naartoe, nooit naar main).
Prod-branch: `claude/pizza-ordering-app-qCbom`.

## Stack
- Frontend: React (JSX), Tailwind CSS v3
- Backend: Netlify Functions (ESM `.mjs`)
- Storage: Netlify Blobs (geen database)
- Fonts: DM Serif Display (font-serif), DM Sans (font-sans)

## Design tokens (tailwind.config.js)
- `cream` — achtergrond
- `parchment` — subtiele borders/vlakken
- `wine` — primaire accentkleur (terracotta ~#A0522D)
- `wine-light` — hover state
- `gold` — ornamenteel
- `ink` — tekst
- `warm-gray`, `warm-gray-light` — secundaire tekst
- `olive` — focus ring

## Bestandsstructuur
```
src/
  App.jsx                  ← router + Shop() + inline secties + ServiceTeasers()
  index.css                ← Tailwind + @keyframes slide
  components/
    PizzaCard.jsx          ← typografische tile, fly-to-cart
    Cart.jsx               ← "Il Conto" receipt-stijl
    CheckoutModal.jsx      ← bevat wijn-suggesties
    Admin.jsx              ← /beheer route
    Cancel.jsx             ← /annuleer route
    Unsubscribe.jsx        ← /uitschrijven route
    SiteNav.jsx            ← gedeelde topnav + mobiel menu (exporteert NAV_LINKS)
    SiteFooter.jsx         ← gedeelde 4-koloms footer met nieuwsbriefformulier
    ServicePage.jsx        ← shell voor dienstenpagina's + ServiceSection helper
    InquiryForm.jsx        ← herbruikbaar aanvraagformulier (honeypot, /api/inquiries)
    PizzaBox.jsx           ← /box route
    Catering.jsx           ← /catering route
    Workshops.jsx          ← /workshops route
    Ovens.jsx              ← /ovens route
    PaperTexture.jsx, SectionLabel.jsx
  lib/
    useServices.js         ← laadt /api/services over services.json heen (mergeServices)
  data/
    config.json            ← storeName, slotIntervalMinutes, openingHour, closingHour, currency
    pizzas.json            ← fallback pizzadata
    services.json          ← alle teksten/prijzen voor box, catering, workshops, ovens
netlify/
  functions/
    pizzas.mjs, wines.mjs, opening-days.mjs, slots.mjs, orders.mjs
    register.mjs, settings.mjs, admin-verify.mjs, cancel.mjs
    inquiries.mjs          ← aanvragen box/catering/workshop/oven (/api/inquiries)
    services.mjs           ← beheerbare dienstendata (/api/services)
    send-email.mjs         ← escapeHtml() tegen XSS; types: confirmation, registration,
                             threshold, inquiry
    newsletter-subscribers.mjs, newsletter-editions.mjs, unsubscribe.mjs
    ingredients.mjs, expenses.mjs, costs.mjs, scan-label.mjs
```

## App.jsx structuur (Shop view)
Routes (pathname-based, trailing slash wordt gestript):
`/beheer` → Admin · `/annuleer` → Cancel · `/uitschrijven` → Unsubscribe ·
`/box` → PizzaBox · `/catering` → Catering · `/workshops` → Workshops ·
`/ovens` → Ovens · anders → Shop

Navigatie tussen pagina's gaat via gewone `<a href>` (volledige paginalading, geen
client-side router). Netlify's SPA-redirect vangt alle paden op naar index.html.

Shop state: `cart`, `wineCart`, `showCheckout`, `successOrder`, `pizzas`, `wines`, `openingDays`, `registration`, `settings`, `regName/regEmail/regPizzas/regStatus`

Conditionele views:
1. Loading: `openingDays === null || registration === null`
2. Registration: `registration?.registrationOpen === true`
3. Success: `successOrder`
4. Shop: standaard

Sectienummering op de homepage: N° I Suggesties · N° II Il Menù · N° III La Cantina ·
N° IV Oltre la pizza (teasers) · N° V Il Racconto. Elke dienstenpagina heeft haar eigen
nummer in `services.json` (`num`).

## Diensten (box, catering, workshops, ovens)

### Waar de data vandaan komt
`src/data/services.json` is de basis en blijft de bron van waarheid voor een verse
omgeving. Daaroverheen legt `useServices()` wat er in Netlify Blobs staat (store
`services`, key `config`), **per dienst en per veld**. Gevolg: velden die later in
code bijkomen blijven werken, ook als de bewaarde blob ouder is. Wijzig teksten dus
in `services.json`, niet in de JSX.

Prijzen, formules en modus wijzigt u in `/beheer` → tab **Diensten**. Dat schrijft naar
de blob en is meteen zichtbaar, zonder deploy.

### Modus per dienst
Elke dienst heeft `mode`:
- `live` — gewone pagina met prijzen
- `concept` — badge uit `conceptBadge`, geen prijzen ("Prijs volgt"), knoppen en
  formulier heten "Houd mij op de hoogte" in plaats van offerte/reserveren
- `off` — verdwijnt uit navigatie en homepage-teasers; de pagina blijft bestaan en
  toont `offNotice`, zodat bestaande links en zoekresultaten niet doodlopen

`ServicePage` regelt `concept` en `off` centraal; de pagina's zelf verbergen enkel
hun prijzen. **Ovens staat standaard op `concept`** omdat er nog geen partnership is
met Gozney of Ooni — controleer de `priceFrom`-waarden vóór u op live zet.

### Status per item
Elke box, formule, workshop en oven heeft `status`: leeg, `nieuw`, `op-aanvraag` of
`volzet`. Bij `volzet` heet de knop "Op de wachtlijst" — de aanvraag blijft dus mogelijk.

### Foto's bij de ovens
Elk ovenmodel heeft `imageUrl`, in te vullen via `/beheer` → Diensten → Ovens.
Een pad naar `public/` (bv. `/ovens/roccbox.jpg`) of een volledige URL.

`ModelImage` in `Ovens.jsx` regelt drie gevallen:
- geen enkel model in beeld heeft een foto → het fotoblok valt volledig weg
- sommige wel, sommige niet → de kaarten zonder foto houden hun plek vrij met de
  merknaam erin, anders wordt het raster rafelig
- gebroken pad → dezelfde gereserveerde plek in plaats van een gebroken-beeldicoon

`object-contain` in een 4:3-kader, zodat een oven op witte achtergrond niet wordt
afgesneden. Het veldtype `image` in `SERVICE_FIELDS` is generiek — één regel volstaat
om ook boxen, formules of workshops een foto te geven.

**Rechten:** zet er geen persfoto's van Gozney of Ooni in zonder toestemming. Zolang
er geen partnership is, is er geen gebruiksrecht op hun beeldmateriaal.

### Aanvragen
Gaan naar `/api/inquiries` (Netlify Blobs, store `inquiries`). **Die function stuurt de
mails zelf**, met een interne call naar `/api/send-email` en `x-internal-token`. De
browser raakt `/api/send-email` niet aan — anders zou dat endpoint een open mailrelay
zijn voor het type `inquiry`. Faalt de mail, dan is de aanvraag toch bewaard.

De formulenaam in de mail wordt server-side opgezocht in de `services`-blob; het label
dat de browser meestuurt is alleen een terugval. Beheer: `/beheer` → tab **Aanvragen**
(filteren, status nieuw/opgevolgd/afgerond, verwijderen).

### Nog niet beheerbaar (staat in services.json)
Intro, tagline, teaser, praktische voorwaarden, "in de box"-lijst, de stappenblokken
(`steps`, `flow`), de tip, `conceptBadge`, `offNotice`, merkomschrijvingen, de
disclaimer en de SEO-velden. Sectievolgorde, iconen en N°-nummering horen bewust in
code — dat is ontwerp, geen bedrijfsvoering.

## Veldnamen data
Pizzas: `id, name, ingredients[], price, emoji, suggestion`
Wines: `id, name, description, price, type, tags[]`
Inquiries: `id, type, name, email, phone, option, date, guests, location, message, status, createdAt`
Diensten: elke dienst heeft `mode`, `route`, `num`, `eyebrow`, `title`, `tagline`, `intro`,
`teaser`, `metaTitle`, `metaDescription`, `conceptBadge`, `offNotice` + een eigen itemlijst
(`packages` / `formulas` / `types` / `models`). Elk item heeft `id`, `name` en `status`.

## Beveiliging (al geïmplementeerd)
- Admin-wachtwoord: server-side via `/api/admin-verify`, nooit in bundle
- XSS: `escapeHtml()` in send-email.mjs op alle user input, ook op aanvraagmails
- Modal a11y: `role="dialog"`, `aria-modal`, focus-trap, Escape-key, scroll-lock
- `/api/inquiries`: lengte- en typevalidatie op elk veld, honeypot tegen bots,
  dubbele inzending binnen 2 minuten wordt genegeerd, GET/PUT/DELETE achter `x-admin-password`
- `/api/inquiries`: floodgrens van 10 aanvragen per 5 minuten (429), interne
  foutteksten worden niet naar de client teruggegeven
- `/api/services`: PUT achter `x-admin-password`, bewaart alleen de vier bekende
  dienstsleutels, weigert een onbekende `mode` (die zou een dienst ongemerkt
  onzichtbaar maken) en een payload boven 256 kB
- `/api/send-email`: `type: 'inquiry'` staat in `INTERNAL_ONLY` en vereist
  `x-internal-token` = `ADMIN_PASSWORD`

## Openstaand na de security-review
- **`/api/send-email` is nog open voor `confirmation`, `registration` en `threshold`.**
  Die worden vanuit de browser aangeroepen (CheckoutModal, App.handleRegister), dus wie
  dan ook kan mail laten versturen vanaf het Gmail-account. Dezelfde oplossing als bij
  de aanvragen: `orders.mjs` en `register.mjs` laten mailen en die types ook in
  `INTERNAL_ONLY` zetten. Raakt de afrekenflow, dus niet ongetest doorvoeren.
- **Read-modify-write op één blobsleutel** (orders, register, newsletter, inquiries):
  twee gelijktijdige inzendingen kunnen elkaar overschrijven. Netlify Blobs heeft geen
  compare-and-swap; een sleutel per record zou dit oplossen.
- **Geen privacyverklaring en geen bewaartermijn** voor de persoonsgegevens in
  `inquiries` (naam, e-mail, telefoon, locatie, bericht).
- Adminwachtwoord staat in `sessionStorage`. Aanvaardbaar zolang er geen XSS is —
  er staat nergens `dangerouslySetInnerHTML` of `innerHTML` in de code.

## SEO — bekende beperking
De site is client-rendered. `ServicePage` zet titel, meta-description en canonical met JS,
wat Google verwerkt, maar link-previews van Facebook/LinkedIn/WhatsApp lezen alleen de
statische `index.html` en tonen dus voor élke route de homepage-OG-tags. Wie per pagina
eigen previews wil, heeft prerendering nodig (Netlify prerender-plugin of losse HTML-
bestanden per route).

## Git workflow
- Push naar de branch die in de opdracht staat, nooit naar main
- Netlify maakt automatisch een preview-URL van de branch
