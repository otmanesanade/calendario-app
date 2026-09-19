"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import GlowfyLogo from "../../components/GlowfyLogo";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  CalendarPlus,
  MessageCircle,
  UserCheck,
  Check,
  ChevronRight,
  AlertCircle,
  Users,
  Sparkles,
} from "lucide-react";

// Días de la semana en español
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function PublicBookingPage() {
  const { slug } = useParams();
  const [barber, setBarber] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  // selectedStaffId: null means "Cualquier barbero disponible"
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  // selectedServiceIds: array of service IDs (Multi-Servicios)
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("Todos");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  // Generate next 14 calendar days
  const upcomingDays = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dayOfWeek = d.getDay(); // 0 = Domingo
      list.push({
        date: d,
        isoDate: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        dayName: i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS_SEMANA[dayOfWeek],
        monthName: MESES[d.getMonth()],
        dayOfWeek,
        isSunday: dayOfWeek === 0,
      });
    }
    return list;
  }, []);

  // Cargar datos del negocio, barberos (staff) y servicios
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: b } = await supabase
        .from("barbers")
        .select("*")
        .eq("slug", slug)
        .single();

      if (b) {
        setBarber(b);

        // Staff / Equipo de barberos
        const { data: stf } = await supabase
          .from("barber_staff")
          .select("*")
          .eq("barber_id", b.id)
          .eq("active", true);
        setStaffList(stf || []);

        // Servicios
        const { data: s } = await supabase
          .from("services")
          .select("*")
          .eq("barber_id", b.id)
          .eq("active", true)
          .order("price", { ascending: true });
        setServices(s || []);

        // Citas existentes para comprobación de disponibilidad
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, starts_at, ends_at, status, staff_id")
          .eq("barber_id", b.id);
        setExistingAppointments(appts || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Set default selected date
  useEffect(() => {
    if (!selectedDate && upcomingDays.length > 0) {
      const firstValid = upcomingDays.find((d) => !d.isSunday) || upcomingDays[0];
      setSelectedDate(firstValid);
    }
  }, [upcomingDays, selectedDate]);

  // Toggle servicio (Multi-Servicios)
  function toggleService(serviceId) {
    setSelectedSlot(null); // Reset slot al cambiar servicios
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  }

  // Servicios seleccionados calculados
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [selectedServices]);

  // Categorías de servicios disponibles
  const availableCategories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  const displayServices = useMemo(() => {
    if (serviceCategoryFilter === "Todos") return services;
    return services.filter(
      (s) => (s.category || "Peluquería").toLowerCase() === serviceCategoryFilter.toLowerCase()
    );
  }, [services, serviceCategoryFilter]);

  // Generación de slots considerando:
  // 1. Horario de España (mañana y tarde)
  // 2. Multi-Servicio: duración acumulada total
  // 3. Multi-Barbero: si eligió uno en concreto o "Cualquiera"
  const slotsGrouped = useMemo(() => {
    if (!barber || !selectedDate || totalDuration === 0) {
      return { manana: [], tarde: [], closed: false };
    }

    const workDays = barber.work_days || [1, 2, 3, 4, 5, 6];
    if (!workDays.includes(selectedDate.dayOfWeek)) {
      return { manana: [], tarde: [], closed: true };
    }

    const interval = barber.slot_interval || 30; // minutos base de salto
    const morningStart = barber.opening_time_morning || "10:00";
    const morningEnd = barber.closing_time_morning || "14:00";
    const afternoonStart = barber.opening_time_afternoon || "16:30";
    const afternoonEnd = barber.closing_time_afternoon || "20:30";
    const hasSiesta = barber.has_siesta !== false;

    function parseTime(str) {
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    }

    function formatTime(mins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    function generateRange(startMins, endMins) {
      const list = [];
      for (let t = startMins; t + totalDuration <= endMins; t += interval) {
        list.push(formatTime(t));
      }
      return list;
    }

    const morningSlots = generateRange(parseTime(morningStart), parseTime(morningEnd));
    const afternoonSlots = hasSiesta
      ? generateRange(parseTime(afternoonStart), parseTime(afternoonEnd))
      : [];

    const now = new Date();
    const isToday =
      selectedDate.date.getDate() === now.getDate() &&
      selectedDate.date.getMonth() === now.getMonth() &&
      selectedDate.date.getFullYear() === now.getFullYear();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Comprobar disponibilidad de un slot
    function checkSlot(slotStr) {
      const [sh, sm] = slotStr.split(":").map(Number);
      const slotMins = sh * 60 + sm;

      // 1. Hora ya pasada hoy
      if (isToday && slotMins <= currentMins + 15) {
        return { slot: slotStr, available: false, reason: "pasado", assignedStaff: null };
      }

      const slotStartTime = new Date(
        selectedDate.date.getFullYear(),
        selectedDate.date.getMonth(),
        selectedDate.date.getDate(),
        sh,
        sm
      ).getTime();
      const slotEndTime = slotStartTime + totalDuration * 60000;

      // Helper para ver si un barbero concreto está libre en este tramo
      function isBarberFree(staffId) {
        const hasConflict = existingAppointments.some((appt) => {
          if (appt.status === "cancelada") return false;
          // Si la cita no tiene staff_id o tiene este staff_id
          if (appt.staff_id && appt.staff_id !== staffId) return false;
          const apptStart = new Date(appt.starts_at).getTime();
          const apptEnd = new Date(appt.ends_at).getTime();
          return slotStartTime < apptEnd && slotEndTime > apptStart;
        });
        return !hasConflict;
      }

      // Si el cliente seleccionó un barbero específico
      if (selectedStaffId) {
        const free = isBarberFree(selectedStaffId);
        return {
          slot: slotStr,
          available: free,
          reason: free ? "libre" : "ocupado",
          assignedStaffId: selectedStaffId,
        };
      }

      // Si seleccionó "Cualquier barbero disponible":
      // Está disponible si AL MENOS UN barbero del equipo está libre
      const availableStaff = staffList.filter((st) => isBarberFree(st.id));
      if (availableStaff.length > 0) {
        return {
          slot: slotStr,
          available: true,
          reason: "libre",
          assignedStaffId: availableStaff[0].id, // Asigna al primer barbero libre
        };
      }

      return {
        slot: slotStr,
        available: false,
        reason: "ocupado",
        assignedStaffId: null,
      };
    }

    return {
      closed: false,
      manana: morningSlots.map(checkSlot),
      tarde: afternoonSlots.map(checkSlot),
    };
  }, [
    barber,
    selectedDate,
    totalDuration,
    selectedStaffId,
    existingAppointments,
    staffList,
  ]);

  async function handleConfirm(e) {
    e.preventDefault();
    if (selectedServices.length === 0 || !selectedSlot || !selectedDate || !name || !phone) {
      return;
    }

    setSubmitting(true);

    try {
      let cleanPhone = phone.trim().replace(/\s+/g, "");
      if (/^[6789]\d{8}$/.test(cleanPhone)) {
        cleanPhone = `+34 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
      }

      // 1. Crear o registrar cliente
      const { data: client } = await supabase
        .from("clients")
        .insert({
          barber_id: barber.id,
          full_name: name.trim(),
          phone: cleanPhone,
          notes: notes.trim() ? `Nota cliente: ${notes.trim()}` : null,
        })
        .select()
        .single();

      // 2. Calcular inicio y fin
      const [h, m] = selectedSlot.split(":").map(Number);
      const startsAt = new Date(
        selectedDate.date.getFullYear(),
        selectedDate.date.getMonth(),
        selectedDate.date.getDate(),
        h,
        m
      );
      const endsAt = new Date(startsAt.getTime() + totalDuration * 60000);

      // Determinar qué barbero atenderá
      let finalStaffId = selectedStaffId;
      if (!finalStaffId) {
        // Encontrar barbero disponible para ese slot
        const allSlots = [...slotsGrouped.manana, ...slotsGrouped.tarde];
        const match = allSlots.find((s) => s.slot === selectedSlot);
        finalStaffId = match?.assignedStaffId || (staffList[0] && staffList[0].id) || null;
      }

      const assignedStaff = staffList.find((s) => s.id === finalStaffId) || null;

      // Nombres de los servicios concatenados (Multi-Servicios)
      const serviceNames = selectedServices.map((s) => s.name).join(" + ");

      // 3. Crear cita con Multi-Servicio, Barbero y Precio Total
      await supabase.from("appointments").insert({
        barber_id: barber.id,
        client_id: client?.id,
        service_id: selectedServices[0]?.id,
        staff_id: finalStaffId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "confirmada",
        total_price: totalPrice,
        total_duration: totalDuration,
        payment_status: "pendiente",
      });

      setConfirmedData({
        clientName: name,
        clientPhone: cleanPhone,
        services: selectedServices,
        serviceNames,
        totalPrice,
        totalDuration,
        staff: assignedStaff,
        date: selectedDate,
        slot: selectedSlot,
        startsAt,
        endsAt,
      });
    } catch (err) {
      console.error("Error al confirmar cita:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Generar enlace directo de WhatsApp con mensaje formal en español
  function getWhatsAppUrl() {
    if (!confirmedData || !barber) return "#";
    const barberPhone = (barber.phone || "+34 612 345 678").replace(/[^0-9]/g, "");
    const dateFormatted = confirmedData.startsAt.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const msg = `¡Hola ${barber.business_name}! 👋 Acabo de reservar cita por vuestra web:
✂️ Servicios: ${confirmedData.serviceNames} (${confirmedData.totalPrice}€)
⏱️ Duración: ${confirmedData.totalDuration} min
💈 Barbero: ${confirmedData.staff ? confirmedData.staff.name : "Primer barbero libre"}
📅 Fecha: ${dateFormatted}
⏰ Hora: ${confirmedData.slot} h
👤 Cliente: ${confirmedData.clientName} (${confirmedData.clientPhone})
${notes ? `📝 Nota: ${notes}\n` : ""}¡Muchas gracias!`;

    return `https://wa.me/${barberPhone}?text=${encodeURIComponent(msg)}`;
  }

  // Generar enlace de Google Calendar
  function getGoogleCalendarUrl() {
    if (!confirmedData || !barber) return "#";
    const title = `${confirmedData.serviceNames} en ${barber.business_name}`;
    const desc = `Cita de barbería en ${barber.business_name} con ${confirmedData.staff ? confirmedData.staff.name : "tu barbero"}. Total: ${confirmedData.totalPrice}€`;
    const loc = `${barber.business_name}, ${barber.address || barber.city || "España"}`;

    const toGCalTime = (d) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const start = toGCalTime(confirmedData.startsAt);
    const end = toGCalTime(confirmedData.endsAt);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${start}/${end}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(
      loc
    )}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Cargando agenda de la barbería...</p>
        </div>
      </main>
    );
  }

  if (!barber) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Barbería no encontrada</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            El enlace solicitado no corresponde a ninguna barbería activa.
          </p>
        </div>
      </main>
    );
  }

  // Pantalla de Confirmación de Cita con WhatsApp
  if (confirmedData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
            ¡Cita Reservada con Éxito!
          </span>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Te esperamos, {confirmedData.clientName}
          </h1>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Tu cita en <strong className="text-zinc-900 dark:text-white">{barber.business_name}</strong> ha quedado registrada en la agenda del equipo.
          </p>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 text-left text-sm space-y-2.5 mb-6 border border-zinc-100 dark:border-zinc-700/50">
            {confirmedData.staff && (
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> Barbero
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: confirmedData.staff.avatar_color || "#4f46e5" }}
                  />
                  {confirmedData.staff.name}
                </span>
              </div>
            )}

            <div className="flex justify-between items-start pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 flex items-center gap-1.5 pt-0.5">
                <Scissors className="w-4 h-4" /> Servicios
              </span>
              <div className="text-right">
                <div className="font-semibold text-zinc-900 dark:text-white">
                  {confirmedData.serviceNames}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  {confirmedData.totalPrice} € · {confirmedData.totalDuration} min
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Fecha
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white capitalize">
                {confirmedData.startsAt.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Hora
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                {confirmedData.slot} h
              </span>
            </div>

            {barber.address && (
              <div className="flex justify-between items-start pt-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" /> Ubicación
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 text-right text-xs max-w-[200px]">
                  {barber.address}
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Abrir confirmación en WhatsApp</span>
            </a>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-medium text-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-indigo-600" />
              <span>Añadir a Google Calendar</span>
            </a>

            <button
              onClick={() => {
                setConfirmedData(null);
                setSelectedSlot(null);
                setSelectedServiceIds([]);
                setSelectedStaffId(null);
                setName("");
                setPhone("");
                setNotes("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 underline pt-2"
            >
              Reservar otra cita
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        {/* Cabecera de la Barbería */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3.5 flex items-center justify-center font-bold text-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md">
            {barber.business_name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {barber.business_name}
          </h1>

          {/* Badge de tipo de centro */}
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              {barber.business_type === "estetica"
                ? "✨ Centro de Estética & Belleza"
                : barber.business_type === "spa"
                ? "🧖‍♀️ Spa & Masajes Wellness"
                : barber.business_type === "mixto"
                ? "💖 Salón Completo (Peluquería, Estética & Spa)"
                : "💈 Barbería & Peluquería"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 flex-wrap">
            {barber.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {barber.address || barber.city}
              </span>
            )}
            {barber.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                {barber.phone}
              </span>
            )}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>
              {barber.opening_time_morning || "10:00"} - {barber.closing_time_morning || "14:00"}
              {barber.has_siesta !== false && ` y ${barber.opening_time_afternoon || "16:30"} - ${barber.closing_time_afternoon || "20:30"}`}
            </span>
          </div>
        </div>

        {/* PASO 1: Elegir Barbero (Multi-Barbero / Sillones) */}
        {staffList.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
                Elige profesional
              </h2>
              <span className="text-xs text-zinc-500">
                {selectedStaffId
                  ? staffList.find((s) => s.id === selectedStaffId)?.name
                  : "Cualquier barbero"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Opción Cualquier Barbero */}
              <button
                type="button"
                onClick={() => {
                  setSelectedStaffId(null);
                  setSelectedSlot(null);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedStaffId === null
                    ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 mx-auto flex items-center justify-center mb-1.5">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-semibold text-xs text-zinc-900 dark:text-white">
                  Cualquiera
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Más disponibilidad</div>
              </button>

              {/* Barberos individuales */}
              {staffList.map((st) => {
                const isSelected = selectedStaffId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(st.id);
                      setSelectedSlot(null);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xs mb-1.5 shadow-xs"
                      style={{ backgroundColor: st.avatar_color || "#4f46e5" }}
                    >
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                      {st.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                      {st.role || "Barbero"}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PASO 2: Elegir Servicios (MULTI-SERVICIOS: Selecciona uno o varios) */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                2
              </span>
              Elige los servicios
            </h2>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Puedes elegir varios
            </span>
          </div>

          {/* Filtros por Categoría si hay varias */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
              {["Todos", ...availableCategories].map((cat) => {
                const isSelected = serviceCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setServiceCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-2.5">
            {displayServices.map((s) => {
              const isSelected = selectedServiceIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex justify-between items-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {s.duration_minutes} min
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-zinc-900 dark:text-white">
                      {s.price} €
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"
                      }`}
                    >
                      {isSelected ? "Añadido" : "+ Añadir"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Resumen de Servicios Seleccionados */}
          {selectedServices.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-600 text-white rounded-xl flex items-center justify-between text-xs font-medium shadow-md shadow-indigo-600/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {selectedServices.length}{" "}
                  {selectedServices.length === 1 ? "servicio" : "servicios"} · {totalDuration} min
                </span>
              </div>
              <div className="text-sm font-bold">{totalPrice} €</div>
            </div>
          )}
        </section>

        {/* PASO 3: Elegir Fecha */}
        {selectedServices.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  3
                </span>
                Elige el día
              </h2>
              {selectedDate && (
                <span className="text-xs text-zinc-500 capitalize">
                  {selectedDate.date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {upcomingDays.map((item) => {
                const isSelected = selectedDate?.isoDate === item.isoDate;
                const isClosed = item.isSunday;

                return (
                  <button
                    key={item.isoDate}
                    disabled={isClosed}
                    onClick={() => {
                      setSelectedDate(item);
                      setSelectedSlot(null);
                    }}
                    className={`flex-shrink-0 w-16 py-3 px-1 rounded-xl border text-center transition-all ${
                      isClosed
                        ? "opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/40 border-dashed border-zinc-300 dark:border-zinc-700"
                        : isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`text-[11px] font-medium uppercase ${
                        isSelected ? "text-indigo-100" : "text-zinc-500"
                      }`}
                    >
                      {item.dayName}
                    </div>
                    <div
                      className={`text-lg font-bold my-0.5 ${
                        isSelected ? "text-white" : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {item.dayNum}
                    </div>
                    <div
                      className={`text-[10px] ${
                        isSelected ? "text-indigo-200" : "text-zinc-400"
                      }`}
                    >
                      {isClosed ? "Cerrado" : item.monthName}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PASO 4: Elegir Hora (Mañana y Tarde con duración acumulada) */}
        {selectedServices.length > 0 && selectedDate && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  4
                </span>
                Elige la hora ({totalDuration} min)
              </h2>
              {selectedSlot && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedSlot} h
                </span>
              )}
            </div>

            {slotsGrouped.closed ? (
              <div className="text-center py-6 text-zinc-500 text-sm">
                La barbería está cerrada este día. Por favor elige otra fecha.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Turno Mañana */}
                {slotsGrouped.manana.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Turno de Mañana ({barber.opening_time_morning || "10:00"} - {barber.closing_time_morning || "14:00"})
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slotsGrouped.manana.map(({ slot, available, reason }) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={!available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow"
                                : available
                                ? "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                                : "bg-zinc-100 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-600 border-transparent cursor-not-allowed line-through"
                            }`}
                            title={!available ? (reason === "ocupado" ? "Horario ocupado" : "Hora pasada") : `Reservar a las ${slot}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Turno Tarde */}
                {slotsGrouped.tarde.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Turno de Tarde ({barber.opening_time_afternoon || "16:30"} - {barber.closing_time_afternoon || "20:30"})
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slotsGrouped.tarde.map(({ slot, available, reason }) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            disabled={!available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow"
                                : available
                                ? "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                                : "bg-zinc-100 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-600 border-transparent cursor-not-allowed line-through"
                            }`}
                            title={!available ? (reason === "ocupado" ? "Horario ocupado" : "Hora pasada") : `Reservar a las ${slot}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* PASO 5: Datos del Cliente */}
        {selectedServices.length > 0 && selectedSlot && (
          <form
            onSubmit={handleConfirm}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                5
              </span>
              Tus datos de contacto
            </h2>

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre y Apellidos *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Martínez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Teléfono Móvil (WhatsApp) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-zinc-400 font-semibold">
                    🇪🇸 +34
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="612 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2.5 pl-16 pr-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Te avisaremos por WhatsApp para el recordatorio de la cita.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Observaciones o preferencias (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Degradado bajo con navaja, piel sensible..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            </div>

            {/* Resumen Final */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3.5 text-xs text-zinc-600 dark:text-zinc-300 mb-5 border border-zinc-200/60 dark:border-zinc-700 space-y-1">
              <div className="font-semibold text-zinc-900 dark:text-white">
                Resumen de tu reserva:
              </div>
              <div>
                <strong>{selectedServices.map((s) => s.name).join(" + ")}</strong> ({totalPrice} € · {totalDuration} min)
              </div>
              <div>
                {selectedDate.dayName} {selectedDate.dayNum} {selectedDate.monthName} a las{" "}
                <strong>{selectedSlot} h</strong>
                {selectedStaffId && (
                  <span> con <strong>{staffList.find((s) => s.id === selectedStaffId)?.name}</strong></span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim() || !phone.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirmando reserva...</span>
                </>
              ) : (
                <>
                  <span>Confirmar cita ({totalPrice} €)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Powered by Glowfy */}
        <div className="text-center mt-8 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-xs transition"
          >
            <span>Reservas gestionadas con</span>
            <GlowfyLogo size={18} className="rounded-md" />
            <strong className="text-indigo-600 dark:text-indigo-400">Glowfy</strong>
          </Link>
        </div>
      </div>
    </main>
  );
}
