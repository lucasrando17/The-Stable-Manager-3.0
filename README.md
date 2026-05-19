# The Trotting Stable Owners Portal Build

This is a separate owner-facing portal package.

Purpose:
- Owners see only their horses
- Owners see updates, media, invoices, race hub, calendar and horse pages
- It is not the internal stable management app

Includes:
- owner login
- owner profile linking through `owner_portal_profiles`
- dashboard
- horse list
- horse profile page
- updates feed
- photos/videos/links from updates
- media vault
- race day hub
- invoices and financials
- phone-style calendar
- owner notifications support

Install:
1. Run `RUN_THIS_SQL_FOR_OWNERS_PORTAL.sql` in Supabase.
2. Upload this folder's CONTENTS to a GitHub repo or separate Vercel project.
3. Add Vercel env vars:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. Deploy.

Important:
To link an owner login, add a row to `owner_portal_profiles`:
- user_id = the Supabase Auth user UUID
- stable_id = your stable UUID
- owner_name = must match the `horse_owners.owner_name`
- owner_email / owner_phone optional

Verification:
Open `src/main.jsx` and search for:
- `OwnerDashboard`
- `HorsePortalPage`
- `OwnerCalendar`
