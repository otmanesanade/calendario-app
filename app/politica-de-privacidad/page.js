import Link from "next/link";
import GlowfyLogo from "../../components/GlowfyLogo";
import {
  ShieldCheck,
  Lock,
  Server,
  FileText,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | Glowfy España",
  description:
    "Información transparente sobre el tratamiento y protección de datos personales en Glowfy España conforme al RGPD (UE 2016/679) y la LOPD-GDD.",
  alternates: {
    canonical: "/politica-de-privacidad",
  },
};

export default function PoliticaPrivacidadPage() {
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
      <div className="bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Marco Legal RGPD & LOPD-GDD España</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Política de Privacidad y Protección de Datos
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-6">
            En Glowfy España la seguridad y la confidencialidad de tus datos y los de los clientes de tu salón son nuestra máxima prioridad. Aquí te explicamos con total claridad cómo tratamos y protegemos la información.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Última actualización: 24 de septiembre de 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Servidores seguros en la Unión Europea</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Cifrado SSL / TLS de 256 bits</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* SUMMARY HIGHLIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Nunca vendemos datos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No comercializamos ni cedemos tu información ni los contactos de tus clientes a terceras empresas bajo ningún concepto.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Total control sobre tus datos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Puedes ejercer tus derechos de acceso, rectificación, portabilidad o borrado total en cualquier momento en 1 solo clic.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Tú eres el propietario</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tu base de datos de clientes pertenece a tu negocio. Glowfy actúa como encargado técnico del tratamiento (Art. 28 RGPD).
            </p>
          </div>
        </div>

        {/* POLICY ARTICLES */}
        <article className="prose prose-slate max-w-none space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* 1. Responsable */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">1</span>
              Responsable del Tratamiento de los Datos
            </h2>
            <p className="text-slate-600 mb-4">
              En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD), se informa a los usuarios y profesionales que el responsable de los datos personales recogidos en esta plataforma es:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm font-mono space-y-1 text-slate-800">
              <p><strong>Razón Comercial:</strong> Glowfy España (SaaS de Gestión y Reservas)</p>
              <p><strong>Domicilio Social:</strong> España (Unión Europea)</p>
              <p><strong>Email de Contacto y Privacidad:</strong> soporte@glowfy.es / privacidad@glowfy.es</p>
              <p><strong>Sitio Web Oficial:</strong> https://glowfy.es</p>
              <p><strong>Actividad:</strong> Proveedor de software como servicio (SaaS) para reservas online, agenda digital y control de caja en salones de belleza, barberías y centros wellness.</p>
            </div>
          </section>

          {/* 2. Principios */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">2</span>
              Principios que Aplicamos a tu Información
            </h2>
            <p className="text-slate-600 mb-3">
              Glowfy España aplica con rigor los principios fundamentales contemplados en el artículo 5 del RGPD:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 list-none pl-0">
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Licitud, lealtad y transparencia:</strong>
                  Tratamos los datos previo consentimiento informado o ejecución de contrato.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Minimización de datos:</strong>
                  Solo solicitamos los datos estrictamente necesarios para prestar el servicio.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Exactitud y actualización:</strong>
                  Facilitamos mecanismos para rectificar cualquier dato de inmediato.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 block">Integridad y confidencialidad:</strong>
                  Cifrado de extremo a extremo y medidas técnicas para impedir accesos no autorizados.
                </div>
              </li>
            </ul>
          </section>

          {/* 3. Datos recopilados */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">3</span>
              Qué Datos Recopilamos y con qué Fines
            </h2>
            <div className="space-y-4 text-slate-600 text-sm">
              <div className="border-l-4 border-emerald-500 pl-4 py-1">
                <h4 className="font-bold text-slate-900 text-sm">A) Datos del Profesional o Titular del Salón:</h4>
                <p className="text-xs sm:text-sm mt-1">
                  Nombre del negocio, nombre del titular o responsable, dirección postal en España, CIF/NIF, correo electrónico, número de teléfono WhatsApp, credenciales seguras de acceso y datos bancarios o de tarjeta para la suscripción mensual (29 €/mes IVA inc.) o anual (290 €/año IVA inc.).
                </p>
              </div>

              <div className="border-l-4 border-indigo-500 pl-4 py-1">
                <h4 className="font-bold text-slate-900 text-sm">B) Datos de los Clientes que realizan Reservas:</h4>
                <p className="text-xs sm:text-sm mt-1">
                  Nombre de pila o apellidos, número de teléfono móvil (para confirmación y recordatorio automático vía WhatsApp), correo electrónico (opcional para recibo), servicio seleccionado, fecha y hora de la cita, profesional preferido y notas voluntarias sobre el servicio solicitado.
                </p>
              </div>

              <div className="border-l-4 border-teal-500 pl-4 py-1">
                <h4 className="font-bold text-slate-900 text-sm">C) Datos Técnicos y de Registro:</h4>
                <p className="text-xs sm:text-sm mt-1">
                  Dirección IP anonimizada, fecha y hora de las peticiones, tipo de navegador e identificadores técnicos estrictamente necesarios para prevenir ciberataques, fraudes y garantizar la disponibilidad del servicio.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Finalidad y Base Jurídica */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">4</span>
              Base Jurídica y Finalidades del Tratamiento
            </h2>
            <p className="text-slate-600 mb-4">
              Tratamos los datos personales únicamente bajo las siguientes bases de legitimación admitidas por el artículo 6 del RGPD:
            </p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-bold text-emerald-700">1. Ejecución del contrato:</span>
                <span className="text-slate-600">
                  Para permitir la creación de cuentas, la sincronización de agendas, el envío de reservas en tiempo real y el acceso al panel administrativo de gestión del negocio.
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-bold text-emerald-700">2. Consentimiento explícito:</span>
                <span className="text-slate-600">
                  Cuando el cliente final solicita una cita y acepta recibir la confirmación y el recordatorio previo por WhatsApp para evitar ausencias y olvidos.
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-bold text-emerald-700">3. Cumplimiento de obligaciones legales:</span>
                <span className="text-slate-600">
                  Emisión de facturas oficiales con IVA desglosado, contabilidad conforme a la legislación fiscal española y atención a requerimientos judiciales o de autoridades competentes.
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-bold text-emerald-700">4. Interés legítimo:</span>
                <span className="text-slate-600">
                  Garantizar la ciberseguridad de la infraestructura, prevenir accesos indebidos, ataques de denegación de servicio (DDoS) y mejorar la usabilidad del software.
                </span>
              </div>
            </div>
          </section>

          {/* 5. Rol como Encargado vs Responsable */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">5</span>
              Glowfy como Encargado del Tratamiento (Art. 28 RGPD)
            </h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Es fundamental diferenciar dos supuestos en el funcionamiento de la plataforma:
              </p>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs sm:text-sm space-y-2">
                <p>
                  <strong>• Cuando un cliente final reserva cita en el enlace público de un salón:</strong> El salón de belleza o barbería es el <em>Responsable del Tratamiento</em> de los datos de sus clientes. Glowfy España actúa exclusivamente en calidad de <em>Encargado del Tratamiento</em>, prestando el soporte tecnológico y la infraestructura para registrar la cita.
                </p>
                <p>
                  <strong>• Compromiso de Glowfy como Encargado:</strong> Glowfy no utilizará los datos de los clientes de los salones para finalidades propias, campañas publicitarias ni comunicaciones ajenas al servicio contratado por dicho salón.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Conservación */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">6</span>
              Conservación y Destrucción de Datos
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Los datos personales se conservarán únicamente durante el tiempo estrictamente necesario:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>
                <strong>Cuentas activas de salones:</strong> Mientras se mantenga activa la suscripción al servicio. Si el usuario decide darse de baja, sus datos se conservarán bloqueados durante los plazos legalmente exigibles (e.g. 5 años para prescripción de obligaciones contractuales, 4 años para obligaciones tributarias y de facturación).
              </li>
              <li>
                <strong>Datos de reservas de clientes:</strong> Se mantienen mientras el salón mantenga su cuenta abierta para fines de historial de visitas y atención al cliente, pudiendo ser eliminados o anonimizados a petición del cliente o del salón en cualquier momento.
              </li>
              <li>
                <strong>Registros técnicos de seguridad:</strong> Se conservan durante un período máximo de 6 a 12 meses, tras el cual se eliminan de forma automatizada.
              </li>
            </ul>
          </section>

          {/* 7. Derechos del Usuario */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">7</span>
              Tus Derechos (Derechos ARSOPOL)
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              De acuerdo con la normativa vigente, cualquier persona cuyos datos sean tratados por Glowfy tiene derecho a:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Acceso:</strong>
                Saber qué datos personales tuyos estamos tratando y obtener una copia de los mismos.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Rectificación:</strong>
                Corregir cualquier dato erróneo, inexacto o que haya quedado desactualizado.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Supresión (Derecho al olvido):</strong>
                Solicitar la eliminación definitiva de tus datos cuando ya no sean precisos para la finalidad con la que se recogieron.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Limitación del tratamiento:</strong>
                Solicitar que se suspenda temporalmente el tratamiento en los casos previstos por la ley.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Portabilidad:</strong>
                Recibir tus datos en un formato digital estructurado, común y de lectura mecánica (JSON/CSV) para transferirlos a otro proveedor.
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Oposición:</strong>
                Oponerte a que tus datos sean tratados para finalidades concretas basadas en interés legítimo.
              </div>
            </div>

            <div className="mt-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-900">
              <p className="font-semibold mb-1">¿Cómo ejercer estos derechos?</p>
              <p>
                Basta con enviar un email a <strong>privacidad@glowfy.es</strong> con el asunto &quot;Ejercicio de Derechos RGPD&quot;, indicando tu petición y adjuntando documento acreditativo de tu identidad. Te responderemos en un plazo máximo de 30 días sin coste alguno.
              </p>
              <p className="mt-2 text-[11px] text-emerald-800">
                Asimismo, tienes derecho a presentar una reclamación ante la Autoridad de Control competente: la <strong>Agencia Española de Protección de Datos (AEPD)</strong> a través de su portal oficial: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline font-bold">www.aepd.es</a>.
              </p>
            </div>
          </section>

          {/* 8. Destinatarios y Proveedores */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">8</span>
              Destinatarios y Subencargados de Tratamiento
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Para poder ofrecer el servicio con alta disponibilidad, velocidad y notificaciones inmediatas, Glowfy se apoya en proveedores de tecnología de primer nivel suscritos a acuerdos de confidencialidad y tratamiento de datos (DPA):
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>
                <strong>Proveedores de Alojamiento y Nube:</strong> Servidores y bases de datos con centros en la Unión Europea dotados de certificados ISO 27001, SOC 2 y cumplimiento RGPD.
              </li>
              <li>
                <strong>Servicios de Mensajería WhatsApp:</strong> Proveedores autorizados por Meta Platforms Ireland Ltd. con cumplimiento explícito de las cláusulas contractuales tipo europeas para el envío de confirmaciones y recordatorios de citas.
              </li>
              <li>
                <strong>Pasarelas de Pago Seguras:</strong> Para la suscripción al software (29 €/mes o 290 €/año), la información de tarjeta de crédito/débito es procesada directamente por pasarelas certificadas PCI-DSS Nivel 1. Glowfy nunca almacena los números completos de tarjeta ni los códigos CVC en sus bases de datos.
              </li>
            </ul>
          </section>

          {/* 9. Seguridad y Cifrado */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center justify-center font-black">9</span>
              Medidas de Seguridad Técnicas y Organizativas
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              En cumplimiento del artículo 32 del RGPD, Glowfy aplica rigurosas salvaguardas técnicas y organizativas para garantizar un nivel de seguridad adecuado al riesgo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✓ <strong>Cifrado TLS en tránsito:</strong> Todas las comunicaciones entre tu navegador y los servidores viajan mediante HTTPS con cifrado seguro.
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✓ <strong>Cifrado en reposo:</strong> Las bases de datos y respaldos se almacenan cifrados con algoritmos AES-256.
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✓ <strong>Copias de seguridad automatizadas:</strong> Respaldos periódicos redundantes para prevenir pérdidas accidentales.
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✓ <strong>Control de accesos restringido:</strong> Políticas de mínimo privilegio y autenticación multifactor en la gestión del sistema.
              </div>
            </div>
          </section>

          {/* 10. Contacto */}
          <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">¿Tienes alguna duda sobre privacidad?</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Nuestro equipo de cumplimiento y soporte legal atenderá cualquier cuestión en menos de 24 horas laborables.
                </p>
              </div>
              <a
                href="mailto:privacidad@glowfy.es"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition flex-shrink-0"
              >
                <Mail className="w-4 h-4" />
                <span>Contactar con Privacidad</span>
              </a>
            </div>
          </section>
        </article>

        {/* BOTTOM NAV */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link
            href="/terminos-de-servicio"
            className="text-emerald-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ver los Términos de Servicio</span>
            <FileText className="w-3.5 h-3.5" />
          </Link>
          <p>© {new Date().getFullYear()} Glowfy España. Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  );
}
