"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import {
  Calendar,
  Clock,
  Euro,
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Scissors,
  Sparkles,
  X,
  LayoutGrid,
  List,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  Users,
  Award,
  Gift,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [viewMode, setViewMode] = useState("grid"); // "grid" (Timeline estilo Booksy) o "list"
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal para añadir cita manual
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newStaffId, setNewStaffId] = useState("");
  const [newServiceIds, setNewServiceIds] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState("11:00");
  const [creatingAppt, setCreatingAppt] = useState(false);

  // Modal para cobrar cita (Bizum, Efectivo, Tarjeta)
  const [paymentModalAppt, setPaymentModalAppt] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bizum");
  const [tipAmount, setTipAmount] = useState(0);

  // Modal para pedir reseña de Google por WhatsApp
  const [reviewModalAppt, setReviewModalAppt] = useState(null);
  const [copiedReviewText, setCopiedReviewText] = useState(false);

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Datos del barbero
    const { data: b } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let barberData = b;
    if (typeof window !== "undefined") {
      try {
        const localBackup = localStorage.getItem("barber_settings_backup");
        if (localBackup) {
          barberData = { ...(barberData || {}), ...JSON.parse(localBackup) };
        }
      } catch (e) {
        // ignore
      }
    }
    if (barberData) setBarber(barberData);

    // Equipo de barberos
    const { data: stf } = await supabase
      .from("barber_staff")
      .select("*")
      .eq("barber_id", user.id)
      .eq("active", true);
    setStaffList(stf || []);
    if (stf && stf.length > 0 && !newStaffId) {
      setNewStaffId(stf[0].id);
    }

    // Servicios activos
    const { data: s } = await supabase
      .from("services")
      .select("*")
      .eq("barber_id", user.id)
      .eq("active", true);
    setServices(s || []);
    if (s && s.length > 0 && newServiceIds.length === 0) {
      setNewServiceIds([s[0].id]);
    }

    // Citas del día seleccionado
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appts } = await supabase
      .from("appointments")
      .select(
        "id, client_id, service_id, staff_id, starts_at, ends_at, status, total_price, payment_method, payment_status, tip_amount, clients(full_name, phone), services(name, price, duration_minutes), barber_staff(name, avatar_color)"
      )
      .eq("barber_id", user.id)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString())
      .order("starts_at", { ascending: true });

    setAppointments(appts || []);
    setLoading(false);
  }, [selectedDate, newStaffId, newServiceIds.length]);

  useEffect(() => {
    loadData();

    function handleBarberUpdate(e) {
      if (e?.detail) {
        setBarber((prev) => ({ ...(prev || {}), ...e.detail }));
      }
      loadData();
    }
    window.addEventListener("barber_updated", handleBarberUpdate);
    return () => window.removeEventListener("barber_updated", handleBarberUpdate);
  }, [loadData]);

  // Cambiar de día
  function handlePrevDay() {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  }

  function handleNextDay() {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  }

  // Marcar estado rápido
  async function handleUpdateStatus(apptId, newStatus) {
    await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", apptId);

    if (newStatus === "completada") {
      const target = appointments.find((a) => a.id === apptId);
      if (target && (target.clients?.phone || target.client_phone)) {
        setReviewModalAppt(target);
      }
    }
    loadData();
  }

  // Confirmar cobro con método de pago
  async function handleConfirmPayment() {
    if (!paymentModalAppt) return;
    const completedAppt = { ...paymentModalAppt };
    const isFreeLoyalty = selectedPaymentMethod === "gratis_fidelidad";
    await supabase
      .from("appointments")
      .update({
        status: "completada",
        payment_status: "pagado",
        payment_method: selectedPaymentMethod,
        tip_amount: Number(tipAmount) || 0,
        total_price: isFreeLoyalty ? 0 : paymentModalAppt.total_price || (paymentModalAppt.services && paymentModalAppt.services.price) || 0,
      })
      .eq("id", paymentModalAppt.id);

    setPaymentModalAppt(null);
    setTipAmount(0);
    loadData();

    // Abrir automáticamente el modal para pedir reseña de Google si tiene teléfono
    if (completedAppt.clients?.phone || completedAppt.client_phone) {
      setReviewModalAppt(completedAppt);
    }
  }

  // Abrir modal de añadir cita con slot y barbero pre-rellenados
  function handleOpenSlot(staffId, timeStr) {
    if (staffId) setNewStaffId(staffId);
    if (timeStr) setNewSlotTime(timeStr);
    setShowAddModal(true);
  }

  // Añadir cita manual
  async function handleCreateManualAppt(e) {
    e.preventDefault();
    if (!newClientName.trim() || newServiceIds.length === 0) return;
    setCreatingAppt(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let phoneClean = newClientPhone.trim().replace(/\s+/g, "");
    if (/^[6789]\d{8}$/.test(phoneClean)) {
      phoneClean = `+34 ${phoneClean.slice(0, 3)} ${phoneClean.slice(3, 6)} ${phoneClean.slice(6)}`;
    }

    // 1. Cliente: buscar existente o crear nuevo
    let clientId = null;
    try {
      if (phoneClean) {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("barber_id", user.id)
          .eq("phone", phoneClean)
          .maybeSingle();
        if (existingClient?.id) {
          clientId = existingClient.id;
        }
      }

      if (!clientId) {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            barber_id: user.id,
            full_name: newClientName.trim(),
            phone: phoneClean || "Sin teléfono",
            notes: "Cita manual en el salón",
          })
          .select()
          .maybeSingle();
        clientId = newClient?.id || null;
      }
    } catch (cErr) {
      console.warn("Aviso al gestionar cliente manual:", cErr);
    }

    // 2. Horas y Servicios
    const [h, m] = newSlotTime.split(":").map(Number);
    const startsAt = new Date(selectedDate);
    startsAt.setHours(h, m, 0, 0);

    const chosenServices = services.filter((s) => newServiceIds.includes(s.id));
    const combinedDuration = chosenServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);
    const combinedPrice = chosenServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    const endsAt = new Date(startsAt.getTime() + combinedDuration * 60000);

    // 3. Crear cita
    await supabase.from("appointments").insert({
      barber_id: user.id,
      client_id: clientId,
      service_id: chosenServices[0]?.id,
      staff_id: newStaffId || (staffList[0] && staffList[0].id),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmada",
      total_price: combinedPrice,
      total_duration: combinedDuration,
      payment_status: "pendiente",
    });

    setNewClientName("");
    setNewClientPhone("");
    setShowAddModal(false);
    setCreatingAppt(false);
    loadData();
  }

  // Generar enlace WhatsApp de recordatorio para España
  function getWhatsAppReminderUrl(appt) {
    const rawPhone = (appt.clients?.phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) return "#";

    const dateObj = new Date(appt.starts_at);
    const hora = dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dia = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    const staffName = appt.barber_staff?.name || "tu barbero";
    const serviceName = appt.services?.name || "tu cita";

    const text = `Hola ${appt.clients?.full_name || ""} 👋 Te recordamos tu cita de ${serviceName} con ${staffName} para ${dia} a las ${hora} en ${
      barber?.business_name || "la barbería"
    }. Si necesitas cambiarla o no puedes venir, avísanos con antelación. ¡Nos vemos pronto! 💈`;

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  }

  // Generar texto para pedir reseña de Google
  function getReviewMessageText(appt) {
    if (!appt) return "";
    const clientName = appt.clients?.full_name || appt.client_name || "amigo";
    const salonName = barber?.business_name || "nuestro salón";
    const reviewLink = barber?.google_review_url || "https://g.page/r/ejemplo/review";

    const template =
      barber?.google_review_message ||
      "¡Hola {nombre}! Muchas gracias por tu visita a {negocio} 💈✂️ ¿Qué tal te pareció el resultado? Nos ayudarías mucho dejándonos tu valoración en Google (sólo 15 segundos): {enlace} ⭐ ¡Muchísimas gracias!";

    return template
      .replace(/{nombre}/g, clientName)
      .replace(/{negocio}/g, salonName)
      .replace(/{enlace}/g, reviewLink);
  }

  // Generar enlace WhatsApp con mensaje de reseña de Google
  function getWhatsAppReviewUrl(appt) {
    if (!appt) return "#";
    const rawPhone = (appt.clients?.phone || appt.client_phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) return "#";

    const text = getReviewMessageText(appt);
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  }

  // Cálculos de métricas del día
  const { totalFacturado, completadas, pendientes, noShows, totalBizum, totalEfectivo } =
    useMemo(() => {
      let facturado = 0;
      let comp = 0;
      let pend = 0;
      let noshow = 0;
      let bizum = 0;
      let efectivo = 0;

      appointments.forEach((a) => {
        const price = Number(a.total_price || (a.services && a.services.price) || 0);
        if (a.status === "completada") {
          facturado += price;
          comp++;
          if (a.payment_method === "bizum") bizum += price;
          else efectivo += price;
        } else if (a.status === "no_vino") {
          noshow++;
        } else if (a.status !== "cancelada") {
          pend++;
        }
      });

      return {
        totalFacturado: facturado,
        completadas: comp,
        pendientes: pend,
        noShows: noshow,
        totalBizum: bizum,
        totalEfectivo: efectivo,
      };
    }, [appointments]);

  // Horarios de apertura, cierre e intervalos según la configuración del salón en Ajustes
  const {
    timelineHours,
    scheduleOpeningMins,
    scheduleClosingMins,
    siestaStartMins,
    siestaEndMins,
    isSiestaActive,
  } = useMemo(() => {
    const hasSiesta = barber?.has_siesta !== false;
    const morningOpenStr = barber?.opening_time_morning || "10:00";
    const morningCloseStr = barber?.closing_time_morning || "14:00";
    const afternoonOpenStr = barber?.opening_time_afternoon || "16:30";
    const afternoonCloseStr =
      barber?.closing_time_afternoon || (hasSiesta ? "20:30" : morningCloseStr);

    function parseToMins(str) {
      if (!str || typeof str !== "string") return 0;
      const parts = str.split(":").map(Number);
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }

    function formatFromMins(mins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    const interval = Math.max(10, Number(barber?.slot_interval) || 30); // 15, 20, 30, 45, 60

    let startMins = parseToMins(morningOpenStr);
    let endMins = hasSiesta
      ? parseToMins(afternoonCloseStr)
      : parseToMins(morningCloseStr || afternoonCloseStr);

    const sStartMins = parseToMins(morningCloseStr);
    const sEndMins = parseToMins(afternoonOpenStr);

    // Si existen citas en este día fuera del horario oficial, ampliamos dinámicamente
    // para que ninguna cita existente quede oculta en la rejilla
    appointments.forEach((a) => {
      if (a.starts_at) {
        const d = new Date(a.starts_at);
        const aMins = d.getHours() * 60 + d.getMinutes();
        if (aMins < startMins) {
          startMins = Math.floor(aMins / interval) * interval;
        }
      }
      if (a.ends_at) {
        const d = new Date(a.ends_at);
        const aMins = d.getHours() * 60 + d.getMinutes();
        if (aMins > endMins) {
          endMins = Math.ceil(aMins / interval) * interval;
        }
      }
    });

    if (endMins <= startMins) {
      endMins = startMins + 8 * 60;
    }

    const hours = [];
    for (let t = startMins; t <= endMins; t += interval) {
      hours.push(formatFromMins(t));
    }

    return {
      timelineHours: hours,
      scheduleOpeningMins: startMins,
      scheduleClosingMins: endMins,
      siestaStartMins: sStartMins,
      siestaEndMins: sEndMins,
      isSiestaActive: hasSiesta && sEndMins > sStartMins,
    };
  }, [
    barber?.opening_time_morning,
    barber?.closing_time_morning,
    barber?.has_siesta,
    barber?.opening_time_afternoon,
    barber?.closing_time_afternoon,
    barber?.slot_interval,
    appointments,
  ]);

  // Comprobar si una hora determinada cae en la pausa de siesta
  function isSlotInSiesta(hourStr) {
    if (!isSiestaActive) return false;
    const parts = hourStr.split(":").map(Number);
    const mins = (parts[0] || 0) * 60 + (parts[1] || 0);
    return mins >= siestaStartMins && mins < siestaEndMins;
  }

  const isCurrentDayClosed = useMemo(() => {
    const activeWorkDays = barber?.work_days && Array.isArray(barber.work_days)
      ? barber.work_days
      : [1, 2, 3, 4, 5, 6];
    return !activeWorkDays.includes(selectedDate.getDay());
  }, [barber?.work_days, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Cabecera con selector de día y cambio de vista (Grid / Lista) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Agenda del Salón
            </h1>
            {/* Botón selector de Vista Lista / Vista Grid Rejilla */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
                title="Vista Timeline por Sillones / Barberos (Estilo Booksy)"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Sillones (Grid)</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
                title="Vista en lista cronológica"
              >
                <List className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {isCurrentDayClosed ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  Día de descanso (Salón cerrado hoy)
                </span>
              ) : barber?.has_siesta !== false ? (
                <span>
                  Horario de hoy:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {barber?.opening_time_morning || "10:00"} - {barber?.closing_time_morning || "14:00"}
                  </strong>{" "}
                  y{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {barber?.opening_time_afternoon || "16:30"} - {barber?.closing_time_afternoon || "20:30"}
                  </strong>
                </span>
              ) : (
                <span>
                  Horario continuo:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {barber?.opening_time_morning || "10:00"} - {barber?.closing_time_morning || barber?.closing_time_afternoon || "20:30"}
                  </strong>
                </span>
              )}
            </span>
            <Link
              href="/dashboard/ajustes"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] inline-flex items-center gap-0.5"
            >
              Configurar horario ⚙️
            </Link>
          </div>
        </div>

        {/* Selector de fecha */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-3 text-zinc-900 dark:text-white capitalize min-w-[130px] text-center flex flex-col items-center">
              <span>
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {isCurrentDayClosed && (
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded-md">
                  Cerrado (descanso)
                </span>
              )}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setSelectedDate(today);
              }}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
            >
              Hoy
            </button>
          </div>

          <button
            onClick={() => handleOpenSlot(null, barber?.opening_time_morning || "10:00")}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir Cita</span>
          </button>
        </div>
      </div>

      {/* Alerta si el día seleccionado está marcado como cerrado en Ajustes */}
      {isCurrentDayClosed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center text-lg font-bold shrink-0">
              ☕
            </div>
            <div>
              <p className="font-bold text-sm text-amber-950 dark:text-amber-100">
                Día de descanso semanal (Salón cerrado)
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                Según tu horario en <strong>Ajustes del Salón</strong>, tu salón no abre este día de la semana. Los clientes no pueden reservar online hoy en tu web.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/ajustes"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-zinc-800 transition whitespace-nowrap self-start sm:self-auto shadow-xs"
          >
            Modificar días en Ajustes ⚙️
          </Link>
        </div>
      )}

      {/* Métricas rápidas del día */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
            <span>Citas Hoy</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {appointments.length}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {completadas} completadas · {pendientes} pendientes
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
            <span>Facturado Hoy</span>
            <Euro className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalFacturado} €
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {totalBizum > 0 && <span>Bizum: {totalBizum}€ · </span>}
            Efectivo: {totalEfectivo}€
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
            <span>Asistencia</span>
            <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {appointments.length > 0
              ? `${(((appointments.length - noShows) / appointments.length) * 100).toFixed(0)}%`
              : "100%"}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {noShows === 0 ? "Sin ausencias hoy" : `${noShows} No-Shows`}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
            <span>Equipo Activo</span>
            <Users className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {staffList.length} barberos
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {staffList.map((s) => s.name).join(", ")}
          </div>
        </div>
      </div>

      {/* VISTA 1: TIMELINE GRID ESTILO BOOKSY / FRESHA */}
      {viewMode === "grid" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Cabecera de columnas con los nombres de los barberos */}
          <div className="grid grid-cols-[70px_repeat(auto-fit,minmax(180px,1fr))] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 sticky top-0 z-10">
            <div className="p-3 text-center text-[11px] font-bold text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
              Hora
            </div>
            {staffList.map((st) => (
              <div
                key={st.id}
                className="p-3 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: st.avatar_color || "#4f46e5" }}
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {st.role || "Barbero"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenSlot(st.id, barber?.opening_time_morning || "10:00")}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-indigo-600 transition"
                  title={`Añadir cita a ${st.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Rejilla horaria con slots sincronizados */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {timelineHours.map((hourStr) => {
              const isSiesta = isSlotInSiesta(hourStr);
              const [h, m] = hourStr.split(":").map(Number);
              const slotStartMins = (h || 0) * 60 + (m || 0);
              const interval = Math.max(10, Number(barber?.slot_interval) || 30);
              const slotEndMins = slotStartMins + interval;

              return (
                <div
                  key={hourStr}
                  className={`grid grid-cols-[70px_repeat(auto-fit,minmax(180px,1fr))] min-h-[56px] transition-colors ${
                    isSiesta
                      ? "bg-amber-50/25 dark:bg-amber-950/20"
                      : isCurrentDayClosed
                      ? "bg-zinc-50/50 dark:bg-zinc-900/40"
                      : "hover:bg-zinc-50/40"
                  }`}
                >
                  {/* Etiqueta de la hora */}
                  <div className="p-2.5 text-center text-xs font-semibold text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 flex items-start justify-center">
                    {hourStr}
                  </div>

                  {/* Columnas para cada barbero en esta hora */}
                  {staffList.map((st) => {
                    // Buscar citas que caen en este intervalo horario
                    const slotAppts = appointments.filter((a) => {
                      if (a.staff_id !== st.id) return false;
                      const apptDate = new Date(a.starts_at);
                      const apptMins = apptDate.getHours() * 60 + apptDate.getMinutes();
                      return apptMins >= slotStartMins && apptMins < slotEndMins;
                    });

                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          if (slotAppts.length === 0 && !isSiesta) {
                            handleOpenSlot(st.id, hourStr);
                          }
                        }}
                        className={`p-1.5 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 relative group cursor-pointer ${
                          isSiesta ? "cursor-not-allowed" : "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10"
                        }`}
                      >
                        {isSiesta && slotAppts.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-amber-700/60 dark:text-amber-400/40 font-medium italic">
                            Pausa mediodía
                          </div>
                        ) : slotAppts.length > 0 ? (
                          slotAppts.map((appt) => {
                            const isPaid = appt.status === "completada";
                            const isNoShow = appt.status === "no_vino";
                            const isCancelled = appt.status === "cancelada";

                            return (
                              <div
                                key={appt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentModalAppt(appt);
                                }}
                                className={`p-2 rounded-xl text-left shadow-xs border transition-all ${
                                  isPaid
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                                    : isNoShow
                                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800"
                                    : isCancelled
                                    ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 opacity-50 line-through"
                                    : "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs truncate">
                                    {appt.clients?.full_name || "Cliente"}
                                  </span>
                                  <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                                    {appt.total_price || (appt.services && appt.services.price)} €
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                                  {appt.services?.name || "Servicio"}
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                  <span className="capitalize font-semibold">
                                    {appt.status}
                                  </span>
                                  <span className="text-zinc-400">
                                    {appt.payment_method ? `(${appt.payment_method})` : "Pendiente"}
                                  </span>
                                </div>
                                {appt.status === "completada" && (appt.clients?.phone || appt.client_phone) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewModalAppt(appt);
                                    }}
                                    className="mt-1.5 w-full flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] transition border border-amber-500/20"
                                    title="Pedir reseña en Google al cliente"
                                  >
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                    <span>Pedir Reseña ⭐</span>
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            + Libre
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISTA 2: LISTA CRONOLÓGICA DETALLADA */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              Cargando citas del día...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No hay citas programadas para este día. Añade la primera con el botón superior.
            </div>
          ) : (
            appointments.map((appt) => {
              const dateObj = new Date(appt.starts_at);
              const hora = dateObj.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isPaid = appt.status === "completada";

              return (
                <div
                  key={appt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 text-center">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                        {hora}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {appt.services?.duration_minutes || 30} min
                      </span>
                    </div>

                    <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800" />

                    <div>
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{appt.clients?.full_name || "Cliente"}</span>
                        {appt.barber_staff && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
                            style={{ backgroundColor: appt.barber_staff.avatar_color || "#4f46e5" }}
                          >
                            {appt.barber_staff.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{appt.services?.name || "Corte"}</span>
                        <span>·</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {appt.total_price || (appt.services && appt.services.price)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Botón WhatsApp Recordatorio */}
                    {appt.clients?.phone && (
                      <a
                        href={getWhatsAppReminderUrl(appt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl transition"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>
                    )}

                    {/* Botón Cobrar / Completar */}
                    {!isPaid ? (
                      <button
                        onClick={() => setPaymentModalAppt(appt)}
                        className="flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                      >
                        <Euro className="w-3.5 h-3.5" />
                        <span>Cobrar</span>
                      </button>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                          Cobrado ({appt.payment_method || "efectivo"})
                        </span>
                        {(appt.clients?.phone || appt.client_phone) && (
                          <button
                            type="button"
                            onClick={() => setReviewModalAppt(appt)}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold transition"
                            title="Pedir reseña de Google al cliente por WhatsApp"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Pedir Reseña ⭐</span>
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(appt.id, "no_vino")}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg text-xs"
                      title="Marcar como No-Show"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL DE COBRO (Bizum, Efectivo, Tarjeta) */}
      {paymentModalAppt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Euro className="w-4 h-4 text-emerald-500" />
                Cobro de la Cita
              </h2>
              <button
                onClick={() => setPaymentModalAppt(null)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-zinc-500">
                {paymentModalAppt.clients?.full_name} · {paymentModalAppt.services?.name}
              </div>
              {selectedPaymentMethod === "gratis_fidelidad" ? (
                <div className="mt-1">
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    0 € <span className="text-xs font-bold uppercase tracking-wider text-amber-500 ml-1">¡GRATIS!</span>
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    🎁 Premio fidelización: 10ª visita gratis aplicada
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                  {Number(paymentModalAppt.total_price || (paymentModalAppt.services && paymentModalAppt.services.price)) + Number(tipAmount || 0)} €
                </div>
              )}
            </div>

            {/* Selector de Método de Pago */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Elige cómo paga el cliente:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("bizum")}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "bizum"
                      ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold ring-1 ring-cyan-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-cyan-500" />
                  <span className="text-[11px] block">Bizum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("efectivo")}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "efectivo"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <span className="text-[11px] block">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("tarjeta")}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "tarjeta"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                  <span className="text-[11px] block">Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("gratis_fidelidad")}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "gratis_fidelidad"
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                  title="Aplicar premio de fidelización: 10 visitas = 1 gratis"
                >
                  <Gift className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <span className="text-[11px] block">Fidelidad</span>
                </button>
              </div>
            </div>

            {/* Propina opcional */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Propina para el barbero (opcional):
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTipAmount(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      tipAmount === val
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                    }`}
                  >
                    {val === 0 ? "0€" : `+${val}€`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Cobro y Cerrar</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE AÑADIR CITA MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Añadir Cita Telefónica / Presencial
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualAppt} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  required
                  placeholder="Ej. Juan Gómez"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Teléfono Móvil (opcional)
                </label>
                <input
                  placeholder="612 345 678"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Barbero / Sillón
                  </label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600 font-medium"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.role || "Barbero"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Servicio(s)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {services.map((s) => {
                    const checked = newServiceIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewServiceIds((prev) => [...prev, s.id]);
                              } else {
                                setNewServiceIds((prev) => prev.filter((id) => id !== s.id));
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{s.name}</span>
                        </div>
                        <span className="font-bold">{s.price} €</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingAppt || !newClientName.trim() || newServiceIds.length === 0}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
                >
                  {creatingAppt ? "Guardando..." : "Guardar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA PEDIR RESEÑA EN GOOGLE POR WHATSAPP */}
      {reviewModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    ¡Cita completada! ⭐
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Pide una reseña en Google a {reviewModalAppt.clients?.full_name || "tu cliente"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalAppt(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso si no tiene enlace de Google configurado */}
            {!barber?.google_review_url && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-semibold">Aún no has configurado tu enlace de Google</p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Puedes configurarlo en <a href="/dashboard/ajustes" className="underline font-bold">Ajustes &gt; Reseñas de Google</a> para personalizar tu enlace directo.
                  </p>
                </div>
              </div>
            )}

            {/* Vista previa del mensaje */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Mensaje listo para enviar:
              </label>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl rounded-tl-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {getReviewMessageText(reviewModalAppt)}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppReviewUrl(reviewModalAppt)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => setReviewModalAppt(null), 1000);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar mensaje por WhatsApp</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = getReviewMessageText(reviewModalAppt);
                    navigator.clipboard.writeText(text);
                    setCopiedReviewText(true);
                    setTimeout(() => setCopiedReviewText(false), 2500);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  {copiedReviewText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <span>Copiar texto</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewModalAppt(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
