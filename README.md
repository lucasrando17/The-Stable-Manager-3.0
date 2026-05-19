# The Trotting Stable App — Final Rebuild v2

This is the final unified rebuild requested.

Included:
- Separate landing access points:
  - Stable Login
  - Owners Portal
  - Join With Invite Code
- Role permissions:
  - Admin
  - Trainer
  - Staff
  - Owner
- Owner role opens owner portal only.
- Stable roles open the stable operation side.
- Horses, owners, multi-owner percentages and profile pages.
- Work sectors, warm-up rules, sectionals and phone-style calendar.
- Racing nominations, results, prizemoney and analytics.
- Vet/Farrier expenses auto-create owner invoices by ownership percentage.
- Auto-created invoices are fully editable.
- Invoice module restored with:
  - line items
  - add/remove invoice lines
  - print/save PDF
  - share via phone sheet
  - email/demo API
- Updates with photos/videos/links.
- Updates automatically appear in owners portal and create owner notifications.
- Analytics: wins, placings, starts, prizemoney, income, expenses, net.
- Saved toast appears at the bottom of the screen.

Instructions:
1. Run RUN_THIS_SQL_FIRST.sql in Supabase.
2. Upload this folder's CONTENTS to GitHub.
3. Commit.
4. Wait for Vercel redeploy.
5. Hard refresh: CMD + SHIFT + R.

Verification in GitHub src/main.jsx:
- Landing
- StableApp
- OwnerApp
- Invoices
- InvoiceModal
- ShareInvoice
- PhoneCalendar


Build fix:
- Resolved duplicate MediaPreview function declaration that caused Vercel build failure.

Verified build fix:
- Removed duplicate RecordModal and UpdateMediaPreview declarations.
- Ran npm run build successfully before packaging.
