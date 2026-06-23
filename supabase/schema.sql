create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text,
  relationship_status text,
  main_goal text,
  currency text not null default 'BRL',
  language text not null default 'pt-BR',
  avatar_url text,
  current_assets numeric(14,2) not null default 0,
  net_worth_goal numeric(14,2) not null default 0,
  onboarding_completed boolean not null default false,
  plan text not null default 'free' check (plan in ('free','premium_monthly','premium_annual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  type text not null check (type in ('income','expense')),
  name text not null,
  amount numeric(14,2) not null check (amount >= 0),
  category text,
  date date not null,
  status text not null default 'realized' check (status in ('planned','realized')),
  is_recurring boolean not null default false,
  recurrence_id uuid,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transactions_user_month_idx on public.transactions(user_id, month_key);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  debt_type text,
  total_amount numeric(14,2) not null,
  paid_amount numeric(14,2) not null default 0,
  monthly_payment numeric(14,2) not null default 0,
  interest_rate numeric(8,4),
  total_installments integer,
  current_installment integer,
  due_day integer,
  priority_type text,
  urgency_reason text,
  is_current_priority boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  deadline date,
  monthly_required numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  status text not null default 'open' check (status in ('open','closed')),
  planned_income numeric(14,2) not null default 0,
  realized_income numeric(14,2) not null default 0,
  planned_expenses numeric(14,2) not null default 0,
  realized_expenses numeric(14,2) not null default 0,
  final_balance numeric(14,2) not null default 0,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month_key)
);

create table if not exists public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  name text not null,
  amount numeric(14,2) not null,
  category text,
  day_of_month integer not null check (day_of_month between 1 and 31),
  start_month text not null,
  end_month text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couple_meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  topic_1 text not null,
  topic_2 text not null,
  topic_3 text not null,
  created_at timestamptz not null default now(),
  unique(user_id, month_key)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibilidade com o schema inicial já distribuído.
alter table public.profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists relationship_status text;
alter table public.profiles add column if not exists main_goal text;
alter table public.profiles add column if not exists currency text default 'BRL';
alter table public.profiles add column if not exists language text default 'pt-BR';
alter table public.profiles add column if not exists current_assets numeric(14,2) default 0;
alter table public.profiles add column if not exists net_worth_goal numeric(14,2) default 0;
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists plan text default 'free';
update public.profiles set user_id = id where user_id is null;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='full_name') then
    execute 'update public.profiles set name = full_name where name is null and full_name is not null';
  end if;
end $$;
create unique index if not exists profiles_user_id_idx on public.profiles(user_id);

alter table public.transactions add column if not exists month_key text;
alter table public.transactions add column if not exists name text;
alter table public.transactions add column if not exists date date;
alter table public.transactions add column if not exists status text default 'realized';
alter table public.transactions add column if not exists is_recurring boolean default false;
alter table public.transactions add column if not exists recurrence_id uuid;
alter table public.transactions add column if not exists payment_method text;
alter table public.transactions add column if not exists updated_at timestamptz default now();
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='transactions' and column_name='description') then
    execute 'update public.transactions set name = description where name is null and description is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='transactions' and column_name='occurred_at') then
    execute 'update public.transactions set date = occurred_at where date is null and occurred_at is not null';
  end if;
end $$;
update public.transactions set month_key = to_char(coalesce(date, current_date), 'YYYY-MM') where month_key is null;

alter table public.debts add column if not exists debt_type text;
alter table public.debts add column if not exists total_amount numeric(14,2);
alter table public.debts add column if not exists paid_amount numeric(14,2) default 0;
alter table public.debts add column if not exists total_installments integer;
alter table public.debts add column if not exists current_installment integer;
alter table public.debts add column if not exists priority_type text;
alter table public.debts add column if not exists urgency_reason text;
alter table public.debts add column if not exists is_current_priority boolean default false;
alter table public.debts add column if not exists updated_at timestamptz default now();
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='debts' and column_name='original_amount') then
    execute 'update public.debts set total_amount = original_amount where total_amount is null and original_amount is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='debts' and column_name='current_amount') then
    execute 'update public.debts set paid_amount = greatest(0, coalesce(original_amount,0) - coalesce(current_amount,0)) where paid_amount is null';
  end if;
end $$;

alter table public.goals add column if not exists goal_type text;
alter table public.goals add column if not exists deadline date;
alter table public.goals add column if not exists monthly_required numeric(14,2);
alter table public.goals add column if not exists updated_at timestamptz default now();
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='goals' and column_name='category') then
    execute 'update public.goals set goal_type = category where goal_type is null and category is not null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='goals' and column_name='target_date') then
    execute 'update public.goals set deadline = target_date where deadline is null and target_date is not null';
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.goals enable row level security;
alter table public.financial_months enable row level security;
alter table public.recurring_items enable row level security;
alter table public.couple_meetings enable row level security;
alter table public.leads enable row level security;
alter table public.subscriptions enable row level security;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','transactions','debts','goals','financial_months','recurring_items','couple_meetings']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_own', table_name);
    execute format('create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', table_name || '_own', table_name);
  end loop;
end $$;

drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert with check (true);
drop policy if exists subscriptions_own on public.subscriptions;
create policy subscriptions_own on public.subscriptions for select using (user_id = auth.uid());

revoke update on public.profiles from authenticated;
grant select, insert on public.profiles to authenticated;
grant update (name, email, relationship_status, main_goal, currency, language, avatar_url, current_assets, net_worth_goal, onboarding_completed, updated_at) on public.profiles to authenticated;

create or replace function public.enforce_free_plan_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare user_plan text;
declare item_count integer;
begin
  select coalesce(plan, 'free') into user_plan from public.profiles where user_id = new.user_id;
  if user_plan <> 'free' then return new; end if;
  if tg_table_name = 'transactions' then
    select count(*) into item_count from public.transactions where user_id = new.user_id and month_key = new.month_key;
    if item_count >= 20 then raise exception 'Limite gratuito de 20 lançamentos por mês atingido'; end if;
  elsif tg_table_name = 'goals' then
    select count(*) into item_count from public.goals where user_id = new.user_id;
    if item_count >= 3 then raise exception 'Limite gratuito de 3 metas atingido'; end if;
  elsif tg_table_name = 'debts' then
    select count(*) into item_count from public.debts where user_id = new.user_id;
    if item_count >= 3 then raise exception 'Limite gratuito de 3 dívidas atingido'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_transactions_limit on public.transactions;
drop trigger if exists enforce_goals_limit on public.goals;
drop trigger if exists enforce_debts_limit on public.debts;
create trigger enforce_transactions_limit before insert on public.transactions for each row execute function public.enforce_free_plan_limits();
create trigger enforce_goals_limit before insert on public.goals for each row execute function public.enforce_free_plan_limits();
create trigger enforce_debts_limit before insert on public.debts for each row execute function public.enforce_free_plan_limits();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars_read" on storage.objects;
drop policy if exists "avatars_insert" on storage.objects;
drop policy if exists "avatars_update" on storage.objects;
drop policy if exists "avatars_delete" on storage.objects;
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
