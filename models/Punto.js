import mongoose from "mongoose";

// Esquema sin campos `estado` ni `id` personalizados
const puntoSchema = new mongoose.Schema(
  {
    encargado: { type: String },
    administrador: { type: String },
    nombre_punto: { type: String },
    tipo_punto: { type: String, default: "Municipal" },
    direccion_completa: { type: String },
    tipo_via: { type: String },
    nombre_via: { type: String },
    comuna_id: { type: Number },
    comuna_nombre: { type: String },
    region_id: { type: Number },
    region_nombre: { type: String },
    region_abreviatura: { type: String },
    latitud: { type: Number },
    longitud: { type: Number },
    telefono: { type: String, default: "No disponible" },
    horario: { type: String, default: "Horario no especificado" },
    tipo_electronico: { type: String },
    materiales_aceptados: { type: [String], default: [] },
  },
  { strict: true }
);

// Defensa adicional: si por alguna razón llegan `estado` o `id` en el documento,
// asegúrate de que no se persistan.
// Nota: evitamos hooks de "save" para reducir complejidad y posibles recursiones.

// Normaliza valores vacíos antes de validar para asegurar plantilla consistente
puntoSchema.pre("validate", function (next) {
  if (!this.telefono || String(this.telefono).trim() === "") {
    this.telefono = "No disponible";
  }
  if (!this.horario || String(this.horario).trim() === "") {
    this.horario = "Horario no especificado";
  }
  if (!this.tipo_punto || String(this.tipo_punto).trim() === "") {
    this.tipo_punto = "Municipal";
  }
  if (!Array.isArray(this.materiales_aceptados)) {
    this.materiales_aceptados = [];
  }
  next();

});

export default mongoose.model("Punto", puntoSchema);
