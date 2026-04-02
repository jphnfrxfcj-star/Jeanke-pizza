import nodemailer from "nodemailer"

const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD
const OWNER_EMAIL    = process.env.OWNER_EMAIL || GMAIL_USER
const SITE_URL       = process.env.URL || 'https://jeanke-pizza.netlify.app'

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD },
  })
}

function confirmationHtml({ name, order, date, timeslot, total, cancelToken }) {
  const cancelUrl = `${SITE_URL}/annuleer?token=${cancelToken}`
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:'Georgia',serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid #EDE5D8;">
    <div style="background:#3D4A2D;padding:36px 32px;text-align:center;">
      <p style="color:#BFA06A;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px;">Jeanke's Pizza</p>
      <h1 style="color:#F7F3EC;font-size:28px;margin:0;font-style:italic;font-weight:400;">Bestelling bevestigd</h1>
      <div style="margin:16px auto;width:60px;border-top:1px solid rgba(191,160,106,0.4);"></div>
      <p style="color:rgba(247,243,236,0.6);font-size:12px;margin:0;font-style:italic;">Piccola pizzeria artigianale</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1C1410;font-size:15px;margin:0 0 20px;">Ciao <strong>${name}</strong>,</p>
      <p style="color:#8A7E72;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Uw bestelling is goed ontvangen. Tot dan!
      </p>

      <div style="background:#F7F3EC;border:1px solid #EDE5D8;padding:20px;margin-bottom:24px;">
        <table style="width:100%;font-size:13px;">
          <tr><td style="color:#8A7E72;padding:4px 0;letter-spacing:1px;font-size:11px;text-transform:uppercase;">Datum</td>
              <td style="color:#1C1410;text-align:right;font-weight:bold;">${dateFormatted}</td></tr>
          <tr><td style="color:#8A7E72;padding:4px 0;letter-spacing:1px;font-size:11px;text-transform:uppercase;">Tijdslot</td>
              <td style="color:#1C1410;text-align:right;font-weight:bold;">${timeslot}</td></tr>
          <tr><td colspan="2" style="border-top:1px solid #EDE5D8;padding-top:12px;margin-top:8px;"></td></tr>
          ${order.split(', ').map(item => `
          <tr><td style="color:#1C1410;padding:3px 0;font-size:13px;">${item}</td></tr>`).join('')}
          <tr><td colspan="2" style="border-top:1px solid #EDE5D8;padding-top:12px;"></td></tr>
          <tr><td style="color:#8A7E72;letter-spacing:1px;font-size:11px;text-transform:uppercase;">Totaal</td>
              <td style="color:#722F37;text-align:right;font-size:18px;font-weight:bold;">${total}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${cancelUrl}"
           style="display:inline-block;border:1px solid #C5BAB0;color:#8A7E72;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:12px 24px;text-decoration:none;">
          Bestelling annuleren
        </a>
      </div>

      <p style="color:#C5BAB0;font-size:11px;text-align:center;font-style:italic;margin:0;">
        Con amore — Jeanke's Pizza
      </p>
    </div>
  </div>
</body>
</html>`
}

function ownerHtml({ name, email, order, date, timeslot, total }) {
  const dateFormatted = new Date(date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
  return `
<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;">
  <h2 style="color:#3D4A2D;">Nieuwe bestelling 🍕</h2>
  <table style="font-size:14px;width:100%;">
    <tr><td style="color:#8A7E72;padding:4px 0;">Naam</td><td><strong>${name}</strong></td></tr>
    <tr><td style="color:#8A7E72;padding:4px 0;">E-mail</td><td>${email}</td></tr>
    <tr><td style="color:#8A7E72;padding:4px 0;">Datum</td><td>${dateFormatted}</td></tr>
    <tr><td style="color:#8A7E72;padding:4px 0;">Tijdslot</td><td><strong>${timeslot}</strong></td></tr>
    <tr><td style="color:#8A7E72;padding:4px 0;">Bestelling</td><td>${order}</td></tr>
    <tr><td style="color:#8A7E72;padding:4px 0;">Totaal</td><td><strong style="color:#722F37;">${total}</strong></td></tr>
  </table>
</div>`
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

    if (type === 'threshold') {
      const { count, threshold } = body
      await transport.sendMail({
        from: `"Jeanke's Pizza" <${GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `🎉 ${threshold} inschrijvingen bereikt!`,
        html: `<p style="font-family:Georgia;font-size:15px;">Je hebt <strong>${count}</strong> inschrijvingen. Tijd om een openingsdag te plannen!</p>`,
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Email error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export const config = { path: "/api/send-email" }
