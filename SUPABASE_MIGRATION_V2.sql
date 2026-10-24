-- Dust Devil's MC : exécuter dans Supabase SQL Editor, une fois.
-- Ne supprime pas les comptes existants.
create table if not exists public.member_logins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique,
 created_at timestamptz default now()
);
alter table public.member_logins enable row level security;
insert into public.member_logins(user_id,username)
values ('4a0f07d1-8c3c-4882-a8dd-2bef9e85e6e9','lucas.lubrun')
on conflict(user_id) do update set username=excluded.username;
alter table public.member_profiles add column if not exists permission_overrides jsonb not null default '{}'::jsonb;
alter table public.member_profiles add column if not exists must_change_password boolean not null default false;
create table if not exists public.club_data (
 section text primary key,
 payload jsonb not null default '[]'::jsonb,
 version bigint not null default 1,
 updated_at timestamptz not null default now()
);
create table if not exists public.club_audit (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 actor_id uuid references auth.users(id) on delete set null,
 actor_name text not null,
 action text not null,
 section text not null,
 details jsonb not null default '{}'::jsonb
);
create table if not exists public.club_announcements (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 author_name text not null,
 title text not null,
 body text not null
);
alter table public.club_data enable row level security;
alter table public.club_audit enable row level security;
alter table public.club_announcements enable row level security;
-- Aucune policy client : ces tables sont accessibles exclusivement via les fonctions serveur vérifiant le JWT et le rôle.
-- Ne jamais exposer la clé service_role au navigateur.
