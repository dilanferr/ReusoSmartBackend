import React from "react";
import { FaLeaf, FaMapMarkerAlt, FaRecycle } from "react-icons/fa";

export default function About() {
  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold text-emerald-700 mb-8">Sobre Nosotros</h2>
      <p className="max-w-3xl mx-auto text-gray-600 mb-10">
        En <strong>ReusoSmart</strong> creemos en el poder de la tecnología para transformar el planeta. 
        Nuestra misión es fomentar la reutilización y el reciclaje de dispositivos electrónicos, 
        promoviendo la economía circular.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <FaLeaf className="text-emerald-500 text-5xl mb-3" />
          <h3 className="text-lg font-semibold">Sostenibilidad</h3>
          <p className="text-gray-600 text-sm mt-2">
            Promovemos prácticas responsables para reducir el impacto ambiental.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <FaMapMarkerAlt className="text-emerald-500 text-5xl mb-3" />
          <h3 className="text-lg font-semibold">Geolocalización</h3>
          <p className="text-gray-600 text-sm mt-2">
            Encuentra fácilmente los puntos de reciclaje más cercanos.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <FaRecycle className="text-emerald-500 text-5xl mb-3" />
          <h3 className="text-lg font-semibold">Reutilización</h3>
          <p className="text-gray-600 text-sm mt-2">
            Damos una segunda vida a los dispositivos tecnológicos.
          </p>
        </div>
      </div>
    </section>
  );
}
