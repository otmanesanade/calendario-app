"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  ChevronRight,
  Plus,
  User,
  Sparkles,
  Award,
  Gift,
  Clock,
  CalendarAlert,
  History,
} from "lucide-react";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [barber, setBarber] = useState(null);
  const [clientVisitsMap, setClientVisitsMap] = useState({});
  const [clientLastVisitMap, setClientLastVisitMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Cargar configuración de fidelización de la barbería
      const { data: bData } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setBarber(bData);

      // Cargar clientes
      const { data: cData } = await supabase
        .from("clients")
        .select("*")
        .eq("barber_id", user.id)
        .order("full_name", { ascending: true });
      setClients(cData || []);

      // Contar visitas por cliente y fecha de última cita para detectar inactivos
      const { data: appts } = await supabase
        .from("appointments")
        .select("client_id, status, starts_at")
        .eq("barber_id", user.id)
        .order("starts_at", { ascending: false });

      const visitsMap = {};
      const lastVisitMap = {};

      (appts || []).forEach((a) => {
        if (a.client_id && a.status !== "cancelada" && a.status !== "no_vino") {
          visitsMap[a.client_id] = (visitsMap[a.client_id] || 0) + 1;
          if (!lastVisitMap[a.client_id] && a.starts_at) {
            lastVisitMap[a.client_id] = a.starts_at;
          }
        }
      });
      setClientVisitsMap(visitsMap);
      setClientLastVisitMap(lastVisitMap);

      setLoading(false);
    }
    load();
  }, []);

  const [filterType, setFilterType] = useState("todos"); // "todos" | "inactivos" | "premios"

  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (c.full_name || "").toLowerCase().includes(term) ||
      (c.phone || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filterType === "inactivos") {
      const lastVisit = clientLastVisitMap[c.id];
      if (!lastVisit) return false;
      const daysDiff = (now - new Date(lastVisit)) / (1000 * 60 * 60 * 24);
      return daysDiff >= 30;
    }

    if (filterType === "premios") {
      const target = barber?.loyalty_visits_needed || 10;
      const vCount = clientVisitsMap[c.id] || 0;
      const stamps = vCount % target;
      return vCount > 0 && stamps === 0;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Directorio de Clientes (CRM)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Ficha técnica, historial de cortes y contacto directo por WhatsApp con tus clientes en España.
        </p>
      </div>

      {/* Buscador y Filtros Inteligentes */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-indigo-600 shadow-sm"
          />
        </div>

        {/* Pestañas de filtrado rápido */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterType("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === "todos"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            Todos ({clients.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("inactivos")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === "inactivos"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sin cita hace +30 días</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("premios")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === "premios"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Premio Gratis Listo</span>
          </button>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Cargando clientes...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            {search
              ? "No se encontraron clientes con esa búsqueda."
              : "Aún no tienes clientes registrados. Se guardan automáticamente cuando reservan en tu página web."}
          </div>
        ) : (
          filteredClients.map((c) => {
            const cleanPhone = (c.phone || "").replace(/[^0-9]/g, "");
            return (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition"
              >
                <Link
                  href={`/dashboard/clientes/${c.id}`}
                  className="flex items-center gap-3.5 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {(c.full_name || "C")
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                      {c.full_name || "Cliente"}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center flex-wrap gap-1.5 mt-0.5">
                      <span>{c.phone}</span>
                      {c.notes && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400 truncate max-w-[180px]">
                            {c.notes}
                          </span>
                        </>
                      )}
                      {/* Badge Sellos / Premio Fidelización */}
                      {(() => {
                        const target = barber?.loyalty_visits_needed || 10;
                        const vCount = clientVisitsMap[c.id] || 0;
                        const stamps = vCount % target;
                        const hasReward = vCount > 0 && stamps === 0;

                        return (
                          <>
                            <span>·</span>
                            {hasReward ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                <Gift className="w-3 h-3" />
                                <span>¡Corte Gratis Disponible!</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                                <Award className="w-3 h-3 text-amber-500" />
                                <span>{stamps}/{target} sellos</span>
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {cleanPhone && (() => {
                    const lastVisit = clientLastVisitMap[c.id];
                    const isInactive = lastVisit && (now - new Date(lastVisit)) / (1000 * 60 * 60 * 24) >= 30;
                    const bookingUrl = typeof window !== "undefined" && barber?.slug ? `${window.location.origin}/${barber.slug}` : "";
                    
                    const reactivateMsg = encodeURIComponent(
                      `¡Hola ${c.full_name || ""}! 👋 Te escribimos desde ${barber?.business_name || "tu barbería"}. Hace tiempo que no te vemos por aquí y nos encantaría volver a atenderte. ¿Te apetece renovar tu corte? Puedes reservar tu cita aquí: ${bookingUrl}`
                    );

                    return isInactive ? (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${reactivateMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        title="Enviar mensaje en español para recuperar cliente inactivo"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Reactivar</span>
                      </a>
                    ) : (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl transition"
                        title="Abrir chat de WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>
                    );
                  })()}

                  <Link
                    href={`/dashboard/clientes/${c.id}`}
                    className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
