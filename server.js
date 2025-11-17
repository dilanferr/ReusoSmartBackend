// ============================================================================
// 🌍 IMPORTAR DEPENDENCIAS
// ============================================================================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

// Rutas
import recyclingRoutes from "./routes/recyclingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";

// Modelo
import Punto from "./models/Punto.js";


// ============================================================================
// ⚙️ CONFIGURACIÓN INICIAL
// ============================================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// ============================================================================
// ☁️ CONFIGURACIÓN DE CLOUDINARY
// ============================================================================
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verificar conexión a Cloudinary
cloudinary.v2.api
  .ping()
  .then((res) => console.log("✅ Cloudinary conectado:", res.status))
  .catch((err) => console.error("❌ Error Cloudinary:", err));


// ============================================================================
// 🧩 MIDDLEWARES GLOBALES
// ============================================================================

// Log de cada petición
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Permitir JSON grandes
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// CORS (ajusta origin en producción)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ============================================================================
// 🍃 CONEXIÓN A MONGODB ATLAS
// ============================================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error MongoDB:", err));


// ============================================================================
// 🧭 RUTAS PRINCIPALES DE LA API
// ============================================================================

// Usuarios
app.use("/api/users", userRoutes);

// Reciclajes (fotos + BD)
app.use("/api/reciclajes", recyclingRoutes);

// Debug general de puntos
app.use("/api/puntos", (req, res, next) => {
  console.log(`➡️ /api/puntos ${req.method}`);
  next();
});

// Rutas reales de puntos
app.use("/api/puntos", pointsRoutes);

// Test general
app.post("/api/test", (req, res) => {
  res.status(200).json({ ok: true, received: req.body });
});


// ============================================================================
// 🧪 ENDPOINTS DE DEPURACIÓN (opcionales)
// ============================================================================

// Test mínimo para POST
app.post("/api/puntos/crear-min", (req, res) => {
  res.status(201).json({ ok: true });
});

// Ping de verificación
app.post("/api/puntos/_ping", (_req, res) => {
  res.status(200).json({ ok: true, ping: "pong" });
});

// Listar rutas registradas
app.get("/api/_debug/routes", (req, res) => {
  try {
    const stack = app._router?.stack || [];
    const list = [];

    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(", ");
        list.push({ path: layer.route.path, methods });
      }
    }

    res.json({ count: list.length, routes: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ============================================================================
// 🧹 RUTA DE MANTENIMIENTO (limpiar campos antiguos)
// ============================================================================
app.post("/api/_maintenance/cleanup-fields", async (_req, res) => {
  try {
    const result = await Punto.updateMany({}, { $unset: { estado: "", id: "" } });
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ============================================================================
// 🏡 RUTAS BASE
// ============================================================================
app.get("/", (req, res) => {
  res.send("🌎 API de ReusoSmart funcionando correctamente 🚀");
});

app.get("/api/_health", (_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});


// ============================================================================
// 🖥️ INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Servidor corriendo en: http://10.50.16.159:${PORT}`);
});
