// Vercel Serverless Function placeholder.
// To activate real SMS sending, add Twilio credentials to Vercel env vars.
//
// Expected POST body:
// { to, message, invoiceNumber }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message, invoiceNumber } = req.body || {};

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing phone number or message' });
  }

  // Example Twilio integration would go here.

  return res.status(200).json({
    ok: true,
    mode: 'demo',
    message: `Demo only: SMS for invoice ${invoiceNumber || ''} would be sent to ${to}.`
  });
}
