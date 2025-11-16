import express from "express";
import Punto from "../models/Punto.js";

const router = express.Router();

// Normaliza el nombre de la región para eliminar iniciales en paréntesis.
// Ej: "Metropolitana de Santiago (RM)" -> "Metropolitana de Santiago" y guarda "RM" en abreviatura si no viene.
function normalizeRegionFields(data) {
  const original = String(data.region_nombre || "");
  const match = original.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  let region_nombre = original.trim();
  let region_abreviatura = data.region_abreviatura;
  if (match) {
    region_nombre = match[1].trim();
    region_abreviatura = region_abreviatura || match[2].trim();
  }
  return { region_nombre, region_abreviatura };
}

async function geocodeAddress({ direccion, comuna, region }) {
  const composed = [direccion, comuna, region, "Chile"].filter(Boolean).join(", ");

  // Intenta MapTiler si hay API key; si no, usa Nominatim
  const maptilerKey = process.env.MAPTILER_KEY;
  try {
    if (maptilerKey) {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        composed
      )}.json?key=${maptilerKey}&language=es&country=cl&limit=1`;
      const r = await fetch(url);
      if (r.ok) {
        const j = await r.json();
        const feat = j.features?.[0];
        if (feat?.geometry?.coordinates?.length >= 2) {
          const [lng, lat] = feat.geometry.coordinates;
          return { latitud: Number(lat), longitud: Number(lng) };
        }
      }
    }
  } catch (e) {
    // continúa al fallback
  }

  // Fallback: OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=cl&q=${encodeURIComponent(
      composed
    )}`;
    const r = await fetch(url, {
      headers: {
        "User-Agent": `ReusoSmart/1.0 (${process.env.EMAIL_USER || "admin@reusosmart.local"})`,
        Accept: "application/json",
      },
    });
    if (r.ok) {
      const j = await r.json();
      const hit = j?.[0];
      if (hit?.lat && hit?.lon) {
        return { latitud: Number(hit.lat), longitud: Number(hit.lon) };
      }
    }
  } catch (e) {
    // ignora y devuelve null
  }
  return null;
}

// Obtener todos los puntos
router.get("/", async (req, res) => {
  try {
    const { region } = req.query;
    let filter = {};
    if (region) {
      // Filtrar por región usando nombre o abreviatura (insensible a mayúsculas)
      const regex = new RegExp(region, "i");
      filter = { $or: [{ region_nombre: regex }, { region_abreviatura: regex }] };
    }
    const puntos = await Punto.find(filter).lean();
    const sanitized = puntos.map((doc) => {
      const { id, estado, tipo_punto, ...rest } = doc;
      return rest;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener puntos" });
  }
});

// Ruta de verificación: devuelve puntos sin `id` ni `estado` explícitamente borrados
router.get("/sanitized", async (_req, res) => {
  try {
    const puntos = await Punto.find({}).lean();
    const sanitized = puntos.map((doc) => {
      delete doc.id;
      delete doc.estado;
      delete doc.tipo_punto;
      return doc;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener puntos" });
  }
});

// Conteo rápido de puntos (con filtro opcional por región)
router.get("/count", async (req, res) => {
  try {
    const { region } = req.query;
    let filter = {};
    if (region) {
      const regex = new RegExp(region, "i");
      filter = { $or: [{ region_nombre: regex }, { region_abreviatura: regex }] };
    }
    const total = await Punto.countDocuments(filter);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener conteo de puntos" });
  }
});

// Debug: eco simple para verificar router activo
router.post("/debug-echo", (req, res) => {
  try {
    res.status(200).json({ ok: true, echo: req.body || null });
  } catch (e) {
    console.error("[POST /api/puntos/debug-echo] error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Crear un nuevo punto (forma explícita con route encadenado)
router.route("/")
  .post(async (req, res) => {
    let failStage = "init";
    try {
      // Ruta mínima para aislar problemas: si se solicita modo mínimo, devuelve OK inmediato
      if (req.query && (req.query._min === "1" || req.query.min === "1")) {
        return res.status(201).json({ ok: true, mode: "min" });
      }
      const data = req.body || {};
      failStage = "sanitize-input";
      // Quitar campos no deseados del payload y normalizar región
      const { estado, id, ...rest } = data;
      failStage = "normalize-region";
      const { region_nombre, region_abreviatura } = normalizeRegionFields(rest);
      failStage = "defaults";

      // Normalizaciones y valores por defecto (plantilla)
      const telefono = typeof rest.telefono === "string" && rest.telefono.trim()
        ? rest.telefono.trim()
        : "No disponible";
      const horario = typeof rest.horario === "string" && rest.horario.trim()
        ? rest.horario.trim()
        : "Horario no especificado";
      const encargado = typeof rest.encargado === "string" && rest.encargado.trim()
        ? rest.encargado.trim()
        : "Municipal";
      const administrador = typeof rest.administrador === "string" && rest.administrador.trim()
        ? rest.administrador.trim()
        : "DEMARCO";
      const nombre_punto = typeof rest.nombre_punto === "string" && rest.nombre_punto.trim()
        ? rest.nombre_punto.trim()
        : "Punto Reciclaje";

      const materiales_aceptados = Array.isArray(rest.materiales_aceptados)
        ? rest.materiales_aceptados
            .map((m) => (typeof m === "string" ? m.trim() : ""))
            .filter((m) => m.length > 0)
        : [];

      // Geocodificación automática de dirección si faltan coordenadas
      failStage = "geocode";
      let latitud = typeof rest.latitud === "number" ? rest.latitud : undefined;
      let longitud = typeof rest.longitud === "number" ? rest.longitud : undefined;
      if (latitud == null || longitud == null) {
        const geo = await geocodeAddress({
          direccion: rest.direccion_completa,
          comuna: rest.comuna_nombre,
          region: region_nombre,
        });
        if (geo) {
          latitud = geo.latitud;
          longitud = geo.longitud;
        }
      }

      failStage = "construct-doc";
      const punto = new Punto({
        encargado,
        administrador,
        nombre_punto,
        direccion_completa: rest.direccion_completa,
        tipo_via: rest.tipo_via,
        nombre_via: rest.nombre_via,
        comuna_id: rest.comuna_id,
        comuna_nombre: rest.comuna_nombre,
        region_id: rest.region_id,
        region_nombre,
        ...(region_abreviatura ? { region_abreviatura } : {}),
        latitud,
        longitud,
        telefono,
        horario,
        tipo_electronico: rest.tipo_electronico,
        materiales_aceptados,
      });
      failStage = "save";
      const saved = await punto.save();
      failStage = "read-lean";
      const plain = await Punto.findById(saved._id).lean();
      delete plain.id;
      delete plain.estado;
      delete plain.tipo_punto;
      failStage = "respond";
      // Evita posibles problemas de serialización en Express 5 usando send de string
      res.status(201).type("application/json").send(JSON.stringify(plain));
    } catch (err) {
      console.error("[POST /api/puntos] stage:", err && err.stage ? err.stage : (typeof err === 'object' ? failStage : 'unknown'));
      console.error("[POST /api/puntos] error:", err);
      if (err && err.stack) console.error("[POST /api/puntos] stack:\n", err.stack);
      try { res.setHeader("X-Fail-Stage", String(failStage)); } catch {}
      res.status(400).json({ message: "Error al crear punto", stage: failStage, error: err?.message || String(err), stack: typeof err?.stack === "string" ? err.stack : "no-stack" });
    }
  });

// Alternativa explícita: creación en /crear (para evitar colisiones con POST "/")
router.post("/crear", async (req, res) => {
  let failStage = "init";
  try {
    const data = req.body || {};
    failStage = "sanitize-input";
    const { estado, id, ...rest } = data;
    failStage = "normalize-region";
    const { region_nombre, region_abreviatura } = normalizeRegionFields(rest);
    failStage = "defaults";
    const telefono = typeof rest.telefono === "string" && rest.telefono.trim()
      ? rest.telefono.trim()
      : "No disponible";
    const horario = typeof rest.horario === "string" && rest.horario.trim()
      ? rest.horario.trim()
      : "Horario no especificado";
    const encargado = typeof rest.encargado === "string" && rest.encargado.trim()
      ? rest.encargado.trim()
      : "Municipal";
    const administrador = typeof rest.administrador === "string" && rest.administrador.trim()
      ? rest.administrador.trim()
      : "DEMARCO";
    const nombre_punto = typeof rest.nombre_punto === "string" && rest.nombre_punto.trim()
      ? rest.nombre_punto.trim()
      : "Punto Reciclaje";

    const materiales_aceptados = Array.isArray(rest.materiales_aceptados)
      ? rest.materiales_aceptados
          .map((m) => (typeof m === "string" ? m.trim() : ""))
          .filter((m) => m.length > 0)
      : [];

    failStage = "geocode";
    let latitud = typeof rest.latitud === "number" ? rest.latitud : undefined;
    let longitud = typeof rest.longitud === "number" ? rest.longitud : undefined;
    if (latitud == null || longitud == null) {
      const geo = await geocodeAddress({
        direccion: rest.direccion_completa,
        comuna: rest.comuna_nombre,
        region: region_nombre,
      });
      if (geo) {
        latitud = geo.latitud;
        longitud = geo.longitud;
      }
    }

    failStage = "construct-doc";
    const punto = new Punto({
      encargado,
      administrador,
      nombre_punto,
      direccion_completa: rest.direccion_completa,
      tipo_via: rest.tipo_via,
      nombre_via: rest.nombre_via,
      comuna_id: rest.comuna_id,
      comuna_nombre: rest.comuna_nombre,
      region_id: rest.region_id,
      region_nombre,
      ...(region_abreviatura ? { region_abreviatura } : {}),
      latitud,
      longitud,
      telefono,
      horario,
      tipo_electronico: rest.tipo_electronico,
      materiales_aceptados,
    });
    failStage = "save";
    const saved = await punto.save();
    failStage = "read-lean";
    const plain = await Punto.findById(saved._id).lean();
    delete plain.id;
    delete plain.estado;
    delete plain.tipo_punto;
    failStage = "respond";
    res.status(201).type("application/json").send(JSON.stringify(plain));
  } catch (err) {
    console.error("[POST /api/puntos/crear] stage:", err && err.stage ? err.stage : (typeof err === 'object' ? failStage : 'unknown'));
    console.error("[POST /api/puntos/crear] error:", err);
    if (err && err.stack) console.error("[POST /api/puntos/crear] stack:\n", err.stack);
    try { res.setHeader("X-Fail-Stage", String(failStage)); } catch {}
    res.status(400).json({ message: "Error al crear punto", stage: failStage, error: err?.message || String(err), stack: typeof err?.stack === "string" ? err.stack : "no-stack" });
  }
});

// Actualizar un punto existente por ID
router.put("/:id", async (req, res) => {
  let failStage = "init";
  try {
    const id = String(req.params.id || "").trim();
    if (!id) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const data = req.body || {};
    failStage = "sanitize-input";
    const { estado, tipo_punto, id: _ignored, ...rest } = data;

    failStage = "normalize-region";
    const { region_nombre, region_abreviatura } = normalizeRegionFields(rest);

    // Normalizaciones y valores por defecto
    const telefono = typeof rest.telefono === "string" && rest.telefono.trim()
      ? rest.telefono.trim()
      : undefined;
    const horario = typeof rest.horario === "string" && rest.horario.trim()
      ? rest.horario.trim()
      : undefined;
    const encargado = typeof rest.encargado === "string" && rest.encargado.trim()
      ? rest.encargado.trim()
      : undefined;
    const administrador = typeof rest.administrador === "string" && rest.administrador.trim()
      ? rest.administrador.trim()
      : undefined;
    const nombre_punto = typeof rest.nombre_punto === "string" && rest.nombre_punto.trim()
      ? rest.nombre_punto.trim()
      : undefined;

    const materiales_aceptados = Array.isArray(rest.materiales_aceptados)
      ? rest.materiales_aceptados
          .map((m) => (typeof m === "string" ? m.trim() : ""))
          .filter((m) => m.length > 0)
      : undefined;

    // Preparar coordenadas; si faltan, intentar geocodificar
    failStage = "geocode";
    let latitud = typeof rest.latitud === "number" ? rest.latitud : undefined;
    let longitud = typeof rest.longitud === "number" ? rest.longitud : undefined;
    if (latitud == null || longitud == null) {
      const geo = await geocodeAddress({
        direccion: rest.direccion_completa,
        comuna: rest.comuna_nombre,
        region: region_nombre,
      });
      if (geo) {
        latitud = geo.latitud;
        longitud = geo.longitud;
      }
    }

    failStage = "prepare-update";
    const update = {
      ...(encargado != null ? { encargado } : {}),
      ...(administrador != null ? { administrador } : {}),
      ...(nombre_punto != null ? { nombre_punto } : {}),
      ...(typeof rest.direccion_completa === "string" ? { direccion_completa: rest.direccion_completa } : {}),
      ...(typeof rest.tipo_via === "string" ? { tipo_via: rest.tipo_via } : {}),
      ...(typeof rest.nombre_via === "string" ? { nombre_via: rest.nombre_via } : {}),
      ...(typeof rest.comuna_id === "string" ? { comuna_id: rest.comuna_id } : {}),
      ...(typeof rest.comuna_nombre === "string" ? { comuna_nombre: rest.comuna_nombre } : {}),
      ...(typeof rest.region_id === "string" ? { region_id: rest.region_id } : {}),
      ...(typeof region_nombre === "string" ? { region_nombre } : {}),
      ...(typeof region_abreviatura === "string" ? { region_abreviatura } : {}),
      ...(typeof latitud === "number" ? { latitud } : {}),
      ...(typeof longitud === "number" ? { longitud } : {}),
      ...(telefono != null ? { telefono } : {}),
      ...(horario != null ? { horario } : {}),
      ...(materials_update(materiales_aceptados)),
    };

    // Ejecutar actualización
    failStage = "update";
    const updated = await Punto.findByIdAndUpdate(
      id,
      { $set: update, $unset: { tipo_electronico: "" } },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }

    // Sanitizar salida
    delete updated.id;
    delete updated.estado;
    delete updated.tipo_punto;
    failStage = "respond";
    res.status(200).json(updated);
  } catch (err) {
    console.error("[PUT /api/puntos/:id] stage:", failStage);
    console.error("[PUT /api/puntos/:id] error:", err);
    if (err && err.stack) console.error("[PUT /api/puntos/:id] stack:\n", err.stack);
    try { res.setHeader("X-Fail-Stage", String(failStage)); } catch {}
    res.status(400).json({ message: "Error al actualizar punto", stage: failStage, error: err?.message || String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const deleted = await Punto.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Punto no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Error al eliminar punto", error: err?.message || String(err) });
  }
});

function materials_update(materiales_aceptados) {
  if (materiales_aceptados == null) return {};
  return { materiales_aceptados };
}

export default router;

// Ruta de mantenimiento: limpiar campos no deseados en documentos existentes
// Elimina `estado` y `id` de todos los puntos ya almacenados.
router.post("/cleanup-fields", async (req, res) => {
  try {
    const result = await Punto.updateMany({}, { $unset: { estado: "", id: "" } });
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Fallback de depuración: captura rutas no manejadas dentro de este router
router.use((req, res) => {
  res.status(404).json({ ok: false, message: "No match in points router", method: req.method, path: req.originalUrl });
});
