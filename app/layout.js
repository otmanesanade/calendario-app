import "./globals.css";

const siteUrl = "https://www.glowfy.es";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Glowfy España — Software de Gestión y Reservas para Barberías, Peluquerías y Spas",
    template: "%s | Glowfy España",
  },
  description:
    "El software de reservas online líder en España para barberías, peluquerías, salones de estética y spas. Agenda de empleados y cabinas, cobros con Bizum, recordatorios por WhatsApp y 0% de comisiones por cita.",
  keywords: [
    "software barberia españa",
    "programa gestion peluqueria",
    "reservas online peluqueria",
    "agenda online estetica españa",
    "software spa wellness españa",
    "programa para peluquerias sin comisiones",
    "sistema de reservas con bizum",
    "alternativa booksy españa",
    "alternativa fresha españa",
    "software citas salon de belleza",
    "app reservas barberia madrid barcelona valencia sevilla",
    "gestion de citas peluqueria españa",
  ],
  authors: [{ name: "Glowfy España", url: siteUrl }],
  creator: "Glowfy España",
  publisher: "Glowfy España",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-ES": siteUrl,
      es: siteUrl,
    },
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "google022487ecbdb8f39b",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "Glowfy España",
    title:
      "Glowfy España — Software de Gestión y Reservas para Barberías, Peluquerías y Spas",
    description:
      "Software de reservas online sin comisiones, agenda de empleados y cabinas, cobros con Bizum y avisos automáticos por WhatsApp para salones en España.",
    images: [
      {
        url: `${siteUrl}/icon.svg`,
        width: 512,
        height: 512,
        alt: "Glowfy España — Software de Reservas y Gestión de Salones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Glowfy España — Software de Gestión y Reservas para Barberías y Salones",
    description:
      "El software de reservas y agenda online líder en España sin comisiones. Con Bizum, WhatsApp y horario partido.",
    images: [`${siteUrl}/icon.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Glowfy",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
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

const jsonLdSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Glowfy España",
  operatingSystem: "All, Web, iOS, Android (PWA)",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Appointment Scheduling Software",
  url: siteUrl,
  description:
    "Software SaaS de reservas online, agenda de profesionales y cabinas, caja con Bizum y gestión de clientes para Barberías, Peluquerías, Estética y Spas en España.",
  offers: {
    "@type": "Offer",
    price: "29.00",
    priceCurrency: "EUR",
    priceValidUntil: "2027-12-31",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "148",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Reservas online 24/7 sin comisiones",
    "Recordatorios automáticos por WhatsApp",
    "Caja diaria con desglose Bizum, Efectivo y Tarjeta",
    "Horario partido con siesta española",
    "Gestión de equipo y comisiones por barbero/estilista",
    "Solicitud de reseñas 5 estrellas para Google Maps",
  ],
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Glowfy España",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  description:
    "Plataforma tecnológica de software de reservas y gestión especializada en salones de belleza, barberías y spas en España.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ES",
  },
  areaServed: {
    "@type": "Country",
    name: "España",
  },
  sameAs: [
    "https://www.instagram.com/glowfy.es/",
    "https://www.facebook.com/profile.php?id=61594867821190",
  ],
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuáles son las tarifas y cómo funciona la suscripción de Glowfy en España?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Glowfy tiene un precio único y transparente: 29 € al mes con IVA ya incluido, sin compromiso de permanencia. Si optas por el pago anual son 290 € al año (2 meses gratis). No cobramos ningún céntimo de comisión por cita reservada.",
      },
    },
    {
      "@type": "Question",
      name: "¿Los clientes tienen que descargar alguna app para reservar cita?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tus clientes reservan directamente a través de tu enlace web propio (ej: glowfy.es/tu-centro) desde cualquier móvil u ordenador en solo 30 segundos, sin descargas obligatorias.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo funciona el horario partido con siesta española?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Glowfy está adaptado a las costumbres de España: puedes configurar turno de mañana (ej. 10:00 - 14:00) y de tarde (ej. 16:30 - 20:30). El sistema bloquea de forma estricta las horas de descanso intermedias.",
      },
    },
    {
      "@type": "Question",
      name: "¿Se puede cobrar con Bizum, efectivo o tarjeta?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Dispones de un arqueo de Caja diaria con desglose exacto por Efectivo, Tarjeta y Bizum. Al finalizar la jornada puedes cerrar la caja con un clic y descargar el balance.",
      },
    },
    {
      "@type": "Question",
      name: "¿Por qué Glowfy es la mejor alternativa a Booksy o Treatwell en España?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Glowfy no te cobra comisiones por tus clientes recurrentes ni por nuevas reservas. Tus clientes son tuyos, dispones de integración directa con Bizum y WhatsApp, y pagas una tarifa plana fija con soporte 100% en español.",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-ES">
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="google022487ecbdb8f39b" />
        <meta name="google-site-verification" content="google022487ecbdb8f39b.html" />

        {/* Geo-targeting Meta Tags for Spain */}
        <meta name="geo.region" content="ES" />
        <meta name="geo.placename" content="España" />
        <meta name="geo.position" content="40.4168;-3.7038" />
        <meta name="ICBM" content="40.4168, -3.7038" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Spain" />
        <meta name="distribution" content="Global" />

        {/* PWA & Mobile Icons */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Glowfy" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}

