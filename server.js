// =======================
//  Importar dependencias
// =======================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";
import Punto from "./models/Punto.js";
// Debug: mostrar campos del esquema Punto para verificar que no existen `estado` ni `id`
try {
  const schemaFields = Object.keys(Punto.schema.paths || {});
  console.log("🧩 Campos del esquema Punto:", schemaFields);
} catch {}

// =======================
//  Configuración inicial
// =======================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
//  Middlewares
// =======================
// Log global de cada petición para depurar rutas y métodos
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json());
app.use(cors()); // Permitir peticiones desde otros orígenes (como Expo o React Native)

// =======================
// 🧩 Conexión a MongoDB Atlas
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar con MongoDB:", err));

// =======================
//  Rutas API
// =======================
// Montar rutas de usuarios y puntos
app.use("/api/users", userRoutes);
// Ruta de prueba general
app.post("/api/test", (req, res) => {
  res.status(200).json({ ok: true, received: req.body || null });
});
// Gancho temporal de depuración: responder a cualquier método en /api/puntos
// (hook de depuración eliminado)
// Debug: intercepta todas las peticiones a /api/puntos (antes de montar rutas)
app.use("/api/puntos", (req, res, next) => {
  console.log(`➡️  /api/puntos ${req.method}`);
  next();
});

// (Filtro universal eliminado para prevenir recursiones en respuestas de Mongoose)

// (GET /api/puntos y /api/puntos/sanitized delegados al router de puntos)

// Manejo explícito de creación de puntos (POST) para evitar 404 en algunos entornos)
async function geocodeAddress({ direccion, comuna, region }) {
  const composed = [direccion, comuna, region, "Chile"].filter(Boolean).join(", ");
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
    // ignorar y continuar al fallback
  }
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

// Normaliza el nombre de la región para eliminar iniciales entre paréntesis
// Ej: "Metropolitana de Santiago (RM)" -> nombre: "Metropolitana de Santiago", abreviatura: "RM"
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

// Registra POST antes de montar el router para evitar que el router devuelva 404
// Ruta de prueba para aislar problemas de middleware/serialización
app.post("/api/puntos/test", (req, res) => {
  try {
    res.status(200).json({ ok: true, echo: req.body ?? null });
  } catch (e) {
    console.error("[POST /api/puntos/test] error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});
console.log("✅ Registrada ruta POST /api/puntos/test");
// Ruta mínima para probar POST sin lógica
app.post("/api/puntos/crear-min", (req, res) => {
  res.status(201).json({ ok: true });
});
console.log("✅ Registrada ruta POST /api/puntos/crear-min");
// Ping simple para validar que los endpoints bajo /api/puntos están accesibles
app.post("/api/puntos/_ping", (_req, res) => {
  res.status(200).json({ ok: true, ping: "pong" });
});
console.log("✅ Registrada ruta POST /api/puntos/_ping");
// Captura temporal: responde a cualquier método en /api/puntos (incluye subrutas)
app.use("/api/puntos", (req, res, next) => {
  if (process.env.DEBUG_CAPTURE_PUNTOS === "1") {
    res.setHeader("X-Debug-Capture", "api/puntos");
    return res.status(200).json({ captured: true, method: req.method, originalUrl: req.originalUrl });
  }
  next();
});
// (POST /api/puntos y /api/puntos/crear delegados al router de puntos)

// Middleware de compatibilidad: eliminado para evitar colisiones con rutas específicas

// Monta el router después del POST explícito
app.use("/api/puntos", pointsRoutes);

// Debug: listar rutas registradas
try {
  const stack = (app._router && app._router.stack) || [];
  const routes = stack.map((l) => {
    if (l.route) return { path: l.route.path, methods: l.route.methods };
    if (l.name === "router" && l.handle?.stack) {
      const prefix = l.regexp && l.regexp.toString();
      const subs = l.handle.stack
        .filter((s) => s.route)
        .map((s) => ({ path: s.route.path, methods: s.route.methods }));
      return { router: true, prefix, subroutes: subs };
    }
    return null;
  }).filter(Boolean);
  console.log("🔎 Rutas registradas:", routes);
} catch (e) {
  // ignorar
}

// Endpoint de depuración para listar rutas registradas con mayor detalle
app.get("/api/_debug/routes", (req, res) => {
  try {
    const toJSON = (layer, prefix = "") => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods || {}).filter(Boolean);
        return [{ method: methods.join("|"), path: prefix + layer.route.path }];
      }
      if (layer.name === "router" && layer.handle?.stack) {
        const m = (layer.regexp && layer.regexp.toString()) || "";
        // Intenta derivar prefijo de la RegExp del router
        const match = m.match(/^\/(?:\^)?\\\/(.*?)\\\//);
        const routerPrefix = match ? `/${match[1]}` : prefix;
        return layer.handle.stack.flatMap((s) => toJSON(s, routerPrefix));
      }
      return [];
    };
    const stack = (app._router && app._router.stack) || [];
    const list = stack.flatMap((layer) => toJSON(layer, ""));
    res.json({ count: list.length, routes: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ruta de prueba (opcional)
app.get("/", (req, res) => {
  res.send("🌎 API de ReusoSmart funcionando correctamente (marker-123)");
});

// Salud mínima para verificar registro de rutas GET fuera de '/'
app.get("/api/_health", (_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// =======================
//  Ruta de mantenimiento
// =======================
// Limpia campos no deseados en documentos existentes: elimina `estado` e `id`.
app.post("/api/_maintenance/cleanup-fields", async (_req, res) => {
  try {
    const result = await Punto.updateMany({}, { $unset: { estado: "", id: "" } });
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =======================
//  Servidor escuchando
// =======================
//  Importante: usar "0.0.0.0" para que Expo (en el celular) pueda acceder
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Servidor corriendo en http://10.50.16.149:${PORT}`);
});
  