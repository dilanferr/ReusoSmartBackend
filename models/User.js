const mongoose = require("mongoose");

const credencialesSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  algoritmo: { type: String, default: "bcrypt" },
  ultimo_cambio: { type: Date, default: Date.now }
});

const seguridadSchema = new mongoose.Schema({
  intentos_fallidos: { type: Number, default: 0 },
  ultimo_acceso: { type: Date, default: null },
  bloqueado: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  credenciales: { type: credencialesSchema, required: true },
  fecha_registro: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
  seguridad: { type: seguridadSchema, default: () => ({}) },

  // Campos para "olvidé contraseña"
  resetCode: { type: String },
  resetCodeExpires: { type: Date },

  // Para el método antiguo de contraseña temporal (opcional)
  tempCredenciales: {
    hash: String,
    salt: String,
    creado: Date
  }
});

module.exports = mongoose.model("User", userSchema);
