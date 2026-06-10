-- VetTooth initial Supabase/Postgres schema.
-- Run this in Supabase SQL editor or with `supabase db push`.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('admin', 'vet', 'secretary');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.user_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'overdue');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.attendance_status as enum ('scheduled', 'in_progress', 'finished', 'canceled');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_tenant_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.clinic_id is null then
      new.clinic_id := public.current_clinic_id();
    end if;

    if to_jsonb(new) ? 'created_by'
      and new.created_by is null
      and auth.uid() is not null
      and exists (select 1 from public.user_profiles where id = auth.uid())
    then
      new.created_by := auth.uid();
    end if;
  end if;

  if tg_op = 'UPDATE'
    and to_jsonb(new) ? 'updated_by'
    and auth.uid() is not null
    and exists (select 1 from public.user_profiles where id = auth.uid())
  then
    new.updated_by := auth.uid();
  end if;

  return new;
end;
$$;

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  document text,
  phone text,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  role public.user_role not null default 'vet',
  status public.user_status not null default 'active',
  name text not null,
  full_name text,
  email text not null,
  phone text,
  function_title text,
  access_profile_id uuid,
  team_member_id uuid,
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, email)
);

create or replace function public.current_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = public
as $$
  select p
  from public.user_profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.current_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from public.user_profiles where id = auth.uid() limit 1
$$;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin'::public.user_role, false)
$$;

create table if not exists public.access_profiles (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  description text,
  type text not null default 'custom',
  base_role public.user_role,
  permissions jsonb not null default '{}'::jsonb,
  restrictions jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add constraint user_profiles_access_profile_fk
  foreign key (access_profile_id) references public.access_profiles(id) on delete set null
  not valid;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid references public.user_profiles(id) on delete set null,
  name text not null,
  function_title text not null,
  specialty text,
  crmv text,
  cpf text,
  phone text,
  email text,
  signature text,
  photo_url text,
  status public.user_status not null default 'active',
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add constraint user_profiles_team_member_fk
  foreign key (team_member_id) references public.team_members(id) on delete set null
  not valid;

create table if not exists public.general_settings (
  clinic_id uuid primary key references public.clinics(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  document text,
  phone text,
  secondary_phone text,
  email text,
  address text,
  zip_code text,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  owner_id uuid references public.owners(id) on delete set null,
  name text not null,
  address text,
  city text,
  state text,
  phone text,
  email text,
  document text,
  registration_number text,
  type text,
  zip_code text,
  street text,
  number text,
  neighborhood text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  owner_id uuid not null references public.owners(id) on delete restrict,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  species text not null,
  custom_species text,
  breed text,
  birth_date date,
  age integer,
  age_months integer,
  gender text,
  neutered boolean default false,
  pregnant boolean default false,
  weight numeric(10,3),
  photo_url text,
  status text not null default 'Alive',
  size text,
  temperament text,
  coat text,
  microchip text,
  rg text,
  health_plan text,
  health_plan_number text,
  health_plan_expiry date,
  health_plan_obj jsonb,
  allergies text[] default '{}',
  chronic_diseases text[] default '{}',
  anesthetic_risk text,
  notes text,
  internal_notes text,
  archived_at timestamptz,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  category text not null,
  quantity numeric(12,3) not null default 0,
  unit text not null,
  min_stock numeric(12,3) not null default 0,
  cost_price numeric(12,2) not null default 0,
  unit_cost numeric(12,4),
  sale_price numeric(12,2) not null default 0,
  package_quantity numeric(12,3),
  package_unit text,
  allows_fraction boolean not null default false,
  batch_number text,
  expiry_date date,
  manufacturing_date date,
  manufacturer text,
  supplier text,
  description text,
  image_url text,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procedure_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  category text,
  description text,
  base_cost numeric(12,2) not null default 0,
  charge_price numeric(12,2),
  margin_percent numeric(8,2),
  duration text,
  average_time text,
  operational_cost numeric(12,2),
  notes text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procedure_template_items (
  id uuid primary key default gen_random_uuid(),
  procedure_template_id uuid not null references public.procedure_templates(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  quantity numeric(12,3) not null default 1,
  unit text,
  item_name text,
  cost_unit numeric(12,4),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  doctor_user_id uuid references public.user_profiles(id) on delete set null,
  doctor_name text,
  title text,
  start_at timestamptz not null,
  end_at timestamptz,
  appointment_mode text,
  type text,
  status text not null default 'scheduled',
  color text,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  owner_id uuid references public.owners(id) on delete set null,
  vet_user_id uuid references public.user_profiles(id) on delete set null,
  patient_name text not null,
  owner_name text,
  vet_name text,
  date timestamptz not null default now(),
  reason text,
  anamnesis text,
  diagnosis text,
  consultation_type text,
  return_date date,
  notes text,
  status public.attendance_status not null default 'in_progress',
  vitals jsonb not null default '{}'::jsonb,
  total_cost numeric(12,2) not null default 0,
  total_service numeric(12,2) not null default 0,
  total_total numeric(12,2) not null default 0,
  total_products_revenue numeric(12,2) default 0,
  total_procedure_cost numeric(12,2) default 0,
  total_procedure_revenue numeric(12,2) default 0,
  total_vaccine_cost numeric(12,2) default 0,
  total_vaccine_revenue numeric(12,2) default 0,
  gross_profit numeric(12,2) default 0,
  margin_percent numeric(8,2) default 0,
  finished_at timestamptz,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_consumed_items (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  item_name text not null,
  quantity_used numeric(12,3) not null,
  unit text,
  cost_at_moment numeric(12,4) not null default 0,
  price_at_moment numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  date timestamptz not null default now(),
  digital_signature boolean default false,
  controlled_medication boolean default false,
  signature_hash text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  type text not null,
  name text not null,
  concentration text,
  formula text,
  quantity text,
  dosage text,
  frequency text,
  duration text,
  route text,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_requests (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  date timestamptz not null default now(),
  clinical_indication text,
  priority text not null default 'routine',
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.exam_request_items (
  id uuid primary key default gen_random_uuid(),
  exam_request_id uuid not null references public.exam_requests(id) on delete cascade,
  name text not null,
  type text not null,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.vaccine_applications (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  type text,
  name text not null,
  dose text,
  batch text,
  manufacturer text,
  manufacturing_date date,
  expiry_date date,
  application_date date not null default current_date,
  price numeric(12,2) not null default 0,
  notes text,
  next_dose_date date,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.applied_procedures (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  procedure_template_id uuid references public.procedure_templates(id) on delete set null,
  name text not null,
  category text,
  price numeric(12,2) not null default 0,
  cost numeric(12,2) default 0,
  margin_percent numeric(8,2),
  consumed_items jsonb not null default '[]'::jsonb,
  notes text,
  timestamp timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.return_visits (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendances(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  date date not null,
  time time,
  type text not null,
  reason text,
  notes text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  attendance_id uuid references public.attendances(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  patient_name text not null,
  owner_name text,
  amount numeric(12,2) not null default 0,
  total_cost numeric(12,2),
  gross_profit numeric(12,2),
  margin_percent numeric(8,2),
  professional_name text,
  due_date date not null,
  status public.payment_status not null default 'pending',
  payment_date timestamptz,
  payment_method text,
  payment_details jsonb,
  description text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  business_date date not null,
  status text not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_balance numeric(12,2) not null default 0,
  closing_balance numeric(12,2),
  notes text,
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cash_sessions_one_open_per_day_idx
  on public.cash_sessions(clinic_id, business_date)
  where status = 'open';

create table if not exists public.cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  cash_session_id uuid references public.cash_sessions(id) on delete set null,
  attendance_id uuid references public.attendances(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  reference_id uuid,
  date timestamptz not null default now(),
  business_date date,
  type text not null,
  category text not null,
  amount numeric(12,2) not null,
  gross_amount numeric(12,2),
  total_cost numeric(12,2),
  gross_profit numeric(12,2),
  margin_percent numeric(8,2),
  payment_status public.payment_status,
  payment_method text,
  patient_name text,
  owner_name text,
  professional_name text,
  description text,
  source_type text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  attendance_id uuid references public.attendances(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  patient_name text not null,
  owner_name text,
  professional_name text,
  date timestamptz not null default now(),
  gross_amount numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,
  gross_profit numeric(12,2) not null default 0,
  margin_percent numeric(8,2) not null default 0,
  payment_status public.payment_status not null default 'pending',
  procedure_count integer not null default 0,
  description text,
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  actor_user_id uuid references public.user_profiles(id) on delete set null,
  actor_name text not null,
  entity text not null,
  entity_id uuid,
  action text not null,
  changed_field text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.backup_snapshots (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  label text not null,
  created_by uuid references public.user_profiles(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists owners_clinic_idx on public.owners(clinic_id);
create index if not exists properties_clinic_idx on public.properties(clinic_id);
create index if not exists patients_clinic_idx on public.patients(clinic_id);
create index if not exists patients_owner_idx on public.patients(owner_id);
create index if not exists appointments_clinic_start_idx on public.appointments(clinic_id, start_at);
create index if not exists attendances_clinic_patient_idx on public.attendances(clinic_id, patient_id);
create index if not exists receivables_clinic_status_idx on public.receivables(clinic_id, status);
create index if not exists cash_flow_clinic_date_idx on public.cash_flow_entries(clinic_id, business_date);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_clinic_id uuid;
  requested_role public.user_role;
  requested_role_text text;
  target_access_profile_id uuid;
  profile_name text;
begin
  requested_role_text := lower(coalesce(new.raw_user_meta_data->>'role', 'admin'));
  requested_role := case requested_role_text
    when 'admin' then 'admin'::public.user_role
    when 'vet' then 'vet'::public.user_role
    when 'veterinario' then 'vet'::public.user_role
    when 'veterinário' then 'vet'::public.user_role
    when 'secretary' then 'secretary'::public.user_role
    when 'secretaria' then 'secretary'::public.user_role
    when 'secretária' then 'secretary'::public.user_role
    else 'admin'::public.user_role
  end;
  profile_name := coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email);
  target_clinic_id := nullif(new.raw_user_meta_data->>'clinic_id', '')::uuid;

  if target_clinic_id is null then
    insert into public.clinics (name, email)
    values (coalesce(new.raw_user_meta_data->>'clinic_name', profile_name || ' - Clinica'), new.email)
    returning id into target_clinic_id;
  end if;

  select id into target_access_profile_id
  from public.access_profiles
  where clinic_id = target_clinic_id
    and type = 'standard'
    and base_role = requested_role
  limit 1;

  insert into public.user_profiles (
    id,
    clinic_id,
    role,
    name,
    full_name,
    email,
    phone,
    function_title,
    access_profile_id
  )
  values (
    new.id,
    target_clinic_id,
    requested_role,
    profile_name,
    coalesce(new.raw_user_meta_data->>'full_name', profile_name),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'function_title',
    target_access_profile_id
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  insert into public.general_settings (clinic_id, settings)
  values (target_clinic_id, '{}'::jsonb)
  on conflict (clinic_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_login()
returns void
language sql
security definer
set search_path = public
as $$
  update public.user_profiles
  set last_access_at = now(), updated_at = now()
  where id = auth.uid();
$$;

create or replace function public.seed_standard_access_profiles(target_clinic_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.access_profiles (clinic_id, name, description, type, base_role, permissions, restrictions)
  values
    (target_clinic_id, 'Administrador (ADM)', 'Acesso total ao sistema.', 'standard', 'admin',
      '{"settings":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"users":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"branding":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"finance":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"inventory":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"attendance":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"medicalRecords":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"agenda":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"reports":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"documents":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"invoices":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"whatsapp":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"audit":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"patients":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true},"team":{"view":true,"create":true,"edit":true,"delete":true,"exportPdf":true,"accessFinancial":true,"accessStock":true}}',
      '{"editAgenda":true,"cancelAttendance":true,"viewValues":true,"sensitiveSettings":true}'),
    (target_clinic_id, 'Medico Veterinario', 'Permissoes clinicas com acesso operacional.', 'standard', 'vet',
      '{"attendance":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":true,"accessFinancial":false,"accessStock":false},"medicalRecords":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":true,"accessFinancial":false,"accessStock":false},"agenda":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":false},"patients":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":false},"documents":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":true,"accessFinancial":false,"accessStock":false},"inventory":{"view":true,"create":false,"edit":false,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":true},"finance":{"view":true,"create":false,"edit":false,"delete":false,"exportPdf":false,"accessFinancial":true,"accessStock":false}}',
      '{"editAgenda":true,"cancelAttendance":false,"viewValues":true,"sensitiveSettings":false}'),
    (target_clinic_id, 'Secretaria / Recepcao', 'Permissoes administrativas restritas.', 'standard', 'secretary',
      '{"agenda":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":false},"patients":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":false},"attendance":{"view":true,"create":false,"edit":false,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":false},"inventory":{"view":true,"create":true,"edit":true,"delete":false,"exportPdf":false,"accessFinancial":false,"accessStock":true},"finance":{"view":true,"create":true,"edit":false,"delete":false,"exportPdf":false,"accessFinancial":true,"accessStock":false},"documents":{"view":true,"create":false,"edit":false,"delete":false,"exportPdf":true,"accessFinancial":false,"accessStock":false}}',
      '{"editAgenda":true,"cancelAttendance":false,"viewValues":true,"sensitiveSettings":false}')
  on conflict do nothing;
end;
$$;

create or replace function public.seed_profiles_after_clinic()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_standard_access_profiles(new.id);
  return new;
end;
$$;

drop trigger if exists on_clinic_created_seed_profiles on public.clinics;
create trigger on_clinic_created_seed_profiles
  after insert on public.clinics
  for each row execute function public.seed_profiles_after_clinic();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clinics','user_profiles','access_profiles','team_members','general_settings',
    'owners','properties','patients','inventory_items','procedure_templates',
    'appointments','attendances','receivables','cash_sessions','cash_flow_entries',
    'financial_records'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'access_profiles','team_members','owners','properties','patients',
    'inventory_items','procedure_templates','appointments','attendances',
    'receivables','cash_sessions','cash_flow_entries','financial_records'
  ]
  loop
    execute format('drop trigger if exists set_%I_tenant_fields on public.%I', table_name, table_name);
    execute format('create trigger set_%I_tenant_fields before insert or update on public.%I for each row execute function public.set_tenant_fields()', table_name, table_name);
  end loop;
end $$;

alter table public.clinics enable row level security;
alter table public.user_profiles enable row level security;
alter table public.access_profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.general_settings enable row level security;
alter table public.owners enable row level security;
alter table public.properties enable row level security;
alter table public.patients enable row level security;
alter table public.inventory_items enable row level security;
alter table public.procedure_templates enable row level security;
alter table public.procedure_template_items enable row level security;
alter table public.appointments enable row level security;
alter table public.attendances enable row level security;
alter table public.attendance_consumed_items enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_items enable row level security;
alter table public.exam_requests enable row level security;
alter table public.exam_request_items enable row level security;
alter table public.vaccine_applications enable row level security;
alter table public.applied_procedures enable row level security;
alter table public.return_visits enable row level security;
alter table public.receivables enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.cash_flow_entries enable row level security;
alter table public.financial_records enable row level security;
alter table public.audit_logs enable row level security;
alter table public.backup_snapshots enable row level security;

drop policy if exists "clinic members can read their clinic" on public.clinics;
create policy "clinic members can read their clinic"
  on public.clinics for select
  using (id = public.current_clinic_id());

drop policy if exists "admins can update their clinic" on public.clinics;
create policy "admins can update their clinic"
  on public.clinics for update
  using (id = public.current_clinic_id() and public.is_admin())
  with check (id = public.current_clinic_id() and public.is_admin());

drop policy if exists "members can read profiles from their clinic" on public.user_profiles;
create policy "members can read profiles from their clinic"
  on public.user_profiles for select
  using (clinic_id = public.current_clinic_id());

drop policy if exists "admins can manage profiles from their clinic" on public.user_profiles;
create policy "admins can manage profiles from their clinic"
  on public.user_profiles for all
  using (clinic_id = public.current_clinic_id() and public.is_admin())
  with check (clinic_id = public.current_clinic_id() and public.is_admin());

drop policy if exists "users can update own profile" on public.user_profiles;
create policy "users can update own profile"
  on public.user_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and clinic_id = public.current_clinic_id());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'access_profiles','team_members','general_settings','owners','properties','patients',
    'inventory_items','procedure_templates','appointments','attendances','receivables',
    'cash_sessions','cash_flow_entries','financial_records','audit_logs','backup_snapshots'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || ' select same clinic', table_name);
    execute format(
      'create policy %I on public.%I for select using (clinic_id = public.current_clinic_id())',
      table_name || ' select same clinic',
      table_name
    );
    execute format('drop policy if exists %I on public.%I', table_name || ' insert same clinic', table_name);
    execute format(
      'create policy %I on public.%I for insert with check (clinic_id = public.current_clinic_id())',
      table_name || ' insert same clinic',
      table_name
    );
    execute format('drop policy if exists %I on public.%I', table_name || ' update same clinic', table_name);
    execute format(
      'create policy %I on public.%I for update using (clinic_id = public.current_clinic_id()) with check (clinic_id = public.current_clinic_id())',
      table_name || ' update same clinic',
      table_name
    );
    execute format('drop policy if exists %I on public.%I', table_name || ' admin delete same clinic', table_name);
    execute format(
      'create policy %I on public.%I for delete using (clinic_id = public.current_clinic_id() and public.is_admin())',
      table_name || ' admin delete same clinic',
      table_name
    );
  end loop;
end $$;

drop policy if exists "procedure template items visible by clinic" on public.procedure_template_items;
create policy "procedure template items visible by clinic"
  on public.procedure_template_items for select
  using (
    exists (
      select 1 from public.procedure_templates p
      where p.id = procedure_template_id
        and p.clinic_id = public.current_clinic_id()
    )
  );

drop policy if exists "procedure template items write by clinic" on public.procedure_template_items;
create policy "procedure template items write by clinic"
  on public.procedure_template_items for all
  using (
    exists (
      select 1 from public.procedure_templates p
      where p.id = procedure_template_id
        and p.clinic_id = public.current_clinic_id()
    )
  )
  with check (
    exists (
      select 1 from public.procedure_templates p
      where p.id = procedure_template_id
        and p.clinic_id = public.current_clinic_id()
    )
  );

do $$
declare
  child_table text;
begin
  foreach child_table in array array[
    'attendance_consumed_items','prescriptions','exam_requests',
    'vaccine_applications','applied_procedures','return_visits'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', child_table || ' select by attendance clinic', child_table);
    execute format(
      'create policy %I on public.%I for select using (exists (select 1 from public.attendances a where a.id = attendance_id and a.clinic_id = public.current_clinic_id()))',
      child_table || ' select by attendance clinic',
      child_table
    );
    execute format('drop policy if exists %I on public.%I', child_table || ' write by attendance clinic', child_table);
    execute format(
      'create policy %I on public.%I for all using (exists (select 1 from public.attendances a where a.id = attendance_id and a.clinic_id = public.current_clinic_id())) with check (exists (select 1 from public.attendances a where a.id = attendance_id and a.clinic_id = public.current_clinic_id()))',
      child_table || ' write by attendance clinic',
      child_table
    );
  end loop;
end $$;

drop policy if exists "prescription items visible by clinic" on public.prescription_items;
create policy "prescription items visible by clinic"
  on public.prescription_items for select
  using (
    exists (
      select 1
      from public.prescriptions p
      join public.attendances a on a.id = p.attendance_id
      where p.id = prescription_id
        and a.clinic_id = public.current_clinic_id()
    )
  );

drop policy if exists "prescription items write by clinic" on public.prescription_items;
create policy "prescription items write by clinic"
  on public.prescription_items for all
  using (
    exists (
      select 1
      from public.prescriptions p
      join public.attendances a on a.id = p.attendance_id
      where p.id = prescription_id
        and a.clinic_id = public.current_clinic_id()
    )
  )
  with check (
    exists (
      select 1
      from public.prescriptions p
      join public.attendances a on a.id = p.attendance_id
      where p.id = prescription_id
        and a.clinic_id = public.current_clinic_id()
    )
  );

drop policy if exists "exam request items visible by clinic" on public.exam_request_items;
create policy "exam request items visible by clinic"
  on public.exam_request_items for select
  using (
    exists (
      select 1
      from public.exam_requests e
      join public.attendances a on a.id = e.attendance_id
      where e.id = exam_request_id
        and a.clinic_id = public.current_clinic_id()
    )
  );

drop policy if exists "exam request items write by clinic" on public.exam_request_items;
create policy "exam request items write by clinic"
  on public.exam_request_items for all
  using (
    exists (
      select 1
      from public.exam_requests e
      join public.attendances a on a.id = e.attendance_id
      where e.id = exam_request_id
        and a.clinic_id = public.current_clinic_id()
    )
  )
  with check (
    exists (
      select 1
      from public.exam_requests e
      join public.attendances a on a.id = e.attendance_id
      where e.id = exam_request_id
        and a.clinic_id = public.current_clinic_id()
    )
  );
