import "./globals.css";

export const metadata = {
  title: "Glowfy España — Gestión y Reservas para Barberías, Estética y Spas",
  description:
    "Software SaaS de reservas online, agenda de profesionales y cabinas, caja y gestión de clientes para Barberías, Estética y Spas en España con WhatsApp y Bizum.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Glowfy",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
