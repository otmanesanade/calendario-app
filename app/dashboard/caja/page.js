"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  TrendingDown,
  Receipt,
  Users,
  Printer,
  CheckCircle2,
  Gift,
  Star,
  Download,
  BarChart3,
  Scissors,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  X,
  Info,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function CajaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramTab = searchParams.get("tab");
  const paramMonth = searchParams.get("month");
  const paramYear = searchParams.get("year");

  // Tab: "diaria" o "mensual"
  const initialTab = paramTab === "mensual" ? "mensual" : "diaria";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Estados para Vista Diaria
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyAppointments, setDailyAppointments] = useState([]);

  // Estados para Vista Mensual
  const now = new Date();
  const initialMonth =
    paramMonth !== null && !isNaN(Number(paramMonth))
      ? Math.max(0, Math.min(11, Number(paramMonth)))
      : now.getMonth();
  const initialYear =
    paramYear !== null && !isNaN(Number(paramYear))
      ? Number(paramYear)
      : now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [allAppointments, setAllAppointments] = useState([]);

  const [staffList, setStaffList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para Modal de Exportación a Google Sheets / Excel
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("mensual");
  const [exportCopied, setExportCopied] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [sheetsHelpOpen, setSheetsHelpOpen] = useState(false);

  // Sincronizar con parámetros de URL si cambian
  useEffect(() => {
    if (paramTab === "mensual") setActiveTab("mensual");
    else if (paramTab === "diaria") setActiveTab("diaria");
    if (paramMonth !== null && !isNaN(Number(paramMonth))) {
      setSelectedMonth(Math.max(0, Math.min(11, Number(paramMonth))));
    }
    if (paramYear !== null && !isNaN(Number(paramYear))) {
      setSelectedYear(Number(paramYear));
    }
  }, [paramTab, paramMonth, paramYear]);

  // Cargar datos del barbero, equipo y servicios
  useEffect(() => {
    async function loadMeta() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: b } = await supabase
        .from("barbers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (b) setBarber(b);

      const { data: stf } = await supabase
        .from("barber_staff")
        .select("*")
        .eq("barber_id", user.id);
      setStaffList(stf || []);

      const { data: srv } = await supabase
        .from("services")
        .select("*")
        .eq("barber_id", user.id);
      setServicesList(srv || []);
    }
    loadMeta();
  }, []);

  // Cargar citas diarias
  const loadDailyData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

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

    setDailyAppointments(appts || []);
    setLoading(false);
  }, [selectedDate]);

  // Cargar todas las citas del año seleccionado para el desglose mensual
  const loadMonthlyData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Buscamos todo el año seleccionado para calcular comparativas y gráficos
    const startOfYear = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

    const { data: appts } = await supabase
      .from("appointments")
      .select(
        "id, client_id, service_id, service_name, staff_id, starts_at, status, total_price, payment_method, payment_status, tip_amount, clients(full_name, phone), services(name, price), barber_staff(name)"
      )
      .eq("barber_id", user.id)
      .gte("starts_at", startOfYear.toISOString())
      .lte("starts_at", endOfYear.toISOString())
      .order("starts_at", { ascending: true });

    setAllAppointments(appts || []);
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => {
    loadDailyData();
    loadMonthlyData();
  }, [loadDailyData, loadMonthlyData]);

  // Navegación diaria
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

  // Navegación mensual
  function handlePrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  // Enlace WhatsApp para pedir reseña Google
  function getWhatsAppReviewUrl(appt) {
    if (!appt) return "#";
    const rawPhone = (appt.clients?.phone || appt.client_phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) return "#";

    const clientName = appt.clients?.full_name || appt.client_name || "amigo";
    const salonName = barber?.business_name || "nuestro salón";
    const reviewLink = barber?.google_review_url || "https://g.page/r/ejemplo/review";

    const template =
      barber?.google_review_message ||
      "¡Hola {nombre}! Muchas gracias por tu visita a {negocio} 💈✂️ ¿Qué tal te pareció el resultado? Nos ayudarías mucho dejándonos tu valoración en Google: {enlace} ⭐ ¡Muchísimas gracias!";

    const text = template
      .replace(/{nombre}/g, clientName)
      .replace(/{negocio}/g, salonName)
      .replace(/{enlace}/g, reviewLink);

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  }

  // Cálculos financieros del DÍA
  const dailyStats = useMemo(() => {
    let ingresos = 0;
    let bizum = 0;
    let efectivo = 0;
    let tarjeta = 0;
    let gratisFidelidadCount = 0;
    let propinas = 0;
    let cobradas = 0;
    let pendientes = 0;
    const barberoMap = {};

    dailyAppointments.forEach((a) => {
      const price = Number(a.total_price || (a.services && a.services.price) || 0);
      const tip = Number(a.tip_amount || 0);
      const method = (a.payment_method || "").toLowerCase();

      if (a.status === "completada" || a.payment_status === "pagado") {
        cobradas++;
        ingresos += price;
        propinas += tip;

        if (method === "bizum") bizum += price;
        else if (method === "tarjeta") tarjeta += price;
        else if (method === "gratis_fidelidad") gratisFidelidadCount++;
        else efectivo += price;

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
      totalGratisFidelidad: gratisFidelidadCount,
      totalPropinas: propinas,
      citasCobradas: cobradas,
      citasPendientes: pendientes,
      porBarbero: Object.values(barberoMap),
    };
  }, [dailyAppointments, staffList]);

  // Cálculos financieros MENSUALES (Mes seleccionado + Histórico del año)
  const monthlyStats = useMemo(() => {
    // Array de los 12 meses del año
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MESES[i],
      ingresos: 0,
      citas: 0,
      bizum: 0,
      efectivo: 0,
      tarjeta: 0,
      propinas: 0,
    }));

    const barberoMap = {};
    const serviciosMap = {};

    allAppointments.forEach((a) => {
      const dt = new Date(a.starts_at);
      const mIdx = dt.getMonth();
      const price = Number(a.total_price || (a.services && a.services.price) || 0);
      const tip = Number(a.tip_amount || 0);
      const method = (a.payment_method || "").toLowerCase();

      if (a.status === "completada" || a.payment_status === "pagado") {
        monthsData[mIdx].citas++;
        monthsData[mIdx].ingresos += price;
        monthsData[mIdx].propinas += tip;

        if (method === "bizum") monthsData[mIdx].bizum += price;
        else if (method === "tarjeta") monthsData[mIdx].tarjeta += price;
        else monthsData[mIdx].efectivo += price;

        // Si pertenece al mes seleccionado, computar breakdown por barbero y servicio
        if (mIdx === selectedMonth) {
          const staffId = a.staff_id || "general";
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

          // Servicios
          const srvName = a.services?.name || a.service_name || "Servicio General";
          if (!serviciosMap[srvName]) {
            serviciosMap[srvName] = {
              name: srvName,
              citas: 0,
              total: 0,
            };
          }
          serviciosMap[srvName].citas++;
          serviciosMap[srvName].total += price;
        }
      }
    });

    const currentMonthData = monthsData[selectedMonth];
    const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevMonthData = monthsData[prevMonthIndex];

    // Porcentaje de variación con mes anterior
    let diffPercent = 0;
    if (prevMonthData.ingresos > 0) {
      diffPercent = ((currentMonthData.ingresos - prevMonthData.ingresos) / prevMonthData.ingresos) * 100;
    } else if (currentMonthData.ingresos > 0) {
      diffPercent = 100;
    }

    // Ticket medio
    const ticketMedio =
      currentMonthData.citas > 0
        ? currentMonthData.ingresos / currentMonthData.citas
        : 0;

    // Máximo ingreso mensual para calcular la altura del gráfico de barras
    const maxMonthlyRevenue = Math.max(...monthsData.map((m) => m.ingresos), 100);

    // Total acumulado anual
    const totalAnual = monthsData.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalCitasAnual = monthsData.reduce((acc, curr) => acc + curr.citas, 0);

    return {
      currentMonth: currentMonthData,
      prevMonth: prevMonthData,
      diffPercent,
      ticketMedio,
      monthsData,
      maxMonthlyRevenue,
      totalAnual,
      totalCitasAnual,
      porBarbero: Object.values(barberoMap).sort((a, b) => b.total - a.total),
      topServicios: Object.values(serviciosMap).sort((a, b) => b.total - a.total),
    };
  }, [allAppointments, selectedMonth, staffList]);

  // Imprimir reporte fiscal mensual
  function handlePrintReport() {
    window.print();
  }

  // Generar filas estructuradas para Google Sheets / Excel / Gestoría
  function generateExportRows(type = "mensual") {
    const isMensual = type === "mensual";
    const appts = isMensual
      ? allAppointments.filter((a) => {
          const d = new Date(a.starts_at);
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        })
      : dailyAppointments;

    const salonName = barber?.business_name || "Glowfy Salón";
    const city = barber?.city || "España";
    const periodLabel = isMensual
      ? `${MESES[selectedMonth]} ${selectedYear}`
      : selectedDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

    const rows = [
      [`INFORME DE CAJA Y FACTURACIÓN - ${salonName.toUpperCase()}`],
      [
        `Ubicación: ${city}`,
        `Período: ${periodLabel}`,
        `Generado el: ${new Date().toLocaleDateString("es-ES")} ${new Date().toLocaleTimeString("es-ES")}`,
      ],
      [],
    ];

    if (isMensual) {
      const cur = monthlyStats.currentMonth;
      const baseEstimada = (cur.ingresos / 1.21).toFixed(2);
      const ivaEstimado = (cur.ingresos - Number(baseEstimada)).toFixed(2);
      rows.push([
        "RESUMEN FISCAL MENSUAL",
        `Total Facturado: ${cur.ingresos.toFixed(2)} €`,
        `Bizum: ${cur.bizum.toFixed(2)} €`,
        `Tarjeta: ${cur.tarjeta.toFixed(2)} €`,
        `Efectivo: ${cur.efectivo.toFixed(2)} €`,
        `Base Imponible (21% IVA): ${baseEstimada} €`,
        `IVA 21% Desglosado: ${ivaEstimado} €`,
        `Citas Totales: ${cur.citas}`,
        `Ticket Medio: ${monthlyStats.ticketMedio.toFixed(2)} €`,
      ]);
    } else {
      const dStats = dailyStats;
      const baseEstimada = (dStats.totalIngresos / 1.21).toFixed(2);
      const ivaEstimado = (dStats.totalIngresos - Number(baseEstimada)).toFixed(2);
      rows.push([
        "RESUMEN DE CAJA DIARIA",
        `Total Día: ${dStats.totalIngresos.toFixed(2)} €`,
        `Bizum: ${dStats.totalBizum.toFixed(2)} €`,
        `Tarjeta: ${dStats.totalTarjeta.toFixed(2)} €`,
        `Efectivo: ${dStats.totalEfectivo.toFixed(2)} €`,
        `Propinas: ${dStats.totalPropinas.toFixed(2)} €`,
        `Base Imponible (21% IVA): ${baseEstimada} €`,
        `IVA 21%: ${ivaEstimado} €`,
        `Citas Cobradas: ${dStats.citasCobradas}`,
      ]);
    }
    rows.push([]);

    // Cabecera de columnas
    rows.push([
      "Fecha",
      "Hora",
      "Cliente",
      "Teléfono",
      "Servicio",
      "Profesional / Sillón",
      "Método de Pago",
      "Estado",
      "Importe Total (€)",
      "Base Imponible (€)",
      "IVA 21% (€)",
      "Propina (€)",
    ]);

    appts.forEach((a) => {
      const d = new Date(a.starts_at);
      const fecha = d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hora = d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const cliente = a.clients?.full_name || a.client_name || "Cliente";
      const telefono = a.clients?.phone || a.client_phone || "";
      const servicio = a.services?.name || a.service_name || "Servicio";
      const staffName =
        a.barber_staff?.name ||
        staffList.find((s) => s.id === a.staff_id)?.name ||
        "General";
      const rawMethod = (a.payment_method || "efectivo").toLowerCase();
      const metodo =
        rawMethod === "bizum"
          ? "Bizum"
          : rawMethod === "tarjeta"
          ? "Tarjeta"
          : rawMethod === "gratis_fidelidad"
          ? "Premio Fidelidad"
          : "Efectivo";
      const precio = Number(a.total_price || (a.services && a.services.price) || 0);
      const base = (precio / 1.21).toFixed(2);
      const iva = (precio - Number(base)).toFixed(2);
      const propina = Number(a.tip_amount || 0).toFixed(2);
      const estado =
        a.status === "completada" || a.payment_status === "pagado"
          ? "Cobrado"
          : a.status === "cancelada"
          ? "Cancelada"
          : "Pendiente";

      rows.push([
        fecha,
        hora,
        cliente,
        telefono,
        servicio,
        staffName,
        metodo,
        estado,
        precio.toFixed(2),
        base,
        iva,
        propina,
      ]);
    });

    return rows;
  }

  // Descargar archivo CSV con formato español para Gestoría / Google Sheets
  function handleDownloadCSV(type = exportType) {
    const rows = generateExportRows(type);
    const csvContent = rows
      .map((row) =>
        row
          .map((val) => {
            const str = String(val ?? "");
            if (str.includes(";") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(";")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename =
      type === "mensual"
        ? `caja-${MESES[selectedMonth].toLowerCase()}-${selectedYear}-${barber?.slug || "glowfy"}.csv`
        : `caja-diaria-${selectedDate.toISOString().slice(0, 10)}-${barber?.slug || "glowfy"}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccessMessage(
      `¡Archivo "${filename}" descargado con éxito! Listo para abrir en Google Sheets o enviar a tu gestor.`
    );
    setTimeout(() => setExportSuccessMessage(null), 4500);
  }

  // Copiar al portapapeles con doble método garantizado (navigator + textarea fallback)
  async function copyTextToClipboard(text) {
    if (typeof window === "undefined") return false;
    let ok = false;

    // Método 1: navigator.clipboard
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (e) {
        console.warn("navigator.clipboard fallo, intentando fallback:", e);
      }
    }

    // Método 2: textarea + execCommand("copy") si el anterior falló o no existe
    if (!ok && typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        ok = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (e) {
        console.warn("execCommand fallback fallo:", e);
      }
    }

    return ok;
  }

  // Copiar TSV directo para pegar en Google Sheets con Ctrl+V
  async function handleCopyForGoogleSheets(type = exportType) {
    const rows = generateExportRows(type);
    const tsvContent = rows
      .map((row) =>
        row.map((val) => String(val ?? "").replace(/\t/g, " ")).join("\t")
      )
      .join("\n");

    await copyTextToClipboard(tsvContent);
    setExportCopied(true);
    setExportSuccessMessage(
      "¡Tabla copiada al portapapeles! En Google Sheets pulsa en la casilla A1 y haz Ctrl + V (Pegar)."
    );
    setTimeout(() => {
      setExportCopied(false);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    }, 3500);
  }

  // Copiar datos y abrir Google Sheets al instante en nueva pestaña (1 solo clic)
  async function handleCopyAndOpenSheets(type = exportType) {
    await handleCopyForGoogleSheets(type);
    setSheetsHelpOpen(true);
    if (typeof window !== "undefined") {
      window.open("https://sheets.new", "_blank");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Selector de Pestañas: Caja Diaria vs Ingresos Mensuales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {activeTab === "diaria" ? "Caja Diaria" : "Ingresos Mensuales"}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Finanzas
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {activeTab === "diaria"
              ? "Arqueo y cobros del día con desglose de Bizum, Tarjeta y Efectivo."
              : "Control de facturación mes a mes, comparativas, ticket medio y comisiones."}
          </p>
        </div>

        {/* Botones de Cambio de Vista */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => {
              setActiveTab("diaria");
              router.replace("/dashboard/caja?tab=diaria");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "diaria"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Caja Diaria</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("mensual");
              router.replace("/dashboard/caja?tab=mensual");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "mensual"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Ingresos Mensuales</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VISTA 1: INGRESOS MENSUALES (MES A MES)                   */}
      {/* ========================================================= */}
      {activeTab === "mensual" && (
        <div className="space-y-6">
          {/* Barra de navegación de mes y año */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 transition border border-zinc-200 dark:border-zinc-700"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-600"
                >
                  {MESES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-600"
                >
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 transition border border-zinc-200 dark:border-zinc-700"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const d = new Date();
                  setSelectedMonth(d.getMonth());
                  setSelectedYear(d.getFullYear());
                }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition border border-indigo-100 dark:border-indigo-900/50"
              >
                Mes actual
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExportType("mensual");
                  setShowExportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition"
                title="Exportar informe fiscal a Google Sheets / Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar a Google Sheets</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition"
                title="Imprimir informe para el gestor / asesor fiscal"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Tarjetas Principales del Mes Seleccionado */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Facturado en el Mes */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-5 rounded-3xl text-white shadow-lg shadow-indigo-600/20 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-indigo-100 text-xs font-medium">
                <span>Ingresos {MESES[selectedMonth]}</span>
                <Euro className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-3xl font-black mt-2 tracking-tight">
                {monthlyStats.currentMonth.ingresos.toFixed(0)} €
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-[11px]">
                {monthlyStats.diffPercent >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-400/20 text-emerald-200 font-bold px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3 h-3" />
                    +{monthlyStats.diffPercent.toFixed(1)}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 bg-rose-400/20 text-rose-200 font-bold px-1.5 py-0.5 rounded-md">
                    <ArrowDownRight className="w-3 h-3" />
                    {monthlyStats.diffPercent.toFixed(1)}%
                  </span>
                )}
                <span className="text-indigo-200 text-[10px]">vs mes anterior</span>
              </div>
            </div>

            {/* Total Citas y Ticket Medio */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span>Citas del Mes</span>
                <Scissors className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {monthlyStats.currentMonth.citas}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Ticket medio:{" "}
                  <strong className="text-zinc-900 dark:text-white font-bold">
                    {monthlyStats.ticketMedio.toFixed(2)} €
                  </strong>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                Propinas recibidas: {monthlyStats.currentMonth.propinas} €
              </div>
            </div>

            {/* Bizum del Mes */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">Bizum</span>
                <Smartphone className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {monthlyStats.currentMonth.bizum.toFixed(0)} €
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {monthlyStats.currentMonth.ingresos > 0
                    ? ((monthlyStats.currentMonth.bizum / monthlyStats.currentMonth.ingresos) * 100).toFixed(0)
                    : 0}% de los ingresos
                </div>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{
                    width: `${
                      monthlyStats.currentMonth.ingresos > 0
                        ? (monthlyStats.currentMonth.bizum / monthlyStats.currentMonth.ingresos) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Tarjeta y Efectivo del Mes */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span>Tarjeta & Efectivo</span>
                <CreditCard className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-indigo-500" /> Tarjeta:
                  </span>
                  <strong className="text-zinc-900 dark:text-white font-bold">
                    {monthlyStats.currentMonth.tarjeta.toFixed(0)} €
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Banknote className="w-3 h-3 text-emerald-500" /> Efectivo:
                  </span>
                  <strong className="text-zinc-900 dark:text-white font-bold">
                    {monthlyStats.currentMonth.efectivo.toFixed(0)} €
                  </strong>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-1.5 flex items-center justify-between">
                <span>Acumulado {selectedYear}:</span>
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {monthlyStats.totalAnual.toFixed(0)} €
                </strong>
              </div>
            </div>
          </div>

          {/* Gráfico Visual de Barras: Evolución Mes a Mes del Año */}
          <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Evolución de Ingresos Mes a Mes ({selectedYear})</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Haz clic en cualquier mes para ver su desglose completo.
                </p>
              </div>

              <div className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 self-start">
                Total año {selectedYear}:{" "}
                <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {monthlyStats.totalAnual.toFixed(0)} €
                </strong>{" "}
                ({monthlyStats.totalCitasAnual} citas)
              </div>
            </div>

            {/* Barras Interactivas */}
            <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-48 pt-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              {monthlyStats.monthsData.map((m, idx) => {
                const heightPercent =
                  monthlyStats.maxMonthlyRevenue > 0
                    ? Math.max(8, (m.ingresos / monthlyStats.maxMonthlyRevenue) * 100)
                    : 8;
                const isSelected = idx === selectedMonth;

                return (
                  <button
                    key={m.monthName}
                    type="button"
                    onClick={() => setSelectedMonth(idx)}
                    className="group flex flex-col items-center justify-end h-full w-full outline-none"
                    title={`${m.monthName}: ${m.ingresos} € (${m.citas} citas)`}
                  >
                    {/* Tooltip flotante con precio */}
                    <div className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                      {m.ingresos > 0 ? `${m.ingresos.toFixed(0)}€` : ""}
                    </div>

                    {/* Barra */}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-t from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-zinc-900"
                          : m.ingresos > 0
                          ? "bg-zinc-200 dark:bg-zinc-700 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-700"
                          : "bg-zinc-100 dark:bg-zinc-800"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Nombres de los meses */}
            <div className="grid grid-cols-12 gap-1.5 sm:gap-3 text-center pt-2">
              {monthlyStats.monthsData.map((m, idx) => (
                <button
                  key={m.monthName}
                  type="button"
                  onClick={() => setSelectedMonth(idx)}
                  className={`text-[10px] sm:text-xs font-semibold truncate transition ${
                    idx === selectedMonth
                      ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  {m.monthName.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Reparto por Barbero/Empleado y Top Servicios del Mes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facturación por Barbero en el Mes */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Rendimiento por Profesional ({MESES[selectedMonth]})</span>
              </h3>

              {monthlyStats.porBarbero.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  No hay citas cobradas registradas para este mes.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthlyStats.porBarbero.map((b) => {
                    const percent =
                      monthlyStats.currentMonth.ingresos > 0
                        ? (b.total / monthlyStats.currentMonth.ingresos) * 100
                        : 0;
                    return (
                      <div
                        key={b.id}
                        className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                            {b.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {b.citas} citas realizadas · {percent.toFixed(0)}% del total
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            {b.total.toFixed(0)} €
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Comisión (50%): {(b.total * 0.5).toFixed(0)} €
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Servicios Más Facturados del Mes */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Scissors className="w-4 h-4 text-indigo-500" />
                <span>Servicios Más Facturados ({MESES[selectedMonth]})</span>
              </h3>

              {monthlyStats.topServicios.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  No hay datos de servicios para este mes.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthlyStats.topServicios.slice(0, 5).map((srv, idx) => (
                    <div
                      key={srv.name}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                            {srv.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">{srv.citas} servicios</div>
                        </div>
                      </div>
                      <div className="font-black text-sm text-zinc-900 dark:text-white">
                        {srv.total.toFixed(0)} €
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabla Resumen Mes a Mes de Todo el Año */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Histórico de Ingresos Mes a Mes ({selectedYear})
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detalle fiscal por meses para declaración de IVA y liquidación de autónomos.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Mes</th>
                    <th className="py-3 px-4 text-center">Citas</th>
                    <th className="py-3 px-4">Bizum</th>
                    <th className="py-3 px-4">Tarjeta</th>
                    <th className="py-3 px-4">Efectivo</th>
                    <th className="py-3 px-4 text-right">Total Facturado</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {monthlyStats.monthsData.map((m, idx) => {
                    const isSelected = idx === selectedMonth;
                    return (
                      <tr
                        key={m.monthName}
                        className={`transition ${
                          isSelected
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30 font-semibold"
                            : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected
                                ? "bg-indigo-600"
                                : m.ingresos > 0
                                ? "bg-emerald-500"
                                : "bg-zinc-300 dark:bg-zinc-700"
                            }`}
                          />
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {m.monthName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-600 dark:text-zinc-300">
                          {m.citas}
                        </td>
                        <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400">
                          {m.bizum.toFixed(0)} €
                        </td>
                        <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400">
                          {m.tarjeta.toFixed(0)} €
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">
                          {m.efectivo.toFixed(0)} €
                        </td>
                        <td className="py-3 px-4 text-right font-black text-sm text-zinc-900 dark:text-white">
                          {m.ingresos.toFixed(0)} €
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedMonth(idx)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            }`}
                          >
                            {isSelected ? "Seleccionado" : "Ver mes"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-100/80 dark:bg-zinc-800 font-extrabold text-zinc-900 dark:text-white border-t-2 border-zinc-200 dark:border-zinc-700">
                    <td className="py-3.5 px-4">TOTAL ANUAL {selectedYear}</td>
                    <td className="py-3.5 px-4 text-center">{monthlyStats.totalCitasAnual}</td>
                    <td className="py-3.5 px-4 text-cyan-700 dark:text-cyan-300">
                      {monthlyStats.monthsData.reduce((acc, m) => acc + m.bizum, 0).toFixed(0)} €
                    </td>
                    <td className="py-3.5 px-4 text-indigo-700 dark:text-indigo-300">
                      {monthlyStats.monthsData.reduce((acc, m) => acc + m.tarjeta, 0).toFixed(0)} €
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-300">
                      {monthlyStats.monthsData.reduce((acc, m) => acc + m.efectivo, 0).toFixed(0)} €
                    </td>
                    <td className="py-3.5 px-4 text-right text-base text-emerald-600 dark:text-emerald-400">
                      {monthlyStats.totalAnual.toFixed(0)} €
                    </td>
                    <td className="py-3.5 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: CAJA DIARIA (ARQUEO Y COBROS DEL DÍA)           */}
      {/* ========================================================= */}
      {activeTab === "diaria" && (
        <div className="space-y-6">
          {/* Cabecera y Selector de Día */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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
                  year: "numeric",
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

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setExportType("diaria");
                  setShowExportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition"
                title="Exportar cierre del día a Google Sheets / Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Día a Google Sheets</span>
              </button>

              {/* Enlace rápido a ver el mes completo */}
              <button
                onClick={() => {
                  setSelectedMonth(selectedDate.getMonth());
                  setSelectedYear(selectedDate.getFullYear());
                  setActiveTab("mensual");
                  router.replace("/dashboard/caja?tab=mensual");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
              >
                <span>Ver resumen mes ({MESES[selectedDate.getMonth()]})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Métricas Principales de Caja Diaria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Total Facturado */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm col-span-2 sm:col-span-1">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span>Total Facturado Hoy</span>
                <Euro className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {dailyStats.totalIngresos.toFixed(0)} €
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                {dailyStats.citasCobradas} citas cobradas
              </div>
            </div>

            {/* Bizum */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">Bizum</span>
                <Smartphone className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {dailyStats.totalBizum.toFixed(0)} €
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                {dailyStats.totalIngresos > 0
                  ? ((dailyStats.totalBizum / dailyStats.totalIngresos) * 100).toFixed(0)
                  : 0}% del total
              </div>
            </div>

            {/* Efectivo */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Efectivo</span>
                <Banknote className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {dailyStats.totalEfectivo.toFixed(0)} €
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">En cajón del salón</div>
            </div>

            {/* Tarjeta */}
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="text-xs text-zinc-500 flex items-center justify-between">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Tarjeta / TPV</span>
                <CreditCard className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {dailyStats.totalTarjeta.toFixed(0)} €
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Datáfono / Redsys</div>
            </div>

            {/* Premios Fidelidad Entregados */}
            {dailyStats.totalGratisFidelidad > 0 && (
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm col-span-2 sm:col-span-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Cortes Gratis de Fidelización Entregados Hoy
                    </span>
                    <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
                      Recompensas de clientes que completaron sus 10 sellos
                    </span>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {dailyStats.totalGratisFidelidad}{" "}
                  {dailyStats.totalGratisFidelidad === 1 ? "premio" : "premios"}
                </div>
              </div>
            )}
          </div>

          {/* Desglose por Barbero en el Día */}
          {dailyStats.porBarbero.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Reparto de Facturación y Comisiones por Barbero (Hoy)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dailyStats.porBarbero.map((b) => (
                  <div
                    key={b.id}
                    className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60"
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
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Registro de Citas del Día
              </h2>
              <span className="text-xs text-zinc-500">
                {dailyStats.citasCobradas} cobradas · {dailyStats.citasPendientes} pendientes
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500">Cargando operaciones...</div>
            ) : dailyAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No hay citas registradas para este día.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {dailyAppointments.map((a) => {
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
                              : method === "gratis_fidelidad"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {method === "bizum" ? (
                            <Smartphone className="w-4 h-4" />
                          ) : method === "tarjeta" ? (
                            <CreditCard className="w-4 h-4" />
                          ) : method === "gratis_fidelidad" ? (
                            <Gift className="w-4 h-4" />
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
                          {method === "gratis_fidelidad" ? (
                            <span className="text-amber-600 dark:text-amber-400">0 € (Gratis)</span>
                          ) : (
                            `${price} €`
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            isPaid
                              ? method === "gratis_fidelidad"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {isPaid
                            ? method === "gratis_fidelidad"
                              ? "Premio Fidelidad"
                              : `Cobrado (${method})`
                            : "Pendiente de cobro"}
                        </span>

                        {isPaid && (a.clients?.phone || a.client_phone) && (
                          <div className="mt-1.5 flex justify-end">
                            <a
                              href={getWhatsAppReviewUrl(a)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold transition shadow-xs"
                              title="Pedir reseña de Google al cliente por WhatsApp"
                            >
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                              <span>Pedir Reseña ⭐</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exportación a Google Sheets / Excel */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                    Exportar para Google Sheets & Gestoría
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {exportType === "mensual"
                      ? `Informe fiscal completo de ${MESES[selectedMonth]} ${selectedYear}`
                      : `Cierre de caja del ${selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensaje de Éxito / Feedback */}
            {exportSuccessMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportSuccessMessage}</span>
              </div>
            )}

            {/* Banner de Ayuda Visual: Cómo pegar en Google Sheets (sheets.new) */}
            {sheetsHelpOpen && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 shadow-xs">
                <div className="flex items-center justify-between gap-2 font-black text-sm text-amber-950 dark:text-amber-100 mb-1">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>¿Por qué Google Sheets se abre en blanco?</span>
                  </div>
                  <button
                    onClick={() => setSheetsHelpOpen(false)}
                    className="text-[10px] text-amber-700 hover:text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800/40"
                  >
                    Cerrar aviso
                  </button>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Google siempre abre una hoja nueva vacía por seguridad. <strong>¡Tus datos ya están copiados en el portapapeles!</strong>
                </p>
                <div className="mt-2.5 bg-white/95 dark:bg-zinc-900/90 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                  <div className="flex items-start gap-2.5 font-bold text-zinc-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                    <span>En la pestaña de Google Sheets, haz clic en la primera casilla <strong>A1</strong> (arriba a la izquierda).</span>
                  </div>
                  <div className="flex items-start gap-2.5 font-bold text-zinc-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                    <span>Pulsa en tu teclado <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-[11px]">V</kbd> (o clic derecho con el ratón ➜ <em>Pegar</em>).</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pl-7">
                    ✨ ¡Verás cómo aparece automáticamente toda la tabla con fecha, cliente, Bizum, IVA 21% y totales!
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-amber-700 dark:text-amber-400">¿Prefieres no tener que pulsar Ctrl + V?</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCSV(exportType)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    ➜ Descarga el archivo .CSV listo
                  </button>
                </div>
              </div>
            )}

            {/* Resumen del Período */}
            <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">Total a exportar:</span>
              <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                {exportType === "mensual"
                  ? `${monthlyStats.currentMonth.ingresos.toFixed(2)} € (${monthlyStats.currentMonth.citas} citas)`
                  : `${dailyStats.totalIngresos.toFixed(2)} € (${dailyStats.citasCobradas} citas)`}
              </span>
            </div>

            {/* Opciones de Exportación */}
            <div className="mt-4 space-y-3">
              {/* Opción 1: Copiar datos y abrir Google Sheets (con instrucciones paso a paso) */}
              <button
                type="button"
                onClick={() => handleCopyAndOpenSheets(exportType)}
                className="w-full text-left p-4 rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/20 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/10 hover:shadow-md transition flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Copiar Datos y Abrir Google Sheets (1 Clic)</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1.5 leading-snug">
                    Copia la tabla al portapapeles y abre una hoja en tu Google Workspace. En la hoja pulsa la casilla <strong>A1</strong> y haz <strong>Pegar (Ctrl+V)</strong>.
                  </p>

                  {/* Pasos visuales claros */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-zinc-800/80 p-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                    <span>1. Clic aquí</span>
                    <span>➜</span>
                    <span>2. En Sheets pulsa A1</span>
                    <span>➜</span>
                    <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded">3. Pulsa Ctrl + V</span>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap transition shrink-0 mt-1 shadow-sm">
                  {exportCopied ? "¡Copiado! 🚀" : "Abrir y Pegar ↗"}
                </span>
              </button>

              {/* Opción 2: Descargar archivo CSV para Gestoría / Excel (Sin tener que pegar) */}
              <button
                type="button"
                onClick={() => handleDownloadCSV(exportType)}
                className="w-full text-left p-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 transition flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Descargar archivo .CSV (¡Abre directo con todos los datos!)</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[9px] font-bold">
                      Directo
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    Archivo listo para abrir con doble clic en Excel o subir a Google Sheets (<em>Archivo ➜ Importar</em>). <strong>No necesitas hacer Ctrl + V</strong>.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap transition shrink-0 mt-0.5 shadow-xs">
                  Descargar .CSV
                </span>
              </button>

              {/* Opción 3: Solo copiar al portapapeles */}
              <button
                type="button"
                onClick={() => handleCopyForGoogleSheets(exportType)}
                className="w-full text-left p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Solo copiar tabla al portapapeles (sin abrir nueva pestaña)</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {exportCopied ? "¡Copiado!" : "Copiar"}
                </span>
              </button>
            </div>

            {/* Botón para Previsualizar la Tabla de Datos directamente */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDataPreview(!showDataPreview)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  {showDataPreview ? (
                    <EyeOff className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-indigo-600" />
                  )}
                  <span>
                    {showDataPreview
                      ? "Ocultar previsualización de la tabla"
                      : "👁️ Ver y revisar los datos aquí mismo en Glowfy"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {showDataPreview ? "Cerrar" : "Ver tabla completa"}
                </span>
              </button>

              {showDataPreview && (
                <div className="mt-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700 max-h-56 overflow-auto text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">
                      Vista previa de los datos a exportar:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyForGoogleSheets(exportType)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 flex items-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Todo</span>
                    </button>
                  </div>
                  <table className="w-full text-[10px] text-left border-collapse">
                    <tbody>
                      {generateExportRows(exportType).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`border-b border-zinc-200 dark:border-zinc-700/60 ${
                            rIdx === 0 || rIdx === 3 || rIdx === 5
                              ? "font-bold bg-zinc-100 dark:bg-zinc-700/40 text-zinc-900 dark:text-white"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/20"
                          }`}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-1.5 whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Compatible con Google Workspace (@glowfy.es) y Excel</span>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="font-bold text-zinc-600 dark:text-zinc-300 hover:underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CajaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-zinc-500">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Cargando datos de facturación...</span>
        </div>
      }
    >
      <CajaContent />
    </Suspense>
  );
}
