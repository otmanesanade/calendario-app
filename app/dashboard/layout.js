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
} from "lucide-react";
import QrCodeModal from "../../components/QrCodeModal";
import PwaInstallModal from "../../components/PwaInstallModal";
import NotificationCenter from "../../components/NotificationCenter";

const NAV = [
  { href: "/dashboard", label: "Agenda diaria", icon: CalendarDays },
  { href: "/dashboard/qr", label: "Código QR & Cartel", icon: QrCode },
  { href: "/dashboard/caja", label: "Caja & Finanzas", icon: Receipt },
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Barra superior con datos del negocio y enlace público */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" title="Ir a la página principal">
              <GlowfyLogo size={36} />
            </Link>
            <div>
              <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{barber?.business_name || "Mi Centro"}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  🇪🇸 España
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Store className="w-3 h-3" />
                <span>{barber?.city || "Madrid"}</span>
              </div>
            </div>
          </div>

          {/* Enlace público para compartir por Instagram / WhatsApp y Código QR */}
          <div className="flex items-center gap-2">
            {barber && (
              <>
                {!isStandalone && (
                  <button
                    onClick={handleOpenInstallModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition shadow-xs"
                    title="Instalar Glowfy en tu iPhone, iPad, Tablet o Android"
                  >
                    <Tablet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden md:inline">Instalar en iPad/iPhone</span>
                    <span className="md:hidden">Instalar</span>
                  </button>
                )}

                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition shadow-xs"
                  title="Ver y descargar Código QR para tu local"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Código QR</span>
                </button>

                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1 border border-zinc-200/80 dark:border-zinc-700">
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
              const active = pathname === item.href;
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

          {/* Navegación horizontal scrollable en móvil bajo la cabecera */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {!isStandalone && (
              <button
                type="button"
                onClick={handleOpenInstallModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 whitespace-nowrap flex-shrink-0 shadow-xs"
              >
                <Tablet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>📲 Instalar App (iOS/Tablet)</span>
              </button>
            )}
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Contenido de cada vista */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Barra de Navegación Inferior Móvil (Fija) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
                active
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard/ajustes"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            pathname === "/dashboard/ajustes"
              ? "text-indigo-600 dark:text-indigo-400 font-bold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Settings className={`w-5 h-5 mb-0.5 ${pathname === "/dashboard/ajustes" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="truncate max-w-[60px]">Ajustes</span>
        </Link>
      </nav>

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
