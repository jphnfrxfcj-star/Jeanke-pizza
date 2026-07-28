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
  data/
    config.json            ← storeName, slotIntervalMinutes, openingHour, closingHour, currency
    pizzas.json            ← fallback pizzadata
    services.json          ← alle teksten/prijzen voor box, catering, workshops, ovens
netlify/
  functions/
    pizzas.mjs, wines.mjs, opening-days.mjs, slots.mjs, orders.mjs
    register.mjs, settings.mjs, admin-verify.mjs, cancel.mjs
    inquiries.mjs          ← aanvragen box/catering/workshop/oven (/api/inquiries)
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
Alle teksten, prijzen en specs staan in `src/data/services.json` — pas die aan, niet de JSX.
Elke pagina gebruikt `ServicePage` (zet `document.title`, meta-description en canonical)
en `InquiryForm`.

Aanvragen gaan naar `/api/inquiries` (Netlify Blobs, store `inquiries`) en daarna
vrijblijvend naar `/api/send-email` met `type: 'inquiry'`. Als de mail faalt is de
aanvraag toch bewaard. Beheer: `/beheer` → tab **Aanvragen** (filteren, status
nieuw/opgevolgd/afgerond, verwijderen).

**Ovens staan in conceptmodus.** Er is nog geen partnership met Gozney of Ooni. Zolang
`settings.ovensMode !== 'live'`:
- geen prijzen zichtbaar ("Prijs volgt"), badge "Aanbod in voorbereiding"
- knop en formulier heten "Houd mij op de hoogte" i.p.v. "Offerte aanvragen"
- disclaimer onderaan dat we geen officiële verdeler zijn

Omschakelen zodra de samenwerking rond is: `/beheer` → Instellingen → *Ovenaanbod live*.
Controleer dan eerst of de `priceFrom`-waarden in `services.json` nog kloppen.

## Veldnamen data
Pizzas: `id, name, ingredients[], price, emoji, suggestion`
Wines: `id, name, description, price, type, tags[]`
Inquiries: `id, type, name, email, phone, option, date, guests, location, message, status, createdAt`

## Beveiliging (al geïmplementeerd)
- Admin-wachtwoord: server-side via `/api/admin-verify`, nooit in bundle
- XSS: `escapeHtml()` in send-email.mjs op alle user input, ook op aanvraagmails
- Modal a11y: `role="dialog"`, `aria-modal`, focus-trap, Escape-key, scroll-lock
- `/api/inquiries`: lengte- en typevalidatie op elk veld, honeypot tegen bots,
  dubbele inzending binnen 2 minuten wordt genegeerd, GET/PUT/DELETE achter `x-admin-password`

## SEO — bekende beperking
De site is client-rendered. `ServicePage` zet titel, meta-description en canonical met JS,
wat Google verwerkt, maar link-previews van Facebook/LinkedIn/WhatsApp lezen alleen de
statische `index.html` en tonen dus voor élke route de homepage-OG-tags. Wie per pagina
eigen previews wil, heeft prerendering nodig (Netlify prerender-plugin of losse HTML-
bestanden per route).

## Git workflow
- Push naar de branch die in de opdracht staat, nooit naar main
- Netlify maakt automatisch een preview-URL van de branch
