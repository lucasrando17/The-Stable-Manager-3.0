# The Trotting Stable App — Final Rebuild

This is the unified final rebuild package.

Includes:
- Landing page with Stable/Owner Login and Join With Invite Code
- Role-based app:
  - Admin
  - Trainer
  - Staff
  - Owner
- Stable-side operations
- Owner portal inside the same app, not replacing the trainer login
- Horses with profile pages
- Owners with profile pages
- Multi-owner percentage support
- Work with requested sectors, warm-up rules, sectionals and phone-style calendar
- Racing nominations/results/prizemoney
- Vet and farrier billing to owners by percentage
- Feed, gear, inventory, staff
- Updates with photos/videos/links
- Updates automatically appear in owner portal and create owner notifications
- Analytics: wins, placings, starts, prizemoney, income/expenses/net
- Invoices auto-created from vet/farrier/finance expenses and remain editable
- Saved toast appears at bottom of screen

Instructions:
1. Run RUN_THIS_SQL_FIRST.sql in Supabase.
2. Upload this folder's CONTENTS to GitHub.
3. Commit changes.
4. Vercel redeploys automatically.
5. Hard refresh with CMD + SHIFT + R.

Verification:
Open src/main.jsx in GitHub and search for:
- StableApp
- OwnerApp
- PhoneCalendar
- afterSave
