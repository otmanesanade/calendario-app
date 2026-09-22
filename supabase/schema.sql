-- ============================================================
-- Esquema completo de base de datos para Glowfy en Supabase
-- Puedes copiar y pegar todo este script directamente en
-- Supabase -> SQL Editor y pulsar "Run".
-- ============================================================

-- 1. Tabla de barberos / peluqueros / spas
create table if not exists barbers (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  slug text unique not null,
  business_type text default 'barberia',
  phone text,
  city text,
  address text,
  instagram text,
  opening_time_morning text default '10:00',
  closing_time_morning text default '14:00',
  has_siesta boolean default true,
  opening_time_afternoon text default '16:30',
  closing_time_afternoon text default '20:30',
  work_days jsonb default '[1,2,3,4,5,6]'::jsonb,
  slot_interval int default 30,
  currency text default 'EUR',
  created_at timestamptz default now()
);

-- Si la tabla ya existía anteriormente con menos columnas, añadirlas:
alter table barbers add column if not exists address text;
alter table barbers add column if not exists instagram text;
alter table barbers add column if not exists opening_time_morning text default '10:00';
alter table barbers add column if not exists closing_time_morning text default '14:00';
alter table barbers add column if not exists has_siesta boolean default true;
alter table barbers add column if not exists opening_time_afternoon text default '16:30';
alter table barbers add column if not exists closing_time_afternoon text default '20:30';
alter table barbers add column if not exists work_days jsonb default '[1,2,3,4,5,6]'::jsonb;
alter table barbers add column if not exists slot_interval int default 30;
alter table barbers add column if not exists currency text default 'EUR';

-- 2. Equipo / Personal / Barberos del centro
create table if not exists barber_staff (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  name text not null,
  role text default 'Barbero',
  avatar_color text default '#4f46e5',
  phone text,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. Servicios ofrecidos por cada negocio
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  name text not null,
  duration_minutes int not null default 30,
  price numeric(10,2) not null default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- 4. Clientes de cada negocio (CRM)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  full_name text not null,
  phone text,
  notes text,
  created_at timestamptz default now()
);

-- 5. Citas / Reservas
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  staff_id uuid references barber_staff(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'confirmada',
  total_price numeric(10,2) default 0,
  total_duration int default 30,
  payment_method text default 'efectivo',
  payment_status text default 'pendiente',
  tip_amount numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Columnas añadidas para appointments si ya existía:
alter table appointments add column if not exists staff_id uuid references barber_staff(id) on delete set null;
alter table appointments add column if not exists total_price numeric(10,2) default 0;
alter table appointments add column if not exists total_duration int default 30;
alter table appointments add column if not exists payment_method text default 'efectivo';
alter table appointments add column if not exists payment_status text default 'pendiente';
alter table appointments add column if not exists tip_amount numeric(10,2) default 0;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table barbers enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table barber_staff enable row level security;

-- Barbers
drop policy if exists "barbers_select_own" on barbers;
create policy "barbers_select_own" on barbers for select using (auth.uid() = id);

drop policy if exists "barbers_update_own" on barbers;
create policy "barbers_update_own" on barbers for update using (auth.uid() = id);

drop policy if exists "barbers_insert_own" on barbers;
create policy "barbers_insert_own" on barbers for insert with check (auth.uid() = id);

drop policy if exists "barbers_public_read" on barbers;
create policy "barbers_public_read" on barbers for select using (true);

-- Services
drop policy if exists "services_owner_all" on services;
create policy "services_owner_all" on services for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

drop policy if exists "services_public_read" on services;
create policy "services_public_read" on services for select using (active = true);

-- Clients
drop policy if exists "clients_owner_all" on clients;
create policy "clients_owner_all" on clients for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

drop policy if exists "clients_public_insert" on clients;
create policy "clients_public_insert" on clients for insert with check (true);

drop policy if exists "clients_public_select" on clients;
create policy "clients_public_select" on clients for select using (true);

drop policy if exists "clients_public_update" on clients;
create policy "clients_public_update" on clients for update using (true);

-- Appointments
drop policy if exists "appointments_owner_all" on appointments;
create policy "appointments_owner_all" on appointments for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

drop policy if exists "appointments_public_insert" on appointments;
create policy "appointments_public_insert" on appointments for insert with check (true);

-- Barber Staff
drop policy if exists "staff_owner_all" on barber_staff;
create policy "staff_owner_all" on barber_staff for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

drop policy if exists "staff_public_read" on barber_staff;
create policy "staff_public_read" on barber_staff for select using (active = true);
