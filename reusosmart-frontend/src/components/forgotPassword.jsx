import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("❌ Ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Código enviado a tu correo electrónico");
        // Redirigir al formulario de restablecimiento de contraseña
        window.location.href = `/resetPassword?email=${encodeURIComponent(email)}`;
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
          Recuperar contraseña
        </h2>

        <p className="text-gray-600 text-center mb-4">
          Ingresa tu correo electrónico y te enviaremos un código de verificación.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Enviando..." : "Enviar código"}
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

export default ForgotPassword;
