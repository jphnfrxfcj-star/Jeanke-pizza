import { getStore } from "@netlify/blobs"
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL    = process.env.OWNER_EMAIL || GMAIL_USER
const SITE_URL       = process.env.URL || "https://secretpizza.be"

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
  cream:      "#F5EFE6",
  cardBg:     "#FFF8EF",
  terracotta: "#C4572A",
  brown:      "#2a1f17",
  gold:       "#C4A780",
  goldLight:  "#D4B88A",
  text:       "#3a2d24",
  muted:      "#7a6a5e",
  border:     "#E8DDCE",
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
function newsletterHtml({ number, ophaaldag, ophaaltijden, intro, pizzas, subscriberName, unsubscribeToken }) {
  const unsubUrl = `${SITE_URL}/uitschrijven?token=${escapeHtml(unsubscribeToken)}`
  const greeting = subscriberName ? escapeHtml(subscriberName) : "beste pizza-liefhebber"
  const safeOphaaldag   = escapeHtml(ophaaldag)
  const safeOphaaltijden = escapeHtml(ophaaltijden)
  const safeIntro       = escapeHtml(intro || "De houtoven wordt weer opgestookt. Drie suggesties van het huis, deze editie voor u.")
  const [dag, ...datumParts] = (ophaaldag || "").split(" ")
  const datum = datumParts.join(" ")

  const pizzaCards = pizzas.map((p, i) => `
    <tr>
      <td style="padding:0 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:${C.cardBg};border:1px solid ${C.border};border-radius:8px;">
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60" style="vertical-align:top;padding-right:16px;">
                    <div style="width:52px;height:52px;background:${C.terracotta};border-radius:50%;text-align:center;line-height:52px;">
                      <span style="font-family:Georgia,serif;font-size:11px;font-weight:normal;color:#ffffff;letter-spacing:1px;">N°&nbsp;${i + 1}</span>
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};">${escapeHtml(p.label || "")}</p>
                    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:18px;color:${C.brown};">${escapeHtml(p.name || "")}</p>
                    <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.muted};line-height:1.6;">${escapeHtml(p.description || "")}</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:16px;color:${C.terracotta};">${escapeHtml(p.price || "")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("")

  return `<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Jeanke's Pizza — N° ${number}</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
<tr><td align="center" style="padding:0 16px 48px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">

  <!-- Top terracotta bar -->
  <tr>
    <td style="background:${C.terracotta};padding:10px 24px;text-align:center;">
      <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#ffffff;font-style:italic;">Piccola pizzeria artigianale</p>
    </td>
  </tr>

  <!-- Logo + edition header -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:32px 24px 24px;text-align:center;">
      <div style="display:inline-block;width:64px;height:64px;border:2px solid ${C.terracotta};border-radius:50%;line-height:60px;text-align:center;margin-bottom:16px;">
        <span style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:${C.terracotta};">J</span>
      </div>
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">N° ${escapeHtml(String(number))} &middot; Il Racconto</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:normal;font-style:italic;color:${C.brown};">Jeanke<span style="color:${C.terracotta};">'</span>s Pizza</h1>
    </td>
  </tr>

  <!-- Ophaaldag block (dark) -->
  <tr>
    <td style="background:${C.brown};border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:32px 24px;text-align:center;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:${C.gold};">Ophaaldag</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-style:italic;color:${C.goldLight};">${escapeHtml(dag)}</p>
      <p style="margin:4px 0 16px;font-family:Georgia,serif;font-size:52px;font-weight:normal;color:#ffffff;line-height:1.1;">${escapeHtml(datum)}</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
        <tr>
          <td style="width:40px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
          <td style="padding:0 10px;color:${C.terracotta};font-size:14px;">&#10022;</td>
          <td style="width:40px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;font-style:italic;color:${C.gold};">${safeOphaaltijden}</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">Tijdslot per 15 min &middot; afhalen aan de deur</p>
    </td>
  </tr>

  <!-- Intro -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:28px 32px 8px;">
      <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:14px;color:${C.text};">Ciao <strong>${greeting}</strong>,</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:14px;font-style:italic;color:${C.muted};line-height:1.7;">${safeIntro}</p>
    </td>
  </tr>

  <!-- Divider ornament -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:16px 0;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="width:32px;border-top:1px solid ${C.border};font-size:0;">&nbsp;</td>
          <td style="padding:0 10px;color:${C.terracotta};font-size:14px;">&#10022;</td>
          <td style="width:32px;border-top:1px solid ${C.border};font-size:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Pizza cards -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:0 0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${pizzaCards}
      </table>
    </td>
  </tr>

  <!-- CTA button -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:8px 24px 32px;text-align:center;">
      <a href="${SITE_URL}" style="display:inline-block;font-family:Georgia,serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#ffffff;background:${C.terracotta};text-decoration:none;padding:14px 32px;">Reserveer uw pizza &rarr;</a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:${C.brown};border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:28px 32px 24px;text-align:center;">
      <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.gold};line-height:1.7;">
        &ldquo;Geen keten. Geen haast. Gewoon goede pizza,<br>gemaakt door Jeanke en zijn familie.&rdquo;
      </p>
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
        <tr>
          <td style="width:28px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
          <td style="padding:0 8px;color:${C.terracotta};font-size:12px;">&#10022;</td>
          <td style="width:28px;border-top:1px solid ${C.terracotta};font-size:0;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:11px;color:${C.muted};">
        Deze mail ontving u omdat u al eens bij ons bestelde.
      </p>
      <p style="margin:0;">
        <a href="${unsubUrl}" style="font-family:Georgia,serif;font-size:11px;color:${C.gold};text-decoration:underline;">Uitschrijven</a>
      </p>
    </td>
  </tr>

  <!-- Bottom bar -->
  <tr>
    <td style="background:${C.terracotta};padding:8px 24px;text-align:center;">
      <p style="margin:0;font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Jeanke&rsquo;s Pizza &middot; secretpizza.be</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Plain-text fallback ─────────────────────────────────────────────────────
function newsletterText({ number, ophaaldag, ophaaltijden, intro, pizzas, unsubscribeToken }) {
  const unsubUrl = `${SITE_URL}/uitschrijven?token=${unsubscribeToken}`
  const pizzaLines = pizzas.map((p, i) =>
    `N° ${i + 1} — ${p.label || ""}\n${p.name || ""}\n${p.description || ""}\n${p.price || ""}`
  ).join("\n\n")
  return `Jeanke's Pizza — N° ${number}

OPHAALDAG: ${ophaaldag}
TIJDEN: ${ophaaltijden}

${intro || "De houtoven wordt weer opgestookt."}

— SUGGESTIES —

${pizzaLines}

Reserveer via: ${SITE_URL}

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
    const { action, id, number, subject, ophaaldag, ophaaltijden, intro, pizzas } = body

    // ── Save draft ──────────────────────────────────────────────────────────
    if (action === "save") {
      const editions = await getEditions(editionStore)
      const existing = id ? editions.find(e => e.id === id) : null
      if (existing) {
        Object.assign(existing, { number, subject, ophaaldag, ophaaltijden, intro, pizzas, updated_at: new Date().toISOString() })
      } else {
        editions.push({ id: randomUUID(), number, subject, ophaaldag, ophaaltijden, intro, pizzas, created_at: new Date().toISOString() })
      }
      await editionStore.set("editions", JSON.stringify(editions))
      return Response.json({ success: true })
    }

    // ── Test mail ───────────────────────────────────────────────────────────
    if (action === "test") {
      if (!GMAIL_USER || !GMAIL_PASSWORD) return Response.json({ error: "Gmail niet geconfigureerd" }, { status: 500 })
      const transport = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD } })
      const html = newsletterHtml({ number, ophaaldag, ophaaltijden, intro, pizzas, subscriberName: "Jeanke", unsubscribeToken: "test" })
      const text = newsletterText({ number, ophaaldag, ophaaltijden, intro, pizzas, unsubscribeToken: "test" })
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
          const html = newsletterHtml({ number, ophaaldag, ophaaltijden, intro, pizzas, subscriberName: sub.name, unsubscribeToken: sub.unsubscribe_token })
          const text = newsletterText({ number, ophaaldag, ophaaltijden, intro, pizzas, unsubscribeToken: sub.unsubscribe_token })
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

      // Persist delivery log + mark edition as sent
      await logDeliveries(deliveryStore, editionId, results)
      const editions = await getEditions(editionStore)
      const edition = id ? editions.find(e => e.id === id) : null
      const sentCount = results.filter(r => r.status === "sent").length
      if (edition) {
        edition.sent_at    = new Date().toISOString()
        edition.sent_count = sentCount
      } else {
        editions.push({ id: editionId, number, subject, ophaaldag, ophaaltijden, intro, pizzas, sent_at: new Date().toISOString(), sent_count: sentCount, created_at: new Date().toISOString() })
      }
      await editionStore.set("editions", JSON.stringify(editions))

      return Response.json({ sent: sentCount, failed: results.filter(r => r.status === "failed").length, results })
    }

    return Response.json({ error: "Onbekende actie" }, { status: 400 })
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 })
}

export const config = { path: "/api/newsletter-editions" }
