-- Coach Academy production-MVP schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'student' check (role in ('student','coach')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  price_inr integer not null default 0 check (price_inr >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 1,
  video_path text,
  created_at timestamptz not null default now(),
  unique(course_id, position)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_option text not null,
  position integer not null default 1,
  unique(course_id, position)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  paid boolean not null default false,
  payment_id text,
  payment_order_id text,
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id, module_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_no text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  score integer not null check (score >= 60 and score <= 100),
  issued_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.enrollments enable row level security;
alter table public.module_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "published courses readable" on public.courses;
create policy "published courses readable" on public.courses for select using (published=true or auth.uid() is not null);

drop policy if exists "course modules readable" on public.modules;
create policy "course modules readable" on public.modules for select using (exists(select 1 from public.courses c where c.id=course_id and (c.published=true or auth.uid() is not null)));

drop policy if exists "quiz readable" on public.quiz_questions;
create policy "quiz readable" on public.quiz_questions for select using (exists(select 1 from public.courses c where c.id=course_id and c.published=true));

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);

drop policy if exists "own enrollment read" on public.enrollments;
create policy "own enrollment read" on public.enrollments for select using (auth.uid()=user_id);

drop policy if exists "own progress" on public.module_progress;
create policy "own progress" on public.module_progress for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

drop policy if exists "own attempts" on public.quiz_attempts;
create policy "own attempts" on public.quiz_attempts for select using (auth.uid()=user_id);

drop policy if exists "own certificates" on public.certificates;
create policy "own certificates" on public.certificates for select using (auth.uid()=user_id);

insert into storage.buckets(id,name,public) values ('course-videos','course-videos',false)
on conflict(id) do nothing;

-- Coach writes should be performed through server routes using the service role key.
-- Never expose the service-role key in client-side code.
