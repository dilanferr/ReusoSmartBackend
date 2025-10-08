const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión a MongoDB:", err));

// Rutas API
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Servir archivos estáticos (tu frontend-test)
app.use(express.static(path.join(__dirname, "frontend-test")));

// Ruta raíz → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend-test", "index.html"));
});

// Arranque del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
