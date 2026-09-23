"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Share,
  PlusSquare,
  Smartphone,
  Tablet,
  Check,
  Download,
  Sparkles,
} from "lucide-react";

export default function PwaInstallModal({ isOpen, onClose, deferredPrompt, onInstallDeferred }) {
  const [activeTab, setActiveTab] = useState("ios"); // "ios" o "android"
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isTabletDevice, setIsTabletDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIOS =
        /iphone|ipad|ipod/.test(ua) ||
        (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua));
      const isTablet =
        /ipad/.test(ua) ||
        (window.navigator.maxTouchPoints > 1 && /macintosh/.test(ua)) ||
        /tablet|android(?!.*mobile)/.test(ua);

      setIsIOSDevice(isIOS);
      setIsTabletDevice(isTablet);
      setActiveTab(isIOS ? "ios" : "android");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center relative overflow-hidden border border-indigo-200 dark:border-indigo-800">
              <Image
                src="/apple-touch-icon.png"
                alt="Glowfy App"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Instalar Glowfy</span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  App PWA
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                {isTabletDevice ? "Optimizado para Tablet / iPad" : "Para iPhone, iPad y Android"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de plataforma: iOS (iPhone / iPad) vs Android */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === "ios"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === "android"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Contenido pestaña iOS (iPhone / iPad) */}
        {activeTab === "ios" && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold flex items-center gap-1">
                <span>🍎</span>
                <span>Instalación directa desde Safari en 3 toques:</span>
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                Apple no permite descargas automáticas sin pasar por Safari. Sigue estos pasos para tener la app en tu pantalla de inicio:
              </p>
            </div>

            <ol className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              {/* Paso 1 */}
              <li className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                  1
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>Pulsa el botón Compartir</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    En <strong>iPhone</strong> está en la barra inferior de Safari. En <strong>iPad</strong> se encuentra arriba a la derecha.
                  </p>
                </div>
              </li>

              {/* Paso 2 */}
              <li className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                  2
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>Elige &quot;Añadir a pantalla de inicio&quot;</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Desliza hacia abajo en las opciones de compartir hasta encontrar el icono de más (+).
                  </p>
                </div>
              </li>

              {/* Paso 3 */}
              <li className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-xs">
                  3
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>Pulsa &quot;Añadir&quot; (Add)</span>
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    En la esquina superior derecha. Se creará el icono de <strong>Glowfy</strong> y se abrirá en pantalla completa sin barra de navegación.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Contenido pestaña Android / Chrome */}
        {activeTab === "android" && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              En dispositivos Android y navegadores Chrome/Edge, puedes pulsar directamente en el botón de abajo para instalarla automáticamente:
            </p>

            {deferredPrompt ? (
              <button
                type="button"
                onClick={onInstallDeferred}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Glowfy en este dispositivo</span>
              </button>
            ) : (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Pasos para Chrome en Android:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <li>Pulsa en los 3 puntos (⋮) de la esquina superior derecha de Chrome.</li>
                  <li>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.</li>
                  <li>Confirma y ¡listo!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Ventajas de la App */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Sin descargas pesadas
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Notificaciones y acceso rápido
          </span>
        </div>

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}
