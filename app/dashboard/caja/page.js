"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Euro,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  Users,
  Printer,
  CheckCircle2,
} from "lucide-react";

export default function CajaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: b } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", user.id)
      .single();
    if (b) setBarber(b);

    const { data: stf } = await supabase
      .from("barber_staff")
      .select("*")
      .eq("barber_id", user.id);
    setStaffList(stf || []);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appts } = await supabase
      .from("appointments")
      .select(
        "id, client_id, service_id, staff_id, starts_at, status, total_price, payment_method, payment_status, tip_amount, clients(full_name, phone), services(name, price), barber_staff(name, avatar_color)"
      )
      .eq("barber_id", user.id)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString())
      .order("starts_at", { ascending: true });

    setAppointments(appts || []);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handlePrevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  }

  function handleNextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  }

  // Cálculos financieros
  const {
    totalIngresos,
    totalBizum,
    totalEfectivo,
    totalTarjeta,
    totalPropinas,
    citasCobradas,
    citasPendientes,
    porBarbero,
  } = useMemo(() => {
    let ingresos = 0;
    let bizum = 0;
    let efectivo = 0;
    let tarjeta = 0;
    let propinas = 0;
    let cobradas = 0;
    let pendientes = 0;
    const barberoMap = {};

    appointments.forEach((a) => {
      const price = Number(a.total_price || (a.services && a.services.price) || 0);
      const tip = Number(a.tip_amount || 0);
      const method = (a.payment_method || "").toLowerCase();

      if (a.status === "completada" || a.payment_status === "pagado") {
        cobradas++;
        ingresos += price;
        propinas += tip;

        if (method === "bizum") bizum += price;
        else if (method === "tarjeta") tarjeta += price;
        else efectivo += price; // Default o efectivo

        // Agrupar por barbero
        const staffId = a.staff_id || "sin-asignar";
        const staffName =
          (a.barber_staff && a.barber_staff.name) ||
          staffList.find((s) => s.id === staffId)?.name ||
          "General";

        if (!barberoMap[staffId]) {
          barberoMap[staffId] = {
            id: staffId,
            name: staffName,
            citas: 0,
            total: 0,
          };
        }
        barberoMap[staffId].citas++;
        barberoMap[staffId].total += price;
      } else if (a.status !== "cancelada") {
        pendientes++;
      }
    });

    return {
      totalIngresos: ingresos,
      totalBizum: bizum,
      totalEfectivo: efectivo,
      totalTarjeta: tarjeta,
      totalPropinas: propinas,
      citasCobradas: cobradas,
      citasPendientes: pendientes,
      porBarbero: Object.values(barberoMap),
    };
  }, [appointments, staffList]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera y Selector de Día */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <span>Caja Diaria y Métodos de Pago</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cierre de caja en tiempo real con desglose de Bizum, Efectivo, Tarjeta y comisiones del equipo.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button
            onClick={handlePrevDay}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-zinc-900 dark:text-white capitalize min-w-[140px] text-center">
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <button
            onClick={handleNextDay}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Métricas Principales de Caja */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Facturado */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span>Total Facturado</span>
            <Euro className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
            {totalIngresos.toFixed(0)} €
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {citasCobradas} citas cobradas
          </div>
        </div>

        {/* Bizum (Súper popular en España) */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Bizum</span>
            <Smartphone className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalBizum.toFixed(0)} €
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {totalIngresos > 0 ? ((totalBizum / totalIngresos) * 100).toFixed(0) : 0}% del total
          </div>
        </div>

        {/* Efectivo */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Efectivo</span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalEfectivo.toFixed(0)} €
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">En cajón del salón</div>
        </div>

        {/* Tarjeta / Datáfono */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Tarjeta / TPV</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalTarjeta.toFixed(0)} €
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Datáfono / Redsys</div>
        </div>
      </div>

      {/* Desglose por Barbero / Comisiones */}
      {porBarbero.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Reparto de Facturación y Comisiones por Barbero</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {porBarbero.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60"
              >
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {b.name}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{b.citas} citas cobradas</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-700">
                  <span className="text-xs text-zinc-500">Facturado:</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {b.total} €
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                  <span>Comisión 50%:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {(b.total * 0.5).toFixed(0)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle de Operaciones y Cobros del Día */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Registro de Citas del Día
          </h2>
          <span className="text-xs text-zinc-500">
            {citasCobradas} cobradas · {citasPendientes} pendientes
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Cargando operaciones...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No hay citas registradas para este día.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {appointments.map((a) => {
              const price = Number(a.total_price || (a.services && a.services.price) || 0);
              const isPaid = a.status === "completada" || a.payment_status === "pagado";
              const method = a.payment_method || "efectivo";

              return (
                <div
                  key={a.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        method === "bizum"
                          ? "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400"
                          : method === "tarjeta"
                          ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {method === "bizum" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : method === "tarjeta" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : (
                        <Banknote className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                        {a.clients?.full_name || "Cliente"}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{a.services?.name || "Servicio"}</span>
                        <span>·</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {a.barber_staff?.name || "Marco"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">
                      {price} €
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        isPaid
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {isPaid ? `Cobrado (${method})` : "Pendiente de cobro"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
