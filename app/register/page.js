"use client";

import { useState } from "react";
import Link from "next/link";
import GlowfyLogo from "../../components/GlowfyLogo";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import {
  Scissors,
  Sparkles,
  Lock,
  Mail,
  Store,
  MapPin,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Heart,
  Droplet,
} from "lucide-react";

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BUSINESS_TYPES = [
  {
    id: "barberia",
    label: "Barbería / Peluquería",
    desc: "Cortes, barbas, tintes y arreglo tradicional",
    icon: Scissors,
  },
  {
    id: "estetica",
    label: "Centro de Estética & Belleza",
    desc: "Faciales, depilación láser, manicura y cejas",
    icon: Sparkles,
  },
  {
    id: "spa",
    label: "Spa & Masajes Wellness",
    desc: "Masajes relajantes, circuito termal y bienestar",
    icon: Droplet,
  },
  {
    id: "mixto",
    label: "Salón Completo (Peluquería + Estética + Spa)",
    desc: "Todos los servicios de belleza y cuidado en un solo centro",
    icon: Heart,
  },
];

const CIUDADES_POPULARES = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Zaragoza",
  "Málaga",
  "Murcia",
  "Palma de Mallorca",
  "Bilbao",
  "Alicante",
  "Córdoba",
  "Valladolid",
  "Vigo",
  "Granada",
  "A Coruña",
  "Otra ciudad",
];

export default function RegisterPage() {
  const router = useRouter();
  const [businessType, setBusinessType] = useState("barberia");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [city, setCity] = useState("Madrid");
  const [customCity, setCustomCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleRegister() {
    setGoogleLoading(true);
    setError("");

    try {
      if (isSupabaseConfigured) {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (oauthError) {
          setError(oauthError.message || "Error al autenticar con Google.");
          setGoogleLoading(false);
          return;
        }
      } else {
        // Fallback for mock preview environment
        const nameToUse = ownerName.trim() || "Otman K";
        const businessToUse =
          businessName.trim() ||
          (businessType === "estetica"
            ? `${nameToUse} Centro Estético`
            : businessType === "spa"
            ? `${nameToUse} Spa & Wellness`
            : `${nameToUse} Barbería`);
        const finalCity = city === "Otra ciudad" ? customCity.trim() || "Madrid" : city;
        const phoneToUse = phone.trim() || "+34 612 345 678";

        const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            email: "otmank514@gmail.com",
            name: nameToUse,
          },
        });

        if (authError) {
          setError("Error al crear cuenta con Google.");
          setGoogleLoading(false);
          return;
        }

        const userId = authData?.user?.id;
        if (userId) {
          await supabase.from("barbers").upsert({
            id: userId,
            business_name: businessToUse,
            business_type: businessType,
            city: finalCity,
            phone: phoneToUse,
          });
        }

        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Error al registrarse con Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Registro Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || "Error al crear la cuenta.");
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError("Error al obtener identificador de usuario.");
        setLoading(false);
        return;
      }

      const finalCity = city === "Otra ciudad" ? customCity.trim() || "España" : city;
      let cleanPhone = phone.trim().replace(/\s+/g, "");
      if (/^[6789]\d{8}$/.test(cleanPhone)) {
        cleanPhone = `+34 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
      }

      const baseSlug = slugify(businessName) || "negocio";
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      // 2. Crear registro de negocio en barbers con su tipo
      await supabase.from("barbers").insert({
        id: userId,
        business_name: businessName.trim(),
        slug,
        business_type: businessType,
        phone: cleanPhone || "+34 600 000 000",
        city: finalCity,
        opening_time_morning: "10:00",
        closing_time_morning: "14:00",
        has_siesta: businessType === "spa" ? false : true,
        opening_time_afternoon: "16:30",
        closing_time_afternoon: "20:30",
        work_days: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
        currency: "EUR",
      });

      // 3. Crear el primer profesional del equipo o cabina
      const defaultRole =
        businessType === "estetica"
          ? "Esteticista Especialista"
          : businessType === "spa"
          ? "Terapeuta & Masajista"
          : businessType === "mixto"
          ? "Director/a del Salón"
          : "Master Barber / Fundador";

      await supabase.from("barber_staff").insert({
        barber_id: userId,
        name: ownerName.trim() || businessName.split(" ")[0] || "Profesional",
        role: defaultRole,
        avatar_color: businessType === "estetica" ? "#db2777" : businessType === "spa" ? "#059669" : "#4f46e5",
        phone: cleanPhone,
        active: true,
      });

      // 4. Crear servicios iniciales según el tipo de negocio
      let defaultServices = [];

      if (businessType === "estetica") {
        defaultServices = [
          {
            barber_id: userId,
            name: "Higiene facial profunda con punta de diamante",
            duration_minutes: 50,
            price: 35,
            category: "Estética",
            active: true,
          },
          {
            barber_id: userId,
            name: "Manicura semipermanente spa",
            duration_minutes: 40,
            price: 22,
            category: "Uñas",
            active: true,
          },
          {
            barber_id: userId,
            name: "Depilación láser diodo zonas combinadas",
            duration_minutes: 30,
            price: 45,
            category: "Estética",
            active: true,
          },
        ];
      } else if (businessType === "spa") {
        defaultServices = [
          {
            barber_id: userId,
            name: "Masaje descontracturante con aceites esenciales",
            duration_minutes: 50,
            price: 45,
            category: "Spa & Masajes",
            active: true,
          },
          {
            barber_id: userId,
            name: "Ritual Spa facial y corporal relajante",
            duration_minutes: 75,
            price: 65,
            category: "Spa & Masajes",
            active: true,
          },
          {
            barber_id: userId,
            name: "Drenaje linfático manual",
            duration_minutes: 45,
            price: 40,
            category: "Spa & Masajes",
            active: true,
          },
        ];
      } else if (businessType === "mixto") {
        defaultServices = [
          {
            barber_id: userId,
            name: "Corte de pelo y peinado profesional",
            duration_minutes: 40,
            price: 24,
            category: "Peluquería",
            active: true,
          },
          {
            barber_id: userId,
            name: "Limpieza facial iluminadora",
            duration_minutes: 45,
            price: 35,
            category: "Estética",
            active: true,
          },
          {
            barber_id: userId,
            name: "Masaje relajante espalda y cuello",
            duration_minutes: 30,
            price: 30,
            category: "Spa & Masajes",
            active: true,
          },
        ];
      } else {
        // Barbería
        defaultServices = [
          {
            barber_id: userId,
            name: "Corte de pelo clásico y degradado",
            duration_minutes: 30,
            price: 18,
            category: "Barbería",
            active: true,
          },
          {
            barber_id: userId,
            name: "Arreglo y perfilado de barba",
            duration_minutes: 20,
            price: 12,
            category: "Barbería",
            active: true,
          },
          {
            barber_id: userId,
            name: "Corte completo + Barba + Lavado",
            duration_minutes: 45,
            price: 26,
            category: "Barbería",
            active: true,
          },
        ];
      }

      for (const s of defaultServices) {
        await supabase.from("services").insert(s);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Ha ocurrido un error inesperado al registrar tu centro.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <GlowfyLogo size={42} />
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
              Glowfy
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Registra tu Centro en Glowfy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Software de reservas y agenda para Barberías, Centros de Estética y Spas en España.
          </p>
        </div>

        {/* Tarjeta de Registro */}
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Registro Rápido con Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 mb-5 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold rounded-xl text-xs sm:text-sm border border-zinc-300 dark:border-zinc-700 shadow-sm transition flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Registrarse con Google</span>
          </button>

          {/* Separador */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-semibold text-[10px] tracking-wider">
                O completa los datos de tu centro
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de Tipo de Negocio: Barbería, Estética, Spa, Mixto */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                ¿Qué tipo de negocio tienes? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUSINESS_TYPES.map((bt) => {
                  const isSelected = businessType === bt.id;
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => setBusinessType(bt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"
                          }`}
                        />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {bt.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{bt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nombre del Negocio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    required
                    placeholder={
                      businessType === "estetica"
                        ? "Ej. Centro Estética Bellísima"
                        : businessType === "spa"
                        ? "Ej. Oasis Spa & Wellness"
                        : "Ej. Barbería Madrid Centro"
                    }
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tu Nombre y Apellido *
                </label>
                <input
                  required
                  placeholder="Ej. Laura Martínez"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Ciudad en España *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 font-medium"
                  >
                    {CIUDADES_POPULARES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {city === "Otra ciudad" && (
                  <input
                    required
                    placeholder="Escribe tu ciudad o municipio"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full mt-2 py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none focus:border-indigo-600"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-zinc-400 font-semibold">
                    🇪🇸 +34
                  </div>
                  <input
                    required
                    type="tel"
                    placeholder="612 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2.5 pl-16 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Correo Electrónico (Acceso) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  required
                  type="email"
                  placeholder="admin@tu-centro.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Contraseña segura *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-indigo-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Ventajas incluidas */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  30 días de prueba gratuita sin permanencia
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  29 €/mes o 290 €/año (IVA inc.)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span>✓ Sin comisiones por reserva</span>
                <span>·</span>
                <span>✓ Con Bizum, Efectivo y Tarjeta</span>
                <span>·</span>
                <span>✓ WhatsApp automático</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !businessName.trim() || !email.trim() || !password.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Configurando tu centro...</span>
                </>
              ) : (
                <>
                  <span>Crear Centro y Empezar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 leading-tight">
              Al hacer clic en &quot;Crear Centro&quot;, confirmas que aceptas nuestros{" "}
              <Link href="/terminos-de-servicio" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="/politica-de-privacidad" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Política de Privacidad
              </Link>.
            </p>
          </form>
        </div>

        {/* Enlace a Login */}
        <div className="text-center mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          ¿Ya tienes cuenta registrada?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </main>
  );
}
