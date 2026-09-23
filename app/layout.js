import "./globals.css";

export const metadata = {
  title: "Glowfy España — Gestión y Reservas para Barberías, Estética y Spas",
  description:
    "Software SaaS de reservas online, agenda de profesionales y cabinas, caja y gestión de clientes para Barberías, Estética y Spas en España con WhatsApp y Bizum.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Glowfy",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Glowfy" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
