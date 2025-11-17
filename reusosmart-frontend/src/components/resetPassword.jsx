import React, { useState, useEffect } from "react";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Capturar el email desde la URL (viene del forgotPassword)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, resetCode, newPassword, confirmPassword } = formData;

    if (!email || !resetCode || !newPassword || !confirmPassword) {
      alert("❌ Completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Contraseña actualizada correctamente");
        console.log("Reset exitoso:", data);
        window.location.href = "/login";
      } else {
        alert(`❌ ${data.msg}`);
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
          Restablecer contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full bg-gray-100 border border-emerald-300 rounded-lg px-4 py-2 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Código de verificación
            </label>
            <input
              type="text"
              name="resetCode"
              placeholder="Ej: 123456"
              value={formData.resetCode}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="********"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
            {loading ? "Actualizando..." : "Restablecer contraseña"}
          </button>

          <div className="text-center mt-4 text-sm">
            <a
              href="/login"
              className="text-emerald-600 hover:underline block mt-2"
            >
              Volver al inicio de sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
