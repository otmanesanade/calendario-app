# Calendario App

Plataforma para barberos y peluqueros: cada profesional tiene su propio panel
para gestionar servicios, clientes (con notas e historial) y citas. Los clientes
reservan a través de una página pública única por profesional.

## Estructura

- `app/register` — alta de un nuevo profesional
- `app/login` — inicio de sesión
- `app/dashboard` — panel privado (agenda, servicios, clientes) con sidebar
- `app/[slug]` — página pública de reserva (ej: `tuapp.com/estudio-marco-a1b2`)
- `supabase/schema.sql` — esquema completo de base de datos con seguridad por fila (RLS)

## 1. Configurar Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y pega el contenido de `supabase/schema.sql`, luego ejecútalo
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
4. Crea un archivo `.env.local` en la raíz del proyecto (copia `.env.example`) y pega ahí esos dos valores

## 2. Probar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`

## 3. Subir este proyecto a tu repositorio de GitHub

Como este código se generó fuera de tu repositorio, tienes que subirlo tú
manualmente (por seguridad, no tengo acceso a tus credenciales de GitHub).
Descarga el zip, descomprímelo, y desde esa carpeta ejecuta:

```bash
git init
git remote add origin https://github.com/otmanesanade/calendario-app.git
git add .
git commit -m "Primera versión: registro, dashboard, servicios, clientes, reserva pública"
git branch -M main
git push -u origin main --force
```

(`--force` es necesario porque el repo está vacío pero puede tener configuración
inicial; revísalo con `git log` si no estás seguro)

## 4. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) e importa el repositorio `calendario-app`
2. En **Environment Variables**, añade las mismas dos variables de `.env.local`
3. Despliega — Vercel detecta Next.js automáticamente

## Qué falta por construir (siguientes pasos)

- Configurar horarios de trabajo reales por profesional (ahora mismo los huecos son fijos de 10:00 a 19:00)
- Notificaciones por SMS/WhatsApp al confirmar una cita
- Página para que el barbero vea y cancele citas futuras (no solo las de hoy)
- Confirmación de email al registrarse (Supabase lo activa por defecto)
- Subida de foto de perfil/logo del negocio
