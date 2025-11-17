import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Guardar datos del usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.usuario.nombre);
        localStorage.setItem("userEmail", data.usuario.email);
        if (data?.usuario?.rol !== undefined && data?.usuario?.rol !== null) {
          localStorage.setItem("userRole", String(data.usuario.rol));
        }

        // 🔄 Notificar al resto de la app que el login cambió
        window.dispatchEvent(new Event("storage"));

        setMessage(`✅ Bienvenido, ${data.usuario.nombre}`);

        // Redirigir al Home sin recargar
        setTimeout(() => {
          window.history.replaceState(null, "", "/");
          window.location.reload();
        }, 800);
      } else {
        setMessage(`❌ ${data.msg || "Error al iniciar sesión"}`);
      }
    } catch (error) {
      console.error("⚠️ Error de conexión:", error);
      setMessage("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-emerald-100">
        <div className="flex justify-center mb-4">
          <img
            src="/src/assets/logo.png"
            alt="ReusoSmart Logo"
            className="w-16 h-16"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Inicia Sesión en ReusoSmart
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>

          {message && (
            <p
              className={`text-center mt-4 ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <div className="text-center mt-4 text-sm">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="text-emerald-600 hover:underline">
                Regístrate aquí
              </a>
            </p>
            <a
              href="/forgotPassword"
              className="text-emerald-500 hover:underline block mt-2"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
