-- ShortsAI Studio — Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text not null default '',
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','creator','studio')),
  videos_used_this_month int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Projects ────────────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  status text not null default 'uploading'
    check (status in ('uploading','processing','ready','failed')),
  original_url text,
  file_size bigint,
  duration numeric(10,2),
  viral_score int,
  shorts_count int not null default 0,
  transcript jsonb,
  ai_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can manage own projects" on public.projects
  for all using (auth.uid() = user_id);

-- ── Shorts ──────────────────────────────────────────────────────────────────
create table public.shorts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  platform text not null default 'youtube_shorts',
  viral_score int not null default 0,
  duration numeric(6,2) not null default 0,
  views int not null default 0,
  status text not null default 'ready',
  caption_style text default 'bold_impact',
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.shorts enable row level security;

create policy "Users can manage own shorts" on public.shorts
  for all using (auth.uid() = user_id);

-- ── Storage Buckets ─────────────────────────────────────────────────────────
-- Run these in Supabase Dashboard > Storage:
-- 1. Create bucket "videos" (private, 8GB max)
-- 2. Create bucket "shorts" (public, 500MB max)
-- 3. Create bucket "thumbnails" (public, 10MB max)

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_status on public.projects(status);
create index idx_shorts_project_id on public.shorts(project_id);
create index idx_shorts_user_id on public.shorts(user_id);
create index idx_shorts_viral_score on public.shorts(viral_score desc);
