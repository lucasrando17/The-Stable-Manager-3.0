export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { to, subject, message, invoiceNumber } = req.body || {};
  if (!to || !subject) return res.status(400).json({ error: 'Missing recipient or subject' });
  if (!process.env.RESEND_API_KEY || !process.env.INVOICE_FROM_EMAIL) {
    return res.status(200).json({ ok: true, mode: 'demo', message: `Demo only: invoice ${invoiceNumber || ''} would be emailed to ${to}.` });
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.INVOICE_FROM_EMAIL, to, subject, html: String(message || '').replace(/\n/g, '<br />') })
  });
  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data });
  return res.status(200).json({ ok: true, message: `Invoice ${invoiceNumber || ''} emailed to ${to}.`, data });
}
