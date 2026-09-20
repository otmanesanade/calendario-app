"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Store,
  Sparkles,
  Share2,
  FileText,
  Smartphone,
  Info
} from "lucide-react";
import Link from "next/link";

export default function DashboardQrPage() {
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState("#0f172a");
  const [posterTitle, setPosterTitle] = useState("¡Reserva tu cita aquí!");
  const [posterSubtitle, setPosterSubtitle] = useState("Escanea el código con tu móvil para ver huecos libres");

  useEffect(() => {
    async function loadBarber() {
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
      }
      setLoading(false);
    }
    loadBarber();
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://glowfy.es";
  const slug = barber?.slug || "estudio-marco";
  const bookingUrl = `${origin}/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDownloadPng() {
    const canvas = document.getElementById("dashboard-qr-canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  function handlePrintStand() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Permite ventanas emergentes para imprimir el cartel.");
      return;
    }

    const canvas = document.getElementById("dashboard-qr-canvas");
    const qrDataUrl = canvas ? canvas.toDataURL("image/png") : "";
    const bName = barber?.business_name || "Nuestro Centro";
    const city = barber?.city || "España";
    const phone = barber?.phone || "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cartel de Mostrador - ${bName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              text-align: center;
              padding: 30px 20px;
              margin: 0;
              background: #ffffff;
            }
            .poster-card {
              border: 3px solid #0f172a;
              border-radius: 32px;
              padding: 40px 30px;
              max-width: 520px;
              margin: 0 auto;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .badge {
              display: inline-block;
              background: #ecfdf5;
              color: #059669;
              font-weight: 800;
              font-size: 13px;
              padding: 6px 18px;
              border-radius: 9999px;
              margin-bottom: 20px;
              letter-spacing: 0.5px;
            }
            h1 {
              font-size: 34px;
              font-weight: 900;
              margin: 0 0 8px 0;
              line-height: 1.2;
            }
            p.sub {
              font-size: 16px;
              color: #475569;
              margin: 0 0 28px 0;
            }
            .qr-wrapper {
              background: #f8fafc;
              padding: 24px;
              border-radius: 24px;
              display: inline-block;
              border: 2px dashed #cbd5e1;
              margin-bottom: 24px;
            }
            .qr-img {
              width: 270px;
              height: 270px;
              display: block;
            }
            .cta-box {
              font-size: 22px;
              font-weight: 800;
              color: #047857;
              margin-bottom: 10px;
            }
            .instructions {
              font-size: 14px;
              color: #64748b;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .meta-info {
              font-size: 13px;
              font-weight: 600;
              color: #334155;
              margin-bottom: 15px;
            }
            .url-text {
              font-family: monospace;
              font-size: 13px;
              color: #94a3b8;
            }
            .footer-brand {
              margin-top: 30px;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            <div class="badge">RESERVAS ONLINE DISPONIBLES</div>
            <h1>${bName}</h1>
            <p class="sub">${posterSubtitle}</p>
            
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" class="qr-img" alt="Código QR Reserva" />
            </div>

            <div class="cta-box">${posterTitle}</div>
            <div class="instructions">
              1. Abre la cámara de tu teléfono móvil<br />
              2. Apunta al código QR para acceder a la agenda<br />
              3. Selecciona tu servicio, tu profesional favorito y tu hora
            </div>

            ${phone || city ? `<div class="meta-info">📍 ${city} ${phone ? `· 📞 ${phone}` : ""}</div>` : ""}

            <div class="url-text">${bookingUrl}</div>
            
            <div class="footer-brand">
              Glowfy · Software inteligente de reservas para salones y spas en España
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span>Código QR & Cartel de Mostrador</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Pon este código QR en tu escaparate, en el espejo o en el mostrador para que los clientes reserven en 15 segundos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>
          <button
            onClick={handlePrintStand}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel A4</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Preview Poster Card */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Vista Previa del Cartel
              </span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Listo para imprimir
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 dark:bg-zinc-950/40 max-w-md mx-auto">
            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full mb-4 border border-emerald-200/60">
              RESERVAS ONLINE
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-1">
              {barber?.business_name || "Estudio Marco"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              {posterSubtitle}
            </p>

            {/* Canvas QR element */}
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block mb-4">
              <QRCodeCanvas
                id="dashboard-qr-canvas"
                value={bookingUrl}
                size={220}
                level="H"
                fgColor={qrColor}
                bgColor="#ffffff"
                includeMargin={true}
              />
            </div>

            <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">
              {posterTitle}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto mb-4">
              Apunta con la cámara de tu smartphone para elegir servicio y hora al instante.
            </p>

            <div className="text-[11px] font-mono text-zinc-400 break-all bg-white dark:bg-zinc-900 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-zinc-800">
              {bookingUrl}
            </div>
          </div>
        </div>

        {/* Right: Customization & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customization Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Personalizar Cartel</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Título de llamada a la acción:
              </label>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Subtítulo explicativo:
              </label>
              <input
                type="text"
                value={posterSubtitle}
                onChange={(e) => setPosterSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Color del código QR:
              </label>
              <div className="flex items-center gap-3">
                {[
                  { label: "Negro", color: "#0f172a" },
                  { label: "Émeraude", color: "#059669" },
                  { label: "Azul", color: "#2563eb" },
                  { label: "Ámbar", color: "#d97706" },
                  { label: "Burdeos", color: "#9f1239" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setQrColor(c.color)}
                    className={`w-7 h-7 rounded-full border-2 transition flex items-center justify-center ${
                      qrColor === c.color ? "border-emerald-500 scale-110 shadow-sm" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  >
                    {qrColor === c.color && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrintStand}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cartel A4 Ahora</span>
              </button>
            </div>
          </div>

          {/* Direct Link & Walk-in Tips */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Enlace Directo</span>
            </h3>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate flex-1">
                {bookingUrl}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white hover:text-emerald-600 font-bold text-xs border border-slate-200 dark:border-zinc-600 transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>

            {/* Ideas where to place QR */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <Info className="w-4 h-4" />
                <span>¿Dónde colocar este QR para maximizar citas?</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-emerald-900/80 dark:text-emerald-200/80">
                <li><strong>Escaparate o puerta de entrada:</strong> Para la gente que pasa cuando el local está cerrado o descansando en la siesta.</li>
                <li><strong>Mostrador / Caja:</strong> Para que el cliente reserve su siguiente sesión antes de marcharse.</li>
                <li><strong>En el espejo del sillón:</strong> Mientras les atiendes, pueden ver los servicios y escanear.</li>
                <li><strong>Tarjetas de visita y flyers físicos.</strong></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
