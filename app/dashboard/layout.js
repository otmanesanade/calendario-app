"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlowfyLogo from "../../components/GlowfyLogo";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  CalendarDays,
  Scissors,
  Users,
  Settings,
  Receipt,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Store,
  Smartphone,
  Sparkles,
  QrCode,
  Tablet,
  Download,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import QrCodeModal from "../../components/QrCodeModal";
import PwaInstallModal from "../../components/PwaInstallModal";
import NotificationCenter from "../../components/NotificationCenter";

const NAV = [
  { href: "/dashboard", label: "Agenda diaria", icon: CalendarDays },
  { href: "/dashboard/caja?tab=mensual", label: "Ingresos por Mes", icon: TrendingUp },
  { href: "/dashboard/caja?tab=diaria", label: "Caja Diaria & Cobros", icon: Receipt },
  { href: "/dashboard/qr", label: "Código QR & Cartel", icon: QrCode },
  { href: "/dashboard/equipo", label: "Equipo & Sillones", icon: Users },
  { href: "/dashboard/clientes", label: "Clientes (CRM)", icon: Users },
  { href: "/dashboard/servicios", label: "Servicios y Tarifas", icon: Scissors },
  { href: "/dashboard/ajustes", label: "Horarios y Negocio", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);

      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS =
        /iphone|ipad|ipod/.test(ua) ||
        (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua));
      setIsIOSDevice(isIOS);
    }

    async function loadBarber() {
      try {
        const authRes = await supabase.auth.getUser();
        const user = authRes?.data?.user;
        if (!user) {
          router.push("/login");
          return;
        }

        const { data } = await supabase
          .from("barbers")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (data) setBarber(data);
      } catch (err) {
        console.warn("Error loading barber in layout:", err);
      }
    }
    loadBarber();

    function handleBarberUpdated(e) {
      if (e?.detail) {
        setBarber((prev) => ({ ...(prev || {}), ...e.detail }));
      } else {
        loadBarber();
      }
    }

    window.addEventListener("barber_updated", handleBarberUpdated);

    // Capturar evento PWA beforeinstallprompt
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("barber_updated", handleBarberUpdated);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [router]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function copyPublicLink() {
    if (!barber) return;
    const url = `${window.location.origin}/${barber.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleInstallDeferred() {
    if (!deferredPrompt) {
      setShowPwaModal(true);
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      setShowPwaModal(false);
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  }

  function handleOpenInstallModal() {
    setShowPwaModal(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isItemActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    const [itemPath, itemQuery] = href.split("?");
    if (pathname !== itemPath) return false;
    if (itemQuery && typeof window !== "undefined") {
      return window.location.search.includes(itemQuery);
    }
    return true;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Barra superior con datos del negocio y enlace público */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botón de 3 Rayas (Menú Hamburguesa) para Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition -ml-1.5 focus:outline-none"
              aria-label="Abrir menú"
              title="Abrir menú (3 rayas)"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" title="Ir a la página principal" className="shrink-0">
              <GlowfyLogo size={34} />
            </Link>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{barber?.business_name || "Mi Centro"}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  🇪🇸 España
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-500 flex items-center gap-1 truncate">
                <Store className="w-3 h-3 shrink-0" />
                <span className="truncate">{barber?.city || "España"}</span>
              </div>
            </div>
          </div>

          {/* Enlace público para compartir por Instagram / WhatsApp y Código QR */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {barber && (
              <>
                {!isStandalone && (
                  <button
                    onClick={handleOpenInstallModal}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-xs"
                    title="Instalar Glowfy en tu iPhone, iPad, Tablet o Android"
                  >
                    <Tablet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden md:inline">Instalar en iPad/iPhone</span>
                    <span className="md:hidden">Instalar</span>
                  </button>
                )}

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition shadow-xs"
                  title="Ver y descargar Código QR para tu local"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Código QR</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1 border border-zinc-200/80 dark:border-zinc-700">
                  <button
                    onClick={copyPublicLink}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    title="Copiar enlace de reserva para compartir con clientes"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Enlace clientes:</span>
                        <span className="font-mono text-[11px] text-zinc-500">/{barber.slug}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/${barber.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    title="Abrir página pública de reserva en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            )}

            <NotificationCenter />

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="md:flex gap-8 items-start">
          {/* Navegación lateral para Desktop */}
          <nav className="hidden md:flex flex-col gap-1.5 md:w-60 flex-shrink-0">
            {NAV.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-400 dark:text-indigo-600" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Botón Logout visible en el menú */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>

            {/* PWA / App Móvil Card */}
            {!isStandalone && (
              <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200/60 dark:border-indigo-800/40 text-left">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
                  <Tablet className="w-4 h-4" />
                  <span>Instalar en iPhone / iPad</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug mb-2.5">
                  Añade la app a tu pantalla de inicio en iPhone, iPad, Tablet o Android para usar en el local.
                </p>
                <button
                  onClick={handleOpenInstallModal}
                  className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar en tu pantalla</span>
                </button>
              </div>
            )}
          </nav>

          {/* Contenido de cada vista */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Barra de Navegación Inferior Móvil (Fija) con acceso a 3 Rayas */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex justify-between items-center shadow-lg">
        {/* 1. Agenda Diaria */}
        <Link
          href="/dashboard"
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition ${
            pathname === "/dashboard"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <CalendarDays className={`w-5 h-5 mb-0.5 ${pathname === "/dashboard" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="truncate">Agenda</span>
        </Link>

        {/* 2. Ingresos por Mes */}
        <Link
          href="/dashboard/caja?tab=mensual"
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition ${
            isItemActive("/dashboard/caja?tab=mensual")
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <TrendingUp className={`w-5 h-5 mb-0.5 ${isItemActive("/dashboard/caja?tab=mensual") ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="truncate">Ingresos</span>
        </Link>

        {/* 3. Caja Diaria */}
        <Link
          href="/dashboard/caja?tab=diaria"
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition ${
            isItemActive("/dashboard/caja?tab=diaria")
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Receipt className={`w-5 h-5 mb-0.5 ${isItemActive("/dashboard/caja?tab=diaria") ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="truncate">Caja</span>
        </Link>

        {/* 4. Clientes */}
        <Link
          href="/dashboard/clientes"
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition ${
            pathname === "/dashboard/clientes"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Users className={`w-5 h-5 mb-0.5 ${pathname === "/dashboard/clientes" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="truncate">Clientes</span>
        </Link>

        {/* 5. Botón de las 3 Rayas (Menú Completo) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] font-medium transition ${
            mobileMenuOpen
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5 stroke-[2.2]" />
          <span className="truncate font-bold">Menú</span>
        </button>
      </nav>

      {/* Drawer / Menú Lateral Móvil de 3 Rayas */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Fondo oscuro con desenfoque */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel Lateral deslizante desde la izquierda */}
          <div className="fixed inset-y-0 left-0 max-w-[290px] w-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Cabecera del Menú */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <GlowfyLogo size={32} />
                <div className="min-w-0">
                  <div className="font-black text-xs text-zinc-900 dark:text-white truncate">
                    {barber?.business_name || "Glowfy Salón"}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Panel de Control</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Acceso Rápido al Enlace de Clientes */}
            {barber && (
              <div className="p-3 mx-3 my-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Enlace reservas:</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200/70 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-mono">
                    /{barber.slug}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyPublicLink}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-indigo-700 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`/${barber.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition"
                    title="Ver página pública de reservas"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Lista de Enlaces de Navegación con 3 Rayas */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Menú de Secciones
              </div>
              {NAV.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Pie del Menú con PWA y Cerrar Sesión */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
              {!isStandalone && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenInstallModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>📲 Instalar App en el Móvil</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        businessName={barber?.business_name || "Mi Centro"}
        slug={barber?.slug || "demo"}
        city={barber?.city || "España"}
      />

      {/* Modal Instalación PWA para iOS (iPhone / iPad), Tablet y Android */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallDeferred={handleInstallDeferred}
      />
    </div>
  );
}
