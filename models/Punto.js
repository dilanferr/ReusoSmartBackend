const mongoose = require("mongoose");

const puntoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  encargado: String,
  administrador: String,
  tipo_punto: String,
  estado: String,
  direccion_completa: String,
  tipo_via: String,
  nombre_via: String,
  comuna_id: Number,
  comuna_nombre: String,
  region_id: Number,
  region_nombre: String,
  region_abreviatura: String,
  latitud: Number,
  longitud: Number,
  telefono: String,
  horario: String,
  tipo_electronico: String,
  materiales_aceptados: String,
});

module.exports = mongoose.model("Punto", puntoSchema);
