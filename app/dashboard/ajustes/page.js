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

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setBarber(data);
        setBusinessName(data.business_name || "");
        setBusinessType(data.business_type || "barberia");
        setSlug(data.slug || "");
        setPhone(data.phone || "");
        setCity(data.city || "Madrid");
        setAddress(data.address || "");
        setInstagram(data.instagram || "");
        setOpeningMorning(data.opening_time_morning || "10:00");
        setClosingMorning(data.closing_time_morning || "14:00");
        setHasSiesta(data.has_siesta !== false);
        setOpeningAfternoon(data.opening_time_afternoon || "16:30");
        setClosingAfternoon(data.closing_time_afternoon || "20:30");
        setWorkDays(data.work_days || [1, 2, 3, 4, 5, 6]);
        setSlotInterval(data.slot_interval || 30);
      }
      setLoading(false);
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
    if (!barber) return;
    setSaving(true);
    setSavedSuccess(false);
    setSaveError("");

    const fullPayload = {
      business_name: businessName.trim(),
      business_type: businessType,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      instagram: instagram.trim(),
      opening_time_morning: openingMorning,
      closing_time_morning: closingMorning,
      has_siesta: hasSiesta,
      opening_time_afternoon: openingAfternoon,
      closing_time_afternoon: closingAfternoon,
      work_days: workDays,
      slot_interval: Number(slotInterval) || 30,
    };

    try {
      // 1. Try updating all fields
      let { error } = await supabase
        .from("barbers")
        .update(fullPayload)
        .eq("id", barber.id);

      // If Supabase returns an error (for example missing column in remote database),
      // fallback to the essential base columns guaranteed to exist
      if (error) {
        console.warn("Retrying update with essential columns due to error:", error.message);
        const essentialPayload = {
          business_name: businessName.trim(),
          business_type: businessType,
          slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          phone: phone.trim(),
          city: city.trim(),
        };
        const retryResult = await supabase
          .from("barbers")
          .update(essentialPayload)
          .eq("id", barber.id);
        
        if (retryResult.error) {
          throw new Error(retryResult.error.message || "Error al actualizar los datos en la base de datos.");
        }

        // Essential saved, let the user know full columns can be updated in Supabase
        setBarber((prev) => ({ ...prev, ...essentialPayload }));
        window.dispatchEvent(new Event("barber_updated"));
        setSavedSuccess(true);
        setSaveError("Datos principales guardados. Para guardar horarios personalizados y dirección, ejecuta la migración SQL en Supabase.");
        setTimeout(() => setSavedSuccess(false), 4000);
        return;
      }

      // Update local state and announce update to layout/header
      setBarber((prev) => ({ ...prev, ...fullPayload }));
      window.dispatchEvent(new Event("barber_updated"));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
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
