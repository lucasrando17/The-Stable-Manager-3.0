
-- THE TROTTING STABLE APP - FINAL CLEAN REBUILD SQL
-- Run this once in Supabase SQL Editor.
-- It is designed to be safe to rerun over the earlier messy rebuilds.

create extension if not exists "pgcrypto";

create table if not exists public.stables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  stable_id uuid references public.stables(id) on delete cascade,
  role text not null default 'owner',
  full_name text,
  owner_name text,
  created_at timestamptz default now()
);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  stable_id uuid references public.stables(id) on delete cascade,
  role text not null default 'owner',
  email text,
  owner_name text,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text default 'owner',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.horses (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  name text not null,
  stable_name text,
  profile_photo_url text,
  age numeric,
  sex text,
  trainer text,
  status text,
  current_status text,
  next_target text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.horse_owners (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  horse_name text not null,
  owner_name text not null,
  percentage numeric default 100,
  created_at timestamptz default now()
);

create table if not exists public.work_entries (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  date date,
  horse_name text,
  sector text,
  warmup text,
  distance text,
  overall_time text,
  mile_rate text,
  last_half text,
  last_quarter text,
  driver text,
  recovery text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.race_records (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  date date,
  horse_name text,
  track text,
  race text,
  race_time text,
  barrier text,
  distance text,
  status text,
  driver text,
  result text,
  prizemoney numeric default 0,
  replay_url text,
  comments text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  treatment_date date,
  horse_name text,
  treatment_type text,
  veterinarian text,
  bill_amount numeric default 0,
  bill_to_owners text default 'No',
  follow_up_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.farrier_records (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  farrier_date date,
  horse_name text,
  farrier_name text,
  service_type text,
  shoeing_notes text,
  bill_amount numeric default 0,
  bill_to_owners text default 'No',
  next_due_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.feed_programs (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  horse_name text,
  morning_feed text,
  lunch_feed text,
  night_feed text,
  supplements text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.gear_items (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  item_name text,
  horse_name text,
  category text,
  size text,
  colour text,
  condition text,
  location text,
  assigned_to text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  entry_date date,
  horse_name text,
  entry_type text,
  category text,
  amount numeric default 0,
  paid text,
  bill_to_owners text default 'No',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  invoice_number text,
  client_name text,
  client_email text,
  client_phone text,
  horse_name text,
  due_date date,
  status text default 'Draft',
  payment_status text default 'Unpaid',
  notes text,
  line_items jsonb default '[]'::jsonb,
  amount numeric default 0,
  gst numeric default 0,
  total numeric default 0,
  source_type text,
  source_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  title text,
  horse_name text,
  category text,
  body text,
  photo_urls text,
  video_urls text,
  link_urls text,
  visibility text default 'owners',
  send_status text default 'Draft',
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.owner_notifications (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  owner_name text,
  horse_name text,
  title text,
  body text,
  notification_type text,
  read_status text default 'Unread',
  created_at timestamptz default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  item_name text,
  category text,
  quantity numeric default 0,
  supplier text,
  reorder_level numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  stable_id uuid references public.stables(id) on delete cascade,
  full_name text,
  role text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

-- Compatibility columns.
alter table public.profiles add column if not exists owner_name text;
alter table public.invite_codes add column if not exists owner_name text;
alter table public.horses add column if not exists profile_photo_url text;
alter table public.horses add column if not exists current_status text;
alter table public.race_records add column if not exists race_time text;
alter table public.race_records add column if not exists barrier text;
alter table public.race_records add column if not exists replay_url text;
alter table public.race_records add column if not exists comments text;
alter table public.invoices add column if not exists payment_status text default 'Unpaid';
alter table public.invoices add column if not exists source_type text;
alter table public.invoices add column if not exists source_id uuid;
alter table public.updates add column if not exists photo_urls text;
alter table public.updates add column if not exists video_urls text;
alter table public.updates add column if not exists link_urls text;

-- Clean up old constraint mess before recreating it safely.
alter table public.horse_owners drop constraint if exists horse_owners_unique_share;

do $$ begin
  alter table public.horse_owners add constraint horse_owners_unique_share unique (stable_id, horse_name, owner_name);
exception when duplicate_object then null;
end $$;

alter table public.stables enable row level security;
alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.owners enable row level security;
alter table public.horses enable row level security;
alter table public.horse_owners enable row level security;
alter table public.work_entries enable row level security;
alter table public.race_records enable row level security;
alter table public.treatments enable row level security;
alter table public.farrier_records enable row level security;
alter table public.feed_programs enable row level security;
alter table public.gear_items enable row level security;
alter table public.finance_entries enable row level security;
alter table public.invoices enable row level security;
alter table public.updates enable row level security;
alter table public.owner_notifications enable row level security;
alter table public.inventory enable row level security;
alter table public.staff enable row level security;

drop policy if exists "Users can view own profile only" on public.profiles;
create policy "Users can view own profile only" on public.profiles for select using (id = auth.uid());

drop policy if exists "Users can update own profile only" on public.profiles;
create policy "Users can update own profile only" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Users can view own stable" on public.stables;
create policy "Users can view own stable" on public.stables for select using (
  id in (select stable_id from public.profiles where profiles.id = auth.uid())
);

drop policy if exists "Invite codes can be checked" on public.invite_codes;
create policy "Invite codes can be checked" on public.invite_codes for select using (used_by is null);

drop policy if exists "Invite codes can be updated on signup" on public.invite_codes;
create policy "Invite codes can be updated on signup" on public.invite_codes for update using (used_by is null) with check (true);

do $$
declare t text;
begin
  foreach t in array array[
    'owners','horses','horse_owners','work_entries','race_records','treatments','farrier_records',
    'feed_programs','gear_items','finance_entries','invoices','updates','owner_notifications','inventory','staff'
  ]
  loop
    execute format('drop policy if exists "Users can access %s in own stable" on public.%I', t, t);
    execute format(
      'create policy "Users can access %s in own stable" on public.%I for all using (stable_id in (select stable_id from public.profiles where profiles.id = auth.uid())) with check (stable_id in (select stable_id from public.profiles where profiles.id = auth.uid()))',
      t, t
    );
  end loop;
end $$;
