-- Asobou MVP schema
-- No auth/login: access control is enforced entirely at the application layer
-- (Next.js server code holding the service role key). RLS is enabled on every
-- table with NO policies for the anon/authenticated roles, so even if the
-- Supabase anon key ever leaked, PostgREST/Realtime clients could not read or
-- write anything. Only the service role (server-side only, never shipped to
-- the browser) can access these tables.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  share_token text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_members_group_id on members(group_id);

-- ---------------------------------------------------------------------------
-- availability
-- ---------------------------------------------------------------------------
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  note text,
  created_at timestamptz not null default now(),
  constraint availability_time_range check (start_time < end_time)
);

create index if not exists idx_availability_group_date on availability(group_id, date);
create index if not exists idx_availability_member on availability(member_id);

-- ---------------------------------------------------------------------------
-- ideas
-- ---------------------------------------------------------------------------
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  normalized_title text not null,
  created_at timestamptz not null default now(),
  unique (group_id, normalized_title)
);

create index if not exists idx_ideas_group on ideas(group_id);

-- ---------------------------------------------------------------------------
-- idea_votes
-- ---------------------------------------------------------------------------
create table if not exists idea_votes (
  idea_id uuid not null references ideas(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, member_id)
);

create index if not exists idx_idea_votes_member on idea_votes(member_id);

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  idea_id uuid references ideas(id) on delete set null,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  note text,
  created_at timestamptz not null default now(),
  constraint plans_time_range check (start_time < end_time)
);

create index if not exists idx_plans_group on plans(group_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: enabled, default-deny for anon/authenticated.
-- Every read/write goes through the server (service role), which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table groups enable row level security;
alter table members enable row level security;
alter table availability enable row level security;
alter table ideas enable row level security;
alter table idea_votes enable row level security;
alter table plans enable row level security;
