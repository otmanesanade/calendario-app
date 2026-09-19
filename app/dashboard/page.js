"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
      .single();
    if (b) setBarber(b);

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
    loadData();
  }

  // Confirmar cobro con método de pago
  async function handleConfirmPayment() {
    if (!paymentModalAppt) return;
    await supabase
      .from("appointments")
      .update({
        status: "completada",
        payment_status: "pagado",
        payment_method: selectedPaymentMethod,
        tip_amount: Number(tipAmount) || 0,
      })
      .eq("id", paymentModalAppt.id);

    setPaymentModalAppt(null);
    setTipAmount(0);
    loadData();
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

    // 1. Cliente
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        barber_id: user.id,
        full_name: newClientName.trim(),
        phone: phoneClean || "Sin teléfono",
        notes: "Cita manual en el salón",
      })
      .select()
      .single();

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
      client_id: newClient?.id,
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

  // Lista de horas para el Timeline (10:00 hasta 20:30)
  const timelineHours = useMemo(() => {
    const hours = [];
    for (let h = 10; h <= 20; h++) {
      hours.push(`${String(h).padStart(2, "0")}:00`);
      hours.push(`${String(h).padStart(2, "0")}:30`);
    }
    return hours;
  }, []);

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
          <p className="text-xs text-zinc-500 mt-1">
            Revisa las citas organizadas por barbero, cobra por Bizum/Efectivo y añade citas manuales.
          </p>
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
            <span className="text-xs font-semibold px-3 text-zinc-900 dark:text-white capitalize min-w-[130px] text-center">
              {selectedDate.toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
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
            onClick={() => handleOpenSlot(null, "11:00")}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir Cita</span>
          </button>
        </div>
      </div>

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
                  onClick={() => handleOpenSlot(st.id, "11:00")}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-indigo-600 transition"
                  title={`Añadir cita a ${st.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Rejilla horaria con slots */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {timelineHours.map((hourStr) => {
              // Comprobar si esta hora cae en siesta (14:00 - 16:30)
              const [h, m] = hourStr.split(":").map(Number);
              const mins = h * 60 + m;
              const isSiesta = mins >= 14 * 60 && mins < 16 * 60 + 30;

              return (
                <div
                  key={hourStr}
                  className={`grid grid-cols-[70px_repeat(auto-fit,minmax(180px,1fr))] min-h-[56px] transition-colors ${
                    isSiesta ? "bg-amber-50/20 dark:bg-amber-950/10" : "hover:bg-zinc-50/40"
                  }`}
                >
                  {/* Etiqueta de la hora */}
                  <div className="p-2.5 text-center text-xs font-semibold text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 flex items-start justify-center">
                    {hourStr}
                  </div>

                  {/* Columnas para cada barbero en esta hora */}
                  {staffList.map((st) => {
                    // Buscar citas que empiezan en esta hora (o en el intervalo)
                    const slotAppts = appointments.filter((a) => {
                      if (a.staff_id !== st.id) return false;
                      const apptDate = new Date(a.starts_at);
                      const apptHour = String(apptDate.getHours()).padStart(2, "0");
                      const apptMin = String(apptDate.getMinutes()).padStart(2, "0");
                      const apptTime = `${apptHour}:${apptMin}`;
                      return apptTime === hourStr;
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
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                        Cobrado ({appt.payment_method || "efectivo"})
                      </span>
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
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {Number(paymentModalAppt.total_price || (paymentModalAppt.services && paymentModalAppt.services.price)) + Number(tipAmount || 0)} €
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Elige cómo paga el cliente:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("bizum")}
                  className={`p-3 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "bizum"
                      ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold ring-1 ring-cyan-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
                  <span className="text-xs block">Bizum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("efectivo")}
                  className={`p-3 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "efectivo"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold ring-1 ring-emerald-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <span className="text-xs block">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("tarjeta")}
                  className={`p-3 rounded-xl border text-center transition ${
                    selectedPaymentMethod === "tarjeta"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-600"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                  <span className="text-xs block">Tarjeta</span>
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
    </div>
  );
}
