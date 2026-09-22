"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  Award,
  Gift,
} from "lucide-react";

const DIAS_LABORABLES = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

export default function AjustesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [barber, setBarber] = useState(null);

  // Campos de formulario
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("barberia");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Madrid");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");

  // Horario comercial español
  const [openingMorning, setOpeningMorning] = useState("10:00");
  const [closingMorning, setClosingMorning] = useState("14:00");
  const [hasSiesta, setHasSiesta] = useState(true);
  const [openingAfternoon, setOpeningAfternoon] = useState("16:30");
  const [closingAfternoon, setClosingAfternoon] = useState("20:30");
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5, 6]);
  const [slotInterval, setSlotInterval] = useState(30);

  // Programa de Fidelización (Tarjeta de sellos: Ej. 10 visitas = 1 gratis)
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [loyaltyVisitsNeeded, setLoyaltyVisitsNeeded] = useState(10);
  const [loyaltyRewardText, setLoyaltyRewardText] = useState("Corte o servicio gratis");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("barbers")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        let currentBarber = data;
        if (!currentBarber && typeof window !== "undefined") {
          try {
            const localBackup = localStorage.getItem("barber_settings_backup");
            if (localBackup) currentBarber = JSON.parse(localBackup);
          } catch (e) {
            // ignore
          }
        }

        if (currentBarber) {
          setBarber(currentBarber);
          setBusinessName(currentBarber.business_name || "");
          setBusinessType(currentBarber.business_type || "barberia");
          setSlug(currentBarber.slug || "");
          setPhone(currentBarber.phone || "");
          setCity(currentBarber.city || "Madrid");
          setAddress(currentBarber.address || "");
          setInstagram(currentBarber.instagram || "");
          setOpeningMorning(currentBarber.opening_time_morning || "10:00");
          setClosingMorning(currentBarber.closing_time_morning || "14:00");
          setHasSiesta(currentBarber.has_siesta !== false);
          setOpeningAfternoon(currentBarber.opening_time_afternoon || "16:30");
          setClosingAfternoon(currentBarber.closing_time_afternoon || "20:30");
          setWorkDays(Array.isArray(currentBarber.work_days) ? currentBarber.work_days : [1, 2, 3, 4, 5, 6]);
          setSlotInterval(currentBarber.slot_interval || 30);
          setLoyaltyEnabled(currentBarber.loyalty_enabled !== false);
          setLoyaltyVisitsNeeded(currentBarber.loyalty_visits_needed || 10);
          setLoyaltyRewardText(currentBarber.loyalty_reward_text || "Corte o servicio gratis");
        } else {
          // Si el barbero aún no existe en la tabla (ej. post-confirmación email)
          const fallbackName = user.user_metadata?.business_name || user.email?.split("@")[0] || "Mi Negocio";
          const fallbackSlug = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
          setBarber({ id: user.id });
          setBusinessName(fallbackName);
          setSlug(fallbackSlug);
        }
      } catch (err) {
        console.error("Error cargando barbero:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleDay(dayId) {
    if (workDays.includes(dayId)) {
      setWorkDays(workDays.filter((d) => d !== dayId));
    } else {
      setWorkDays([...workDays, dayId].sort());
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSavedSuccess(false);
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetId = barber?.id || user?.id;

    if (!targetId) {
      setSaveError("No se ha detectado usuario activo. Por favor vuelve a iniciar sesión.");
      return;
    }

    if (!businessName.trim()) {
      setSaveError("Por favor introduce el Nombre comercial.");
      return;
    }

    if (!slug.trim()) {
      setSaveError("Por favor introduce el enlace público (URL).");
      return;
    }

    if (!phone.trim()) {
      setSaveError("Por favor introduce el teléfono de WhatsApp.");
      return;
    }

    if (!city.trim()) {
      setSaveError("Por favor introduce la ciudad.");
      return;
    }

    setSaving(true);

    let cleanPhone = phone.trim();
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
      business_name: businessName.trim(),
      business_type: businessType || "barberia",
      slug: cleanSlug,
      phone: cleanPhone,
      city: city.trim(),
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
      // 1. Usar UPSERT para insertar si no existe o actualizar si ya existe
      let { error } = await supabase
        .from("barbers")
        .upsert(fullPayload);

      // Si da error de columna no existente o duplicidad de slug:
      if (error) {
        console.warn("Retrying upsert with essential columns due to error:", error.message);
        if (error.code === "23505" || error.message?.includes("unique")) {
          throw new Error(`El enlace público "/${cleanSlug}" ya está en uso. Por favor escribe otro diferente.`);
        }

        const essentialPayload = {
          id: targetId,
          business_name: businessName.trim(),
          business_type: businessType || "barberia",
          slug: cleanSlug,
          phone: cleanPhone,
          city: city.trim(),
        };

        const retryResult = await supabase
          .from("barbers")
          .upsert(essentialPayload);
        
        if (retryResult.error) {
          throw new Error(retryResult.error.message || "Error al guardar los datos en Supabase.");
        }

        setBarber((prev) => ({ ...(prev || {}), ...essentialPayload }));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("barber_settings_backup", JSON.stringify(fullPayload));
          } catch (e) {
            // ignore
          }
        }
        window.dispatchEvent(new CustomEvent("barber_updated", { detail: fullPayload }));
        setSavedSuccess(true);
        setSaveError("Datos principales guardados con éxito.");
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setBarber((prev) => ({ ...(prev || {}), ...fullPayload }));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("barber_settings_backup", JSON.stringify(fullPayload));
          } catch (e) {
            // ignore
          }
        }
        window.dispatchEvent(new CustomEvent("barber_updated", { detail: fullPayload }));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }

      // Auto-asegurar al menos un personal y un servicio para que la reserva pública funcione de inmediato
      try {
        const { data: existingStaff } = await supabase
          .from("barber_staff")
          .select("id")
          .eq("barber_id", targetId)
          .limit(1);

        if (!existingStaff || existingStaff.length === 0) {
          await supabase.from("barber_staff").insert({
            barber_id: targetId,
            name: businessName.split(" ")[0] || "Profesional 1",
            role: businessType === "estetica" ? "Esteticista" : businessType === "spa" ? "Terapeuta" : "Barbero Principal",
            avatar_color: "#4f46e5",
            phone: cleanPhone,
            active: true,
          });
        }

        const { data: existingServices } = await supabase
          .from("services")
          .select("id")
          .eq("barber_id", targetId)
          .limit(1);

        if (!existingServices || existingServices.length === 0) {
          await supabase.from("services").insert({
            barber_id: targetId,
            name: businessType === "estetica" ? "Tratamiento Facial" : businessType === "spa" ? "Masaje Relajante" : "Corte Clásico",
            duration_minutes: 30,
            price: 15,
            active: true,
          });
        }
      } catch (provisionErr) {
        console.warn("Auto-provisión de staff/servicio finalizada:", provisionErr);
      }

    } catch (err) {
      console.error("Error guardando configuración:", err);
      setSaveError(err.message || "No se pudieron guardar los cambios. Revisa tu conexión o permisos.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-zinc-500">
        Cargando configuración del negocio...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Configuración y Horarios
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Personaliza el perfil de tu barbería y tus turnos de apertura para los clientes en España.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>¡Cambios guardados con éxito!</span>
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sección: Datos del Negocio */}
        <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Store className="w-4 h-4 text-indigo-500" />
            Tipo y Perfil del Negocio
          </h2>

          {/* Selector de categoría */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Categoría del Centro
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "barberia", label: "💈 Barbería", sub: "Peluquería Masculina" },
                { id: "estetica", label: "✨ Estética", sub: "Faciales, Láser, Uñas" },
                { id: "spa", label: "🧖‍♀️ Spa & Relax", sub: "Masajes y Wellness" },
                { id: "mixto", label: "💖 Salón Mixto", sub: "Completo Belleza" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBusinessType(cat.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    businessType === cat.id
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-white ring-1 ring-indigo-600/30"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <p className="text-xs font-bold">{cat.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{cat.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nombre comercial *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Enlace público (URL) *
              </label>
              <div className="flex items-center">
                <span className="py-2 px-2.5 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-300 dark:border-zinc-700 rounded-l-xl text-xs text-zinc-500 font-mono">
                  /
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full py-2 px-3 rounded-r-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Teléfono de WhatsApp (España) *
              </label>
              <input
                type="text"
                required
                placeholder="+34 612 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Ciudad en España *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Madrid, Barcelona, Valencia..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Dirección física del local
              </label>
              <input
                type="text"
                placeholder="Ej. Calle Fuencarral 42, 28004 Madrid"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Instagram del negocio (opcional)
              </label>
              <input
                type="text"
                placeholder="@tu_barberia"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Sección: Horarios Comerciales y Pausa de Mediodía */}
        <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            Horario de Apertura y Turnos
          </h2>

          {/* Días laborables */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Días de apertura al público
            </label>
            <div className="flex gap-2 flex-wrap">
              {DIAS_LABORABLES.map((d) => {
                const active = workDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition border ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turno Mañana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Apertura Mañana
              </label>
              <input
                type="time"
                value={openingMorning}
                onChange={(e) => setOpeningMorning(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Cierre Mañana (Inicio descanso mediodía)
              </label>
              <input
                type="time"
                value={closingMorning}
                onChange={(e) => setClosingMorning(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Pausa de mediodía */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={hasSiesta}
                onChange={(e) => setHasSiesta(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Pausa de mediodía / Turno partido (Típico en España)
              </span>
            </label>

            {hasSiesta && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-indigo-200 dark:border-indigo-900">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Apertura Tarde
                  </label>
                  <input
                    type="time"
                    value={openingAfternoon}
                    onChange={(e) => setOpeningAfternoon(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Cierre Tarde
                  </label>
                  <input
                    type="time"
                    value={closingAfternoon}
                    onChange={(e) => setClosingAfternoon(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Intervalo de citas */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Intervalo base entre turnos (minutos)
            </label>
            <select
              value={slotInterval}
              onChange={(e) => setSlotInterval(e.target.value)}
              className="w-48 py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600"
            >
              <option value="15">Cada 15 minutos</option>
              <option value="20">Cada 20 minutos</option>
              <option value="30">Cada 30 minutos (Recomendado)</option>
              <option value="45">Cada 45 minutos</option>
              <option value="60">Cada 60 minutos</option>
            </select>
          </div>
        </div>

        {/* TARJETA DE FIDELIZACIÓN (RECOMPENSA TRAS N VISITAS) */}
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
            Fideliza a tus clientes premiándoles tras acumular un número de visitas en tu barbería (ej. a las 10 visitas, la siguiente es gratis o con descuento especial).
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
                <p className="text-[11px] text-zinc-400 mt-1">
                  Recomendado: 10 visitas = 1 corte o servicio gratis.
                </p>
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

        {/* Botón Guardar y estado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div>
            {savedSuccess && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>¡Cambios guardados correctamente!</span>
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar todos los cambios"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
