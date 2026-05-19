# The Trotting Stable App — Product Build

Includes:
- public landing/preview page
- rotating login/landing photo reel
- login
- invite-code signup screen
- stable-secured Supabase app
- horses, work, racing, vet, feed, finance, owners, inventory, staff
- invoices with print/share
- work warm-up and jogger machine fields
- single-horse work history isolator

Before deploying:
1. Run SUPABASE_UPGRADE_SQL.sql in Supabase SQL Editor.
2. Upload the contents of this folder to GitHub.
3. Confirm Vercel env vars:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

For photos:
- add images to public/login-photos/
- name them photo-1.jpg, photo-2.jpg, etc.
