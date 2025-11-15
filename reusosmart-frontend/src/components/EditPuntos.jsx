import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import regionesRaw from "../assets/Regiones_y_Comunas.txt?raw";
import elementosRaw from "../assets/Elementos_AEE.txt?raw";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

function toCSV(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}

function fromCSV(str) {
  if (typeof str !== "string") return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const EditPuntos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [points, setPoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // Región/Comuna como en "Agregar Punto"
  const [regions, setRegions] = useState([]);
  const [regionDataMap, setRegionDataMap] = useState({});
  const [regionSearch, setRegionSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [communes, setCommunes] = useState([]);
  const [communeSearch, setCommuneSearch] = useState("");
  const [selectedCommune, setSelectedCommune] = useState(null);

  // Materiales aceptados (multiselect)
  const [materialSearch, setMaterialSearch] = useState("");
  const materialesOpciones = useMemo(() => {
    const lines = elementosRaw.split(/\r?\n/).map((l) => l.trim());
    const result = [];
    for (const l of lines) {
      if (!l) continue;
      if (/^[\p{Emoji}\p{So}]/u.test(l)) continue;
      if (/^\d+\./.test(l)) continue;
      if (/\d+\./.test(l)) continue;
      result.push(l);
    }
    return Array.from(new Set(result));
  }, []);
  const [materialesAceptados, setMaterialesAceptados] = useState([]);

  // Horario Apertura/Cierre como en "Agregar Punto"
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  // Validación de teléfono (bloquear guardar si incompleto)
  const phoneError = useMemo(() => {
    const v = form.telefono || "";
    if (!/[0-9]/.test(v)) return ""; // valores no numéricos se permiten tal cual
    return isChilePhoneComplete(v) ? "" : "Teléfono incompleto: debe tener 9 dígitos";
  }, [form.telefono]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/puntos`);
        if (!res.ok) throw new Error("Error al cargar puntos");
        const data = await res.json();
        setPoints(data);
        // inicializa catálogo de regiones/comunas desde archivo raw
        const parsed = parseRegiones(regionesRaw);
        setRegions(parsed.list);
        setRegionDataMap(parsed.map);
        if (data.length > 0) {
          const p = data[0];
          onPick(p, parsed);
        }
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Actualiza communes al cambiar región seleccionada
  useEffect(() => {
    if (!selectedRegion) { setCommunes([]); return; }
    const regionName = selectedRegion.label;
    const cms = (regionDataMap[regionName] || []).map((c) => ({ value: c, label: c }));
    setCommunes(cms);
  }, [selectedRegion, regionDataMap]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return points;
    return points.filter((p) => {
      const a = `${p.nombre_punto || ""} ${p.direccion_completa || ""} ${p.comuna_nombre || ""}`.toLowerCase();
      return a.includes(term);
    });
  }, [points, search]);

  function toEditable(p) {
    return {
      nombre_punto: p.nombre_punto || "",
      direccion_completa: p.direccion_completa || "",
      telefono: p.telefono || "",
      encargado: p.encargado || "",
      administrador: p.administrador || "",
    };
  }

  function onPick(p, parsed) {
    setSelectedId(p._id);
    setForm(toEditable(p));
    setMessage("");
    // Región/Comuna preseleccionadas
    const reg = p.region_nombre ? { value: p.region_nombre, label: p.region_nombre } : null;
    setSelectedRegion(reg);
    // Ajusta lista de comunas con mapa
    const map = parsed?.map || regionDataMap;
    const cms = reg ? (map[reg.label] || []) : [];
    setCommunes(cms.map((c) => ({ value: c, label: c })));
    const com = p.comuna_nombre ? { value: p.comuna_nombre, label: p.comuna_nombre } : null;
    setSelectedCommune(com);
    // Materiales
    setMaterialesAceptados(Array.isArray(p.materiales_aceptados) ? p.materiales_aceptados : []);
    // Horario → abrir/cerrar
    const { apertura, cierre } = parseHorario(p.horario);
    setHoraInicio(apertura);
    setHoraFin(cierre);
  }

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSave() {
    if (!selectedId) return;
    setSaving(true);
    setMessage("");
    try {
      const horario =
        horaInicio || horaFin
          ? `${horaInicio || "--:--"} a ${horaFin || "--:--"}`
          : undefined;

      const payload = {
        nombre_punto: form.nombre_punto?.trim(),
        direccion_completa: form.direccion_completa?.trim(),
        comuna_nombre: selectedCommune?.label,
        region_nombre: selectedRegion?.label,
        telefono: form.telefono?.trim(),
        horario,
        materiales_aceptados: materialesAceptados,
        encargado: form.encargado?.trim(),
        administrador: form.administrador?.trim(),
      };

      const res = await fetch(`${API_BASE}/api/puntos/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al guardar cambios");
      setMessage("Punto actualizado correctamente");

      // actualizar listado local
      setPoints((prev) => prev.map((p) => (p._id === selectedId ? data : p)));
      onPick(data);
    } catch (e) {
      setMessage(`Error: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-28 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">Editar Puntos</h1>
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
                  onClick={() => onPick(p)}
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
            {!selectedId ? (
              <div className="p-6 text-gray-600">Selecciona un punto a la izquierda.</div>
            ) : (
              <div className="border border-emerald-200 rounded-xl bg-white shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nombre del punto" value={form.nombre_punto} onChange={(v) => setField("nombre_punto", v)} />
                  <Field label="Teléfono" value={form.telefono} onChange={(v) => setField("telefono", formatChilePhone(v))} placeholder="+56 9 1234 5678" error={phoneError} />
                  {/* Región con búsqueda */}
                  <FancySelect
                    label="Región"
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
                    label="Comuna"
                    items={communes}
                    search={communeSearch}
                    setSearch={setCommuneSearch}
                    selected={selectedCommune}
                    setSelected={setSelectedCommune}
                    placeholder="Buscar comuna..."
                    disabled={!selectedRegion}
                  />
                  {/* Campo "Tipo electrónico" eliminado por requerimiento */}
                  <Field label="Encargado" value={form.encargado} onChange={(v) => setField("encargado", v)} />
                  <Field label="Administrador" value={form.administrador} onChange={(v) => setField("administrador", v)} />
                  <Field label="Dirección completa" value={form.direccion_completa} onChange={(v) => setField("direccion_completa", v)} />
                  {/* Materiales aceptados: multiselect */}
                  <div className="md:col-span-2">
                    <FancyMultiSelect
                      label="Materiales aceptados"
                      options={materialesOpciones}
                      search={materialSearch}
                      setSearch={setMaterialSearch}
                      selected={materialesAceptados}
                      setSelected={setMaterialesAceptados}
                    />
                  </div>
                  {/* Horario tipo alarma (Apertura/Cierre) */}
                  <div>
                    <FancyWheelTimePicker label="APERTURA" value={horaInicio} setValue={setHoraInicio} />
                  </div>
                  <div>
                    <FancyWheelTimePicker label="CIERRE" value={horaFin} setValue={setHoraFin} />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (phoneError) { setMessage(phoneError); return; }
                      onSave();
                    }}
                    disabled={saving || !!phoneError}
                    className={`px-6 py-3 rounded-lg font-semibold border ${
                      saving || phoneError ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {saving ? "Guardando..." : phoneError ? "Completa el teléfono" : "Guardar cambios"}
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

function Field({ label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label}</label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${error ? "border-red-400 focus:ring-red-500" : "border-emerald-300 focus:ring-emerald-500"}`}
      />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}

export default EditPuntos;

// ==== Helpers y componentes locales (replican los del formulario de Agregar) ====
function formatChilePhone(raw) {
  if (typeof raw !== "string") return "";
  // Si no hay dígitos (por ejemplo "No disponible"), mantener tal cual
  if (!/[0-9]/.test(raw)) return raw;

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
}

function isChilePhoneComplete(raw) {
  if (typeof raw !== "string") return true;
  if (!/[0-9]/.test(raw)) return true; // permitir textos no numéricos
  const digits = raw.replace(/[^0-9]/g, "");
  const number = digits.startsWith("56") ? digits.slice(2) : digits;
  return number.length === 9; // Chile: 9 dígitos nacionales (móvil y fijo)
}

function parseRegiones(raw) {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
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
    const name = line.replace(/\?\s*→.*$/, "");
    if (name.length > 0 && !map[current].includes(name)) {
      map[current].push(name);
    }
  }
  const list = Object.keys(map).map((r) => ({ value: r, label: r }));
  return { list, map };
}

function parseHorario(h) {
  const m = /^\s*(\d{2}:\d{2})\s*a\s*(\d{2}:\d{2})\s*$/i.exec(h || "");
  return { apertura: m ? m[1] : "", cierre: m ? m[2] : "" };
}

function FancySelect({ label, items = [], search, setSearch, selected, setSelected, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    const term = (search || "").toLowerCase();
    setFiltered(items.filter((i) => i.label.toLowerCase().includes(term)));
  }, [items, search]);

  useEffect(() => {
    if (!open) return;
    const estimatedHeight = 260;
    const spaceBelow = window.innerHeight / 2; // aproximado
    const spaceAbove = window.innerHeight / 2;
    setDirection(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? "up" : "down");
  }, [open, filtered.length]);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label.toUpperCase()}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border shadow-sm transition ${
          disabled ? "opacity-50 bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-emerald-50 border-emerald-300 focus:ring-2 focus:ring-emerald-500"
        }`}
      >
        <span className={`${selected ? "text-gray-800" : "text-gray-400"}`}>{selected?.label || "Seleccionar..."}</span>
        <svg className={`w-5 h-5 text-emerald-600 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={`absolute z-20 w-full bg-white border border-emerald-200 rounded-xl shadow-xl animate-fade ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}>
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
                  onClick={() => { setSelected(i); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition ${selected?.value === i.value ? "bg-emerald-100 text-emerald-800" : "hover:bg-emerald-50"}`}
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
  const [filtered, setFiltered] = useState(options);

  useEffect(() => {
    const term = (search || "").toLowerCase();
    setFiltered(options.filter((o) => o.toLowerCase().includes(term)));
  }, [options, search]);

  const toggle = (opt) => {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  useEffect(() => {
    if (!open) return;
    const estimatedHeight = 260;
    const spaceBelow = window.innerHeight / 2;
    const spaceAbove = window.innerHeight / 2;
    setDirection(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? "up" : "down");
  }, [open, filtered.length, selected.length]);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label.toUpperCase()}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => (
          <span key={s} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
            {s}
            <button onClick={() => toggle(s)} className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center">✕</button>
          </span>
        ))}
      </div>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-300 bg-white shadow-sm hover:bg-emerald-50 transition">
        <span className="text-gray-700">{selected.length > 0 ? `${selected.length} seleccionado(s)` : "Seleccionar materiales..."}</span>
        <svg className={`w-5 h-5 text-emerald-600 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className={`absolute z-20 w-full bg-white border border-emerald-200 rounded-xl shadow-xl animate-fade ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar material..." className="w-full p-3 border-b border-emerald-200 rounded-t-xl focus:outline-none" autoFocus />
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((o) => (
              <button key={o} onClick={() => toggle(o)} className={`w-full text-left px-4 py-2 text-sm transition ${selected.includes(o) ? "bg-emerald-100 text-emerald-800" : "hover:bg-emerald-50"}`}>{o}</button>
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
  useEffect(() => { setValue(`${hour}:${minute}`); }, [hour, minute]);
  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-1">{label}</label>
      <div className="flex items-center justify-center bg-white border border-emerald-300 rounded-xl shadow-sm p-1.5">
        <div className="w-12 h-28 overflow-y-scroll no-scrollbar snap-y snap-mandatory text-center">
          {hours.map((h) => (
            <div key={h} onClick={() => setHour(h)} className={`py-1 snap-center cursor-pointer text-sm transition ${h === hour ? "text-white bg-emerald-600 rounded-md font-semibold" : "text-gray-700 hover:bg-emerald-50"}`}>{h}</div>
          ))}
        </div>
        <span className="mx-2 text-lg font-bold text-emerald-600">:</span>
        <div className="w-12 h-28 overflow-y-scroll no-scrollbar snap-y snap-mandatory text-center">
          {minutes.map((m) => (
            <div key={m} onClick={() => setMinute(m)} className={`py-1 snap-center cursor-pointer text-sm transition ${m === minute ? "text-white bg-emerald-600 rounded-md font-semibold" : "text-gray-700 hover:bg-emerald-50"}`}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}