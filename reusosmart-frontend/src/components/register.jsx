import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { nombre, email, password, confirmPassword } = formData;

    if (!nombre || !email || !password || !confirmPassword) {
      alert("❌ Completa todos los campos");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registro exitoso, ahora puedes iniciar sesión");
        console.log("Usuario registrado:", data);
        window.location.href = "/login";
      } else {
        alert(`❌ ${data.msg || "Error al registrarse"}`);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("⚠️ No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 to-emerald-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-emerald-100">
        <div className="flex justify-center mb-4">
          <img
            src="/src/assets/logo.png"
            alt="ReusoSmart Logo"
            className="w-16 h-16"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Regístrate en ReusoSmart
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una
              minúscula, un número y un símbolo.
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition duration-200 ${
              loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="text-center mt-4 text-sm">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-emerald-600 hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
