import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-emerald-50 border-t border-emerald-200 text-gray-700 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Logo y descripción */}
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-3">
            <img
              src="/src/assets/logo.png"
              alt="ReusoSmart Logo"
              className="w-10 h-10 mr-2"
            />
            <span className="text-xl font-semibold text-emerald-700">ReusoSmart</span>
          </div>
          <p className="text-sm text-gray-600">
            Tecnología que regresa al planeta 🌍. Promoviendo el reciclaje
            electrónico y la sostenibilidad en Chile.
          </p>
        </div>

        {/* Enlaces */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold text-emerald-800 mb-2">Enlaces útiles</h3>
          <Link to="/" className="hover:text-emerald-600">Inicio</Link>
          <Link to="/nosotros" className="hover:text-emerald-600">Sobre Nosotros</Link>
          <a href="#puntos" className="hover:text-emerald-600">Puntos de Reciclaje</a>
          <Link to="/contacto" className="hover:text-emerald-600">Contacto</Link>
        </div>

        {/* Información legal */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold text-emerald-800 mb-2">Información</h3>
          <Link to="/privacidad" className="hover:text-emerald-600">Política de privacidad</Link>
          <Link to="/terminos" className="hover:text-emerald-600">Términos y condiciones</Link>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-emerald-200 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ReusoSmart. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
