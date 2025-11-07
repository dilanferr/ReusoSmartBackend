// =======================
//  Importar dependencias
// =======================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// =======================
//  Configuración inicial
// =======================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
//  Middlewares
// =======================
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
//  Esquema y Modelo
// =======================
const puntoSchema = new mongoose.Schema({
  comuna_nombre: String,
  direccion_completa: String,
  latitud: Number,
  longitud: Number,
});

const Punto = mongoose.model("Punto", puntoSchema);

// =======================
//  Rutas API
// =======================

// Obtener todos los puntos
app.get("/api/puntos", async (req, res) => {
  try {
    const puntos = await Punto.find();
    res.json(puntos);
  } catch (error) {
    console.error("❌ Error al obtener puntos:", error);
    res.status(500).json({ error: "Error al obtener puntos" });
  }
});

// Ruta de prueba (opcional)
app.get("/", (req, res) => {
  res.send("🌎 API de ReusoSmart funcionando correctamente");
});

// =======================
//  Servidor escuchando
// =======================
//  Importante: usar "0.0.0.0" para que Expo (en el celular) pueda acceder
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Servidor corriendo en http://192.168.1.6:${PORT}`);
});
  