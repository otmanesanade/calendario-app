// Sistema de Notificaciones en Vivo y Alertas en App para Glowfy

// Generador de sonido con Web Audio API (Sin depender de archivos externos MP3)
export function playAppointmentSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Reanudar contexto si estaba suspendido (política de navegadores)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Primer tono (campana suave - C5 523.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Segundo tono (campana alegre superior - G5 783.99Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn("No se pudo reproducir el sonido de notificación:", err);
  }
}

// Comprobar y solicitar permisos de notificaciones del navegador
export async function requestBrowserPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  } catch (err) {
    console.warn("Error solicitando permisos de notificación:", err);
  }
  return false;
}

export function hasBrowserPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  return Notification.permission === "granted";
}

// Enviar notificación del sistema (Push de escritorio / móvil)
export function sendBrowserPush({ title, body, icon = "/icon.svg", url = "/dashboard" }) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200],
      tag: "glowfy-appointment",
    });

    notif.onclick = function (e) {
      e.preventDefault();
      window.focus();
      if (url && window.location.pathname !== url) {
        window.location.href = url;
      }
      notif.close();
    };
  } catch (err) {
    console.warn("Fallo al disparar notificación nativa:", err);
  }
}

// Almacenamiento local de notificaciones
const STORAGE_KEY = "glowfy_notifications_list";
const CHANNEL_NAME = "glowfy_live_appointment_channel";

export function getStoredNotifications() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveNotificationRecord(record) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredNotifications();
    const updated = [record, ...current].slice(0, 40); // Guardar las últimas 40
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error guardando notificación en localStorage:", e);
  }
}

export function markNotificationAsRead(id) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("glowfy_notifications_updated"));
  } catch (e) {}
}

export function markAllNotificationsAsRead() {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("glowfy_notifications_updated"));
  } catch (e) {}
}

// Función principal: Disparar notificación de nueva cita desde cualquier parte (página de reserva o manual)
export function dispatchNewAppointment({
  clientName,
  clientPhone,
  serviceName,
  startsAt,
  slot,
  totalPrice,
  barberId,
  barberName,
  staffName,
  notes,
}) {
  if (typeof window === "undefined") return;

  const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const dateFormatted = startsAt
    ? new Date(startsAt).toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "Hoy";

  const payload = {
    id: notifId,
    type: "new_appointment",
    clientName: clientName || "Cliente",
    clientPhone: clientPhone || "Sin teléfono",
    serviceName: serviceName || "Servicio",
    startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
    slot: slot || "",
    totalPrice: totalPrice || 0,
    barberId: barberId || "",
    barberName: barberName || "",
    staffName: staffName || "Equipo",
    notes: notes || "",
    dateFormatted,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // 1. Guardar en historial de notificaciones
  saveNotificationRecord(payload);

  // 2. Notificación del sistema si está permitida
  sendBrowserPush({
    title: "💈 ¡Nueva Cita Recibida en Glowfy!",
    body: `${payload.clientName} (${payload.clientPhone}) reservó ${payload.serviceName} a las ${payload.slot || "su hora"}.`,
    url: "/dashboard",
  });

  // 3. Emitir por BroadcastChannel a todas las pestañas abiertas
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "NEW_APPOINTMENT", payload });
      channel.close();
    }
  } catch (e) {
    // ignore
  }

  // 4. Emitir en localStorage para sincronizar con pestañas que escuchen storage event
  try {
    localStorage.setItem(
      "glowfy_new_booking_ping",
      JSON.stringify({ payload, timestamp: Date.now() })
    );
  } catch (e) {}

  // 5. Emitir evento local directo en la ventana actual
  window.dispatchEvent(
    new CustomEvent("glowfy_new_appointment", {
      detail: payload,
    })
  );

  window.dispatchEvent(new CustomEvent("glowfy_notifications_updated"));
}

// Hook de escucha para componentes (Dashboard Layout o Agenda)
export function subscribeToAppointments(onNewAppointment) {
  if (typeof window === "undefined") return () => {};

  let channel = null;
  try {
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === "NEW_APPOINTMENT" && event.data.payload) {
          onNewAppointment(event.data.payload);
        }
      };
    }
  } catch (e) {}

  // Escuchar por CustomEvent
  function handleCustomEvent(e) {
    if (e.detail) {
      onNewAppointment(e.detail);
    }
  }
  window.addEventListener("glowfy_new_appointment", handleCustomEvent);

  // Escuchar por storage event (otra pestaña hizo reserva)
  function handleStorageEvent(e) {
    if (e.key === "glowfy_new_booking_ping" && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        if (data?.payload) {
          onNewAppointment(data.payload);
        }
      } catch (err) {}
    }
  }
  window.addEventListener("storage", handleStorageEvent);

  return function unsubscribe() {
    if (channel) {
      channel.close();
    }
    window.removeEventListener("glowfy_new_appointment", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
