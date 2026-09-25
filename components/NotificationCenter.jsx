"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  Phone,
  Scissors,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Clock,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import {
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  playAppointmentSound,
  requestBrowserPermission,
  hasBrowserPermission,
  subscribeToAppointments,
  dispatchNewAppointment,
} from "../lib/notifications";

export default function NotificationCenter({ onAppointmentReceived }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const toastTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cargar notificaciones y permisos al montar
  useEffect(() => {
    setNotifications(getStoredNotifications());
    setHasPushPermission(hasBrowserPermission());

    const savedSound = localStorage.getItem("glowfy_sound_enabled");
    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }

    function handleUpdate() {
      setNotifications(getStoredNotifications());
    }

    window.addEventListener("glowfy_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("glowfy_notifications_updated", handleUpdate);
    };
  }, []);

  // Suscribirse a nuevas citas en vivo (BroadcastChannel, storage event, window event)
  useEffect(() => {
    const unsubscribe = subscribeToAppointments((newAppt) => {
      // 1. Reproducir sonido si está activado
      if (soundEnabled) {
        playAppointmentSound();
      }

      // 2. Mostrar toast flotante
      setActiveToast(newAppt);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 9000); // Visible durante 9 segundos

      // 3. Actualizar lista de notificaciones
      setNotifications(getStoredNotifications());

      // 4. Notificar al componente padre (p.ej. recargar agenda)
      if (onAppointmentReceived) {
        onAppointmentReceived(newAppt);
      }
    });

    return () => {
      unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [soundEnabled, onAppointmentReceived]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("glowfy_sound_enabled", String(next));
    if (next) {
      playAppointmentSound();
    }
  }

  async function handleEnablePush() {
    const granted = await requestBrowserPermission();
    setHasPushPermission(granted);
    if (granted) {
      playAppointmentSound();
    }
  }

  function handleTestNotification() {
    playAppointmentSound();
    dispatchNewAppointment({
      clientName: "Prueba Cliente Glowfy",
      clientPhone: "+34 612 345 678",
      serviceName: "Corte y peinado degradado",
      startsAt: new Date().toISOString(),
      slot: "17:30",
      totalPrice: 20,
      notes: "Corte con tijera arriba y barba perfilada",
    });
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead();
  }

  function getWhatsAppUrl(phone, name, slot, service) {
    if (!phone) return "#";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const msg = `¡Hola ${name || "estimado cliente"}! 👋 Hemos recibido tu reserva en Glowfy para ${service || "tu servicio"} a las ${slot || "la hora acordada"}. ¡Te esperamos!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Campana con Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        title="Notificaciones de citas en directo"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Toast Flotante en Pantalla (Aparece cuando llega cita en vivo) */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                🔔 ¡Nueva Cita Recibida en Vivo!
              </span>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5">
            <div className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{activeToast.clientName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                {activeToast.totalPrice} €
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                <Phone className="w-3 h-3" />
                {activeToast.clientPhone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                {activeToast.slot} h ({activeToast.dateFormatted || "Hoy"})
              </span>
            </div>

            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              ✂️ {activeToast.serviceName}
            </div>

            {activeToast.notes && (
              <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/50">
                📝 &ldquo;{activeToast.notes}&rdquo;
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            <a
              href={`tel:${activeToast.clientPhone}`}
              className="flex-1 py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-3 h-3" />
              <span>Llamar</span>
            </a>
            <a
              href={getWhatsAppUrl(
                activeToast.clientPhone,
                activeToast.clientName,
                activeToast.slot,
                activeToast.serviceName
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Menú Desplegable de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera del Panel */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  soundEnabled
                    ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                title={soundEnabled ? "Sonido de aviso activado" : "Sonido silenciado"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-1"
                >
                  Marcar leídas
                </button>
              )}
            </div>
          </div>

          {/* Banner de Permisos de Notificación Web */}
          {!hasPushPermission && (
            <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2">
              <span className="text-[11px] text-indigo-900 dark:text-indigo-200">
                🔔 Activa avisos en pantalla para no perder ninguna cita.
              </span>
              <button
                type="button"
                onClick={handleEnablePush}
                className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg whitespace-nowrap transition"
              >
                Activar
              </button>
            </div>
          )}

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Sin notificaciones pendientes
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                  Cuando un cliente reserve por la web, recibirás un aviso sonoro y visual aquí al instante.
                </div>
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Probar notificación de ejemplo</span>
                </button>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 transition cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                    !notif.read
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                      : "bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">
                        {notif.clientName || "Cliente"}
                      </span>
                      {notif.totalPrice ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {notif.totalPrice} €
                        </span>
                      ) : null}
                    </div>

                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                      {notif.slot ? `${notif.slot} h` : ""}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{notif.clientPhone || "Sin teléfono"}</span>
                    </div>

                    <div className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                      {notif.serviceName}
                    </div>
                  </div>

                  {notif.notes && (
                    <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate italic">
                      📝 {notif.notes}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-end gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                    {notif.clientPhone && notif.clientPhone !== "Sin teléfono" && (
                      <>
                        <a
                          href={`tel:${notif.clientPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 px-2 text-[10px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-1 transition"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>Llamar</span>
                        </a>
                        <a
                          href={getWhatsAppUrl(
                            notif.clientPhone,
                            notif.clientName,
                            notif.slot,
                            notif.serviceName
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 px-2 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/60 rounded-lg flex items-center gap-1 transition"
                        >
                          <MessageCircle className="w-2.5 h-2.5 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie del Panel */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Probar alerta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("glowfy_notifications_list");
                  setNotifications([]);
                }}
                className="text-[11px] text-zinc-400 hover:text-rose-500 transition"
              >
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
