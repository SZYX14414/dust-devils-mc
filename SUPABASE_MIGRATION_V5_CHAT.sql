-- V5 : sauvegarder la base puis exécuter dans Supabase SQL Editor.
-- Migration additive : ne supprime ni comptes ni données.
create table if not exists public.club_chat_messages (
 id bigint generated always as identity primary key,
 channel text not null check (channel in ('general','bureau','tresorerie')),
 author_id uuid references auth.users(id) on delete set null,
 author_name text not null,
 body text not null check (char_length(body) between 1 and 1200),
 created_at timestamptz not null default now()
);
create index if not exists club_chat_channel_id_idx on public.club_chat_messages(channel,id desc);
alter table public.club_chat_messages enable row level security;
-- Pas de policy client : les fonctions Netlify vérifient la session et le rôle.
