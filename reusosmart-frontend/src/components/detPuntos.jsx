import React from "react";
import { useState, useEffect, useMemo } from "react";
import { FaMapMarkerAlt, FaRecycle, FaMobileAlt } from "react-icons/fa";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input }from "@/components/ui/input";
import { Search } from "lucide-react";


function InfoPuntos() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("all");

  useEffect(() => {
    fetchdetPuntos();
  }, []);

  const fetchdetPuntos = async () => {
   try {
    const response = await fetch(`${API_BASE}/api/puntos`);
    const data = await response.json();
    setPuntos(data);
    setLoading(false);
   } catch (error) {
      console.error("Error cargando puntos:", error);
      setLoading(false);
    }
  };

    // Obtener comunas únicas
  const comunas = useMemo(() => {
    const uniqueComunas = new Set(puntos.map((p) => p.comuna_nombre));
    return Array.from(uniqueComunas).sort();
  }, [puntos]);

    // Filtrar puntos
  const filteredPuntos = useMemo(() => {
    return puntos.filter((p) => {
      const matchesSearch =
        (p.nombre_punto?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.direccion_completa?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.tipo_electronico?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesComuna = selectedComuna === "all" || p.comuna_nombre === selectedComuna;
      return matchesSearch && matchesComuna;
    });
  }, [puntos, searchTerm, selectedComuna]);

  if (loading) {
    return (
      <Card className="p-8 shadow-xl bg-white/80 backdrop-blur mt-24 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <main className="pt-32 pb-20 flex flex-col items-center bg-gray-50 min-h-screen overflow-x-hidden text-base md:text-lg">

    <div className="text-center mb-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-ecoGreen-800 leading-tight tracking-tight">
      Puntos de Reciclaje Tecnológico
      </h1>
      <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Encuentra los lugares más cercanos a ti donde puedes reciclar aparatos eléctricos y electrónicos 
      </p>
      <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Construyamos un futuro más sustentable disminuyendo los residuos ♻️
      </p>

    </div>

      <Card className="p-12 shadow-2xl bg-white rounded-2xl w-full max-w-7xl text-xl leading-relaxed">
        {/* Barra de búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              id="search"
              name="search"
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-5 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ecoGreen placeholder:text-lg placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filtro por comuna */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={selectedComuna} onValueChange={setSelectedComuna}>
            <SelectTrigger className="px-5 py-5 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ecoGreen bg-white text-gray-800">
              <SelectValue placeholder="Filtrar por comuna" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl text-lg">
              <SelectItem value="all" className="font-bold text-base">
                Todas las comunas ({comunas.length})
              </SelectItem>
              {comunas.map((comuna) => (
                <SelectItem key={comuna} value={comuna} className="text-lg">
                  {comuna} ({puntos.filter(p => p.comuna_nombre === comuna).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resultados */}
        {filteredPuntos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron puntos de reciclaje para tu búsqueda
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-800 text-lg text-center">
              Mostrando {filteredPuntos.length} de {puntos.length} puntos
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-6">
              {filteredPuntos.map((punto, index) => {
                const uid = punto._id ?? punto.id ?? index;
                return (
                  <AccordionItem
                    key={`punto-${uid}`}
                    value={`punto-${uid}`}
                    className="border border-gray-200 rounded-xl bg-gray-50 hover:border-green-300 transition-all duration-300 ease-in-out overflow-hidden shadow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                          <FaRecycle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 text-xl">{punto.nombre_punto}</div>
                          <div className="text-green-800 flex items-center gap-2 mt-2 text-lg">
                            <FaMapMarkerAlt className="w-4 h-4" />
                            <span>{punto.comuna_nombre}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="text-gray-800 pt-8 px-12 pb-10 text-lg leading-relaxed transition-[margin,height] duration-300 ease-in-out will-change-[transform,height] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="space-y-6">
                        <div>
                          <div className="font-semibold mb-1 text-green-800 pl-6 text-xl">📍 Dirección:</div>
                          <div className="text-gray-700 pl-6 text-lg">{punto.direccion_completa}</div>
                          <div className="text-gray-700 pl-6 text-lg">{punto.region_nombre}</div>
                        </div>
                        
                        {punto.tipo_electronico && (
                          <div>
                            <div className="font-semibold mb-1 text-green-800 pl-6 text-xl">♻️ Materiales aceptados:</div>
                            <div className="text-gray-700 pl-6 text-lg">{punto.tipo_electronico}</div>
                          </div>
                        )}
                        
                        {punto.horario && (
                          <div>
                            <div className="font-semibold mb-1 text-green-900 pl-6 text-xl">🕒 Horario:</div>
                            <div className="text-gray-700 pl-6 text-lg">{punto.horario}</div>
                          </div>
                        )}

                        {punto.telefono && (
                          <div>
                            <div className="font-semibold mb-1 text-green-900 pl-6 text-xl">📞 Teléfono:</div>
                            <div className="text-gray-700 pl-6 text-lg">{punto.telefono}</div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </>
        )}
      </Card>
    </main>
  );
}
export default InfoPuntos;