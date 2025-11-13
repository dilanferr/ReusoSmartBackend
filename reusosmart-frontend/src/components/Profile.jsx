import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("perfil");
  const [user, setUser] = useState({ nombre: "", email: "" });
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    newPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const rol = localStorage.getItem("userRole");

    if (!token) {
      navigate("/login");
    } else {
      const u = { nombre: nombre || "Usuario", email: email || "correo@desconocido.com" };
      setUser(u);
      setForm((f) => ({ ...f, nombre: u.nombre, email: u.email }));
      if (rol) {
        const r = Number(rol);
        setRole(r || rol);
        // Si es admin numérico (2) o string "admin", abrir DashBoard
        const isAdminValue = r === 2 || String(rol).toLowerCase() === "admin";
        if (isAdminValue) setActiveTab("admin");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Visibilidad condicional del Dashboard admin (robusto ante strings)
  const storedRole = localStorage.getItem("userRole");
  const isAdmin =
    Number(role ?? storedRole) === 2 || String(role ?? storedRole).toLowerCase() === "admin";
  const isRole2 = Number(role ?? storedRole) === 2; // Solo rol numérico 2
  const tabs = isAdmin
    ? [
        { key: "perfil", label: "Perfil" },
        { key: "admin", label: "DashBoard" },
        ...(isRole2 ? [{ key: "admin-puntos", label: "Puntos de Reciclaje" }] : []),
      ]
    : [
        { key: "perfil", label: "Perfil" },
        { key: "puntos", label: "Puntos" },
        { key: "medallas", label: "Medallas" },
      ];

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-emerald-600 text-white flex justify-between items-center px-10 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dg233psnj/image/upload/v1761606971/logo_grpepa.png"
            alt="ReusoSmart Logo"
            className="w-10 h-10"
          />
          <h2 className="text-xl font-semibold">ReusoSmart</h2>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="/" className="hover:underline">Inicio</a>
          <a href="/nosotros" className="hover:underline">Sobre Nosotros</a>
          <a href="/puntos" className="hover:underline">Puntos de Reciclaje</a>
          <a href="/contacto" className="hover:underline">Contacto</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="bg-white text-emerald-600 font-bold w-9 h-9 rounded-full flex items-center justify-center">
            {user.nombre.charAt(0)}
          </button>
          <button
            onClick={handleLogout}
            className="border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-emerald-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Section */}
      <div className="flex flex-1 mt-6 mx-auto w-full max-w-7xl">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-emerald-100 rounded-l-xl shadow-sm">
          <div className="p-6 border-b border-emerald-100">
            <p className="text-sm text-gray-500">Bienvenido</p>
            <p className="font-semibold text-emerald-700">{user.nombre}</p>
          </div>
          <nav className="p-4 space-y-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  activeTab === t.key
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Botón adicional solo para rol 2 ya incluido en tabs */}
        </aside>

        {/* Main Content */}
        <section className="flex-1 bg-white rounded-r-xl border border-emerald-100 shadow-sm p-10">
          {activeTab === "perfil" && (
            <div>
              <h2 className="text-3xl font-bold text-emerald-700 mb-10">Perfil de Usuario</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-emerald-700 mb-6">Seguridad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cambiar contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Nueva contraseña"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={() => navigate("/")}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition"
                >
                  Volver al Inicio
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}

          {activeTab === "puntos" && (
            <div>
              <h2 className="text-3xl font-bold text-emerald-700 mb-8">Puntos</h2>
              <p className="text-gray-600 mb-4">Explora y administra tus puntos de reciclaje favoritos.</p>
              <button
                onClick={() => navigate("/puntos")}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                Ver mapa de puntos
              </button>
            </div>
          )}

          {activeTab === "medallas" && (
            <div>
              <h2 className="text-3xl font-bold text-emerald-700 mb-8">Medallas</h2>
              <p className="text-gray-600 mb-6">Logra metas y gana medallas por reciclar 🌱</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { titulo: "Explorador Verde", desc: "Visita 3 puntos de reciclaje" },
                  { titulo: "Héroe Circular", desc: "Recicla 5 dispositivos" },
                  { titulo: "Embajador Eco", desc: "Comparte ReusoSmart con tus amigos" },
                ].map((medalla, i) => (
                  <div key={i} className="border border-emerald-200 rounded-lg p-6 text-center hover:shadow-md transition">
                    <p className="font-semibold text-emerald-700">{medalla.titulo}</p>
                    <p className="text-gray-600 text-sm mt-1">{medalla.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "admin" && isAdmin && (
            <AdminDashboard />
          )}

          {/* Contenido de la subcategoría solo para rol 2 */}
          {activeTab === "admin-puntos" && isRole2 && (
            <div>
              <h2 className="text-3xl font-bold text-emerald-700 mb-8">Puntos de Reciclaje</h2>
              <p className="text-gray-600 mb-4">Accede al mapa y gestiona puntos de reciclaje.</p>
              <button
                onClick={() => navigate("/puntos")}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition"
              >
                Ir al mapa de puntos
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
