// ===== DEPENDENCIAS =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== CONEXIÓN A MONGODB =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// ===== RUTAS DE LA API =====
const userRoutes = require("./routes/userRoutes");
const pointsRoutes = require("./routes/pointsRoutes"); // puntos de reciclaje

app.use("/api/users", userRoutes);
app.use("/api/puntos", pointsRoutes); // <-- en español para mantener consistencia

// ===== SERVIR FRONTEND (opcional, si usas frontend local) =====
app.use(express.static(path.join(__dirname, "frontend-test"))); // o reusosmart-frontend

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend-test", "index.html"));
});

// ===== SERVIDOR =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);

//node server.js backend
//npm run dev frontend