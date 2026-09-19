"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Scissors,
  Plus,
  Clock,
  Trash2,
  Sparkles,
  X,
  Droplet,
  Heart,
  Tag,
} from "lucide-react";

const PRESETS_BY_CATEGORY = {
  barberia: [
    { name: "Corte clásico tijera/máquina", duration: 30, price: 18, category: "Peluquería" },
    { name: "Degradado / Skin Fade", duration: 40, price: 20, category: "Peluquería" },
    { name: "Arreglo de barba tradicional con toalla caliente", duration: 25, price: 14, category: "Peluquería" },
    { name: "Corte completo + Barba", duration: 50, price: 28, category: "Peluquería" },
    { name: "Lavado, peinado y fijación", duration: 15, price: 8, category: "Peluquería" },
  ],
  estetica: [
    { name: "Higiene facial profunda con punta de diamante", duration: 50, price: 35, category: "Estética" },
    { name: "Peeling iluminador con ácido glicólico", duration: 45, price: 45, category: "Estética" },
    { name: "Depilación láser diodo (zonas combinadas)", duration: 30, price: 40, category: "Estética" },
    { name: "Diseño y laminado de cejas", duration: 35, price: 25, category: "Estética" },
    { name: "Lifting y tinte de pestañas", duration: 45, price: 32, category: "Estética" },
  ],
  spa: [
    { name: "Masaje descontracturante de espalda y cuello", duration: 45, price: 40, category: "Spa & Masajes" },
    { name: "Masaje relajante con aceites esenciales", duration: 50, price: 45, category: "Spa & Masajes" },
    { name: "Drenaje linfático manual corporal", duration: 50, price: 42, category: "Spa & Masajes" },
    { name: "Ritual Spa sensorial cuerpo entero", duration: 75, price: 65, category: "Spa & Masajes" },
    { name: "Circuito Spa termal e hidroterapia", duration: 60, price: 30, category: "Spa & Masajes" },
  ],
  unas: [
    { name: "Manicura rusa y esmaltado semipermanente", duration: 45, price: 22, category: "Uñas" },
    { name: "Pedicura Spa completa con exfoliación", duration: 50, price: 32, category: "Uñas" },
    { name: "Uñas de gel / acrílico con extensión", duration: 75, price: 45, category: "Uñas" },
    { name: "Retirada de semipermanente y nutrición", duration: 25, price: 10, category: "Uñas" },
  ],
};

const CATEGORIES_LIST = [
  "Peluquería",
  "Estética",
  "Spa & Masajes",
  "Uñas",
  "General",
];

export default function ServiciosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  // Formulario
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Peluquería");
  const [presetCategory, setPresetCategory] = useState("estetica");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("barber_id", user.id)
      .order("created_at", { ascending: true });
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("services").insert({
      barber_id: user.id,
      name: name.trim(),
      duration_minutes: Number(duration),
      price: Number(price),
      category: category || "General",
      active: true,
    });

    setName("");
    setDuration(30);
    setPrice("");
    setShowForm(false);
    setSubmitting(false);
    load();
  }

  async function handleDelete(serviceId) {
    if (!confirm("¿Seguro que quieres eliminar este servicio de tu carta?")) return;
    await supabase.from("services").delete().eq("id", serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  }

  async function handleToggleActive(service) {
    const nextState = !service.active;
    await supabase
      .from("services")
      .update({ active: nextState })
      .eq("id", service.id);
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, active: nextState } : s))
    );
  }

  function applyPreset(preset) {
    setName(preset.name);
    setDuration(preset.duration);
    setPrice(preset.price);
    setCategory(preset.category);
  }

  // Filtrar servicios
  const filteredServices = services.filter((s) => {
    if (selectedFilter === "Todos") return true;
    return (s.category || "Peluquería").toLowerCase() === selectedFilter.toLowerCase();
  });

  // Helper de icono según categoría
  function getCategoryIcon(cat) {
    const c = (cat || "").toLowerCase();
    if (c.includes("estética") || c.includes("facial") || c.includes("láser")) {
      return <Sparkles className="w-5 h-5" />;
    }
    if (c.includes("spa") || c.includes("masaje") || c.includes("relax")) {
      return <Droplet className="w-5 h-5" />;
    }
    if (c.includes("uña") || c.includes("manicura") || c.includes("pedicura")) {
      return <Heart className="w-5 h-5" />;
    }
    return <Scissors className="w-5 h-5" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Carta de Servicios y Tratamientos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configura tus servicios para Barbería, Centro de Estética, Spa, Uñas o Salón mixto.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Cerrar formulario" : "Nuevo servicio"}</span>
        </button>
      </div>

      {/* Formulario para añadir servicio */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md animate-in fade-in space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Crear Nuevo Servicio o Tratamiento
            </h2>
            <span className="text-[11px] text-zinc-400">Precios con IVA (España)</span>
          </div>

          {/* Selector de sugerencias por sector */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Sugerencias listas para añadir:
              </span>
              <div className="flex gap-1 text-[10px]">
                {[
                  { id: "barberia", label: "💈 Barbería" },
                  { id: "estetica", label: "✨ Estética" },
                  { id: "spa", label: "🧖‍♀️ Spa" },
                  { id: "unas", label: "💅 Uñas" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPresetCategory(tab.id)}
                    className={`px-2 py-1 rounded-lg font-medium transition ${
                      presetCategory === tab.id
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {(PRESETS_BY_CATEGORY[presetCategory] || []).map((sug) => (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => applyPreset(sug)}
                  className="py-1 px-2.5 rounded-lg bg-white dark:bg-zinc-700 hover:border-indigo-400 border border-zinc-200 dark:border-zinc-600 text-[11px] text-zinc-800 dark:text-zinc-200 font-medium transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>{sug.name}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {sug.price}€
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre del servicio o tratamiento *
                </label>
                <input
                  required
                  placeholder="Ej. Higiene facial profunda, Masaje relajante, Corte de pelo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600 transition font-medium"
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Duración del servicio *
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600 transition"
                >
                  <option value="15">15 minutos</option>
                  <option value="20">20 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="40">40 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="50">50 minutos</option>
                  <option value="60">60 minutos (1 hora)</option>
                  <option value="75">75 minutos (1h 15m)</option>
                  <option value="90">90 minutos (1h 30m)</option>
                  <option value="120">120 minutos (2 horas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Precio en Euros (€) *
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.50"
                    placeholder="25"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full py-2 pl-3 pr-8 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-400">
                    €
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="py-2 px-4 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !price}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {submitting ? "Guardando..." : "Guardar Servicio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros por Categoría */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["Todos", "Peluquería", "Estética", "Spa & Masajes", "Uñas"].map((cat) => {
          const isSelected = selectedFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Lista de Servicios */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Cargando carta de servicios...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            {services.length === 0
              ? "No tienes servicios registrados. Añade el primero pulsando el botón superior."
              : `No hay servicios en la categoría "${selectedFilter}".`}
          </div>
        ) : (
          filteredServices.map((s) => (
            <div
              key={s.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    s.active
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {getCategoryIcon(s.category)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>{s.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700">
                      {s.category || "General"}
                    </span>
                    {!s.active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full">
                        Oculto
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{s.duration_minutes} minutos</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-bold text-zinc-900 dark:text-white">
                    {s.price} €
                  </div>
                  <button
                    onClick={() => handleToggleActive(s)}
                    className="text-[11px] text-zinc-400 hover:text-indigo-600 transition"
                  >
                    {s.active ? "Desactivar" : "Activar"}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  title="Eliminar servicio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
