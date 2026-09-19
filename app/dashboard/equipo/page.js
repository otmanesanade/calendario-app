"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Phone,
  Euro,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";

const PALETTE = [
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Rose
  "#7c3aed", // Violet
  "#0891b2", // Cyan
  "#2563eb", // Blue
  "#db2777", // Pink
];

export default function EquipoPage() {
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Barbero");
  const [phone, setPhone] = useState("");
  const [avatarColor, setAvatarColor] = useState(PALETTE[0]);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Equipo de barberos
    const { data: stf } = await supabase
      .from("barber_staff")
      .select("*")
      .eq("barber_id", user.id)
      .order("created_at", { ascending: true });
    setStaff(stf || []);

    // Citas para calcular métricas por barbero
    const { data: appts } = await supabase
      .from("appointments")
      .select("id, staff_id, status, total_price, services(price)")
      .eq("barber_id", user.id);
    setAppointments(appts || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddBarber(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("barber_staff").insert({
      barber_id: user.id,
      name: name.trim(),
      role: role.trim() || "Barbero",
      phone: phone.trim() || null,
      avatar_color: avatarColor,
      active: true,
    });

    setName("");
    setRole("Barbero");
    setPhone("");
    setShowAddModal(false);
    setSubmitting(false);
    loadData();
  }

  async function handleToggleActive(st) {
    const nextState = !st.active;
    await supabase
      .from("barber_staff")
      .update({ active: nextState })
      .eq("id", st.id);
    setStaff((prev) =>
      prev.map((s) => (s.id === st.id ? { ...s, active: nextState } : s))
    );
  }

  async function handleDelete(id) {
    if (staff.length <= 1) {
      alert("Debes mantener al menos un barbero activo en el equipo.");
      return;
    }
    if (!confirm("¿Seguro que deseas dar de baja a este profesional del equipo?")) return;

    await supabase.from("barber_staff").delete().eq("id", id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Equipo, Especialistas y Cabinas</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Gestiona los profesionales y cabinas/sillones de tu centro (Barbería, Estética o Spa). Cada uno dispondrá de su columna en la agenda visual.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Profesional / Cabina</span>
        </button>
      </div>

      {/* Modal / Formulario para añadir Barbero */}
      {showAddModal && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Nuevo profesional para el salón
            </h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddBarber} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nombre del barbero / sillón *
                </label>
                <input
                  required
                  placeholder="Ej. Dani, Carlos, Sillón 1..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Especialidad / Cargo o Cabina
                </label>
                <input
                  placeholder="Ej. Esteticista, Terapeuta Spa, Barbero, Cabina 1..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {[
                    "Esteticista",
                    "Terapeuta Spa",
                    "Masajista",
                    "Barbero",
                    "Manicurista",
                    "Cabina Facial",
                    "Cabina Masaje",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Teléfono Móvil (opcional)
                </label>
                <input
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Color distintivo en la agenda
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        avatarColor === color ? "scale-125 ring-2 ring-zinc-900 dark:ring-white" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-2 px-4 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {submitting ? "Guardando..." : "Guardar Profesional"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Barberos con Tarjetas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-zinc-500">
            Cargando equipo de barberos...
          </div>
        ) : staff.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-zinc-500">
            No tienes barberos configurados. Añade el primero arriba.
          </div>
        ) : (
          staff.map((st) => {
            const barberAppts = appointments.filter(
              (a) => a.staff_id === st.id && a.status !== "cancelada"
            );
            const completedAppts = barberAppts.filter((a) => a.status === "completada");
            const totalRevenue = barberAppts.reduce((sum, a) => {
              const price = a.total_price || (a.services && a.services.price) || 0;
              return sum + Number(price);
            }, 0);

            return (
              <div
                key={st.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 transition-all shadow-sm ${
                  st.active
                    ? "border-zinc-200 dark:border-zinc-800"
                    : "border-dashed border-zinc-300 dark:border-zinc-700 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                      style={{ backgroundColor: st.avatar_color || "#4f46e5" }}
                    >
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{st.name}</span>
                        {!st.active && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">{st.role || "Barbero"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(st)}
                      className="text-[11px] font-medium text-zinc-500 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {st.active ? "Pausar" : "Activar"}
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition"
                      title="Eliminar profesional"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {st.phone && (
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5 mb-4">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{st.phone}</span>
                  </div>
                )}

                {/* Métricas de rendimiento y comisiones */}
                <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                      Citas Totales
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {barberAppts.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                      Facturación
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {totalRevenue} €
                    </span>
                  </div>
                </div>

                {/* Cálculo estimativo de comisión 50/50 típico en España */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Comisión estimada (50%):</span>
                  <strong className="text-zinc-900 dark:text-white font-semibold">
                    {(totalRevenue * 0.5).toFixed(0)} €
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
