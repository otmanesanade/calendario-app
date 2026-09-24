import Link from "next/link";
import GlowfyLogo from "../../components/GlowfyLogo";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  CreditCard,
  Ban,
  RefreshCw,
  Scale,
  Mail,
  Zap,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Términos de Servicio y Condiciones de Uso | Glowfy España",
  description:
    "Términos y condiciones legales de uso de la plataforma Glowfy España. Tarifas transparentes de 29 €/mes o 290 €/año (IVA incluido), 0€ comisiones y 30 días de prueba gratuita.",
  alternates: {
    canonical: "/terminos-de-servicio",
  },
};

export default function TerminosDeServicioPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition hover:opacity-90"
          >
            <GlowfyLogo size={32} />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                Glowfy <span className="text-emerald-600 font-medium text-xs">España</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la página principal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Condiciones Contractuales Claras & Transparentes</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Términos de Servicio y Condiciones de Contratación
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-6">
            Bienvenido a Glowfy España. Este documento regula el acceso y uso de nuestra plataforma de reservas online, agenda digital y gestión integral para salones de belleza, barberías y spas.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Última actualización: 24 de septiembre de 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>29 €/mes o 290 €/año (IVA incluido)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-emerald-600" />
              <span>0 € comisiones por reserva · Sin permanencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* KEY HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Precio Fijo y Transparente</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              29 €/mes o 290 €/año con el IVA ya incluido. Nunca cobramos porcentajes ni comisiones sobre las reservas de tus clientes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Sin Permanencia</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eres libre en todo momento. Puedes cancelar tu suscripción con un solo clic desde tu panel sin penalizaciones ni letras pequeñas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Tus Clientes son Tuyos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Glowfy no publica tu salón en marketplaces competitivos ni desvía a tus clientes hacia otros salones de tu zona.
            </p>
          </div>
        </div>

        {/* CLAUSES */}
        <article className="prose prose-slate max-w-none space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* 1. Objeto y Generalidades */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">1</span>
              Objeto y Ámbito de Aplicación
            </h2>
            <p className="text-slate-600 mb-3">
              El presente documento establece las condiciones legales que regulan el acceso, suscripción y utilización de la plataforma digital y el software como servicio (SaaS) denominado <strong>Glowfy España</strong> (en adelante, &quot;Glowfy&quot; o &quot;la Plataforma&quot;).
            </p>
            <p className="text-slate-600">
              Al crear una cuenta en Glowfy, suscribir un plan o utilizar cualquiera de sus funciones, usted declara ser mayor de edad con capacidad legal para contratar y acepta someterse íntegramente a estos Términos de Servicio y a nuestra <Link href="/politica-de-privacidad" className="text-emerald-600 font-semibold underline">Política de Privacidad</Link>. Si actúa en nombre de una persona jurídica (empresa, SL o sociedad civil), garantiza contar con facultades suficientes de representación.
            </p>
          </section>

          {/* 2. Descripción del Servicio */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">2</span>
              Descripción de las Funcionalidades del Software
            </h2>
            <p className="text-slate-600 mb-4">
              Glowfy proporciona a profesionales del sector de la belleza, estética y bienestar (barberías, peluquerías, centros de estética, uñas, spa, tatuajes y fisioterapia) una solución digital integral que incluye:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <strong className="block text-slate-900 mb-1">🔗 Enlace propio y web de reservas:</strong>
                Página personalizada por centro (ej. <code>glowfy.es/tu-salon</code>) donde tus clientes reservan 24/7 sin necesidad de descargar ninguna app externa.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <strong className="block text-slate-900 mb-1">📅 Agenda visual inteligente:</strong>
                Gestión simultánea de empleados, cabinas, tiempos de servicio, horarios de apertura y descanso.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <strong className="block text-slate-900 mb-1">💬 Notificaciones WhatsApp automáticas:</strong>
                Confirmaciones instantáneas y recordatorios previos a la cita para erradicar las inasistencias y no-shows.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <strong className="block text-slate-900 mb-1">💶 Módulo de Caja y Finanzas:</strong>
                Registro ágil de cobros en Efectivo, Bizum y Tarjeta, balance diario y métricas de facturación.
              </div>
            </div>
          </section>

          {/* 3. Precios y Condiciones Económicas */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">3</span>
              Planes, Tarifas y Facturación
            </h2>
            <div className="space-y-4 text-slate-600 text-sm">
              <p>
                Glowfy opera bajo un modelo de tarifa plana transparente, sin costes ocultos ni comisiones por el volumen de citas recibidas:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Modalidad Mensual</div>
                  <div className="text-2xl font-black text-slate-900">29 € <span className="text-xs font-medium text-slate-500">/ mes (IVA inc.)</span></div>
                  <p className="text-xs text-slate-600 mt-2">
                    Cobro automático mensual. Puedes cancelar en cualquier momento sin compromiso de permanencia.
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 relative">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                    Ahorra 2 meses
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Modalidad Anual</div>
                  <div className="text-2xl font-black text-slate-900">290 € <span className="text-xs font-medium text-slate-500">/ año (IVA inc.)</span></div>
                  <p className="text-xs text-slate-600 mt-2">
                    Pago único anual con 58 € de ahorro (equivalente a 2 meses totalmente gratis).
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 text-xs sm:text-sm space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Garantía de 0% Comisiones:
                </p>
                <p>
                  El 100% del dinero cobrado a tus clientes por los servicios de corte, peluquería, manicura, masajes o estética va directamente a tu salón a través de tus métodos habituales (Efectivo, Bizum o TPV bancario del salón). Glowfy <strong>nunca</strong> cobra comisiones por cita ni retiene tu dinero.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                Los precios indicados incluyen el Impuesto sobre el Valor Añadido (IVA español al 21%). Se expedirá mensualmente o anualmente la factura electrónica oficial correspondiente para la deducción fiscal de tu negocio.
              </p>
            </div>
          </section>

          {/* 4. Período de Prueba */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">4</span>
              Período de Prueba Gratuita (30 días)
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Todos los nuevos centros disponen de un período de prueba de <strong>30 días naturales</strong> con acceso irrestricto a todas las funcionalidades del software. Durante este período, el titular podrá familiarizarse con la agenda, publicar su enlace y recibir reservas de prueba.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Finalizados los 30 días, el usuario podrá decidir si continúa activando su suscripción regular (29 €/mes o 290 €/año). Si decide no continuar, la cuenta no generará ningún cargo automático no autorizado.
            </p>
          </section>

          {/* 5. Cancelación y Baja */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">5</span>
              Cancelación del Servicio y Ausencia de Permanencia
            </h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                No exigimos ningún tipo de permanencia mínima ni penalización por baja anticipada:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong>Baja inmediata:</strong> Puedes cursar la baja en cualquier momento desde el menú de configuración de tu panel de control o enviando un email a <code>soporte@glowfy.es</code>.
                </li>
                <li>
                  <strong>Efectividad:</strong> La baja surtirá efectos al término del período de facturación en curso (mes o año pagado), manteniendo el acceso activo hasta esa fecha.
                </li>
                <li>
                  <strong>Exportación de datos:</strong> Antes de que tu cuenta sea cerrada, dispondrás de la opción de exportar el listado completo de clientes, citas y facturación en formatos estándar (CSV / Excel).
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Uso Aceptable y Obligaciones */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">6</span>
              Obligaciones del Usuario y Uso Aceptable
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              El usuario profesional se compromete a:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>
                Proporcionar información veraz, actualizada y exacta sobre su negocio y los servicios ofrecidos.
              </li>
              <li>
                Mantener en estricta confidencialidad sus credenciales y contraseñas de acceso al panel de administración.
              </li>
              <li>
                No utilizar el servicio ni la integración de notificaciones por WhatsApp para enviar mensajes no deseados (SPAM), publicidad engañosa o contenidos ilícitos que vulneren la legislación española o las directivas de WhatsApp / Meta.
              </li>
              <li>
                Respetar las reservas confirmadas de sus clientes y prestar los servicios acordados bajo estándares de calidad profesional.
              </li>
            </ul>
          </section>

          {/* 7. Responsabilidad del Servicio */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">7</span>
              Disponibilidad, Garantía y Limitación de Responsabilidad
            </h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Glowfy despliega sus mejores esfuerzos técnicos para garantizar un nivel de disponibilidad continua del software superior al 99,5% anual. No obstante:
              </p>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs sm:text-sm space-y-2">
                <p>
                  <strong>• Interrupciones de mantenimiento:</strong> Podrán realizarse intervenciones técnicas programadas en horarios de bajo impacto avisando previamente cuando resulte factible.
                </p>
                <p>
                  <strong>• Servicios de terceros:</strong> Glowfy no asume responsabilidad por caídas atribuibles a redes públicas de telecomunicaciones, servidores DNS ajenos o incidencias de la red global de WhatsApp / Meta.
                </p>
                <p>
                  <strong>• Servicios físicos del salón:</strong> La prestación material del servicio (corte, tinte, masaje, tratamiento estético) y cualquier disputa de consumo referente a la calidad del trabajo en el salón corresponde en exclusiva entre el cliente final y el establecimiento físico.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Propiedad Intelectual */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">8</span>
              Propiedad Intelectual e Industrial
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Todos los elementos que integran la plataforma Glowfy (código fuente, diseño visual, logotipos, algoritmos, interfaz de usuario y arquitectura de software) son de la titularidad exclusiva de Glowfy España y están protegidos por las leyes de propiedad intelectual e industrial españolas e internacionales.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              El salón mantiene en todo momento la plena titularidad sobre su marca, logotipo, fotos de trabajos, precios y base de datos de clientes subida a su cuenta.
            </p>
          </section>

          {/* 9. Ley Aplicable y Jurisdicción */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm flex items-center justify-center font-black">9</span>
              Ley Aplicable y Resolución de Conflictos
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Las presentes Condiciones de Servicio se rigen e interpretan de acuerdo con la legislación común del Reino de España y la normativa comunitaria de la Unión Europea.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              En caso de controversia o litigio que no pueda solventarse por la vía del acuerdo amistoso a través de <code>soporte@glowfy.es</code>, las partes se someten a los Juzgados y Tribunales competentes de España, sin perjuicio de los fueros imperativos aplicables en caso de que concurra la condición legal de consumidor según el Real Decreto Legislativo 1/2007.
            </p>
          </section>

          {/* 10. Contacto y Asistencia */}
          <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">¿Deseas aclarar alguna cláusula contractual?</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Escríbenos directamente y un asesor de Glowfy te atenderá de forma personalizada.
                </p>
              </div>
              <a
                href="mailto:soporte@glowfy.es"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm transition flex-shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Contactar con Soporte Legal</span>
              </a>
            </div>
          </section>
        </article>

        {/* BOTTOM NAV */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link
            href="/politica-de-privacidad"
            className="text-emerald-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Consultar la Política de Privacidad</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </Link>
          <p>© {new Date().getFullYear()} Glowfy España. Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  );
}
