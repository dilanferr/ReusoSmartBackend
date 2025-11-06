import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRecycle } from "react-icons/fa";
import About from "./about";
import Points from "./points";
import Contacto from "./contacto";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div id="home" className="text-gray-800">
      {/* Sección principal (Hero) */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-emerald-50 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-900">
          Dale una segunda vida a tu tecnología
        </h1>

        <p className="text-lg max-w-2xl mb-8 text-gray-700">
          Conecta con puntos de reciclaje cercanos y ayuda al planeta{" "}
          <FaRecycle className="inline text-emerald-600 text-xl" />. Registra tus
          dispositivos y promueve la sostenibilidad tecnológica.
        </p>


      </section>

      {/* Secciones importadas */}
      <section id="about">
        <About />
      </section>

      <section id="points">
        <Points />
      </section>

      <section id="contacto">
        <Contacto />
      </section>
    </div>
  );
}
