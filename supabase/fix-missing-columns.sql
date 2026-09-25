-- ============================================================
-- SQL SCRIPT: حل مشكلة Supabase وتحديث الجداول والأذونات
-- انسخ هذا الكود بالكامل وضعه في:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. إضافة الأعمدة إلى جدول المواعيد (appointments) إذا لم تكن موجودة
alter table appointments add column if not exists client_name text;
alter table appointments add column if not exists client_phone text;
alter table appointments add column if not exists service_name text;
alter table appointments add column if not exists notes text;
alter table appointments add column if not exists staff_id uuid references barber_staff(id) on delete set null;
alter table appointments add column if not exists total_price numeric(10,2) default 0;
alter table appointments add column if not exists total_duration int default 30;
alter table appointments add column if not exists payment_method text default 'efectivo';
alter table appointments add column if not exists payment_status text default 'pendiente';
alter table appointments add column if not exists tip_amount numeric(10,2) default 0;

-- 2. التأكد من تمكين أذونات الزبائن بدون تسجيل دخول (Public Anonymous Insert)
-- لكي يتمكن أي زبون من حجز موعد وحفظ بياناته في قائمة الزبائن (clients)
alter table clients enable row level security;
drop policy if exists "clients_public_insert" on clients;
create policy "clients_public_insert" on clients for insert with check (true);

drop policy if exists "clients_public_select" on clients;
create policy "clients_public_select" on clients for select using (true);

drop policy if exists "clients_public_update" on clients;
create policy "clients_public_update" on clients for update using (true);

-- 3. التأكد من إذن إدخال المواعيد لجميع الزوار
alter table appointments enable row level security;
drop policy if exists "appointments_public_insert" on appointments;
create policy "appointments_public_insert" on appointments for insert with check (true);

-- تم بنجاح!
