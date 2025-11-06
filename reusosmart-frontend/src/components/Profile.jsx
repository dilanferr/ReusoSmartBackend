import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombre: "", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    if (!token) {
      // Si no hay sesión activa, lo manda al login
      navigate("/login");
    } else {
      setUser({
        nombre: nombre || "Usuario",
        email: email || "correo@desconocido.com",
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-6 pt-20">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-md p-8 border border-emerald-100">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="https://res.cloudinary.com/dg233psnj/image/upload/v1761606971/logo_grpepa.png"
            alt="ReusoSmart Logo"
            className="w-16 h-16 drop-shadow-md"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-4">
          Perfil del Usuario
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Aquí puedes revisar tu información y gestionar tu cuenta 🌍
        </p>

        {/* Información del usuario */}
        <div className="bg-emerald-100/50 rounded-xl p-5 text-center mb-6 shadow-inner">
          <p className="text-lg text-gray-800 font-semibold mb-2">
            👤 {user.nombre}
          </p>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Botones */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-full font-medium hover:bg-emerald-700 transition"
          >
            Volver al Inicio
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2.5 rounded-full font-medium hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Pie visual opcional */}
      <p className="mt-8 text-gray-500 text-sm">
        🌿 Gracias por ser parte de <span className="font-semibold text-emerald-600">ReusoSmart</span>
      </p>
    </div>
  );
};

export default Profile;
