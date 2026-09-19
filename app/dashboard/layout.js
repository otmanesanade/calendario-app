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
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Agenda diaria", icon: CalendarDays },
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
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    async function loadBarber() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setBarber(data);
    }
    loadBarber();

    // Capturar evento PWA beforeinstallprompt
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
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

  async function handleInstallPwa() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Para instalar la app en tu móvil: pulsa en Compartir / Menú de tu navegador y elige 'Añadir a la pantalla de inicio'.");
    }
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

          {/* Enlace público para compartir por Instagram / WhatsApp */}
          <div className="flex items-center gap-2">
            {barber && (
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
            )}

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="md:flex gap-8 items-start">
          {/* Navegación lateral */}
          <nav className="flex md:flex-col gap-1.5 md:w-60 flex-shrink-0 mb-6 md:mb-0 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
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
            <div className="hidden md:block mt-6 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20 border border-indigo-200/60 dark:border-indigo-800/40 text-left">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
                <Smartphone className="w-4 h-4" />
                <span>App Móvil PWA</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug mb-2.5">
                Instala la agenda en la pantalla de inicio de tu móvil como una app nativa.
              </p>
              <button
                onClick={handleInstallPwa}
                className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition text-center"
              >
                Instalar App
              </button>
            </div>
          </nav>

          {/* Contenido de cada vista */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
