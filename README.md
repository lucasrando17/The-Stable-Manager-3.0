# The Trotting Stable App — Clean Full Rebuild v9

This is a brand-new project package, not a patch over the older ZIPs.

It includes:
- public landing page
- login
- invite-code signup
- horses
- multi-owner support
- ownership percentages
- owner profile showing horses/percentages
- automatic owner percentage invoice splitting
- work sectors exactly as requested
- conditional warm-up details for Jog/Canter, Gallop, Trot, Hopple
- Recovery/Heart Rate
- sectionals: Overall Time, Mile Rate, Last Half, Last Quarter
- phone-style calendar, not date tabs
- day detail panel when clicking calendar dates
- racing results with status, result, prizemoney
- analytics: income, expenses, net, work entries, starts, wins, placings, prizemoney
- horse profile deep view
- vet, feed, gear, bills, owner shares
- updates tab with photo URLs, video URLs, links
- owner-targeted update sending via phone/SMS/mailto/email demo API
- clear invoice numbering

IMPORTANT:
1. Run `RUN_THIS_SQL_FIRST.sql` in Supabase.
2. Delete/replace the old GitHub files with this folder's contents.
3. Upload the CONTENTS of this folder to GitHub, not the folder itself.
4. Commit changes.
5. Wait for Vercel redeploy.
6. Hard refresh with CMD + SHIFT + R.

Verification after upload:
Open `src/main.jsx` in GitHub and search for:
- `function PhoneCalendar`
- `function UpdatesPanel`
- `function Analytics`
If those are present, the correct rebuild is uploaded.
