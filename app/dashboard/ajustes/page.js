"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Store,
  Clock,
  MapPin,
  Phone,
  AtSign,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  Award,
  Gift,
  CalendarCheck,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";

const DIAS_LABORABLES = [
  { id: 1, label: "Lunes", short: "L" },
  { id: 2, label: "Martes", short: "M" },
  { id: 3, label: "Miércoles", short: "X" },
  { id: 4, label: "Jueves", short: "J" },
  { id: 5, label: "Viernes", short: "V" },
  { id: 6, label: "Sábado", short: "S" },
  { id: 0, label: "Domingo", short: "D" },
];

const TIME_PRESETS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00"
];

export default function AjustesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSavedSuccess, setScheduleSavedSuccess] = useState(false);
  const [barber, setBarber] = useState(null);

  // Campos de formulario
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("barberia");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Madrid");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");

  // Horario comercial
  const [openingMorning, setOpeningMorning] = useState("10:00");
  const [closingMorning, setClosingMorning] = useState("14:00");
  const [hasSiesta, setHasSiesta] = useState(true);
  const [openingAfternoon, setOpeningAfternoon] = useState("16:30");
  const [closingAfternoon, setClosingAfternoon] = useState("20:30");
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5, 6]);
  const [slotInterval, setSlotInterval] = useState(30);

  // Programa de Fidelización
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [loyaltyVisitsNeeded, setLoyaltyVisitsNeeded] = useState(10);
  const [loyaltyRewardText, setLoyaltyRewardText] = useState("Corte o servicio gratis");

  // Carga inicial y combinación con copias locales para persistencia absoluta
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await supabase.auth.getUser();
      const user = authRes?.data?.user;

      const targetUserId = user?.id || "barber-demo-1";

      const { data } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();

      let localBackup = null;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("barber_settings_backup");
          if (raw) localBackup = JSON.parse(raw);
        } catch (e) {
          // ignore
        }
      }

      // Fusionar datos de Supabase con localBackup dando prioridad a los ajustes guardados más recientes
      const mergedBarber = {
        ...(data || {}),
        ...(localBackup || {}),
      };

      if (mergedBarber && (mergedBarber.id || mergedBarber.business_name)) {
        setBarber(mergedBarber);
        setBusinessName(mergedBarber.business_name || "Mi Salón");
        setBusinessType(mergedBarber.business_type || "barberia");
        setSlug(mergedBarber.slug || "mi-salon");
        setPhone(mergedBarber.phone || "+34 600 000 000");
        setCity(mergedBarber.city || "Madrid");
        setAddress(mergedBarber.address || "");
        setInstagram(mergedBarber.instagram || "");
        setOpeningMorning(mergedBarber.opening_time_morning || "10:00");
        setClosingMorning(mergedBarber.closing_time_morning || "14:00");
        setHasSiesta(mergedBarber.has_siesta !== false);
        setOpeningAfternoon(mergedBarber.opening_time_afternoon || "16:30");
        setClosingAfternoon(mergedBarber.closing_time_afternoon || "20:30");

        const loadedDays = Array.isArray(localBackup?.work_days)
          ? localBackup.work_days
          : Array.isArray(mergedBarber.work_days)
          ? mergedBarber.work_days
          : [1, 2, 3, 4, 5, 6];
        setWorkDays(loadedDays);

        setSlotInterval(mergedBarber.slot_interval || 30);
        setLoyaltyEnabled(mergedBarber.loyalty_enabled !== false);
        setLoyaltyVisitsNeeded(mergedBarber.loyalty_visits_needed || 10);
        setLoyaltyRewardText(mergedBarber.loyalty_reward_text || "Corte o servicio gratis");
      } else {
        const fallbackName = user?.email?.split("@")[0] || "Mi Negocio";
        const fallbackSlug = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        setBarber({ id: targetUserId });
        setBusinessName(fallbackName);
        setSlug(fallbackSlug);
      }
    } catch (err) {
      console.error("Error cargando barbero:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Guardado directo e instantáneo de horarios y días
  async function saveScheduleSettings(overrides = {}) {
    setScheduleSaving(true);
    setScheduleSavedSuccess(false);

    try {
      const authRes = await supabase.auth.getUser();
      const user = authRes?.data?.user;
      const targetId = barber?.id || user?.id || "barber-demo-1";

      const nextWorkDays = overrides.work_days ?? workDays;
      const nextMorningStart = overrides.opening_time_morning ?? openingMorning;
      const nextMorningEnd = overrides.closing_time_morning ?? closingMorning;
      const nextHasSiesta = overrides.has_siesta ?? hasSiesta;
      const nextAfternoonStart = overrides.opening_time_afternoon ?? openingAfternoon;
      const nextAfternoonEnd = overrides.closing_time_afternoon ?? closingAfternoon;
      const nextInterval = overrides.slot_interval ?? slotInterval;

      const schedulePayload = {
        ...(barber || {}),
        id: targetId,
        business_name: businessName || barber?.business_name || "Mi Negocio",
        slug: slug || barber?.slug || "mi-negocio",
        phone: phone || barber?.phone || "+34 600 000 000",
        city: city || barber?.city || "Madrid",
        work_days: nextWorkDays,
        opening_time_morning: nextMorningStart,
        closing_time_morning: nextMorningEnd,
        has_siesta: Boolean(nextHasSiesta),
        opening_time_afternoon: nextAfternoonStart,
        closing_time_afternoon: nextAfternoonEnd,
        slot_interval: Number(nextInterval) || 30,
      };

      setBarber((prev) => ({ ...(prev || {}), ...schedulePayload }));

      // Guardar en localStorage inmediatamente
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("barber_settings_backup", JSON.stringify(schedulePayload));
        } catch (e) {
          // ignore
        }
      }

      // Guardar en base de datos Supabase / MockStore
      await supabase.from("barbers").upsert(schedulePayload);

      // Notificar a toda la app del cambio
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("barber_updated", { detail: schedulePayload }));
      }

      setScheduleSavedSuccess(true);
      setTimeout(() => setScheduleSavedSuccess(false), 3000);
    } catch (err) {
      console.warn("Aviso al guardar horario:", err);
    } finally {
      setScheduleSaving(false);
    }
  }

  // Alternar día laborable con guardado instantáneo
  async function toggleDay(dayId) {
    const nextDays = workDays.includes(dayId)
      ? workDays.filter((d) => d !== dayId)
      : [...workDays, dayId].sort((a, b) => a - b);

    setWorkDays(nextDays);
    await saveScheduleSettings({ work_days: nextDays });
  }

  // Alternar pausa de mediodía con guardado instantáneo
  async function handleToggleSiesta(checked) {
    setHasSiesta(checked);
    await saveScheduleSettings({ has_siesta: checked });
  }

  // Guardar formulario completo
  async function handleSave(e) {
    e.preventDefault();
    setSavedSuccess(false);
    setSaveError("");

    const authRes = await supabase.auth.getUser();
    const user = authRes?.data?.user;
    const targetId = barber?.id || user?.id || "barber-demo-1";

    setSaving(true);

    let cleanPhone = (phone.trim() || "+34 600 000 000");
    if (/^[6789]\d{8}$/.test(cleanPhone.replace(/\s+/g, ""))) {
      cleanPhone = `+34 ${cleanPhone.replace(/\s+/g, "")}`;
    }

    const cleanSlug = (slug.trim() || businessName.trim() || "negocio")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const cleanWorkDays = Array.isArray(workDays) ? workDays : [1, 2, 3, 4, 5, 6];

    const fullPayload = {
      id: targetId,
      business_name: businessName.trim() || "Mi Salón",
      business_type: businessType || "barberia",
      slug: cleanSlug,
      phone: cleanPhone,
      city: city.trim() || "Madrid",
      address: address.trim(),
      instagram: instagram.trim(),
      opening_time_morning: openingMorning || "10:00",
      closing_time_morning: closingMorning || "14:00",
      has_siesta: Boolean(hasSiesta),
      opening_time_afternoon: openingAfternoon || "16:30",
      closing_time_afternoon: closingAfternoon || "20:30",
      work_days: cleanWorkDays,
      slot_interval: Number(slotInterval) || 30,
      loyalty_enabled: Boolean(loyaltyEnabled),
      loyalty_visits_needed: Number(loyaltyVisitsNeeded) || 10,
      loyalty_reward_text: loyaltyRewardText.trim() || "Corte o servicio gratis",
    };

    try {
      const { error } = await supabase.from("barbers").upsert(fullPayload);

      if (error && (error.code === "23505" || error.message?.includes("unique"))) {
        throw new Error(`El enlace público "/${cleanSlug}" ya está en uso. Elige otro diferente.`);
      }

      setBarber((prev) => ({ ...(prev || {}), ...fullPayload }));

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("barber_settings_backup", JSON.stringify(fullPayload));
        } catch (e) {
          // ignore
        }
        window.dispatchEvent(new CustomEvent("barber_updated", { detail: fullPayload }));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || "Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const safeWorkDays = Array.isArray(workDays) ? workDays : [1, 2, 3, 4, 5, 6];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Ajustes del Salón & Horarios
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configura los días que abres, tus horarios de trabajo, datos de contacto y fidelización.
          </p>
        </div>

        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl text-xs transition border border-indigo-200 dark:border-indigo-800"
          >
            <span>Ver mi página de reservas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECCIÓN 1: HORARIOS Y DÍAS DE APERTURA (PRIORITARIO) */}
        <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Horario de Trabajo y Días de Apertura
                </h2>
                <p className="text-xs text-zinc-500">
                  Cualquier cambio de día u hora se guarda y actualiza tu web al momento.
                </p>
              </div>
            </div>

            {/* Notificación de guardado instantáneo */}
            <div className="flex items-center gap-2">
              {scheduleSavedSuccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold animate-pulse">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Guardado al instante
                </span>
              )}
              <button
                type="button"
                onClick={() => saveScheduleSettings()}
                disabled={scheduleSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{scheduleSaving ? "Guardando..." : "Guardar Horario"}</span>
              </button>
            </div>
          </div>

          {/* DÍAS LABORABLES (Activar / Desactivar días libres) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Días de apertura (Toca un día para abrirlo o cerrarlo)
              </label>
              <span className="text-xs text-zinc-500">
                {safeWorkDays.length} días abiertos por semana
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {DIAS_LABORABLES.map((d) => {
                const active = safeWorkDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm ring-2 ring-indigo-500/20"
                        : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 opacity-60"
                    }`}
                  >
                    <span className="text-xs font-bold">{d.label}</span>
                    <span
                      className={`text-[10px] mt-1 font-medium px-2 py-0.5 rounded-md ${
                        active
                          ? "bg-emerald-500/20 text-emerald-300 dark:text-emerald-700"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                      }`}
                    >
                      {active ? "Abierto" : "Cerrado"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              💡 Los días marcados como <strong>Cerrado</strong> aparecerán bloqueados en tu página pública para que ningún cliente reserve en tu día de descanso.
            </p>
          </div>

          {/* TIPO DE HORARIO: PARTIDO CON SIESTA vs JORNADA CONTINUA */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 mb-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Pausa a mediodía / Turno partido (Mañana y Tarde)
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Desactívalo si trabajas de forma continuada de un tirón (ej. de 09:00 a 21:00 sin cerrar).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hasSiesta}
                  onChange={(e) => handleToggleSiesta(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>

            {/* CASO 1: HORARIO CONTINUO (SIN SIESTA) */}
            {!hasSiesta && (
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Jornada Continua (Sin descanso a mediodía)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Hora de Apertura
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={openingMorning}
                        onChange={(e) => {
                          setOpeningMorning(e.target.value);
                          saveScheduleSettings({ opening_time_morning: e.target.value });
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                      />
                      <select
                        value={openingMorning}
                        onChange={(e) => {
                          setOpeningMorning(e.target.value);
                          saveScheduleSettings({ opening_time_morning: e.target.value });
                        }}
                        className="py-2 px-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium outline-none"
                      >
                        {TIME_PRESETS.map((t) => (
                          <option key={`c-open-${t}`} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Hora de Cierre
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={closingAfternoon || closingMorning || "20:30"}
                        onChange={(e) => {
                          setClosingAfternoon(e.target.value);
                          setClosingMorning(e.target.value);
                          saveScheduleSettings({
                            closing_time_afternoon: e.target.value,
                            closing_time_morning: e.target.value,
                          });
                        }}
                        className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                      />
                      <select
                        value={closingAfternoon || closingMorning || "20:30"}
                        onChange={(e) => {
                          setClosingAfternoon(e.target.value);
                          setClosingMorning(e.target.value);
                          saveScheduleSettings({
                            closing_time_afternoon: e.target.value,
                            closing_time_morning: e.target.value,
                          });
                        }}
                        className="py-2 px-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium outline-none"
                      >
                        {TIME_PRESETS.map((t) => (
                          <option key={`c-close-${t}`} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 2: TURNO PARTIDO CON SIESTA / DESCANSO */}
            {hasSiesta && (
              <div className="space-y-4">
                {/* Turno Mañana */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" />
                    Turno de Mañana
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Apertura Mañana
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={openingMorning}
                          onChange={(e) => {
                            setOpeningMorning(e.target.value);
                            saveScheduleSettings({ opening_time_morning: e.target.value });
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                        />
                        <select
                          value={openingMorning}
                          onChange={(e) => {
                            setOpeningMorning(e.target.value);
                            saveScheduleSettings({ opening_time_morning: e.target.value });
                          }}
                          className="py-2 px-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                        >
                          {TIME_PRESETS.map((t) => (
                            <option key={`m-open-${t}`} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Cierre Mañana (Inicio pausa mediodía)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={closingMorning}
                          onChange={(e) => {
                            setClosingMorning(e.target.value);
                            saveScheduleSettings({ closing_time_morning: e.target.value });
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                        />
                        <select
                          value={closingMorning}
                          onChange={(e) => {
                            setClosingMorning(e.target.value);
                            saveScheduleSettings({ closing_time_morning: e.target.value });
                          }}
                          className="py-2 px-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                        >
                          {TIME_PRESETS.map((t) => (
                            <option key={`m-close-${t}`} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turno Tarde */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Moon className="w-4 h-4" />
                    Turno de Tarde
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Apertura Tarde
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={openingAfternoon}
                          onChange={(e) => {
                            setOpeningAfternoon(e.target.value);
                            saveScheduleSettings({ opening_time_afternoon: e.target.value });
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                        />
                        <select
                          value={openingAfternoon}
                          onChange={(e) => {
                            setOpeningAfternoon(e.target.value);
                            saveScheduleSettings({ opening_time_afternoon: e.target.value });
                          }}
                          className="py-2 px-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                        >
                          {TIME_PRESETS.map((t) => (
                            <option key={`a-open-${t}`} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Cierre Tarde
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={closingAfternoon}
                          onChange={(e) => {
                            setClosingAfternoon(e.target.value);
                            saveScheduleSettings({ closing_time_afternoon: e.target.value });
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold outline-none focus:border-indigo-600"
                        />
                        <select
                          value={closingAfternoon}
                          onChange={(e) => {
                            setClosingAfternoon(e.target.value);
                            saveScheduleSettings({ closing_time_afternoon: e.target.value });
                          }}
                          className="py-2 px-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                        >
                          {TIME_PRESETS.map((t) => (
                            <option key={`a-close-${t}`} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Intervalo de citas */}
            <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Intervalo base entre turnos
                </label>
                <p className="text-[11px] text-zinc-500">
                  Separación por defecto entre horas disponibles (ej. citas cada 30 min).
                </p>
              </div>
              <select
                value={slotInterval}
                onChange={(e) => {
                  setSlotInterval(e.target.value);
                  saveScheduleSettings({ slot_interval: e.target.value });
                }}
                className="w-56 py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold outline-none focus:border-indigo-600"
              >
                <option value="15">Cada 15 minutos</option>
                <option value="20">Cada 20 minutos</option>
                <option value="30">Cada 30 minutos (Recomendado)</option>
                <option value="45">Cada 45 minutos</option>
                <option value="60">Cada 60 minutos</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: INFORMACIÓN DEL SALÓN */}
        <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Store className="w-4 h-4 text-indigo-600" />
            Información del Salón & Contacto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nombre comercial del Salón
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Barbería El Corte Real"
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Tipo de Negocio
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              >
                <option value="barberia">Barbería / Peluquería Masculina</option>
                <option value="peluqueria">Peluquería Unisex / Salón</option>
                <option value="estetica">Centro de Estética & Belleza</option>
                <option value="spa">Spa & Masajes Wellness</option>
                <option value="ambos">Salón Completo (Peluquería + Estética + Spa)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Enlace público personalizado (URL)
              </label>
              <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden focus-within:border-indigo-600">
                <span className="text-xs text-zinc-400 pl-3 pr-1 select-none">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="mi-barberia"
                  className="w-full py-2 pr-3 bg-transparent text-sm outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Teléfono WhatsApp del Salón
              </label>
              <input
                type="tel"
                placeholder="+34 600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Ej. Madrid, Barcelona, Valencia..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Dirección física
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle Gran Vía 12, 28013 Madrid"
                  className="w-full py-2 pl-9 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Instagram
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@tunegocio"
                  className="w-full py-2 pl-9 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PROGRAMA DE FIDELIZACIÓN */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                Programa de Fidelización y Tarjeta de Sellos
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={loyaltyEnabled}
                onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <p className="text-xs text-zinc-500">
            Fideliza a tus clientes premiándoles tras acumular un número de visitas en tu negocio.
          </p>

          {loyaltyEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Número de visitas para premio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={loyaltyVisitsNeeded}
                    onChange={(e) => setLoyaltyVisitsNeeded(e.target.value)}
                    className="w-24 py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-center outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-zinc-500">visitas acumuladas</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Premio / Recompensa ofrecida
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={loyaltyRewardText}
                    onChange={(e) => setLoyaltyRewardText(e.target.value)}
                    placeholder="Ej. Corte clásico gratis, 50% dto., etc."
                    className="w-full py-2 pl-9 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón Guardar todos los cambios */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div>
            {savedSuccess && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Todos los cambios se han guardado con éxito!</span>
              </p>
            )}
            {saveError && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando todos los cambios..." : "Guardar todos los cambios"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
