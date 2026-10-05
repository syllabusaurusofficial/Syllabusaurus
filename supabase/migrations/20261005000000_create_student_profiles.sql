create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  grade text,
  board text,
  state text,
  medium text,
  target_exam text,
  study_goal text,
  subjects jsonb default '[]'::jsonb,
  learning_style jsonb default '[]'::jsonb,
  academic_challenges jsonb default '[]'::jsonb,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.student_profiles enable row level security;

revoke all on public.student_profiles from anon, public;
grant select, insert, update on public.student_profiles to authenticated;

create policy "Students can read their own profile"
  on public.student_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Students can create their own profile"
  on public.student_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Students can update their own profile"
  on public.student_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
