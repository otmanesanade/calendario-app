"use client";

import { useState } from "react";
import Link from "next/link";
import GlowfyLogo from "../components/GlowfyLogo";
import { motion, AnimatePresence } from "motion/react";
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
  TrendingUp,
  Heart,
  Star,
  Zap,
  HelpCircle,
  Check,
  Store,
  Layers,
  Award,
  BellRing,
  Wallet,
  Building2,
  ArrowRight,
  ChevronDown,
  CheckCircle,
  MapPin,
  CalendarCheck
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeSector, setActiveSector] = useState("barber");
  const [selectedDemoService, setSelectedDemoService] = useState(0);
  const [selectedDemoSlot, setSelectedDemoSlot] = useState("17:30");
  const [demoConfirmed, setDemoConfirmed] = useState(false);

  const sectors = [
    {
      id: "barber",
      name: "Barberías & Salones",
      icon: Scissors,
      tagline: "Control de sillones, barberos y servicios masculinos",
      badge: "Más popular en barberías",
      accent: "from-blue-600 to-indigo-600",
      pillColor: "bg-blue-50 text-blue-700 border-blue-200",
      features: [
        "Reparto equitativo de citas por barbero con comisión calculada",
        "Tiempos exactos para degradados, barbas y arreglos rápidos",
        "Control de caja diaria (Efectivo, Datáfono y pagos con Bizum)"
      ]
    },
    {
      id: "estetica",
      name: "Clínicas de Estética",
      icon: Sparkles,
      tagline: "Gestión avanzada de cabinas, aparatología y tratamientos",
      badge: "Especial belleza",
      accent: "from-rose-500 to-pink-600",
      pillColor: "bg-rose-50 text-rose-700 border-rose-200",
      features: [
        "Asignación automática de cabinas sin solapamiento de máquinas",
        "Ficha e historial detallado de sesiones anteriores de clienta",
        "Campañas de reactivación por WhatsApp a los 30 días"
      ]
    },
    {
      id: "spa",
      name: "Spas & Bienestar",
      icon: Heart,
      tagline: "Planificación de masajes, circuitos y terapeutas",
      badge: "Relax & Salud",
      accent: "from-emerald-600 to-teal-600",
      pillColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      features: [
        "Tiempo de cortesía y ventilación de cabina entre masajes",
        "Venta y canje ágil de bonos y tarjetas de regalo",
        "Confirmaciones relajantes inmediatas directo a WhatsApp"
      ]
    }
  ];

  const demoServices = [
    { name: "Corte Degradado + Arreglo de Barba", time: "45 min", price: "24,00 €", category: "Barbería" },
    { name: "Limpieza Facial Glow + Hidratación", time: "50 min", price: "48,00 €", category: "Estética" },
    { name: "Masaje Descontracturante Espalda", time: "40 min", price: "38,00 €", category: "Bienestar" }
  ];

  const demoSlots = ["11:00", "12:30", "16:30", "17:30", "19:00"];

  const faqs = [
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
      a: "Sí. Cada reserva genera una confirmación inmediata y mensajes de recordatorio listos para enviar por WhatsApp con un solo clic, logrando reducir los 'no-shows' (clientes que olvidan su cita) hasta un 75%."
    },
    {
      q: "¿Puedo cobrar con Bizum, efectivo o datáfono en mi local?",
      a: "Por supuesto. Dispones de un arqueo de Caja diaria con desglose exacto por Efectivo, Tarjeta y Bizum. Al finalizar la jornada puedes cerrar la caja con un clic y descargar el balance contable."
    },
    {
      q: "¿Puedo tener varios empleados y calcular sus comisiones?",
      a: "Totalmente. Puedes invitar a todo tu equipo (barberos, esteticistas, masajistas) asignando sus propios horarios, días de descanso y porcentajes de comisión transparentes por servicio realizado."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Fresh Emerald & Mint Gradient) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-xs">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
          ESPAÑA 🇪🇸
        </span>
        <span>
          Agenda adaptada a tu ritmo: horario partido con siesta, soporte Bizum y avisos automáticos por WhatsApp.
        </span>
        <Link href="/register" className="underline font-bold hover:text-emerald-100 transition hidden sm:inline ml-1">
          Probar gratis &rarr;
        </Link>
      </div>

      {/* 2. NAVBAR (Crisp Clean White & Soft Blur) */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <GlowfyLogo size={40} />
            <div className="leading-tight">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:opacity-90 transition">
                Glowfy
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider block uppercase">
                Barbería · Estética · Spas
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#soluciones" className="hover:text-emerald-600 transition">Sectores</a>
            <a href="#demo" className="hover:text-emerald-600 transition">Simulador en Vivo</a>
            <a href="#funcionalidades" className="hover:text-emerald-600 transition">Funcionalidades</a>
            <a href="#faq" className="hover:text-emerald-600 transition">Preguntas</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl transition"
            >
              Iniciar sesión
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="py-2.5 px-4 sm:px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <span>Crear mi centro</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Luminous, Welcoming, High Contrast, Vibrant) */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Soft emerald & sky ambient lights in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-cyan-100/30 blur-[130px] pointer-events-none -z-10 rounded-full" />

        <div className="text-center max-w-4xl mx-auto">

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.12]"
          >
            Llena tu agenda de citas <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              sin pasar el día al teléfono
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Tus clientes eligen servicio, profesional favorito y reservan en 30 segundos desde su móvil. Con turnos partidos para la siesta, cobros con Bizum y recordatorios automáticos por WhatsApp.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-4 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-600/25 transition group"
              >
                <span>Crear mi centro en 2 minutos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href="/estudio-marco"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 bg-white border border-slate-300 hover:border-emerald-400 text-slate-800 hover:text-emerald-700 rounded-2xl font-bold text-base shadow-xs hover:shadow-md transition"
              >
                <span>Ver página de reserva real</span>
                <ExternalLink className="w-4 h-4 text-emerald-600" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Proof Metric Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-5 text-center max-w-3xl mx-auto"
          >
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">24 / 7</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Citas automáticas</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">-75%</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Menos ausencias con WhatsApp</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">0 €</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Comisión por cita</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">100%</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Tus clientes y tus datos</div>
            </div>
          </motion.div>
        </div>

        {/* 4. INTERACTIVE LIVE BOOKING SIMULATOR (Crisp Clean & Colorful) */}
        <div id="demo" className="mt-16 sm:mt-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-emerald-200/90 bg-white shadow-xl shadow-emerald-500/5 p-5 sm:p-7 overflow-hidden"
          >
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400 ml-2 font-mono hidden sm:inline">glowfy.es/estudio-marco</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Simulador en Vivo: Haz clic y pruébalo
                </span>
                <Link
                  href="/estudio-marco"
                  className="text-xs text-emerald-700 font-bold hover:underline hidden sm:inline"
                >
                  Abrir demo &rarr;
                </Link>
              </div>
            </div>

            {/* Interactive Grid Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left explanation */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  La experiencia de tu cliente
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Prueba a seleccionar un servicio y una hora libre
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Así de claro y cómodo es para tus clientes reservar desde su móvil o Instagram sin tener que esperar a que respondas mensajes.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Precios, tiempos exactos y selección clara de servicios</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Horas disponibles en tiempo real respetando la siesta</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Confirmación instantánea enviada directo a WhatsApp</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    href="/estudio-marco"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    <span>Abrir centro de prueba completo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>

              {/* Right interactive phone/tablet frame */}
              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/90 shadow-sm relative">
                {/* Store Header in Mockup */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      EM
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        Estudio Marco · Barber & Care
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Madrid, Centro · Hoy 10:00 - 14:00 | 16:30 - 20:30</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                      4.9 ★★★★★
                    </span>
                  </div>
                </div>

                {/* Service Selection simulator */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    1. Selecciona un servicio:
                  </div>
                  {demoServices.map((srv, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedDemoService(idx);
                        setDemoConfirmed(false);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                        selectedDemoService === idx
                          ? "bg-emerald-50/80 border-emerald-500 shadow-xs text-slate-900"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{srv.name}</span>
                          {selectedDemoService === idx && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px]">{srv.time} · {srv.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-700 text-sm block">{srv.price}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Seleccionar</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Slot Selection simulator */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    2. Selecciona una hora para hoy:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {demoSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setSelectedDemoSlot(slot);
                          setDemoConfirmed(false);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          selectedDemoSlot === slot
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button in simulator */}
                <div className="pt-2">
                  <AnimatePresence mode="wait">
                    {demoConfirmed ? (
                      <motion.div
                        key="confirmed"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <div>
                            <span className="font-bold block">¡Cita simulada confirmada!</span>
                            <span className="text-emerald-700 text-[11px]">
                              {demoServices[selectedDemoService].name} hoy a las {selectedDemoSlot}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setDemoConfirmed(false)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-emerald-800 text-[11px] font-bold border border-emerald-200"
                        >
                          Reiniciar
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="book-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDemoConfirmed(true)}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                      >
                        <CalendarCheck className="w-4 h-4 text-white" />
                        <span>Simular confirmación ({demoServices[selectedDemoService].price} · {selectedDemoSlot})</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. SECTORES ESPECIALIZADOS WITH ANIMATED TABS */}
      <section id="soluciones" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2 block">
              Especialización
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Adaptado minuciosamente a tu tipo de centro
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Cada negocio tiene sus propias reglas: desde barberías con sillones y navajas hasta spas con cabinas térmicas y masajes.
            </p>
          </div>

          {/* Interactive Sector Switcher Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              {sectors.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSector(sec.id)}
                    className={`relative px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                      isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSectorPillLight"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{sec.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sector Dynamic Showcase Card */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {sectors
                .filter((s) => s.id === activeSector)
                .map((sector) => {
                  const Icon = sector.icon;
                  return (
                    <motion.div
                      key={sector.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                      className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${sector.accent} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-2xl font-black text-slate-900">{sector.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sector.pillColor}`}>
                                {sector.badge}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">{sector.tagline}</p>
                          </div>
                        </div>

                        <Link
                          href="/register"
                          className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition"
                        >
                          Configurar para mi centro &rarr;
                        </Link>
                      </div>

                      <div className="pt-6">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4">
                          Ventajas específicas incluidas:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {sector.features.map((feat, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed flex flex-col justify-between shadow-xs"
                            >
                              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Ventaja {i + 1}</span>
                              </div>
                              <p className="text-slate-600">{feat}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 6. FUNCIONALIDADES DETALLADAS CON TARJETAS HOVER */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2 block">
            Potencia sin rodeos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Diseñado expresamente para el ritmo de trabajo en España
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Glowfy reúne en un solo lugar la agenda de citas, la caja diaria y la comunicación directa con tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Clock,
              title: "Horario con Siesta y Turnos Partidos",
              desc: "Configura turno de mañana (ej. 10:00 - 14:00) y de tarde (ej. 16:30 - 20:30). Los descansos se respetan al 100% sin solapes.",
              color: "text-amber-600 bg-amber-50"
            },
            {
              icon: MessageCircle,
              title: "Avisos Rápidos por WhatsApp",
              desc: "Envío de confirmación automática y recordatorios previos con un solo toque para reducir las ausencias al mínimo.",
              color: "text-emerald-600 bg-emerald-50"
            },
            {
              icon: Euro,
              title: "Caja Diaria con Soporte Bizum",
              desc: "Apunta pagos en caja indicando al momento si fue Efectivo, Datáfono o Bizum con cierre de jornada contable.",
              color: "text-teal-600 bg-teal-50"
            },
            {
              icon: Users,
              title: "Equipo, Sillones y Comisiones",
              desc: "Invita a tus barberos o esteticistas, reparte citas entre profesionales y calcula comisiones por ventas transparentes.",
              color: "text-blue-600 bg-blue-50"
            },
            {
              icon: Smartphone,
              title: "Enlace Web Propio & Móvil",
              desc: "Coloca tu enlace en Instagram, TikTok o Google Maps para convertir seguidores en citas reales sin comisiones de intermediarios.",
              color: "text-indigo-600 bg-indigo-50"
            },
            {
              icon: TrendingUp,
              title: "Reactivación de Clientes Inactivos",
              desc: "Detecta clientes que llevan 30 o 45 días sin venir y ofréceles una oferta especial para que vuelvan a reservar en tu centro.",
              color: "text-rose-600 bg-rose-50"
            }
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 7. PREGUNTAS FRECUENTES (FAQ) WITH ANIMATED ACCORDION */}
      <section id="faq" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2 block">
              Dudas resueltas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-base text-slate-900 hover:text-emerald-700 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3"
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

      {/* 8. FINAL CTA BANNER (Vibrant Emerald, Teal & Cyan Gradient) */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient luminous circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold mb-6">
              <GlowfyLogo size={16} className="rounded-md" />
              <span>Glowfy España</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
              Empieza a recibir citas en tu negocio hoy mismo
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mb-8 leading-relaxed">
              Configura tus servicios, horarios y profesionales en menos de 2 minutos. Sin contratos obligatorios ni permanencias.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/register"
                  className="w-full sm:w-auto py-4 px-8 bg-white hover:bg-slate-50 text-slate-950 rounded-2xl font-black text-sm shadow-xl transition block"
                >
                  Crear mi centro gratis ahora
                </Link>
              </motion.div>
              <Link
                href="/estudio-marco"
                className="w-full sm:w-auto py-4 px-6 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-2xl font-bold text-sm transition"
              >
                Ver ejemplo de cliente
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 9. FOOTER (Clean Light) */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-200 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GlowfyLogo size={32} />
            <div>
              <span className="font-extrabold text-base text-slate-900 block">
                Glowfy
              </span>
              <span className="text-[11px] text-slate-500">
                Software de citas para Barberías, Centros de Estética y Spas en España.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/login" className="hover:text-emerald-600 transition">Panel de gestión</Link>
            <Link href="/register" className="hover:text-emerald-600 transition">Registro de centros</Link>
            <Link href="/estudio-marco" className="hover:text-emerald-600 transition">Demo de reservas</Link>
          </div>

          <p className="text-slate-400 text-[11px]">
            © {new Date().getFullYear()} Glowfy España. Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </main>
  );
}
