import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // 🧠 Detectar si hay sesión activa
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const nombre = localStorage.getItem("userName");
      if (token && nombre) {
        setIsLoggedIn(true);
        setUserName(nombre);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  // 🔄 Desplazamiento suave al inicio
  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    goTo("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-emerald-600/90 backdrop-blur-md shadow-lg border-b border-emerald-700/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 text-white">
        {/* Logo clickeable */}
        <div
          onClick={() => goTo("/")}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <img
            src="https://res.cloudinary.com/dg233psnj/image/upload/v1761606971/logo_grpepa.png"
            alt="ReusoSmart Logo"
            className="w-9 h-9 drop-shadow-md transition-transform duration-300 hover:scale-105"
          />
          <span className="font-bold text-lg hover:text-emerald-200 transition-colors">
            ReusoSmart
          </span>
        </div>

        {/* 🖥️ Menú escritorio */}
        <ul className="hidden md:flex gap-8 font-medium items-center">
          <li>
            <button onClick={() => goTo("/")} className="hover:text-emerald-200 transition">
              Inicio
            </button>
          </li>
          <li>
            <button onClick={() => goTo("/nosotros")} className="hover:text-emerald-200 transition">
              Sobre Nosotros
            </button>
          </li>
          <li>
            <button onClick={() => goTo("/puntos")} className="hover:text-emerald-200 transition">
              Puntos de Reciclaje
            </button>
          </li>
          <li>
            <button onClick={() => goTo("/contacto")} className="hover:text-emerald-200 transition">
              Contacto
            </button>
          </li>

          {/* 👤 Estado de sesión */}
          {isLoggedIn ? (
            <>
              <li>
                <button
                  onClick={() => goTo("/perfil")}
                  className="flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-100 shadow-md transition"
                >
                  <div className="bg-emerald-600 text-white w-7 h-7 flex items-center justify-center rounded-full font-bold shadow-inner">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span>Perfil</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-emerald-700 transition"
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={() => goTo("/login")}
                className="bg-white text-emerald-700 px-5 py-2 rounded-full hover:bg-emerald-100 transition"
              >
                Iniciar Sesión
              </button>
            </li>
          )}
        </ul>

        {/* 📱 Botón móvil */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 📱 Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-emerald-700/95 backdrop-blur-md border-t border-emerald-800/40 shadow-xl transition-all duration-300">
          <ul className="flex flex-col items-center py-4 space-y-4 font-medium text-white">
            <li>
              <button onClick={() => { goTo("/"); setMenuOpen(false); }} className="hover:text-emerald-200">
                Inicio
              </button>
            </li>
            <li>
              <button onClick={() => { goTo("/nosotros"); setMenuOpen(false); }} className="hover:text-emerald-200">
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button onClick={() => { goTo("/puntos"); setMenuOpen(false); }} className="hover:text-emerald-200">
                Puntos de Reciclaje
              </button>
            </li>
            <li>
              <button onClick={() => { goTo("/contacto"); setMenuOpen(false); }} className="hover:text-emerald-200">
                Contacto
              </button>
            </li>

            {isLoggedIn ? (
              <>
                <li>
                  <button
                    onClick={() => { goTo("/perfil"); setMenuOpen(false); }}
                    className="bg-white text-emerald-700 px-5 py-2 rounded-full hover:bg-emerald-100 transition"
                  >
                    Perfil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="px-5 py-2 border border-white rounded-full hover:bg-white hover:text-emerald-700 transition"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  onClick={() => { goTo("/login"); setMenuOpen(false); }}
                  className="bg-white text-emerald-700 px-5 py-2 rounded-full hover:bg-emerald-100 transition"
                >
                  Iniciar Sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
