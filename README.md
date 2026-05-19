# The Trotting Stable App — Final Clean Rebuild

This is a clean rebuild from scratch, created to replace the broken duplicate-function builds.

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
- Horses with multiple owners, ownership percentages and full profile pages.
- Owners with profile pages, horses owned, percentages, invoices and updates.
- Work sectors exactly as requested.
- Warm-up field appears for Jog/Canter, Gallop, Trot and Hopple.
- Sectionals: Overall Time, Mile Rate, Last Half, Last Quarter.
- Phone-style calendar.
- Racing nominations, results, prizemoney and analytics.
- Vet/Farrier expenses auto-create owner invoices by ownership percentage.
- Auto-created invoices are fully editable.
- Invoice module restored with:
  - line items
  - add/remove invoice lines
  - print/save PDF
  - share via phone share sheet
  - email/demo API
- Updates with photos/videos/links.
- Updates automatically appear in owners portal and create owner notifications.
- Analytics: wins, placings, starts, prizemoney, income, expenses, net.
- Saved toast appears at the bottom of screen.

Instructions:
1. Run RUN_THIS_SQL_FIRST.sql in Supabase.
2. Upload this folder's CONTENTS to GitHub.
3. Commit.
4. Wait for Vercel redeploy.
5. Hard refresh with CMD + SHIFT + R.

Verification:
Open src/main.jsx and search for:
- StableApp
- OwnerApp
- InvoiceModal
- ShareInvoice
- PhoneCalendar
- HorseProfile


Build verification:
- npm install completed successfully using local cache.
- npm run build completed successfully before packaging.
