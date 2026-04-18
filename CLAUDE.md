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
  App.jsx                  ← hoofdfile, bevat Shop() + inline secties
  index.css                ← Tailwind + @keyframes slide
  components/
    PizzaCard.jsx          ← nieuwe design (typografische tile, fly-to-cart)
    Cart.jsx               ← nieuwe design ("Il Conto" receipt-stijl)
    CheckoutModal.jsx      ← bestaand, bevat wijn-suggesties
    Admin.jsx              ← /beheer route
    Cancel.jsx             ← /annuleer route
  data/
    config.json            ← storeName, slotIntervalMinutes, openingHour, closingHour, currency
    pizzas.json            ← fallback pizzadata
netlify/
  functions/
    pizzas.mjs
    wines.mjs
    opening-days.mjs
    slots.mjs
    orders.mjs
    register.mjs
    settings.mjs
    send-email.mjs         ← escapeHtml() toegevoegd tegen XSS
    admin-verify.mjs       ← server-side wachtwoordcheck (/api/admin-verify)
    cancel-order.mjs
```

## App.jsx structuur (Shop view)
Routes: `/beheer` → Admin, `/annuleer` → Cancel, anders → Shop

Shop state: `cart`, `wineCart`, `showCheckout`, `successOrder`, `pizzas`, `wines`, `openingDays`, `registration`, `settings`, `regName/regEmail/regPizzas/regStatus`

Conditionele views:
1. Loading: `openingDays === null || registration === null`
2. Registration: `registration?.registrationOpen === true`
3. Success: `successOrder`
4. Shop: standaard

**TODO (nog niet gedaan):** App.jsx herschrijven met nieuwe design-layout:
- TopNav (backdrop-blur, "Jeanke's" wordmark, 3 anchor links, pulse dot)
- Hero (grote typografische h1, roterende SVG-seal 180-220px)
- AnnouncementBar (CSS `slide` ticker, `animate-[slide_50s_linear_infinite]`)
- Suggestions sectie (parchment bg, curated picks)
- WineRow layout (i.p.v. wijnkaart-cards)
- Story sectie (Il Racconto, dotted SVG pattern)
- 4-koloms Footer
- MobileCartBar (`bg-ink text-cream`, vervangt huidige floating bar)
- PaperTexture SVG (`opacity-[0.035] mix-blend-multiply`)
- SectionLabel helper (`N° {n}` prefix)

Referentie prototype: `/tmp/pizza-v2/pizza-repo/app.jsx` (1091 regels)
Relevante secties: Hero L172-237, AnnouncementBar L243-256, Suggestions L359-388, WineRow L401-430, MobileCartBar L766-784, Story L980-1018, Footer L1038-1071, TopNav L898-914

## Veldnamen data
Pizzas: `id, name, ingredients[], price, emoji, suggestion` (NB: prototype gebruikt `suggestie`, onze data gebruikt `suggestion`)
Wines: `id, name, description, price, type, tags[]`

## Beveiliging (al geïmplementeerd)
- Admin-wachtwoord: server-side via `/api/admin-verify`, nooit in bundle
- XSS: `escapeHtml()` in send-email.mjs op alle user input
- Modal a11y: `role="dialog"`, `aria-modal`, focus-trap, Escape-key, scroll-lock

## Git workflow
- Werk altijd op `claude/new-design`
- Push: `git push -u origin claude/new-design`
- Netlify maakt automatisch preview-URL van de branch
