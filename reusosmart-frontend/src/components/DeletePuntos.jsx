import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

const DeletePuntos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/puntos`);
        if (!res.ok) throw new Error("Error al cargar puntos");
        const data = await res.json();
        setPoints(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return points;
    return points.filter((p) => {
      const a = `${p.nombre_punto || ""} ${p.direccion_completa || ""} ${p.comuna_nombre || ""}`.toLowerCase();
      return a.includes(term);
    });
  }, [points, search]);

  const selectedPoint = useMemo(() => points.find((p) => p._id === selectedId) || null, [points, selectedId]);

  const onDelete = async () => {
    if (!selectedId) return;
    const ok = window.confirm("¿Eliminar este punto definitivamente?");
    if (!ok) return;
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/puntos/${selectedId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        throw new Error(txt || "Error al eliminar");
      }
      setPoints((prev) => prev.filter((p) => p._id !== selectedId));
      setSelectedId(null);
      setMessage("Punto eliminado correctamente");
    } catch (e) {
      setMessage(`Error: ${e.message || e}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-28 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">Eliminar Puntos</h1>
        <button
          className="px-4 py-2 rounded-lg bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </div>

      {loading ? (
        <div className="p-6">Cargando puntos...</div>
      ) : error ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : points.length === 0 ? (
        <div className="p-6 text-gray-700">No hay puntos disponibles para eliminar.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, dirección o comuna"
                className="w-full p-3 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="border border-emerald-200 rounded-xl bg-white shadow-sm max-h-[60vh] overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedId(p._id)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                    selectedId === p._id ? "bg-emerald-50" : "hover:bg-emerald-50"
                  }`}
                >
                  <div className="font-semibold text-emerald-700">{p.nombre_punto || "(Sin nombre)"}</div>
                  <div className="text-sm text-gray-600">{p.direccion_completa || "Dirección no especificada"}</div>
                  <div className="text-xs text-gray-500">{p.comuna_nombre} • {p.region_nombre}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedPoint ? (
              <div className="p-6 text-gray-600">Selecciona un punto a la izquierda.</div>
            ) : (
              <div className="border border-emerald-200 rounded-xl bg-white shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Nombre del punto" value={selectedPoint.nombre_punto} />
                  <Info label="Teléfono" value={selectedPoint.telefono} />
                  <Info label="Región" value={selectedPoint.region_nombre} />
                  <Info label="Comuna" value={selectedPoint.comuna_nombre} />
                  <div className="md:col-span-2">
                    <Info label="Dirección completa" value={selectedPoint.direccion_completa} />
                  </div>
                  <Info label="Horario" value={selectedPoint.horario} />
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-emerald-700 mb-1">Materiales aceptados</label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPoint.materiales_aceptados || []).map((m) => (
                        <span key={m} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={onDelete}
                    className="px-6 py-3 rounded-lg font-semibold border bg-red-600 text-white border-red-600 hover:bg-red-700"
                  >
                    Eliminar definitivamente
                  </button>
                  {message && (
                    <span className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-emerald-700"}`}>{message}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Info({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label}</label>
      <div className="w-full p-3 border border-emerald-300 rounded-md bg-gray-50">{value ?? "—"}</div>
    </div>
  );
}

export default DeletePuntos;