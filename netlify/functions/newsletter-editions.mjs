import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL    = process.env.OWNER_EMAIL || GMAIL_USER
const SITE_URL       = process.env.URL || "https://secretpizza.be"

const C = {
  cream:      "#F7F1E8",
  cardBg:     "#FFFBF4",
  panel:      "#F4E8D5",
  panelFoot:  "#F0E3CD",
  terracotta: "#C4572A",
  brown:      "#3A2A1E",
  gold:       "#A8854A",
  goldRule:   "#E2CEA8",
  muted:      "#6B5848",
  border:     "#E8D9C3",
  chipBg:     "#FBF3E7",
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

function flankedLabel(text, ruleColor = C.goldRule, textColor = C.gold) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td style="width:30px;border-top:1px solid ${ruleColor};font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding:0 12px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${textColor};white-space:nowrap;">${text}</td>
        <td style="width:30px;border-top:1px solid ${ruleColor};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>`
}

// ── Newsletter HTML template ────────────────────────────────────────────────
function newsletterHtml({ number, thema, titelLinks, titelRechts, intro, ophaalDag, ophaalDatum, ophaalTijden, pizzas = [], subscriberName, unsubscribeToken, slotIntervalMinutes = 15 }) {
  const unsubUrl  = `${SITE_URL}/uitschrijven?token=${escapeHtml(unsubscribeToken)}`
  const greeting  = subscriberName ? escapeHtml(subscriberName) : "beste pizza-liefhebber"
  const themaLabel = thema ? `N° ${escapeHtml(String(number))} &middot; ${escapeHtml(thema)}` : `N° ${escapeHtml(String(number))}`

  const headline = titelRechts
    ? `${escapeHtml(titelLinks)} <em style="color:${C.terracotta};">&amp;</em> ${escapeHtml(titelRechts)}`
    : escapeHtml(titelLinks || "")

  const pizzaCards = pizzas.map((p) => `
    <tr><td class="px2" style="padding:0 16px 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:${C.cardBg};border:1px solid ${C.border};border-left:3px solid ${C.terracotta};">
        <tr><td style="padding:18px 22px 16px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">${escapeHtml(p.categorie || p.label || "")}</p>
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-weight:400;color:${C.brown};line-height:1.2;">${escapeHtml(p.naam || p.name || "")}</p>
          <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.muted};line-height:1.6;">${escapeHtml(p.beschrijving || p.description || "")}</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="border-top:1px dotted ${C.border};padding-top:12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-family:Georgia,serif;font-size:12px;color:${C.gold};vertical-align:middle;">&#10022;</td>
                <td align="right" style="font-family:Georgia,serif;font-size:16px;font-weight:bold;color:${C.terracotta};vertical-align:middle;">${escapeHtml(p.prijs || p.price || "")}</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`).join("")

  return `<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Jeanke's Pizza</title>
  <style>
    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .px        { padding-left:20px !important; padding-right:20px !important; }
      .px2       { padding-left:12px !important; padding-right:12px !important; }
      .hl        { font-size:30px !important; }
      .dt        { font-size:42px !important; }
      .stack     { display:block !important; width:100% !important; box-sizing:border-box !important; }
      .stack-gap { display:block !important; width:100% !important; height:10px !important;
                   line-height:10px !important; font-size:0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
<tr><td align="center" style="padding:0;">
<table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">

  <!-- Terracotta top bar -->
  <tr><td style="background:${C.terracotta};padding:11px 0;text-align:center;">
    <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#fff;font-style:italic;">Piccola pizzeria artigianale</p>
  </td></tr>

  <!-- Editorial header -->
  <tr><td class="px" style="background:#fff;padding:44px 28px 32px;">
    <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.terracotta};">${themaLabel}</p>
    <h1 class="hl" style="margin:0 0 16px;font-family:Georgia,serif;font-size:38px;font-weight:800;letter-spacing:-1px;line-height:1.14;color:${C.brown};">${headline}</h1>
    ${intro ? `<p style="margin:0;font-family:Georgia,serif;font-size:15px;color:${C.muted};line-height:1.7;font-style:italic;">${escapeHtml(intro)}</p>` : ""}
  </td></tr>

  <!-- Ophaaldag block (light parchment panel) -->
  <tr><td class="px" style="background:${C.panel};padding:38px 24px;text-align:center;border-top:1px solid ${C.border};border-bottom:1px solid ${C.border};">
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:${C.terracotta};">Ophaaldag</p>
    <p style="margin:0;font-family:Georgia,serif;font-size:17px;font-style:italic;color:${C.muted};">${escapeHtml(ophaalDag || "")}</p>
    <p class="dt" style="margin:4px 0 18px;font-family:Georgia,serif;font-size:50px;font-weight:800;color:${C.brown};line-height:1.05;">${escapeHtml(ophaalDatum || "")}</p>
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
      <tr>
        <td style="width:44px;border-top:1px solid ${C.terracotta};font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding:0 10px;color:${C.terracotta};font-size:14px;">&#10022;</td>
        <td style="width:44px;border-top:1px solid ${C.terracotta};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:19px;font-style:italic;color:${C.terracotta};">${escapeHtml(ophaalTijden || "")}</p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">Tijdslot per ${slotIntervalMinutes} min &middot; afhalen aan de deur</p>
  </td></tr>

  ${pizzas.length > 0 ? `
  <!-- Pizza cards -->
  <tr><td style="background:#fff;padding:30px 0 16px;">
    <div style="text-align:center;margin:0 0 20px;">${flankedLabel("Suggesties van het huis")}</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${pizzaCards}
    </table>
  </td></tr>` : ""}

  <!-- Bento grid: Il mestiere -->
  <tr><td class="px2" style="background:${C.cream};padding:32px 16px;">
    <div style="text-align:center;margin:0 0 18px;">${flankedLabel("Il mestiere")}</div>
    <!-- Top card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
      <tr><td style="background:#fff;padding:20px 22px;border:1px solid ${C.border};border-left:3px solid ${C.terracotta};">
        <p style="margin:0 0 5px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:${C.brown};">Deeg van 72 uur</p>
        <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.muted};line-height:1.6;">Lange rijzing, weinig gist. De tijd doet het werk.</p>
      </td></tr>
    </table>
    <!-- Two smaller cards (stack on mobile) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="stack" width="49%" style="background:#fff;border:1px solid ${C.border};padding:18px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
            <tr><td style="width:34px;background:${C.chipBg};border:1px solid ${C.border};text-align:center;font-size:18px;padding:7px 0;line-height:1;">&#x1F525;</td></tr>
          </table>
          <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:${C.brown};">400&deg; houtvuur</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-style:italic;color:${C.muted};line-height:1.5;">90 seconden, niet meer.</p>
        </td>
        <td class="stack-gap" width="2%" style="font-size:0;line-height:0;">&nbsp;</td>
        <td class="stack" width="49%" style="background:#fff;border:1px solid ${C.border};padding:18px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
            <tr><td style="width:34px;background:${C.chipBg};border:1px solid ${C.border};text-align:center;font-size:18px;padding:7px 0;line-height:1;">&#x1F33F;</td></tr>
          </table>
          <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:${C.brown};">Alleen verse kruiden</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-style:italic;color:${C.muted};line-height:1.5;">Geen droge zakjes.</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td class="px" style="background:#fff;padding:26px 24px 40px;text-align:center;border-top:1px solid ${C.border};">
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
      <tr><td style="background:${C.terracotta};">
        <a href="${SITE_URL}" style="display:inline-block;font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fff;text-decoration:none;padding:16px 42px;">Reserveer uw pizza &rarr;</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer (light parchment) -->
  <tr><td class="px" style="background:${C.panelFoot};padding:34px 24px;text-align:center;border-top:1px solid ${C.border};">
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.brown};line-height:1.85;">
      &ldquo;Geen keten. Geen haast. Gewoon goede pizza,<br>gemaakt door Jeanke en zijn familie.&rdquo;
    </p>
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
      <tr>
        <td style="width:22px;border-top:1px solid ${C.terracotta};font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding:0 8px;color:${C.terracotta};font-size:12px;">&#10022;</td>
        <td style="width:22px;border-top:1px solid ${C.terracotta};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>
    <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;color:${C.muted};">
      Deze mail ontving u omdat u al eens bij ons bestelde.
    </p>
    <a href="${unsubUrl}" style="font-family:Arial,sans-serif;font-size:11px;color:${C.terracotta};text-decoration:underline;">Uitschrijven</a>
  </td></tr>

  <!-- Bottom terracotta bar -->
  <tr><td style="background:${C.terracotta};padding:9px 0;text-align:center;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.75);">Jeanke&rsquo;s Pizza &middot; secretpizza.be</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Plain-text fallback ─────────────────────────────────────────────────────
function newsletterText({ number, thema, titelLinks, titelRechts, intro, ophaalDag, ophaalDatum, ophaalTijden, pizzas = [], unsubscribeToken }) {
  const unsubUrl = `${SITE_URL}/uitschrijven?token=${unsubscribeToken}`
  const headline = titelRechts ? `${titelLinks} & ${titelRechts}` : titelLinks
  const pizzaLines = pizzas.map((p, i) =>
    `N° ${i + 1} — ${p.categorie || p.label || ""}\n${p.naam || p.name || ""}\n${p.beschrijving || p.description || ""}\n${p.prijs || p.price || ""}`
  ).join("\n\n")
  return `Jeanke's Pizza — N° ${number}${thema ? ` · ${thema}` : ""}
${headline || ""}

${intro || ""}

OPHAALDAG: ${ophaalDag} ${ophaalDatum}
TIJDEN: ${ophaalTijden}

${pizzaLines ? `— SUGGESTIES —\n\n${pizzaLines}\n\n` : ""}Reserveer via: ${SITE_URL}

—
Uitschrijven: ${unsubUrl}
`
}

// ── Blob helpers ────────────────────────────────────────────────────────────
async function getEditions(store) {
  return await store.get("editions", { type: "json" }).catch(() => null) || []
}

async function getSubscribers() {
  const store = getStore({ name: "newsletter-subscribers", consistency: "strong" })
  return await store.get("subscribers", { type: "json" }).catch(() => null) || []
}

async function logDeliveries(deliveryStore, editionId, results) {
  const existing = await deliveryStore.get(editionId, { type: "json" }).catch(() => null) || []
  await deliveryStore.set(editionId, JSON.stringify([...existing, ...results]))
}

// ── Main handler ────────────────────────────────────────────────────────────
export default async (req) => {
  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const editionStore  = getStore({ name: "newsletter-editions",  consistency: "strong" })
  const deliveryStore = getStore({ name: "newsletter-deliveries", consistency: "strong" })

  if (req.method === "GET") {
    const editions = await getEditions(editionStore)
    return Response.json(editions)
  }

  if (req.method === "DELETE") {
    const { id } = await req.json()
    const editions = await getEditions(editionStore)
    await editionStore.set("editions", JSON.stringify(editions.filter(e => e.id !== id)))
    return Response.json({ success: true })
  }

  if (req.method === "POST") {
    const body = await req.json()
    const { action, id, number, thema, titelLinks, titelRechts, intro, ophaalDag, ophaalDatum, ophaalTijden, pizzas, subject } = body

    const editionData = { number, thema, titelLinks, titelRechts, intro, ophaalDag, ophaalDatum, ophaalTijden, pizzas: pizzas || [], subject }

    // ── Save draft ──────────────────────────────────────────────────────────
    if (action === "save") {
      const editions = await getEditions(editionStore)
      const existing = id ? editions.find(e => e.id === id) : null
      if (existing) {
        Object.assign(existing, { ...editionData, updated_at: new Date().toISOString() })
        await editionStore.set("editions", JSON.stringify(editions))
        return Response.json({ success: true, id: existing.id })
      } else {
        const newId = randomUUID()
        editions.push({ id: newId, ...editionData, created_at: new Date().toISOString() })
        await editionStore.set("editions", JSON.stringify(editions))
        return Response.json({ success: true, id: newId })
      }
    }

    // ── Test mail ───────────────────────────────────────────────────────────
    if (action === "test") {
      if (!GMAIL_USER || !GMAIL_PASSWORD) return Response.json({ error: "Gmail niet geconfigureerd" }, { status: 500 })
      const settingsStore = getStore({ name: "settings", consistency: "strong" })
      const siteSettings = await settingsStore.get("config", { type: "json" }).catch(() => null) || {}
      const slotIntervalMinutes = siteSettings.slotIntervalMinutes ?? 15
      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD } })
      const html = newsletterHtml({ ...editionData, subscriberName: "Jeanke", unsubscribeToken: "test", slotIntervalMinutes })
      const text = newsletterText({ ...editionData, unsubscribeToken: "test" })
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `[PREVIEW] ${subject}`,
        html,
        text,
      })
      return Response.json({ success: true })
    }

    // ── Send to all active subscribers ──────────────────────────────────────
    if (action === "send") {
      if (!GMAIL_USER || !GMAIL_PASSWORD) return Response.json({ error: "Gmail niet geconfigureerd" }, { status: 500 })

      const settingsStore = getStore({ name: "settings", consistency: "strong" })
      const siteSettings = await settingsStore.get("config", { type: "json" }).catch(() => null) || {}
      const slotIntervalMinutes = siteSettings.slotIntervalMinutes ?? 15

      const subscribers = await getSubscribers()
      const active = subscribers.filter(s => s.status === "active")
      if (active.length === 0) return Response.json({ sent: 0, failed: 0, results: [] })

      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD } })
      const results = []
      const editionId = id || randomUUID()

      for (const sub of active) {
        try {
          const html = newsletterHtml({ ...editionData, subscriberName: sub.name, unsubscribeToken: sub.unsubscribe_token, slotIntervalMinutes })
          const text = newsletterText({ ...editionData, unsubscribeToken: sub.unsubscribe_token })
          await transport.sendMail({
            from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
            to: sub.email,
            subject,
            html,
            text,
            headers: {
              "List-Unsubscribe":      `<${SITE_URL}/uitschrijven?token=${sub.unsubscribe_token}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          })
          results.push({ email: sub.email, status: "sent" })
        } catch (err) {
          results.push({ email: sub.email, status: "failed", error: err.message })
        }
      }

      await logDeliveries(deliveryStore, editionId, results)
      const editions = await getEditions(editionStore)
      const edition = id ? editions.find(e => e.id === id) : null
      const sentCount = results.filter(r => r.status === "sent").length
      if (edition) {
        edition.sent_at    = new Date().toISOString()
        edition.sent_count = sentCount
      } else {
        editions.push({ id: editionId, ...editionData, sent_at: new Date().toISOString(), sent_count: sentCount, created_at: new Date().toISOString() })
      }
      await editionStore.set("editions", JSON.stringify(editions))

      return Response.json({ sent: sentCount, failed: results.filter(r => r.status === "failed").length, results })
    }

    return Response.json({ error: "Onbekende actie" }, { status: 400 })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/newsletter-editions" }
