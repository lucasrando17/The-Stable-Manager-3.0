# Stable Manager SaaS Scaffold

This is the rebuilt version with invoice sharing/email/SMS scaffolding.

Included now:
- add/edit/delete stable modules
- work warm-up
- jogger machine work sector
- single horse work history isolator
- invoices with line items, GST, totals
- print/save invoice as PDF
- phone share sheet for SMS/WhatsApp/email text sharing
- demo email API endpoint
- demo SMS API endpoint
- import/export JSON
- placeholders for owner portal, cloud sync, login, database

To make email/SMS actually send:
- Add Resend/Postmark/SendGrid details to `/api/send-invoice-email.js`
- Add Twilio details to `/api/send-invoice-sms.js`
- Add env vars in Vercel from `.env.example`

Vercel:
Framework: Vite
Build: npm run build
Output: dist
Install: npm install
