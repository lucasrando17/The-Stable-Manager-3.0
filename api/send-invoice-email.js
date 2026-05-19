// Vercel Serverless Function placeholder.
// To activate real email sending, add RESEND_API_KEY in Vercel env vars and uncomment fetch call.
//
// Expected POST body:
// { to, subject, message, invoiceHtml, invoiceNumber }
//
// For production: validate user auth, sanitize input, generate a PDF server-side,
// attach it, then send via Resend/Postmark/SendGrid.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, message, invoiceNumber } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing recipient or subject' });
  }

  // Example with Resend:
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: process.env.INVOICE_FROM_EMAIL,
  //     to,
  //     subject,
  //     html: message.replace(/\n/g, '<br />')
  //   })
  // });

  return res.status(200).json({
    ok: true,
    mode: 'demo',
    message: `Demo only: invoice ${invoiceNumber || ''} would be emailed to ${to}.`
  });
}
