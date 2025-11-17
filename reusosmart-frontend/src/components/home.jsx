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
      {/* Sección principal (Hero) con video de fondo */}
      <section className="relative min-h-[80vh] overflow-hidden flex flex-col items-center justify-center text-center bg-emerald-50 px-6">
        {/* Video de fondo servido por Vite desde /public/images */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onCanPlay={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/images/Video-Fondo-ReusoSmart.mp4" type="video/mp4" />
        </video>

        {/* Contenido encima del video: mantenemos h1 y p y los desplazamos bajo el navbar */}
        <div className="relative z-10 pt-24 md:pt-28">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Dale una segunda vida a tu tecnología
          </h1>

          <p className="text-lg max-w-2xl mb-8 text-white">
            Conecta con puntos de reciclaje cercanos y ayuda al planeta{" "}
            <FaRecycle className="inline text-emerald-600 text-xl" />. Registra tus
            dispositivos y promueve la sostenibilidad tecnológica.
          </p>
        </div>

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
