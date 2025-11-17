import React from "react";

export default function Contacto() {
  return (
    <section className="bg-white pt-28 md:pt-32 pb-20 text-center px-6">
      <h2 className="text-3xl font-bold text-emerald-700 mb-8">Contáctanos</h2>
      <p className="text-gray-600 max-w-2xl mx-auto mb-10">
        ¿Tienes dudas, sugerencias o quieres colaborar con ReusoSmart? 🌿  
        Envíanos un mensaje y te responderemos a la brevedad.
      </p>

      <form className="max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Tu nombre"
          className="w-full p-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="email"
          placeholder="Tu correo"
          className="w-full p-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <textarea
          placeholder="Escribe tu mensaje"
          className="w-full p-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
        ></textarea>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition">
          Enviar mensaje
        </button>
      </form>
    </section>
  );
}
