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

function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]><style>td,th{font-family:Georgia,serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F3EC;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;background:#ffffff;border:1px solid #EDE5D8;">
      ${content}
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function emailHeader(title) {
  return `<tr><td bgcolor="#3D4A2D" style="padding:36px 32px;text-align:center;">
    <p style="color:#BFA06A;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 10px;font-family:Georgia,serif;">Jeanke's Pizza</p>
    <h1 style="color:#F7F3EC;font-size:26px;margin:0;font-style:italic;font-weight:normal;font-family:Georgia,serif;">${title}</h1>
  </td></tr>`
}

function confirmationHtml({ name, order, date, timeslot, total, cancelToken }) {
  const cancelUrl = `${SITE_URL}/annuleer?token=${escapeHtml(cancelToken)}`
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
  const safeName = escapeHtml(name)
  const safeTimeslot = escapeHtml(timeslot)
  const safeTotal = escapeHtml(total)
  return emailWrapper(`
    ${emailHeader('Bestelling bevestigd')}
    <tr><td style="padding:32px;">
      <p style="color:#1C1410;font-size:15px;margin:0 0 16px;font-family:Georgia,serif;">Ciao <strong>${safeName}</strong>,</p>
      <p style="color:#8A7E72;font-size:14px;line-height:1.6;margin:0 0 24px;font-family:Georgia,serif;">Uw bestelling is goed ontvangen. Tot dan!</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F3EC;border:1px solid #EDE5D8;margin-bottom:24px;">
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size:13px;font-family:Georgia,serif;">
            <tr>
              <td style="color:#8A7E72;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Datum</td>
              <td align="right" style="color:#1C1410;font-weight:bold;">${dateFormatted}</td>
            </tr>
            <tr>
              <td style="color:#8A7E72;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Tijdslot</td>
              <td align="right" style="color:#1C1410;font-weight:bold;">${safeTimeslot}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0 0;border-top:1px solid #EDE5D8;font-size:1px;">&nbsp;</td></tr>
            ${order.split(', ').map(item => `<tr><td colspan="2" style="color:#1C1410;padding:3px 0;font-size:13px;">${escapeHtml(item)}</td></tr>`).join('')}
            <tr><td colspan="2" style="padding:8px 0 0;border-top:1px solid #EDE5D8;font-size:1px;">&nbsp;</td></tr>
            <tr>
              <td style="color:#8A7E72;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Totaal</td>
              <td align="right" style="color:#722F37;font-size:18px;font-weight:bold;">${safeTotal}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="padding:8px 0 24px;">
          <a href="${cancelUrl}" style="display:inline-block;border:1px solid #C5BAB0;color:#8A7E72;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:12px 28px;text-decoration:none;font-family:Georgia,serif;">Bestelling annuleren</a>
        </td></tr>
      </table>

      <p style="color:#C5BAB0;font-size:11px;text-align:center;font-style:italic;margin:0;font-family:Georgia,serif;">Jeanke's Pizza</p>
    </td></tr>
  `)
}

function ownerHtml({ name, email, order, date, timeslot, total }) {
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
  return emailWrapper(`
    ${emailHeader('Nieuwe bestelling')}
    <tr><td style="padding:28px 32px;">
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size:14px;font-family:Georgia,serif;">
        <tr><td style="color:#8A7E72;width:100px;">Naam</td><td><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="color:#8A7E72;">E-mail</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="color:#8A7E72;">Datum</td><td>${dateFormatted}</td></tr>
        <tr><td style="color:#8A7E72;">Tijdslot</td><td><strong>${escapeHtml(timeslot)}</strong></td></tr>
        <tr><td style="color:#8A7E72;">Bestelling</td><td>${escapeHtml(order)}</td></tr>
        <tr><td style="color:#8A7E72;">Totaal</td><td><strong style="color:#722F37;">${escapeHtml(total)}</strong></td></tr>
      </table>
    </td></tr>
  `)
}

export default async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 })

  if (!GMAIL_USER || !GMAIL_PASSWORD) {
    // Email not configured — skip silently
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
        subject: `✓ Bestelling bevestigd — ${timeslot}`,
        html: confirmationHtml({ name, order, date, timeslot, total, cancelToken }),
      })
      // Also notify owner
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `🍕 Nieuwe bestelling: ${name} om ${timeslot}`,
        html: ownerHtml({ name, email, order, date, timeslot, total }),
      })
    }

    if (type === 'registration') {
      const { name, pizzas, registrationDate } = body
      const dateStr = registrationDate
        ? new Date(registrationDate).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : null
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: email,
        subject: `Inschrijving ontvangen — Jeanke's Pizza`,
        html: emailWrapper(`
          ${emailHeader('Inschrijving bevestigd')}
          <tr><td style="padding:32px;">
            <p style="color:#1C1410;font-size:15px;margin:0 0 16px;font-family:Georgia,serif;">Ciao <strong>${escapeHtml(name)}</strong>,</p>
            <p style="color:#8A7E72;font-size:14px;line-height:1.6;margin:0 0 24px;font-family:Georgia,serif;">
              We hebben je inschrijving goed ontvangen voor <strong>${escapeHtml(pizzas)} pizza${pizzas > 1 ? "'s" : ''}</strong>${dateStr ? ` op <strong>${escapeHtml(dateStr)}</strong>` : ''}.
              Je krijgt een bericht zodra de bestellingen opengaan.
            </p>
            <p style="color:#C5BAB0;font-size:11px;text-align:center;font-style:italic;margin:0;font-family:Georgia,serif;">Jeanke's Pizza</p>
          </td></tr>
        `),
      })
    }

    if (type === 'threshold') {
      const { count, threshold } = body
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `${threshold} inschrijvingen bereikt!`,
        html: emailWrapper(`
          ${emailHeader('Drempel bereikt')}
          <tr><td style="padding:28px 32px;">
            <p style="color:#1C1410;font-size:15px;font-family:Georgia,serif;">Je hebt <strong>${count} pizza-inschrijvingen</strong>. Tijd om een openingsdag te plannen!</p>
          </td></tr>
        `),
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Email error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/send-email" }
