"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import {
  User,
  Phone,
  MessageCircle,
  Calendar,
  Euro,
  ArrowLeft,
  Scissors,
  Save,
  Check,
  Award,
  Gift,
  Sparkles,
  Star,
} from "lucide-react";

export default function ClienteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [barber, setBarber] = useState(null);
  const [visits, setVisits] = useState([]);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: c } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setClient(c);
      setNotes(c?.notes || "");

      if (c?.barber_id) {
        const { data: b } = await supabase
          .from("barbers")
          .select("*")
          .eq("id", c.barber_id)
          .maybeSingle();
        setBarber(b);
      }

      const { data: v } = await supabase
        .from("appointments")
        .select("id, starts_at, status, services(name, price, duration_minutes)")
        .eq("client_id", id)
        .order("starts_at", { ascending: false });
      setVisits(v || []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSaveNotes() {
    await supabase.from("clients").update({ notes }).eq("id", id);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2500);
  }

  if (loading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Cargando ficha de cliente...</div>;
  }

  if (!client) {
    return <div className="p-12 text-center text-xs text-zinc-500">Cliente no encontrado.</div>;
  }

  const cleanPhone = (client.phone || "").replace(/[^0-9]/g, "");
  const totalSpent = visits.reduce(
    (sum, v) => sum + (v.status !== "cancelada" ? Number(v.services?.price) || 0 : 0),
    0
  );

  // Programa de fidelización: 10 visitas = 1 gratis (o configurable)
  const loyaltyVisitsTarget = barber?.loyalty_visits_needed || 10;
  const loyaltyRewardText = barber?.loyalty_reward_text || "Corte o servicio gratis";
  const completedVisitsCount = visits.filter((v) => v.status === "completada" || v.status === "confirmada").length;
  // Sellos acumulados en el ciclo actual
  const currentStamps = completedVisitsCount % loyaltyVisitsTarget;
  const isRewardEarned = completedVisitsCount > 0 && currentStamps === 0;
  const rewardsClaimedCount = Math.floor(completedVisitsCount / loyaltyVisitsTarget);

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/dashboard/clientes")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver a Clientes</span>
      </button>

      {/* Ficha Principal del Cliente */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {client.full_name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                {client.full_name}
              </h1>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                <span>{client.phone}</span>
                <span>·</span>
                <span>Cliente registrado</span>
              </div>
            </div>
          </div>

          {/* Botones de acción directa */}
          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>
            )}

            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition"
                title="Llamar por teléfono"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Métricas del cliente */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl text-center">
            <div className="text-xs text-zinc-500 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Citas reservadas</span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              {visits.length}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl text-center">
            <div className="text-xs text-zinc-500 flex items-center justify-center gap-1">
              <Euro className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gasto acumulado</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalSpent.toFixed(0)} €
            </div>
          </div>
        </div>
      </div>

      {/* TARJETA DE FIDELIDAD (10 VISITAS = 1 GRATIS) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-zinc-900 dark:to-zinc-900 p-6 rounded-2xl border border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Tarjeta de Fidelidad</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full font-bold">
                  {loyaltyVisitsTarget} Visitas = 1 Gratis
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Premio configurado: <strong className="text-zinc-800 dark:text-zinc-200">{loyaltyRewardText}</strong>
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Progreso actual:{" "}
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {isRewardEarned ? loyaltyVisitsTarget : currentStamps} / {loyaltyVisitsTarget}
            </span>
          </div>
        </div>

        {/* Sellos visuales interactivos (1 al 10) */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
          {Array.from({ length: loyaltyVisitsTarget }).map((_, idx) => {
            const stampNum = idx + 1;
            const isCompletedStamp = isRewardEarned
              ? true
              : idx < currentStamps;
            const isLastFreeStamp = stampNum === loyaltyVisitsTarget;

            return (
              <div
                key={stampNum}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                  isCompletedStamp
                    ? isLastFreeStamp
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/50 animate-pulse"
                      : "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : isLastFreeStamp
                    ? "bg-white dark:bg-zinc-800/80 border-dashed border-amber-400 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                    : "bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                }`}
                title={
                  isLastFreeStamp
                    ? `Visita ${stampNum}: ¡GRATIS!`
                    : `Sello ${stampNum} de ${loyaltyVisitsTarget}`
                }
              >
                {isCompletedStamp ? (
                  isLastFreeStamp ? (
                    <Gift className="w-5 h-5 mb-0.5" />
                  ) : (
                    <Check className="w-4 h-4 mb-0.5" />
                  )
                ) : isLastFreeStamp ? (
                  <Gift className="w-5 h-5 mb-0.5 opacity-80" />
                ) : (
                  <Star className="w-4 h-4 mb-0.5 opacity-40" />
                )}
                <span className="text-[10px] font-bold leading-tight">
                  {isLastFreeStamp ? "GRATIS" : `#${stampNum}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Notificación si ya alcanzó la décima visita o las que le faltan */}
        <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
          {isRewardEarned ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  🎉 ¡Este cliente ha completado <strong>{loyaltyVisitsTarget} visitas</strong>! Tiene derecho a su <strong>{loyaltyRewardText}</strong>.
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                Premio Activo
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Le faltan{" "}
                  <strong className="text-zinc-900 dark:text-white font-bold">
                    {loyaltyVisitsTarget - currentStamps} visita(s)
                  </strong>{" "}
                  para recibir su {loyaltyRewardText}.
                </span>
              </span>
              {rewardsClaimedCount > 0 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  🏆 Premios anteriores obtenidos: {rewardsClaimedCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notas Técnicas / Preferencias del corte */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ficha Técnica y Preferencias</span>
          </h2>
          {savedNotes && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> ¡Guardado!
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej. Degradado número 1 en laterales, tijera arriba dejando flequillo, barba cuadrada con perfilado de navaja..."
          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-800 transition"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:opacity-90 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar notas</span>
          </button>
        </div>
      </div>

      {/* Historial de visitas */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Historial de Citas Pasadas y Futuras
          </h2>
        </div>

        {visits.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Aún no tiene visitas registradas.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visits.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {v.services?.name || "Servicio"}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {new Date(v.starts_at).toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-zinc-900 dark:text-white">
                    {v.services?.price} €
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      v.status === "completada"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : v.status === "cancelada"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    {v.status || "confirmada"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
