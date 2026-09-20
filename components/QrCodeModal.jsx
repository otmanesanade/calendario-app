"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Share2
} from "lucide-react";
import GlowfyLogo from "./GlowfyLogo";

export default function QrCodeModal({
  isOpen,
  onClose,
  businessName = "Mi Centro",
  slug = "demo",
  city = "España"
}) {
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState("#0f172a");
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://glowfy.es";
  const bookingUrl = `${origin}/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleDownloadPng() {
    const canvas = document.getElementById("glowfy-qr-canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${slug || "reserva"}.png`;
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

    const canvas = document.getElementById("glowfy-qr-canvas");
    const qrDataUrl = canvas ? canvas.toDataURL("image/png") : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cartel de Reserva - ${businessName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              text-align: center;
              padding: 40px 20px;
              margin: 0;
              background: #ffffff;
            }
            .poster-card {
              border: 3px solid #0f172a;
              border-radius: 28px;
              padding: 50px 30px;
              max-width: 520px;
              margin: 0 auto;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .badge {
              display: inline-block;
              background: #ecfdf5;
              color: #059669;
              font-weight: 700;
              font-size: 14px;
              padding: 6px 18px;
              border-radius: 9999px;
              margin-bottom: 24px;
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
              margin: 0 0 35px 0;
            }
            .qr-wrapper {
              background: #f8fafc;
              padding: 24px;
              border-radius: 20px;
              display: inline-block;
              border: 2px dashed #cbd5e1;
              margin-bottom: 30px;
            }
            .qr-img {
              width: 260px;
              height: 260px;
              display: block;
            }
            .cta-box {
              font-size: 20px;
              font-weight: 800;
              color: #047857;
              margin-bottom: 12px;
            }
            .instructions {
              font-size: 14px;
              color: #64748b;
              line-height: 1.5;
            }
            .url-text {
              margin-top: 30px;
              font-family: monospace;
              font-size: 13px;
              color: #94a3b8;
            }
            .footer-brand {
              margin-top: 40px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            <div class="badge">RESERVAS ONLINE 24/7</div>
            <h1>${businessName}</h1>
            <p class="sub">Elige servicio, tu profesional favorito y tu hora libre</p>
            
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" class="qr-img" alt="Código QR Reserva" />
            </div>

            <div class="cta-box">¡Abre tu cámara y escanea para reservar!</div>
            <div class="instructions">
              1. Abre la cámara de tu móvil o lector de QR<br />
              2. Apunta a este código para abrir la agenda<br />
              3. Reserva en menos de 30 segundos sin descargar ninguna app
            </div>

            <div class="url-text">${bookingUrl}</div>
            
            <div class="footer-brand">
              Gestionado con Glowfy · Agenda inteligente para barberías, estética y spas
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 sm:p-7 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Código QR de tu Centro
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Para poner en tu escaparate, mostrador o tarjetas
            </p>
          </div>
        </div>

        {/* QR Canvas Display */}
        <div className="bg-slate-50 dark:bg-zinc-950/70 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-center flex flex-col items-center justify-center mb-5">
          <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200 inline-block mb-3">
            <QRCodeCanvas
              id="glowfy-qr-canvas"
              value={bookingUrl}
              size={200}
              level="H"
              fgColor={qrColor}
              bgColor="#ffffff"
              includeMargin={true}
            />
          </div>

          <span className="font-bold text-sm text-zinc-900 dark:text-white block">
            {businessName}
          </span>
          <span className="text-xs text-zinc-500 font-mono break-all mt-0.5 max-w-xs">
            {bookingUrl}
          </span>

          {/* Color Selector */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500">
            <span>Color del QR:</span>
            <button
              onClick={() => setQrColor("#0f172a")}
              className={`w-5 h-5 rounded-full bg-slate-900 border-2 transition ${
                qrColor === "#0f172a" ? "border-emerald-500 scale-110" : "border-transparent"
              }`}
              title="Negro clásico"
            />
            <button
              onClick={() => setQrColor("#059669")}
              className={`w-5 h-5 rounded-full bg-emerald-600 border-2 transition ${
                qrColor === "#059669" ? "border-emerald-300 scale-110" : "border-transparent"
              }`}
              title="Verde Émeraude"
            />
            <button
              onClick={() => setQrColor("#2563eb")}
              className={`w-5 h-5 rounded-full bg-blue-600 border-2 transition ${
                qrColor === "#2563eb" ? "border-blue-300 scale-110" : "border-transparent"
              }`}
              title="Azul Marino"
            />
            <button
              onClick={() => setQrColor("#d97706")}
              className={`w-5 h-5 rounded-full bg-amber-600 border-2 transition ${
                qrColor === "#d97706" ? "border-amber-300 scale-110" : "border-transparent"
              }`}
              title="Dorado Ámbar"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <button
            onClick={handleDownloadPng}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar QR en PNG</span>
          </button>

          <button
            onClick={handlePrintStand}
            className="py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel A4 Mostrador</span>
          </button>
        </div>

        {/* Copy Link Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-bold">¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar enlace web</span>
              </>
            )}
          </button>

          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            <span>Abrir página</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
