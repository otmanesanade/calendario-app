export default function manifest() {
  return {
    name: "CitasBarber España — Agenda y Reservas",
    short_name: "CitasBarber",
    description: "Software de reservas online, agenda y gestión de clientes para barberías y peluquerías en España.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
