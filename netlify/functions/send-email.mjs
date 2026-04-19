import nodemailer from "nodemailer"

const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL    = process.env.OWNER_EMAIL || GMAIL_USER
const SITE_URL       = process.env.URL || 'https://jeanke-pizza.netlify.app'

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD },
  })
}

// ── Shared colours (inline — email clients strip <style>) ──────────────────
const C = {
  cream:     '#F7F3EC',
  parchment: '#EDE5D8',
  ink:       '#1C1410',
  wine:      '#A0522D',
  gold:      '#BFA06A',
  warmGray:  '#8A7E72',
  lightGray: '#C5BAB0',
}

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Jeanke's Pizza</title>
  <!--[if mso]><style>td,th{font-family:Georgia,serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.cream};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
  <tr><td align="center" style="padding:40px 16px 48px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

      <!-- Wordmark -->
      <tr><td align="center" style="padding-bottom:28px;">
        <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:11px;letter-spacing:5px;text-transform:uppercase;color:${C.gold};">Jeanke&rsquo;s Pizza</p>
        <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
          <td style="width:36px;border-top:1px solid ${C.gold};font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding:0 8px;color:${C.gold};font-size:11px;line-height:1;">&#10022;</td>
          <td style="width:36px;border-top:1px solid ${C.gold};font-size:0;line-height:0;">&nbsp;</td>
        </tr></table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border:1px solid ${C.parchment};">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding-top:24px;">
        <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-style:italic;color:${C.lightGray};">Con amore, uit de houtoven &mdash; Jeanke&rsquo;s Pizza</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function cardHeader(label, title) {
  return `
    <tr><td style="padding:28px 32px 20px;border-bottom:1px dashed ${C.parchment};">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">${label}</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-style:italic;font-weight:normal;color:${C.ink};">${title}</h1>
    </td></tr>`
}

function dataRow(label, value, last = false) {
  return `
    <tr>
      <td style="padding:8px 0;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.warmGray};width:90px;vertical-align:top;">${label}</td>
      <td colspan="2" style="padding:8px 0;font-family:Georgia,serif;font-size:14px;color:${C.ink};text-align:right;">${value}</td>
    </tr>
    ${!last ? `<tr><td colspan="3" style="font-size:0;line-height:0;border-top:1px dotted ${C.parchment};">&nbsp;</td></tr>` : ''}`
}

// ── Confirmation email (to customer) ───────────────────────────────────────
function confirmationHtml({ name, order, date, timeslot, total, cancelToken }) {
  const cancelUrl     = `${SITE_URL}/annuleer?token=${escapeHtml(cancelToken)}`
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
  const safeName      = escapeHtml(name)
  const safeTimeslot  = escapeHtml(timeslot)
  const safeTotal     = escapeHtml(total)

  const orderRows = order.split(', ').map((item, i, arr) => {
    const m = item.match(/^(\d+)x (.+?) \((.+?)\)$/)
    const qty   = m ? escapeHtml(m[1]) : ''
    const naam  = m ? escapeHtml(m[2]) : escapeHtml(item)
    const prijs = m ? escapeHtml(m[3]) : ''
    const isLast = i === arr.length - 1
    return `
      <tr>
        <td style="padding:9px 0;font-family:Georgia,serif;font-size:13px;color:${C.wine};width:28px;vertical-align:top;">${qty}×</td>
        <td style="padding:9px 6px;font-family:Georgia,serif;font-size:14px;color:${C.ink};vertical-align:top;">${naam}</td>
        <td align="right" style="padding:9px 0;font-family:Georgia,serif;font-size:14px;color:${C.ink};white-space:nowrap;vertical-align:top;">${prijs}</td>
      </tr>
      ${!isLast ? `<tr><td colspan="3" style="font-size:0;line-height:0;border-top:1px dotted ${C.parchment};">&nbsp;</td></tr>` : ''}
    `
  }).join('')

  return emailWrapper(`
    ${cardHeader('Bevestiging', 'Bestelling ontvangen')}

    <!-- Greeting -->
    <tr><td style="padding:24px 32px 0;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;color:${C.ink};">Ciao <strong>${safeName}</strong>,</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.warmGray};line-height:1.7;">Uw bestelling is goed ontvangen. We verheugen ons op uw komst!</p>
    </td></tr>

    <!-- Details block -->
    <tr><td style="padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border:1px solid ${C.parchment};">
        <tr><td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${dataRow('Datum', `<strong>${dateFormatted}</strong>`)}
            ${dataRow('Tijdslot', `<strong>${safeTimeslot}</strong>`)}
            <!-- Order items header -->
            <tr><td colspan="3" style="padding:12px 0 4px;border-top:1px dashed ${C.parchment};font-size:0;">&nbsp;</td></tr>
            <tr><td colspan="3" style="padding:0 0 6px;font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.warmGray};">Bestelling</td></tr>
            ${orderRows}
            <!-- divider -->
            <tr><td colspan="3" style="padding:8px 0;font-size:0;border-top:1px dashed ${C.parchment};">&nbsp;</td></tr>
            <!-- Total -->
            <tr>
              <td colspan="2" style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.warmGray};vertical-align:middle;">Totaal</td>
              <td align="right" style="font-family:Georgia,serif;font-size:22px;color:${C.wine};">${safeTotal}</td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- Cancel link -->
    <tr><td align="center" style="padding:4px 32px 28px;">
      <a href="${cancelUrl}" style="font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.lightGray};text-decoration:underline;">Bestelling annuleren</a>
    </td></tr>
  `)
}

// ── Owner notification ─────────────────────────────────────────────────────
function ownerHtml({ name, email, order, date, timeslot, total }) {
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })

  return emailWrapper(`
    ${cardHeader('Nieuwe bestelling', 'Overzicht')}

    <tr><td style="padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${dataRow('Naam',      `<strong>${escapeHtml(name)}</strong>`)}
        ${dataRow('E-mail',    escapeHtml(email))}
        ${dataRow('Datum',     dateFormatted)}
        ${dataRow('Tijdslot',  `<strong>${escapeHtml(timeslot)}</strong>`)}
        ${dataRow('Bestelling', escapeHtml(order))}
        <!-- divider -->
        <tr><td colspan="2" style="padding:4px 0;font-size:0;border-top:1px dashed ${C.parchment};">&nbsp;</td></tr>
        <tr>
          <td style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.warmGray};vertical-align:middle;">Totaal</td>
          <td align="right" style="font-family:Georgia,serif;font-size:22px;color:${C.wine};">${escapeHtml(total)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="height:8px;"></td></tr>
  `)
}

// ── Registration confirmation (to customer) ────────────────────────────────
function registrationHtml({ name, pizzas, registrationDate }) {
  const dateStr = registrationDate
    ? new Date(registrationDate).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return emailWrapper(`
    ${cardHeader('Inschrijving', 'Ontvangen')}

    <tr><td style="padding:24px 32px 28px;">
      <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:15px;color:${C.ink};">Ciao <strong>${escapeHtml(name)}</strong>,</p>
      <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13px;color:${C.warmGray};line-height:1.7;">
        We hebben je inschrijving goed ontvangen voor
        <strong style="color:${C.ink};">${escapeHtml(String(pizzas))} pizza${pizzas > 1 ? "'s" : ''}</strong>
        ${dateStr ? `op <strong style="color:${C.ink};">${escapeHtml(dateStr)}</strong>` : ''}.
      </p>
      <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:${C.warmGray};line-height:1.7;">
        Je krijgt een bericht zodra de bestellingen opengaan.
      </p>
    </td></tr>
  `)
}

// ── Threshold notification (to owner) ─────────────────────────────────────
function thresholdHtml({ count, threshold }) {
  return emailWrapper(`
    ${cardHeader('Melding', `${threshold} inschrijvingen bereikt`)}

    <tr><td style="padding:24px 32px 28px;">
      <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:${C.ink};line-height:1.7;">
        Er zijn nu <strong>${escapeHtml(String(count))} pizza-inschrijvingen</strong>. Tijd om een openingsdag in te plannen!
      </p>
    </td></tr>
  `)
}

export default async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 })

  if (!GMAIL_USER || !GMAIL_PASSWORD) {
    return Response.json({ success: true, skipped: true })
  }

  try {
    const body = await req.json()
    const { name, email, order, date, timeslot, total, cancelToken, type } = body
    const transport = createTransport()

    if (type === 'confirmation') {
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: email,
        subject: `Bestelling bevestigd — ${timeslot}`,
        html: confirmationHtml({ name, order, date, timeslot, total, cancelToken }),
      })
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `Nieuwe bestelling: ${name} om ${timeslot}`,
        html: ownerHtml({ name, email, order, date, timeslot, total }),
      })
    }

    if (type === 'registration') {
      const { pizzas, registrationDate } = body
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: email,
        subject: `Inschrijving ontvangen — Jeanke's Pizza`,
        html: registrationHtml({ name, pizzas, registrationDate }),
      })
    }

    if (type === 'threshold') {
      const { count, threshold } = body
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `${threshold} inschrijvingen bereikt!`,
        html: thresholdHtml({ count, threshold }),
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Email error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/send-email" }
