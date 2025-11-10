// =======================
//  Importar dependencias
// =======================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";

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
//  Rutas API
// =======================
// Montar rutas de usuarios y puntos
app.use("/api/users", userRoutes);
app.use("/api/puntos", pointsRoutes);

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
  