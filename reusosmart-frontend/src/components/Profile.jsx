import React, { useEffect, useMemo, useRef, useState } from "react";
import regionesRaw from "../assets/Regiones_y_Comunas.txt?raw";
import elementosRaw from "../assets/Elementos_AEE.txt?raw";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  // Estado para el mapa en la vista admin-puntos
  const [mapPoints, setMapPoints] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pointsAction, setPointsAction] = useState(null); // 'add' | 'edit' | 'delete'

  // Estado del formulario para AGREGAR PUNTO
  const [encargado, setEncargado] = useState("");
  const [administrador, setAdministrador] = useState("");
  const [nombrePunto, setNombrePunto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("+56 ");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialesAceptados, setMaterialesAceptados] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Regiones y comunas (desde API DPA Chile) con búsqueda
  const [regions, setRegions] = useState([]);
  const [regionSearch, setRegionSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [communes, setCommunes] = useState([]);
  const [communeSearch, setCommuneSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [regionDataMap, setRegionDataMap] = useState({});

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

  // Carga de puntos sólo cuando se abre la vista "Puntos de Reciclaje" (admin-puntos)
  useEffect(() => {
    const loadPoints = async () => {
      if (activeTab !== "admin-puntos") return;
      setMapLoading(true);
      setMapError(null);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";
        const res = await fetch(`${API_BASE}/api/puntos`);
        if (!res.ok) throw new Error("Error al obtener los puntos");
        const data = await res.json();
        setMapPoints(data);
      } catch (err) {
        console.error("Error cargando puntos:", err);
        setMapError("No se pudieron cargar los puntos de reciclaje.");
      } finally {
        setMapLoading(false);
      }
    };
    loadPoints();
  }, [activeTab]);

  // Parseo offline de regiones y comunas desde assets
  const regionesParsed = useMemo(() => {
    const lines = regionesRaw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const regionRegex = /\bRegión\b/i;
    const skipRegex = /(Province|Provincia)/i;
    const map = {};
    let current = null;
    for (const line of lines) {
      if (regionRegex.test(line)) {
        current = line.replace(/^([IVXLCDM]+\.)\s*/, "");
        map[current] = map[current] || [];
        continue;
      }
      if (!current) continue;
      if (skipRegex.test(line)) continue;
      // Normaliza posibles marcas
      const name = line.replace(/\?\s*→.*$/,"" );
      if (name.length > 0 && !map[current].includes(name)) {
        map[current].push(name);
      }
    }
    const list = Object.keys(map).map((r) => ({ value: r, label: r }));
    return { list, map };
  }, []);

  useEffect(() => {
    if (activeTab !== "admin-puntos") return;
    setRegions(regionesParsed.list);
    setRegionDataMap(regionesParsed.map);
  }, [activeTab, regionesParsed]);

  useEffect(() => {
    if (!selectedRegion) { setCommunes([]); return; }
    const regionName = selectedRegion.label;
    const cms = (regionDataMap[regionName] || []).map((c) => ({ value: c, label: c }));
    setCommunes(cms);
  }, [selectedRegion, regionDataMap]);

  // Opciones de materiales aceptados (fallback si no está el archivo)
  const materialesOpciones = useMemo(() => {
    const lines = elementosRaw.split(/\r?\n/).map((l) => l.trim());
    const result = [];
    for (const l of lines) {
      if (!l) continue;
      // ignora encabezados por emoji/categoría y secciones numeradas
      if (/^[\p{Emoji}\p{So}]/u.test(l)) continue;
      if (/^\d+\./.test(l)) continue;
      // ignora categorías con paréntesis
      if (/\d+\./.test(l)) continue;
      // agrega ítems
      result.push(l);
    }
    // Limpia duplicados
    return Array.from(new Set(result));
  }, []);

  const formatChilePhone = (raw) => {
  // Mantener solo dígitos
  const digits = raw.replace(/[^0-9]/g, "");

  // Caso: usuario intentó borrar todo → dejar solo +56
  if (digits.length <= 2) {
    return "+56";
  }

  // Si el usuario escribió "56" al inicio, eliminarlo
  let number = digits.startsWith("56") ? digits.slice(2) : digits;

  // Si no hay nada después del 56, devolver solo +56
  if (number.length === 0) {
    return "+56";
  }

  // Formato móvil (9 XXXX XXXX)
  if (number.startsWith("9")) {
    const p1 = number.slice(0, 1);
    const p2 = number.slice(1, 5);
    const p3 = number.slice(5, 9);
    return `+56 ${p1}${p2 ? " " + p2 : ""}${p3 ? " " + p3 : ""}`.trim();
  }

  // Formato fijo (2 / 3x / 4x ...)
  const a1 = number.slice(0, 1);
  const a2 = number.slice(1, 5);
  const a3 = number.slice(5, 9);

  return `+56 ${a1}${a2 ? " " + a2 : ""}${a3 ? " " + a3 : ""}`.trim();
};

  const handleCreatePoint = async () => {
    setCreateError("");
    setCreateSuccess("");
    // Validaciones mínimas
    if (!nombrePunto.trim() || !direccion.trim() || !selectedRegion || !selectedCommune) {
      setCreateError("Completa nombre del punto, dirección, región y comuna.");
      return;
    }

    const horario =
      horaInicio || horaFin
        ? `${horaInicio || "--:--"} a ${horaFin || "--:--"}`
        : "Horario no especificado";

    const payload = {
      nombre_punto: nombrePunto.trim(),
      encargado: encargado.trim(),
      administrador: administrador.trim(),
      direccion_completa: direccion.trim(),
      telefono,
      horario,
      estado: "open",
      comuna_nombre: selectedCommune?.label,
      region_nombre: selectedRegion?.label,
      materiales_aceptados: materialesAceptados,
    };

    try {
      setCreateLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";
      const res = await fetch(`${API_BASE}/api/puntos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Error HTTP");
      }
      const saved = await res.json();
      if (typeof saved.latitud === "number" && typeof saved.longitud === "number") {
        setMapPoints((prev) => [...prev, saved]);
      }
      setCreateSuccess("Punto creado correctamente.");
      // Limpieza del formulario
      setEncargado("");
      setAdministrador("");
      setNombrePunto("");
      setDireccion("");
      setTelefono("+56 ");
      setHoraInicio("");
      setHoraFin("");
      setMaterialesAceptados([]);
    } catch (err) {
      setCreateError("No se pudo crear el punto. " + (err.message || ""));
    } finally {
      setCreateLoading(false);
    }
  };

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
      <header className="bg-emerald-600 text-white flex justify-between items-center px-10 py-4 shadow-md relative z-30">
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
      <div className="flex flex-1 mt-8 mx-auto w-full max-w-7xl relative z-0">
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

          {/* Contenido del botón "Puntos de Reciclaje" solo para rol 2 */}
          {activeTab === "admin-puntos" && isRole2 && (
            <div>
              <h2 className="text-3xl font-bold text-emerald-700 mb-6">Puntos de Reciclaje</h2>

              {/* Cuando se selecciona AGREGAR PUNTO: formulario a la izquierda y mapa reducido a la derecha */}
              {pointsAction === "add" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Formulario */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                      <LabeledInput label="ENCARGADO" value={encargado} onChange={setEncargado} />
                      <LabeledInput label="ADMINISTRADOR" value={administrador} onChange={setAdministrador} />
                      <LabeledInput label="NOMBRE DEL PUNTO" value={nombrePunto} onChange={setNombrePunto} />
                      <LabeledInput label="DIRECCIÓN" value={direccion} onChange={setDireccion} />

                      {/* Región con búsqueda */}
                      <FancySelect
                        label="REGIÓN"
                        items={regions}
                        search={regionSearch}
                        setSearch={setRegionSearch}
                        selected={selectedRegion}
                        setSelected={(val) => {
                          setSelectedRegion(val);
                          setSelectedCommune(null);
                          setCommuneSearch("");
                        }}
                        placeholder="Buscar región..."
                      />

                      {/* Comuna dependiente con búsqueda */}
                      <FancySelect
                        label="COMUNA"
                        items={communes}
                        search={communeSearch}
                        setSearch={setCommuneSearch}
                        selected={selectedCommune}
                        setSelected={setSelectedCommune}
                        placeholder="Buscar comuna..."
                        disabled={!selectedRegion}
                      />


                      {/* Teléfono Chile */}
                      <div>
                        <label className="block text-xs font-semibold text-emerald-700 mb-1">TELEFONO</label>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(formatChilePhone(e.target.value))}
                          placeholder="+56 9 1234 5678"
                          className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Formato sugerido: +56 9 XXXX XXXX</p>
                      </div>

                      {/* Horario tipo alarma (rango horario) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FancyWheelTimePicker
                            label="APERTURA"
                            value={horaInicio}
                            setValue={setHoraInicio}
                          />
                        </div>
                        <div>
                          <FancyWheelTimePicker
                            label="CIERRE"
                            value={horaFin}
                            setValue={setHoraFin}
                          />
                        </div>
                      </div>
                      {/* Materiales aceptados: multiselect con búsqueda y etiquetas */}
                      <FancyMultiSelect
                        label="MATERIALES ACEPTADOS"
                        options={materialesOpciones}
                        search={materialSearch}
                        setSearch={setMaterialSearch}
                        selected={materialesAceptados}
                        setSelected={setMaterialesAceptados}
                      />

                      {/* Acciones del formulario */}
                      {createError && (
                        <p className="text-sm text-red-600">{createError}</p>
                      )}
                      {createSuccess && (
                        <p className="text-sm text-emerald-700">{createSuccess}</p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCreatePoint}
                          disabled={createLoading}
                          className={`px-6 py-3 rounded-lg font-semibold border transition ${
                            createLoading
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {createLoading ? "Guardando..." : "Guardar Punto"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPointsAction(null)}
                          className="px-6 py-3 rounded-lg font-semibold border bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          Cancelar
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Mapa Reducido */}
                  <div className="border border-emerald-300 rounded-xl overflow-hidden shadow-md relative z-0">
                    {mapLoading ? (
                      <div className="flex justify-center items-center h-[60vh]">Cargando mapa...</div>
                    ) : mapError ? (
                      <div className="text-red-600 p-4">{mapError}</div>
                    ) : (
                      <MapContainer
                        center={[-33.4489, -70.6693]}
                        zoom={12}
                        style={{ height: "60vh", width: "100%" }}
                        className="rounded-xl z-0"
                      >
                        <TileLayer
                          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=akMCXvGQEqblTr1h6UqF`}
                          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                        />
                        {mapPoints
                          .filter((p) => typeof p.latitud === "number" && typeof p.longitud === "number")
                          .map((punto) => (
                          <Marker
                            key={punto._id}
                            position={[punto.latitud, punto.longitud]}
                            icon={new L.Icon({
                              iconUrl:
                                "https://res.cloudinary.com/dg233psnj/image/upload/v1762310747/ChatGPT_Image_4_nov_2025_11_45_09_p.m._ij1ufz.png",
                              iconSize: [42, 42],
                              iconAnchor: [21, 42],
                              popupAnchor: [0, -40],
                            })}
                          >
                            <Popup>
                              <div className="text-sm leading-relaxed">
                                <h3 className="font-bold text-emerald-700 mb-1">{punto.tipo_electronico}</h3>
                                <p>📍 <b>Dirección:</b> {punto.direccion_completa}</p>
                                <p>🏙️ <b>Comuna:</b> {punto.comuna_nombre}</p>
                                <a
                                  href={`https://www.google.com/maps?q=${punto.latitud},${punto.longitud}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 text-emerald-600 hover:underline font-medium"
                                >
                                  🌍 Ver en Google Maps
                                </a>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    )}
                  </div>
                </div>
              ) : (
                // Vista normal: mapa ocupa todo el ancho
                <div className="border border-emerald-300 rounded-xl overflow-hidden shadow-md mb-8 relative z-0">
                  {mapLoading ? (
                    <div className="flex justify-center items-center h-[55vh]">Cargando mapa...</div>
                  ) : mapError ? (
                    <div className="text-red-600 p-4">{mapError}</div>
                  ) : (
                    <MapContainer
                      center={[-33.4489, -70.6693]}
                      zoom={12}
                      style={{ height: "55vh", width: "100%" }}
                      className="rounded-xl z-0"
                    >
                      <TileLayer
                        url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=akMCXvGQEqblTr1h6UqF`}
                        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                      />
                      {mapPoints
                        .filter((p) => typeof p.latitud === "number" && typeof p.longitud === "number")
                        .map((punto) => (
                        <Marker
                          key={punto._id}
                          position={[punto.latitud, punto.longitud]}
                          icon={new L.Icon({
                            iconUrl:
                              "https://res.cloudinary.com/dg233psnj/image/upload/v1762310747/ChatGPT_Image_4_nov_2025_11_45_09_p.m._ij1ufz.png",
                            iconSize: [42, 42],
                            iconAnchor: [21, 42],
                            popupAnchor: [0, -40],
                          })}
                        >
                          <Popup>
                            <div className="text-sm leading-relaxed">
                              <h3 className="font-bold text-emerald-700 mb-1">{punto.tipo_electronico}</h3>
                              <p>📍 <b>Dirección:</b> {punto.direccion_completa}</p>
                              <p>🏙️ <b>Comuna:</b> {punto.comuna_nombre}</p>
                              <a
                                href={`https://www.google.com/maps?q=${punto.latitud},${punto.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-emerald-600 hover:underline font-medium"
                              >
                                🌍 Ver en Google Maps
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>
              )}

              {/* Botones de acción con selección visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { key: "add", label: "AGREGAR PUNTO" },
                  { key: "edit", label: "EDITAR PUNTO" },
                  { key: "delete", label: "ELIMINAR PUNTO" },
                ].map(({ key, label }) => {
                  const isActive = pointsAction === key;
                  const base = "px-8 py-4 rounded-lg font-semibold transition w-full border";
                  const active = "bg-emerald-600 text-white border-emerald-600";
                  const inactive = "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50";
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setPointsAction(key);
                        if (key === "edit") {
                          navigate("/puntos/editar");
                        }
                      }}
                      className={`${base} ${isActive ? active : inactive}`}
                      aria-pressed={isActive}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;

// Componentes auxiliares
function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

function FancySelect({
  label,
  items = [],
  search,
  setSearch,
  selected,
  setSelected,
  placeholder,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const filtered = useMemo(() => {
    const term = (search || "").toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(term));
  }, [items, search]);

  // Detecta si debe abrir hacia arriba o hacia abajo
  useEffect(() => {
    if (!open) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const estimatedHeight = 260; // altura estimada del menú
    const menuHeight = menuRef.current?.scrollHeight || estimatedHeight;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setDirection("up");
    } else {
      setDirection("down");
    }

  }, [open, filtered.length]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border shadow-sm transition
        ${
          disabled
            ? "opacity-50 bg-gray-100 cursor-not-allowed"
            : "bg-white hover:bg-emerald-50 border-emerald-300 focus:ring-2 focus:ring-emerald-500"
        }`}
      >
        <span className={`${selected ? "text-gray-800" : "text-gray-400"}`}>
          {selected?.label || "Seleccionar..."}
        </span>

        <svg
          className={`w-5 h-5 text-emerald-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute z-20 w-full bg-white border border-emerald-200 rounded-xl shadow-xl animate-fade ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border-b border-emerald-200 rounded-t-xl focus:outline-none"
            autoFocus
          />

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">Sin resultados</div>
            ) : (
              filtered.map((i) => (
                <button
                  key={i.value}
                  onClick={() => {
                    setSelected(i);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition
                    ${
                      selected?.value === i.value
                        ? "bg-emerald-100 text-emerald-800"
                        : "hover:bg-emerald-50"
                    }`}
                >
                  {i.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function FancyMultiSelect({ label, options = [], search, setSearch, selected, setSelected }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const filtered = useMemo(() => {
    const term = (search || "").toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(term));
  }, [options, search]);

  const toggle = (opt) => {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );
  };

  // Auto ajustar dirección (arriba/abajo)
  useEffect(() => {
    if (!open) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const estimatedHeight = 260;
    const menuHeight = menuRef.current?.scrollHeight || estimatedHeight;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setDirection("up");
    } else {
      setDirection("down");
    }

  }, [open, filtered.length, selected.length]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">
        {label}
      </label>

      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => (
          <span
            key={s}
            className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2"
          >
            {s}
            <button
              onClick={() => toggle(s)}
              className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-300 bg-white shadow-sm hover:bg-emerald-50 transition"
      >
        <span className="text-gray-700">
          {selected.length > 0 ? `${selected.length} seleccionado(s)` : "Seleccionar materiales..."}
        </span>

        <svg
          className={`w-5 h-5 text-emerald-600 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute z-20 w-full bg-white border border-emerald-200 rounded-xl shadow-xl animate-fade ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar material..."
            className="w-full p-3 border-b border-emerald-200 rounded-t-xl focus:outline-none"
            autoFocus
          />

          <div className="max-h-60 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                onClick={() => toggle(o)}
                className={`w-full text-left px-4 py-2 text-sm transition 
                  ${
                    selected.includes(o)
                      ? "bg-emerald-100 text-emerald-800"
                      : "hover:bg-emerald-50"
                  }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function FancyWheelTimePicker({ label, value, setValue }) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const [hour, setHour] = useState(value ? value.split(":")[0] : "00");
  const [minute, setMinute] = useState(value ? value.split(":")[1] : "00");

  // Actualiza el valor final
  useEffect(() => {
    setValue(`${hour}:${minute}`);
  }, [hour, minute]);

  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label}</label>

      <div className="flex items-center justify-center bg-white border border-emerald-300 rounded-xl shadow-sm p-1.5">

        {/* Columna Hora */}
        <div className="w-12 h-28 overflow-y-scroll no-scrollbar snap-y snap-mandatory text-center">
          {hours.map((h) => (
            <div
              key={h}
              onClick={() => setHour(h)}
              className={`py-1 snap-center cursor-pointer text-sm transition ${
                h === hour
                  ? "text-white bg-emerald-600 rounded-md font-semibold"
                  : "text-gray-700 hover:bg-emerald-50"
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        <span className="mx-2 text-lg font-bold text-emerald-600">:</span>

        {/* Columna Minutos */}
        <div className="w-12 h-28 overflow-y-scroll no-scrollbar snap-y snap-mandatory text-center">
          {minutes.map((m) => (
            <div
              key={m}
              onClick={() => setMinute(m)}
              className={`py-1 snap-center cursor-pointer text-sm transition ${
                m === minute
                  ? "text-white bg-emerald-600 rounded-md font-semibold"
                  : "text-gray-700 hover:bg-emerald-50"
              }`}
            >
              {m}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}




