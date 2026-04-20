import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL    = process.env.OWNER_EMAIL || GMAIL_USER
const SITE_URL       = process.env.URL || "https://secretpizza.be"

const C = {
  cream:      "#F5EFE6",
  cardBg:     "#FFF8EF",
  terracotta: "#C4572A",
  brown:      "#2C1810",
  gold:       "#C4A780",
  goldLight:  "#C4A780",
  text:       "#2C1810",
  muted:      "#5a4a3a",
  border:     "#E8D9C3",
  beige:      "#E8D9C3",
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

// ── Newsletter HTML template ────────────────────────────────────────────────
function newsletterHtml({ number, thema, titelLinks, titelRechts, intro, ophaalDag, ophaalDatum, ophaalTijden, pizzas = [], subscriberName, unsubscribeToken }) {
  const unsubUrl  = `${SITE_URL}/uitschrijven?token=${escapeHtml(unsubscribeToken)}`
  const greeting  = subscriberName ? escapeHtml(subscriberName) : "beste pizza-liefhebber"
  const themaLabel = thema ? `N° ${escapeHtml(String(number))} &middot; ${escapeHtml(thema)}` : `N° ${escapeHtml(String(number))}`

  const headline = titelRechts
    ? `${escapeHtml(titelLinks)} <em style="color:${C.terracotta};">&amp;</em> ${escapeHtml(titelRechts)}`
    : escapeHtml(titelLinks || "")

  const pizzaCards = pizzas.map((p, i) => `
    <tr><td style="padding:0 16px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:${C.cardBg};border-radius:8px;border:1px solid ${C.border};">
        <tr><td style="padding:20px 20px 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="76" style="vertical-align:top;padding-left:16px;padding-right:4px;">
                <div style="width:56px;height:56px;background:${C.beige};border-radius:50%;text-align:center;line-height:56px;">
                  <span style="font-family:Georgia,serif;font-size:11px;color:${C.muted};letter-spacing:1px;">N°&nbsp;${i + 1}</span>
                </div>
              </td>
              <td style="vertical-align:top;padding-right:16px;">
                <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">${escapeHtml(p.categorie || p.label || "")}</p>
                <p style="margin:0 0 5px;font-family:Georgia,serif;font-size:19px;font-weight:400;color:${C.brown};">${escapeHtml(p.naam || p.name || "")}</p>
                <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.muted};line-height:1.6;">${escapeHtml(p.beschrijving || p.description || "")}</p>
                <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:${C.terracotta};">${escapeHtml(p.prijs || p.price || "")}</p>
              </td>
            </tr>
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
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

  <!-- Terracotta top bar -->
  <tr><td style="background:${C.terracotta};padding:10px 0;text-align:center;">
    <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#fff;font-style:italic;">Piccola pizzeria artigianale</p>
  </td></tr>

  <!-- Editorial header -->
  <tr><td style="background:#fff;padding:40px 24px 28px;">
    <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.terracotta};">${themaLabel}</p>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:38px;font-weight:800;letter-spacing:-1px;line-height:1.15;color:${C.brown};">${headline}</h1>
    ${intro ? `<p style="margin:0;font-family:Georgia,serif;font-size:15px;color:${C.muted};line-height:1.7;font-style:italic;">${escapeHtml(intro)}</p>` : ""}
  </td></tr>

  <!-- Ophaaldag block -->
  <tr><td style="background:${C.brown};padding:36px 24px;text-align:center;">
    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:${C.gold};">Ophaaldag</p>
    <p style="margin:0;font-family:Georgia,serif;font-size:17px;font-style:italic;color:${C.goldLight};">${escapeHtml(ophaalDag || "")}</p>
    <p style="margin:4px 0 18px;font-family:Georgia,serif;font-size:48px;font-weight:800;color:#fff;line-height:1.1;">${escapeHtml(ophaalDatum || "")}</p>
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:16px;">
      <tr>
        <td style="width:40px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
        <td style="padding:0 10px;color:${C.terracotta};font-size:14px;">&#10022;</td>
        <td style="width:40px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
      </tr>
    </table>
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:19px;font-style:italic;color:${C.gold};">${escapeHtml(ophaalTijden || "")}</p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a6050;">Tijdslot per 15 min &middot; afhalen aan de deur</p>
  </td></tr>

  ${pizzas.length > 0 ? `
  <!-- Pizza cards -->
  <tr><td style="background:#fff;padding:24px 0 12px;">
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};text-align:center;">Suggesties van het huis</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${pizzaCards}
    </table>
  </td></tr>` : ""}

  <!-- Bento grid: Il mestiere -->
  <tr><td style="background:${C.cream};padding:28px 16px;">
    <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};text-align:center;">Il mestiere</p>
    <!-- Top card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr><td style="background:#fff;border-radius:8px;padding:20px 20px;border:1px solid ${C.border};">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:${C.brown};">Deeg van 72 uur</p>
        <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.muted};">Lange rijzing, weinig gist. De tijd doet het werk.</p>
      </td></tr>
    </table>
    <!-- Two smaller cards -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="49%" style="background:#F9E5A8;border-radius:8px;padding:16px;vertical-align:top;">
          <p style="margin:0 0 3px;font-family:Georgia,serif;font-size:18px;">&#x1F525;</p>
          <p style="margin:0 0 3px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:${C.brown};">400° houtvuur</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-style:italic;color:${C.muted};">90 seconden, niet meer.</p>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="49%" style="background:#E8D4C8;border-radius:8px;padding:16px;vertical-align:top;">
          <p style="margin:0 0 3px;font-family:Georgia,serif;font-size:18px;">&#x1F33F;</p>
          <p style="margin:0 0 3px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:${C.brown};">Alleen verse kruiden</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-style:italic;color:${C.muted};">Geen droge zakjes.</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#fff;padding:20px 24px 32px;text-align:center;">
    <a href="${SITE_URL}" style="display:inline-block;font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#fff;background:${C.terracotta};text-decoration:none;padding:15px 36px;border-radius:2px;">Reserveer uw pizza &rarr;</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:${C.brown};padding:28px 24px;text-align:center;">
    <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.gold};line-height:1.8;">
      &ldquo;Geen keten. Geen haast. Gewoon goede pizza,<br>gemaakt door Jeanke en zijn familie.&rdquo;
    </p>
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:16px;">
      <tr>
        <td style="width:20px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
        <td style="padding:0 8px;color:${C.terracotta};font-size:12px;">&#10022;</td>
        <td style="width:20px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#7a6050;">
      Deze mail ontving u omdat u al eens bij ons bestelde.
    </p>
    <a href="${unsubUrl}" style="font-family:Arial,sans-serif;font-size:11px;color:${C.gold};text-decoration:underline;">Uitschrijven</a>
  </td></tr>

  <!-- Bottom terracotta bar -->
  <tr><td style="background:${C.terracotta};padding:8px 0;text-align:center;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Jeanke&rsquo;s Pizza &middot; secretpizza.be</p>
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
      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD } })
      const html = newsletterHtml({ ...editionData, subscriberName: "Jeanke", unsubscribeToken: "test" })
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

      const subscribers = await getSubscribers()
      const active = subscribers.filter(s => s.status === "active")
      if (active.length === 0) return Response.json({ sent: 0, failed: 0, results: [] })

      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD } })
      const results = []
      const editionId = id || randomUUID()

      for (const sub of active) {
        try {
          const html = newsletterHtml({ ...editionData, subscriberName: sub.name, unsubscribeToken: sub.unsubscribe_token })
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
