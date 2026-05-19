
-- SUPABASE STORAGE SETUP FOR UPDATE PHOTO/VIDEO UPLOADS
-- Run this in Supabase SQL Editor after your main schema is already working.

insert into storage.buckets (id, name, public)
values ('update-media', 'update-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated users can upload update media" on storage.objects;
create policy "Authenticated users can upload update media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'update-media');

drop policy if exists "Authenticated users can update update media" on storage.objects;
create policy "Authenticated users can update update media"
on storage.objects
for update
to authenticated
using (bucket_id = 'update-media')
with check (bucket_id = 'update-media');

drop policy if exists "Authenticated users can delete update media" on storage.objects;
create policy "Authenticated users can delete update media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'update-media');

drop policy if exists "Public can view update media" on storage.objects;
create policy "Public can view update media"
on storage.objects
for select
to public
using (bucket_id = 'update-media');
