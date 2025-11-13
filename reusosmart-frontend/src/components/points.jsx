import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaMobileAlt, FaMapMarkerAlt } from "react-icons/fa";

// Ícono personalizado (usa tu PNG transparente)
const recyclePhoneIcon = new L.Icon({
  iconUrl: "https://res.cloudinary.com/dg233psnj/image/upload/v1762310747/ChatGPT_Image_4_nov_2025_11_45_09_p.m._ij1ufz.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40],
});

export default function Points() {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/puntos");
        if (!res.ok) throw new Error("Error al obtener los puntos");
        const data = await res.json();
        setPuntos(data);
      } catch (error) {
        console.error("❌ Error cargando puntos:", error);
        setError("No se pudieron cargar los puntos de reciclaje. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchPuntos();
  }, []);

  return (
    <div className="min-h-screen bg-lineal-to-br from-emerald-50 to-emerald-100 pt-28 md:pt-32 pb-12 relative z-0">
      <div className="max-w-7xl mx-auto p-6 relative">
        {/* 🟩 Encabezado */}
        <div className="bg-white/90 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-md p-6 text-center mb-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 flex justify-center items-center gap-3">
            <FaMobileAlt className="text-emerald-600" />
            Puntos de Reciclaje Tecnológico
          </h1>
          <p className="mt-2 text-gray-600">
            Encuentra los lugares donde puedes reciclar tus dispositivos electrónicos ♻️
          </p>
        </div>

        {/* 🔄 Cargando */}
        {loading && (
          <div className="flex justify-center items-center h-[70vh] text-emerald-700 font-medium text-lg">
            Cargando mapa y puntos de reciclaje...
          </div>
        )}

        {/* ⚠️ Error */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <p className="text-red-600 font-semibold text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* 🗺️ Contenedor del mapa */}
        {!loading && !error && (
          <div className="relative border border-emerald-200 rounded-2xl overflow-hidden shadow-2xl z-0">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-9999 bg-white/95 backdrop-blur-md shadow-lg px-6 py-2 rounded-full border border-emerald-300 text-sm md:text-base text-emerald-700 font-medium">
              <FaMapMarkerAlt className="inline text-emerald-600 mr-1" />
              Mostrando <b>{puntos.length}</b> puntos de reciclaje disponibles
            </div>

            <MapContainer
              center={[-33.4489, -70.6693]} // Santiago
              zoom={12}
              style={{ height: "75vh", width: "100%", zIndex: 0 }}
              className="rounded-2xl"
            >
              <TileLayer
                url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=akMCXvGQEqblTr1h6UqF`}
                attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
              />

              {puntos.map((punto) => (
                <Marker
                  key={punto._id}
                  position={[punto.latitud, punto.longitud]}
                  icon={recyclePhoneIcon}
                >
                  <Popup>
                    <div className="text-sm leading-relaxed">
                      <h3 className="font-bold text-emerald-700 mb-1">
                        {punto.tipo_electronico}
                      </h3>
                      <p>📍 <b>Dirección:</b> {punto.direccion_completa}</p>
                      <p>🏙️ <b>Comuna:</b> {punto.comuna_nombre}</p>
                      <p>⏰ <b>Horario:</b> {punto.horario || "No disponible"}</p>
                      <p>☎️ <b>Teléfono:</b> {punto.telefono || "No disponible"}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}
