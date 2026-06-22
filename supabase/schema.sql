create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  monthly_income numeric(12,2) default 0,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('income','expense')),
  category text,
  occurred_at date not null default current_date,
  created_at timestamptz default now()
);

create table public.debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  original_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null,
  interest_rate numeric(7,4) default 0,
  monthly_payment numeric(12,2),
  due_day integer,
  status text default 'active',
  created_at timestamptz default now()
);

create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  target_date date,
  category text,
  created_at timestamptz default now()
);

create table public.couples (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id),
  partner_id uuid references public.profiles(id),
  invite_email text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table public.couple_goals (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  target_date date,
  created_at timestamptz default now()
);

create table public.ai_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  summary text,
  content jsonb not null default '{}'::jsonb,
  model text,
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.goals enable row level security;
alter table public.couples enable row level security;
alter table public.couple_goals enable row level security;
alter table public.ai_plans enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "transactions_own" on public.transactions for all using (auth.uid() = user_id);
create policy "debts_own" on public.debts for all using (auth.uid() = user_id);
create policy "goals_own" on public.goals for all using (auth.uid() = user_id);
create policy "ai_plans_own" on public.ai_plans for all using (auth.uid() = user_id);
create policy "subscriptions_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "couples_members" on public.couples for all using (auth.uid() in (owner_id, partner_id));
create policy "couple_goals_members" on public.couple_goals for all using (
  exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.owner_id, c.partner_id))
);
