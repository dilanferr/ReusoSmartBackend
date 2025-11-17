import React from "react";

export default function Privacy() {
  return (
    <section className="bg-white pt-28 md:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-gray-800">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-6">Política de Privacidad</h2>
        <div className="space-y-4 leading-relaxed">
          <p><strong>Introducción</strong><br/>En ReusoSmart respetamos la privacidad de nuestros usuarios y nos comprometemos a proteger su información personal. Esta política describe cómo recopilamos, usamos y protegemos los datos de quienes utilizan nuestra aplicación móvil y nuestros servicios web.</p>

          <p><strong>Información que recopilamos</strong><br/>Datos personales: nombre y correo electrónico proporcionados al registrarse.<br/>Datos de geolocalización: ubicación del dispositivo, utilizada exclusivamente para mostrar los puntos de reciclaje cercanos.<br/>Datos técnicos: información del dispositivo (modelo, sistema operativo, versión de la app) con fines de mejora del servicio.</p>

          <p><strong>Finalidad del tratamiento de datos</strong><br/>Los datos se recopilan únicamente para: mostrar los puntos de reciclaje más cercanos; mejorar la precisión y funcionalidad del servicio; y analizar de forma agregada el uso de la app para fines estadísticos y de sostenibilidad.</p>

          <p><strong>Bases legales y consentimiento</strong><br/>El uso de los servicios implica el consentimiento expreso del usuario para el tratamiento de sus datos personales conforme a la Ley N°19.628 sobre Protección de la Vida Privada y la Ley N°21.180 de Transformación Digital del Estado.</p>

          <p><strong>Almacenamiento y protección de los datos</strong><br/>Los datos son almacenados en MongoDB Atlas y servidores en la nube de AWS bajo conexión HTTPS cifrada, con medidas alineadas a la norma ISO/IEC 27001, garantizando la confidencialidad, integridad y disponibilidad de la información.</p>

          <p><strong>Derechos de los usuarios</strong><br/>Los usuarios pueden en cualquier momento acceder, rectificar o eliminar sus datos personales; revocar el consentimiento de uso de la ubicación; y solicitar la eliminación total de su cuenta y sus registros.</p>

          <p><strong>Compartición de información</strong><br/>ReusoSmart no comparte datos personales con terceros sin autorización previa. Los datos anonimizados pueden ser utilizados para fines de investigación o sostenibilidad ambiental.</p>

          <p><strong>Retención de la información</strong><br/>Los datos se conservarán mientras la cuenta esté activa o sea necesario para mantener el servicio, aplicando una política de retención segura conforme a buenas prácticas de gestión de configuración de software (SCMP).</p>

          <p><strong>Cambios en la política de privacidad</strong><br/>ReusoSmart podrá actualizar esta política según nuevas normativas o mejoras del servicio. Las modificaciones serán notificadas en la aplicación antes de entrar en vigor.</p>
        </div>
      </div>
    </section>
  );
}