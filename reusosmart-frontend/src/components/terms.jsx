import React from "react";

export default function Terms() {
  return (
    <section className="bg-white pt-28 md:pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-gray-800">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-6">Términos y Condiciones</h2>

        <div className="space-y-4 leading-relaxed">
          <p>
            <strong>Aceptación de los términos</strong><br/>
            Al descargar, acceder o utilizar la aplicación ReusoSmart, el usuario acepta estos Términos y Condiciones en su totalidad. Si el usuario no está de acuerdo con alguno de los puntos, deberá abstenerse de utilizar la aplicación.
          </p>

          <p>
            <strong>Descripción del servicio</strong><br/>
            ReusoSmart es una aplicación móvil que permite localizar puntos de reciclaje de aparatos eléctricos y electrónicos mediante geolocalización. La aplicación tiene un propósito educativo y ambiental, sin fines de lucro, orientado a fomentar la sostenibilidad y el cumplimiento de la Ley REP N°20.920 sobre Responsabilidad Extendida del Productor.
          </p>

          <p>
            <strong>Uso permitido</strong><br/>
            El usuario se compromete a utilizar la aplicación de manera ética y conforme a la legislación chilena vigente. Queda prohibido:
            <br/>• Manipular o falsificar datos de ubicación.
            <br/>• Publicar información falsa o inexacta sobre puntos de reciclaje.
            <br/>• Intentar vulnerar la seguridad del sistema o acceder sin autorización.
          </p>

          <p>
            <strong>Registro y cuentas de usuario</strong><br/>
            El registro requiere proporcionar un correo electrónico y una contraseña segura. El usuario es responsable de mantener la confidencialidad de sus credenciales y de cualquier actividad realizada bajo su cuenta. Las contraseñas se almacenan cifradas conforme a las políticas de seguridad ISO/IEC 27001 e IEEE/EIA 12207 aplicadas en el proyecto.
          </p>

          <p>
            <strong>Datos personales y privacidad</strong><br/>
            El uso de la aplicación implica la aceptación de nuestra <a href="/privacidad" className="text-emerald-700 hover:underline">Política de Privacidad</a>, que regula el tratamiento de los datos personales conforme a la Ley N°19.628.
            ReusoSmart se compromete a proteger la información del usuario mediante cifrado, control de accesos y almacenamiento seguro en MongoDB Atlas y AWS Cloud con conexión HTTPS.
          </p>

          <p>
            <strong>Limitación de responsabilidad</strong><br/>
            ReusoSmart no se responsabiliza por interrupciones del servicio, errores en la geolocalización o disponibilidad de los puntos de reciclaje mostrados. La información entregada tiene fines informativos y puede variar según la actualización de las fuentes.
          </p>

          <p>
            <strong>Propiedad intelectual</strong><br/>
            Todo el contenido, código fuente, diseño y material visual de la aplicación pertenece a los autores del proyecto ReusoSmart. Queda prohibida su copia, modificación o redistribución sin autorización previa por escrito.
          </p>

          <p>
            <strong>Modificaciones del servicio</strong><br/>
            ReusoSmart puede actualizar o modificar sus funcionalidades sin previo aviso, buscando mejorar la experiencia del usuario o adaptarse a nuevas normativas técnicas y de seguridad.
          </p>

          <p>
            <strong>Suspensión o eliminación de cuentas</strong><br/>
            ReusoSmart se reserva el derecho de suspender o eliminar cuentas que infrinjan estos términos o realicen un uso indebido del servicio.
          </p>
        </div>
      </div>
    </section>
  );
}