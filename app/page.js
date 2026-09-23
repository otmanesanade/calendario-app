"use client";

import { useState } from "react";
import Link from "next/link";
import GlowfyLogo from "../components/GlowfyLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Calendar,
  MessageCircle,
  Clock,
  Euro,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Heart,
  Star,
  Check,
  Building2,
  ArrowRight,
  ChevronDown,
  CheckCircle,
  MapPin,
  CalendarCheck,
  AlertCircle,
  XCircle,
  ThumbsUp,
  Wallet,
  Store,
  Layers,
  Award
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeSector, setActiveSector] = useState("barber");
  const [selectedDemoService, setSelectedDemoService] = useState(0);
  const [selectedDemoStaff, setSelectedDemoStaff] = useState("Marco");
  const [selectedDemoSlot, setSelectedDemoSlot] = useState("17:30");
  const [demoConfirmed, setDemoConfirmed] = useState(false);

  // Sectores especializados
  const sectors = [
    {
      id: "barber",
      name: "Barberías & Salones",
      icon: Scissors,
      tagline: "Control de sillones, degradados y arreglos de barba",
      features: [
        "Reparto equitativo de citas por barbero y cálculo de comisiones",
        "Tiempos exactos para fades, arreglos de barba y afeitados a navaja",
        "Caja diaria con desglose de Bizum, efectivo y tarjeta TPV"
      ]
    },
    {
      id: "peluqueria",
      name: "Peluquerías & Estilistas",
      icon: Sparkles,
      tagline: "Gestión de coloración, mechas balayage y cortes",
      features: [
        "Tiempos de exposición y lavado integrados en cada servicio",
        "Selección de estilista preferido por el cliente en 1 clic",
        "Recordatorios de mantenimiento y retoque de color por WhatsApp"
      ]
    },
    {
      id: "estetica",
      name: "Estética & Belleza",
      icon: Heart,
      tagline: "Asignación de cabinas, aparatología y tratamientos",
      features: [
        "Bloqueo automático de cabina para evitar solapamiento de máquinas",
        "Ficha técnica con historial de sesiones previas y consentimientos",
        "Campañas de reactivación de clientas a los 30 días"
      ]
    },
    {
      id: "unas",
      name: "Nail Bars & Uñas",
      icon: Star,
      tagline: "Planificación de mesas de manicura y pedicura",
      features: [
        "Control de tiempos para manicura rusa, gel, acrílico y nail art",
        "Gestión de suplementos y decoraciones adicionales",
        "Agenda ágil para citas rápidas de relleno y mantenimiento"
      ]
    },
    {
      id: "spa",
      name: "Spas & Masajes",
      icon: Award,
      tagline: "Reserva de terapeutas, cabinas dobles y circuitos",
      features: [
        "Tiempo de cortesía y ventilación de cabina entre sesiones",
        "Venta y canje ágil de bonos regalo personalizados",
        "Confirmación relajante directa al móvil del cliente"
      ]
    }
  ];

  const demoServices = [
    { name: "Corte Degradado + Arreglo de Barba", time: "45 min", price: "24,00 €", category: "Barbería" },
    { name: "Mechas Balayage + Tratamiento Glow", time: "90 min", price: "75,00 €", category: "Peluquería" },
    { name: "Limpieza Facial Profunda + Peeling", time: "50 min", price: "48,00 €", category: "Estética" },
    { name: "Manicura Semipermanente Rusa", time: "45 min", price: "28,00 €", category: "Uñas" }
  ];

  const demoStaffMembers = ["Marco", "Elena", "Lucas"];
  const demoSlots = ["10:30", "11:30", "12:30", "17:00", "17:30", "19:00"];

  const faqs = [
    {
      q: "¿Cuáles son las tarifas y cómo funciona la suscripción?",
      a: "Glowfy tiene un precio único y transparente: 29 € al mes con IVA ya incluido, sin ningún compromiso de permanencia. Si optas por el pago anual, son 290 € al año con IVA incluido, lo que equivale a 2 meses completamente gratis (un ahorro directo de 58 € al año). No cobramos ningún céntimo de comisión por cita reservada."
    },
    {
      q: "¿Mis clientes tienen que descargar alguna aplicación para reservar?",
      a: "No, en absoluto. Tus clientes reservan directamente a través de tu enlace web propio (ej: glowfy.es/tu-centro) desde cualquier teléfono, tablet u ordenador en solo 30 segundos, sin descargas obligatorias ni recordar contraseñas."
    },
    {
      q: "¿Cómo funciona el horario partido con siesta española?",
      a: "Glowfy está adaptado al ritmo de España: puedes configurar turno de mañana (ej. 10:00 - 14:00) y de tarde (ej. 16:30 - 20:30). El sistema bloquea de forma estricta las horas de descanso intermedias para que nunca te caiga una cita fuera de tu horario laboral."
    },
    {
      q: "¿Se envían recordatorios por WhatsApp para evitar ausencias?",
      a: "Sí. Cada reserva genera una confirmación inmediata y mensajes de recordatorio listos para enviar por WhatsApp con un solo clic, eliminando los 'no-shows' (clientes que olvidan su cita)."
    },
    {
      q: "¿Puedo cobrar con Bizum, efectivo o datáfono en mi local?",
      a: "Por supuesto. Dispones de un arqueo de Caja diaria con desglose exacto por Efectivo, Tarjeta y Bizum. Al finalizar la jornada puedes cerrar la caja con un clic y descargar el balance contable."
    },
    {
      q: "¿Puedo tener varios empleados y calcular sus comisiones?",
      a: "Totalmente. Puedes invitar a todo tu equipo (barberos, esteticistas, masajistas) asignando sus propios horarios, días de descanso y porcentajes de comisión transparentes por servicio realizado."
    },
    {
      q: "¿Cómo ayuda Glowfy a conseguir más reseñas en Google Maps?",
      a: "Al completar un servicio en el panel, el sistema te permite enviar una felicitación y enlace directo de 5 estrellas al WhatsApp del cliente con un clic, multiplicando las valoraciones positivas de tu ficha de Google."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden font-sans">
      
      {/* 1. TOP BAR CONTRACT */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Zone 1: Brand Wordmark */}
          <Link href="/" className="flex items-center gap-2.5">
            <GlowfyLogo size={28} />
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Glowfy España
            </span>
          </Link>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#problema" className="hover:text-emerald-600 transition-colors">Problema</a>
            <a href="#pasos" className="hover:text-emerald-600 transition-colors">Cómo Funciona</a>
            <a href="#whatsapp" className="hover:text-emerald-600 transition-colors">WhatsApp</a>
            <a href="#demo" className="hover:text-emerald-600 transition-colors">Simulador</a>
            <a href="#sectores" className="hover:text-emerald-600 transition-colors">Sectores</a>
            <a href="#gestion" className="hover:text-emerald-600 transition-colors">Gestión</a>
            <a href="#precios" className="hover:text-emerald-600 transition-colors">Precios</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Diseñado específicamente para salones y barberías en España</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto text-balance">
          El software de reservas y gestión que llena tu salón en piloto automático
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Despídete de parar el trabajo para contestar llamadas. Tus clientes reservan online 24/7 sin comisiones, reciben recordatorios por WhatsApp y tú controlas tu caja diaria y Bizum con total tranquilidad.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Crear mi centro gratis (30 días)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300/80 rounded-xl font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Probar simulador de cliente</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Hero Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            0 € de comisiones por reserva
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Sin permanencia ni contratos
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Soporte en español por WhatsApp
          </span>
        </div>

        {/* 2. BOOKING DEMO / SCREENSHOT PREVIEW */}
        <div className="mt-14 sm:mt-18 relative rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl shadow-slate-300/40">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-slate-500 hidden sm:inline">glowfy.es/estudio-marco</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </span>
              <Link
                href="/estudio-marco"
                className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 text-[11px]"
              >
                <span>Abrir web de prueba</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Realistic Split Screenshot / Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 bg-slate-50/70 rounded-2xl mt-3 text-left">
            {/* Left: Client Booking UI */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black flex items-center justify-center text-lg">
                  EM
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Estudio Marco & Barber</h4>
                  <p className="text-xs text-slate-500">Calle Gran Vía 42, Madrid · ⭐ 4.9 (184 reseñas)</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-50/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Corte Degradado + Barba</span>
                    <span className="text-slate-500">45 min · con Marco</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 text-sm">24,00 €</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Arreglo de Barba Tradicional</span>
                    <span className="text-slate-400">25 min · afeitado con toalla caliente</span>
                  </div>
                  <span className="font-bold text-slate-800">14,00 €</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Próximo hueco libre:</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                  Hoy a las 17:30
                </span>
              </div>
            </div>

            {/* Right: Salon Admin Daily Agenda Preview */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Panel de Agenda Diaria
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Horario: 10:00 - 14:00 y 16:30 - 20:30
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-900 block">11:00 — Carlos Ruiz</span>
                      <span className="text-indigo-600 text-[11px]">Corte + Barba · Barbero: Marco</span>
                    </div>
                    <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                      Cobrado (Bizum)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                    <span className="text-amber-800 font-medium italic text-[11px]">
                      ☕ 14:00 - 16:30 · Pausa de Siesta (Cerrado para reservas)
                    </span>
                    <span className="text-amber-700 text-[10px] font-bold">Protegido</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">17:30 — David Morales</span>
                      <span className="text-slate-500 text-[11px]">Corte Clásico · Barbero: Lucas</span>
                    </div>
                    <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Avisado WhatsApp
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Total Caja Hoy: <strong className="text-slate-900">380,00 €</strong></span>
                <span className="text-emerald-600 font-semibold">14 citas completadas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section id="problema" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 block mb-2">
              El problema de la gestión tradicional
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ¿Cuánto tiempo y dinero pierdes cada día gestionando citas a mano?
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Gestionar tu salón con libreta de papel, llamadas constantes y mensajes sueltos de WhatsApp te roba horas de trabajo y deja dinero sobre la mesa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Problem 1 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Parar el trabajo para contestar llamadas
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Estás cortando el pelo o aplicando un tinte y suena el teléfono. Dejar al cliente esperando genera mala imagen y te hace perder el ritmo de la jornada.
                </p>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Ausencias y clientes que olvidan su cita
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  El típico cliente que nunca aparece y te deja un sillón vacío durante 45 minutos. En un mes, los despistes te cuestan entre 200 € y 600 € directos.
                </p>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Euro className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Comisiones abusivas de marketplaces
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Otras plataformas te cobran porcentajes por cada reserva y además promocionan a tu competencia justo al lado de tu perfil con tus propios clientes.
                </p>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Descontrol al cuadrar la caja con Bizum
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Llega el final del día y no sabes qué entró en efectivo, qué se pagó por Bizum al móvil del dueño o qué comisión le corresponde a cada empleado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 3 STEPS SECTION */}
      <section id="pasos" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
            Simplicidad absoluta
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cómo funciona en 3 sencillos pasos
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Estarás listo para recibir tus primeras reservas online en menos de lo que dura un café.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <span className="text-4xl font-black text-emerald-600/30 block mb-3">01</span>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Crea tu salón en 2 minutos
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Introduce el nombre de tu centro, tus servicios con su duración y precio, y asigna los horarios y barberos o esteticistas de tu equipo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <span className="text-4xl font-black text-emerald-600/30 block mb-3">02</span>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Comparte tu enlace propio
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pega tu enlace personalizado <code className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">glowfy.es/tu-centro</code> en tu perfil de Instagram, en Google Maps y en tu WhatsApp.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <span className="text-4xl font-black text-emerald-600/30 block mb-3">03</span>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Recibe citas 24/7 sin comisiones
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tus clientes eligen hora libre en 30 segundos. Ambos recibís la confirmación por WhatsApp y la cita queda apuntada en tu agenda al momento.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP SPOTLIGHT */}
      <section id="whatsapp" className="py-20 bg-emerald-900 text-white px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700/80 mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>La herramienta favorita en España</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              El poder de WhatsApp: elimina las ausencias y fideliza a tus clientes
            </h2>

            <p className="mt-4 text-emerald-100 text-base leading-relaxed">
              En España todo el mundo usa WhatsApp. Glowfy conecta tu agenda directamente con WhatsApp para que no tengas que pagar costosos SMS ni obligar a nadie a instalar apps raras.
            </p>

            <div className="mt-6 space-y-3.5 text-sm text-emerald-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Confirmación automática:</strong> El cliente recibe un mensaje profesional con el día, la hora y la dirección del local al reservar.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Recordatorio a 1 clic:</strong> Envía recordatorios personalizados antes de la cita para garantizar que nadie olvide su turno.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Reactivación de inactivos:</strong> Detecta clientes que llevan más de 30 días sin visitarte y envíales un saludo con enlace para volver.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Reseñas de Google Maps:</strong> Pide 5 estrellas al terminar el corte o tratamiento con un simple toque al WhatsApp del cliente.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-emerald-950/70 p-6 rounded-3xl border border-emerald-700/60 shadow-2xl backdrop-blur-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-emerald-800/80">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                WA
              </div>
              <div>
                <span className="font-bold text-sm block">WhatsApp Business Sim</span>
                <span className="text-xs text-emerald-300">Mensaje automático</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-emerald-800/50 border border-emerald-700/50 text-xs leading-relaxed space-y-2">
              <p className="font-bold text-emerald-200">¡Hola David! ✂️</p>
              <p>
                Tu cita en <strong>Estudio Marco</strong> está confirmada para hoy a las <strong>17:30</strong> (Corte Degradado + Barba con Marco).
              </p>
              <p className="text-emerald-300 text-[11px] pt-1">
                📍 C/ Gran Vía 42, Madrid · ¡Te esperamos puntual!
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-300">
              <span>Tasa de lectura: <strong>98%</strong></span>
              <span>Sin coste de SMS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOOKING DEMO (INTERACTIVE SIMULATOR) */}
      <section id="demo" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
            Pruébalo tú mismo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simula la experiencia de reserva de tus clientes
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Mira lo fácil y rápido que es reservar un servicio en solo 3 clics desde cualquier móvil.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Interactive Picker */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                1. Selecciona un servicio de prueba
              </h4>
              <div className="space-y-2 mb-6">
                {demoServices.map((srv, idx) => (
                  <button
                    key={srv.name}
                    onClick={() => {
                      setSelectedDemoService(idx);
                      setDemoConfirmed(false);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                      selectedDemoService === idx
                        ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block">{srv.name}</span>
                      <span className="text-[11px] text-slate-500">{srv.time} · {srv.category}</span>
                    </div>
                    <span className="font-extrabold text-emerald-700 text-xs sm:text-sm">{srv.price}</span>
                  </button>
                ))}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                2. Elige profesional
              </h4>
              <div className="flex gap-2 mb-6">
                {demoStaffMembers.map((staff) => (
                  <button
                    key={staff}
                    onClick={() => {
                      setSelectedDemoStaff(staff);
                      setDemoConfirmed(false);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      selectedDemoStaff === staff
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {staff}
                  </button>
                ))}
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                3. Elige hora disponible
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {demoSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedDemoSlot(slot);
                      setDemoConfirmed(false);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      selectedDemoSlot === slot
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Mobile Confirmation Preview */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Resumen del Cliente
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Paso final
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Servicio:</span>
                    <span className="font-bold text-slate-900">{demoServices[selectedDemoService].name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Profesional:</span>
                    <span className="font-bold text-slate-900">{selectedDemoStaff}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Hora seleccionada:</span>
                    <span className="font-bold text-emerald-700">Hoy a las {selectedDemoSlot}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Total a pagar en local:</span>
                    <span className="font-black text-slate-900 text-sm">{demoServices[selectedDemoService].price}</span>
                  </div>
                </div>

                {demoConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-5 p-4 rounded-xl bg-emerald-500 text-white text-xs space-y-1 shadow-md"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Cita confirmada con éxito!</span>
                    </div>
                    <p className="text-emerald-100 text-[11px]">
                      Se ha generado la reserva y el mensaje automático para WhatsApp.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => setDemoConfirmed(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Reserva de Prueba</span>
                </button>
                <Link
                  href="/estudio-marco"
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <span>Ver página completa de reservas</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CORE FEATURES (SECTORES Y HORARIOS DE ESPAÑA) */}
      <section id="sectores" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
              Especialización por sector
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Adaptado a la medida de tu tipo de salón
            </h2>
            <p className="text-base text-slate-600 mt-2">
              No es lo mismo un corte degradado en 30 minutos que un tratamiento facial de cabina o unas mechas balayage.
            </p>
          </div>

          {/* Sector Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-2xl mx-auto mb-10">
            {sectors.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSector(sec.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeSector === sec.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{sec.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Sector Showcase */}
          {(() => {
            const current = sectors.find((s) => s.id === activeSector) || sectors[0];
            const Icon = current.icon;
            return (
              <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50/60 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{current.name}</h3>
                    <p className="text-xs text-slate-500">{current.tagline}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {current.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 8. BUSINESS MANAGEMENT SECTION */}
      <section id="gestion" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
            Gestión Integral
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Todo el control de tu negocio en un solo panel
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Mucho más que una agenda: control de caja, comisiones de tu equipo y fidelización de clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Caja & Bizum */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Arqueo de Caja y Pagos con Bizum
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Cada cobro queda registrado por método de pago: Efectivo, Tarjeta TPV o Bizum. Al cerrar el turno, obtienes el balance exacto sin descuadres ni billetes perdidos.
            </p>
            <div className="flex gap-2 text-[11px] font-semibold text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded-md">Efectivo</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Bizum</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Tarjeta TPV</span>
            </div>
          </div>

          {/* Card 2: Equipo & Comisiones */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Gestión de Equipo y Comisiones
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Asigna horarios y turnos independientes para cada empleado. Calcula automáticamente las comisiones por servicio realizado con total transparencia para el equipo.
            </p>
            <div className="flex gap-2 text-[11px] font-semibold text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded-md">Multi-empleado</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Comisiones %</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Días libres</span>
            </div>
          </div>

          {/* Card 3: Base de Datos de Clientes */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Historial y Reactivación de Clientes
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Guarda teléfonos, notas técnicas (número de tinte, corte favorito) y gasto acumulado. Vuelve a atraer a clientes que no vienen desde hace más de un mes.
            </p>
            <div className="flex gap-2 text-[11px] font-semibold text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded-md">Ficha de cliente</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Notas técnicas</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Reactivación WhatsApp</span>
            </div>
          </div>

          {/* Card 4: Reseñas de Google */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Multiplica tus Reseñas en Google Maps
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Consigue que tu salón aparezca en los primeros puestos de tu barrio. Tras finalizar el servicio, envía un mensaje automático al cliente pidiéndole 5 estrellas.
            </p>
            <div className="flex gap-2 text-[11px] font-semibold text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded-md">Google Reviews</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">Posicionamiento local</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md">+5 Estrellas</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SOCIAL PROOF (TESTIMONIALS & TRUST METRICS) */}
      <section id="testimonios" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
              Opiniones Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              La confianza de profesionales en toda España
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Descubre cómo salones de Madrid, Barcelona, Valencia y Sevilla llenan sus agendas con Glowfy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Desde que pusimos el enlace en la biografía de Instagram, los domingos ya no me paso la tarde contestando WhatsApps. El lunes por la mañana tengo toda la semana llena de citas confirmadas.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs block">Marco Antonio R.</span>
                <span className="text-[11px] text-slate-500">Estudio Marco · Barbería en Madrid</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;El cálculo de comisiones de mis tres barberos y el desglose de lo que entra por Bizum nos ahorra horas cada noche al cerrar caja. Además, 0 comisiones por cita es imbatible.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs block">Carlos Vidal</span>
                <span className="text-[11px] text-slate-500">Barbería El Barrio · Barcelona</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;Los recordatorios de WhatsApp redujeron los olvidos de clientas prácticamente a cero. Las cabinas están siempre ocupadas y las clientas están encantadas con lo fácil que es reservar.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs block">Carmen Serrano</span>
                <span className="text-[11px] text-slate-500">Estética & Nails Carmen · Valencia</span>
              </div>
            </div>
          </div>

          {/* Social Proof Metric Highlights */}
          <div className="mt-12 pt-10 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
            <div>
              <span className="text-3xl font-black text-emerald-600 block">24 / 7</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Citas automáticas día y noche</span>
            </div>
            <div>
              <span className="text-3xl font-black text-cyan-600 block">0 €</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Comisión por cita reservada</span>
            </div>
            <div>
              <span className="text-3xl font-black text-amber-600 block">100%</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Tus clientes y tus datos propios</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRICING SECTION (29€/mes o 290€/año IVA Inc.) */}
      <section id="precios" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
            Tarifas Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Un único plan con todo incluido
          </h2>
          <p className="text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Sin costes ocultos, sin comisiones por cita y con el <strong>IVA ya incluido</strong> en todas las tarifas.
          </p>

          {/* Toggle Mensual / Anual */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/70 shadow-inner">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mensual (29 € / mes)
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Anual (290 € / año)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-white text-[10px] font-extrabold tracking-wide uppercase border border-white/20">
                2 Meses Gratis 🎁
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-white p-7 sm:p-10 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plan Todo Incluido</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Glowfy Pro para tu Salón
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Todo lo necesario para gestionar tu equipo, tus citas online y tu caja diaria en España sin sorpresas.
              </p>
            </div>

            <div className="text-left lg:text-right bg-slate-50 lg:bg-transparent p-5 lg:p-0 rounded-2xl border lg:border-0 border-slate-200">
              <div className="flex items-baseline lg:justify-end gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {billingCycle === "monthly" ? "29 €" : "290 €"}
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-500">
                  {billingCycle === "monthly" ? "/ mes" : "/ año"}
                </span>
              </div>
              <div className="mt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-xs font-bold">
                  IVA 21% Incluido
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {billingCycle === "monthly"
                  ? "Pago mensual flexible · Cancela cuando quieras sin penalización"
                  : "Equivale a 24,16 €/mes · Ahorras 58 € al año (2 meses de regalo)"}
              </p>
            </div>
          </div>

          <div className="pt-8">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-5">
              Todo incluido sin comisiones adicionales:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>0 € de comisiones</strong> por reserva realizada</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Citas y clientes ilimitados</strong> las 24 horas del día</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Agenda inteligente</strong> con horario partido y siesta</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Gestión de equipo</strong> con comisiones por profesional</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>WhatsApp automático:</strong> avisos y recordatorios de cita</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Google Reviews:</strong> solicitud automática de reseñas</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Caja diaria</strong> con desglose por Bizum, Efectivo y Tarjeta</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Web propia de reservas</strong> (glowfy.es/tu-centro)</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>App PWA para iPad/Tablet</strong>, iPhone y Android</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Prueba de 30 días gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Sin permanencia
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Factura española con IVA
                </span>
              </div>

              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Probar 30 Días Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section id="faq" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-2">
              Resolvemos tus dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Todo lo que necesitas saber antes de empezar a usar Glowfy en tu local.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
              Empieza a recibir citas en tu negocio hoy mismo
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mb-8 leading-relaxed">
              Configura tus servicios, horarios y profesionales en menos de 2 minutos. 30 días de prueba gratuita sin tarjeta y sin permanencia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto py-4 px-8 bg-white hover:bg-slate-50 text-slate-950 rounded-2xl font-black text-sm shadow-xl transition block"
              >
                Crear mi centro gratis ahora
              </Link>
              <Link
                href="/estudio-marco"
                className="w-full sm:w-auto py-4 px-6 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-2xl font-bold text-sm transition"
              >
                Ver ejemplo de cliente
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-8 border-t border-slate-200 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GlowfyLogo size={28} />
            <div>
              <span className="font-extrabold text-sm text-slate-900 block">Glowfy España</span>
              <span className="text-[11px] text-slate-400">Software SaaS de reservas y gestión para Barberías, Salones de Belleza y Spas.</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <Link href="/login" className="hover:text-emerald-600 transition">Panel de gestión</Link>
            <Link href="/register" className="hover:text-emerald-600 transition">Registro de centros</Link>
            <Link href="/estudio-marco" className="hover:text-emerald-600 transition">Demo online</Link>
          </div>

          <p className="text-slate-400 text-[11px]">
            &copy; {new Date().getFullYear()} Glowfy España. Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </main>
  );
}
