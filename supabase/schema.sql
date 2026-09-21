-- ============================================================
-- Esquema de base de datos: plataforma multi-tenant de barberos
-- Cada barbero (fila en "barbers") gestiona sus propios servicios,
-- clientes y citas. RLS asegura que cada barbero solo ve sus datos.
-- ============================================================

-- Tabla de barberos/peluqueros/spas (uno por cuenta registrada)
create table barbers (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  slug text unique not null,          -- usado en la URL pública: /slug
  business_type text default 'barberia', -- barberia | peluqueria | spa | ambos
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

-- Equipo / Personal / Barberos del centro
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

-- Servicios ofrecidos por cada barbero
create table services (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  name text not null,
  duration_minutes int not null default 30,
  price numeric(10,2) not null default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Clientes de cada barbero (su propio CRM, aislado)
create table clients (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  full_name text not null,
  phone text,
  notes text,                          -- preferencias, alergias, etc.
  created_at timestamptz default now()
);

-- Citas: une un cliente con un servicio en una franja horaria
create table appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'confirmada',    -- confirmada | cancelada | completada
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security: cada barbero solo ve/edita sus propios datos
-- ============================================================
alter table barbers enable row level security;
alter table services enable row level security;
alter table clients enable row level security;
alter table appointments enable row level security;
alter table barber_staff enable row level security;

-- Barbers: cada uno solo puede ver y editar su propia fila
create policy "barbers_select_own" on barbers
  for select using (auth.uid() = id);
create policy "barbers_update_own" on barbers
  for update using (auth.uid() = id);
create policy "barbers_insert_own" on barbers
  for insert with check (auth.uid() = id);

-- Lectura pública del negocio por slug (para la página de reserva pública)
create policy "barbers_public_read" on barbers
  for select using (true);

-- Services: el barbero gestiona los suyos; lectura pública para reservar
create policy "services_owner_all" on services
  for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);
create policy "services_public_read" on services
  for select using (active = true);

-- Clients: solo el barbero dueño accede a su CRM
create policy "clients_owner_all" on clients
  for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

-- Appointments: el barbero ve y gestiona las suyas
create policy "appointments_owner_all" on appointments
  for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

-- Permite que un cliente público cree una cita (reserva) sin estar autenticado,
-- siempre que la cite a un barbero válido. El cliente asociado se crea aparte.
create policy "appointments_public_insert" on appointments
  for insert with check (true);
create policy "clients_public_insert" on clients
  for insert with check (true);

-- Barber Staff: el barbero gestiona su equipo; clientes pueden ver equipo para elegir profesional
create policy "staff_owner_all" on barber_staff
  for all using (auth.uid() = barber_id) with check (auth.uid() = barber_id);
create policy "staff_public_read" on barber_staff
  for select using (active = true);

-- ============================================================
-- SQL DE MIGRACIÓN PARA PROYECTOS EXISTENTES EN SUPABASE (SQL Editor):
-- Si tu tabla barbers ya existía anteriormente sin estas columnas,
-- ejecuta estas líneas en tu Supabase SQL Editor:
--
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS address text;
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS instagram text;
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS opening_time_morning text DEFAULT '10:00';
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS closing_time_morning text DEFAULT '14:00';
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS has_siesta boolean DEFAULT true;
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS opening_time_afternoon text DEFAULT '16:30';
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS closing_time_afternoon text DEFAULT '20:30';
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS work_days jsonb DEFAULT '[1,2,3,4,5,6]'::jsonb;
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS slot_interval int DEFAULT 30;
-- ALTER TABLE barbers ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';
-- ============================================================
