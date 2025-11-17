import mongoose from "mongoose";

const reciclajeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  puntoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Punto",
    required: true,
  },
  tipo_electronico: {
    type: String,
    required: true,
  },
  materiales_aceptados: [String],
  imagen_validacion: String,
  validadoIA: { type: Boolean, default: false },
  puntos_obtenidos: { type: Number, default: 10 },
  fecha: { type: Date, default: Date.now },
});

export default mongoose.model("Reciclaje", reciclajeSchema);
