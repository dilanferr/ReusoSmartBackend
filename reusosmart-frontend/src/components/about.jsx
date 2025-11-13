import React from "react";
import { FaLeaf, FaMapMarkerAlt, FaRecycle } from "react-icons/fa";

export default function About() {
  return (
    <section className="bg-white pt-28 md:pt-32 pb-20">
      <h2 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Sobre Nosotros</h2>
      <div className="max-w-4xl mx-auto px-6 text-gray-700 space-y-4 leading-relaxed">
        <p><strong>ReusoSmart</strong> es un proyecto de innovación tecnológica creado por estudiantes de Ingeniería en Informática de INACAP, orientado a promover el reciclaje electrónico en Chile. Nuestra aplicación móvil facilita la localización de puntos de reciclaje de aparatos eléctricos y electrónicos mediante geolocalización, conectando a personas y empresas con centros autorizados para reducir el impacto ambiental.</p>
        <p>Nos motiva la sostenibilidad, la eficiencia y la transparencia. Trabajamos con tecnologías modernas como React Native, Node.js y MongoDB, alojadas en AWS con estándares de seguridad ISO 27001. Nuestro objetivo es convertirnos en una plataforma reconocida por impulsar la economía circular y el cuidado del planeta.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col items-center text-center">
            <FaLeaf className="text-emerald-500 text-5xl mb-3" />
            <h3 className="text-lg font-semibold">Sostenibilidad</h3>
            <p className="text-gray-600 text-sm mt-2">Reducimos el impacto ambiental promoviendo prácticas responsables.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaMapMarkerAlt className="text-emerald-500 text-5xl mb-3" />
            <h3 className="text-lg font-semibold">Geolocalización</h3>
            <p className="text-gray-600 text-sm mt-2">Encuentra los puntos de reciclaje más cercanos de forma simple.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaRecycle className="text-emerald-500 text-5xl mb-3" />
            <h3 className="text-lg font-semibold">Economía circular</h3>
            <p className="text-gray-600 text-sm mt-2">Impulsamos la reutilización y el reciclaje de dispositivos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
