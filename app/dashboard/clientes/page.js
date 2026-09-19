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
} from "lucide-react";

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
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
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("barber_id", user.id)
        .order("full_name", { ascending: true });
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(term) ||
      (c.phone || "").toLowerCase().includes(term)
    );
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

      {/* Buscador de clientes */}
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
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span>{c.phone}</span>
                      {c.notes && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400 truncate max-w-[200px]">
                            {c.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl transition"
                      title="Abrir chat de WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </a>
                  )}

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
