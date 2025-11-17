import mongoose from "mongoose";
import dotenv from "dotenv";
import Punto from "../models/Punto.js";

dotenv.config();

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("No MONGO_URI in env");
      process.exit(2);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const punto = new Punto({
      encargado: "Fundación",
      administrador: "DEMARCO",
      nombre_punto: "Punto Test",
      tipo_punto: "Municipal",
      direccion_completa: "Av. Apoquindo 3000",
      comuna_nombre: "Las Condes",
      region_nombre: "Región Metropolitana de Santiago",
      latitud: -33.416848,
      longitud: -70.5988997,
      telefono: "No disponible",
      horario: "Horario no especificado",
      materiales_aceptados: ["Celular"],
    });

    let stage = "save";
    try {
      const saved = await punto.save();
      stage = "toObject";
      const plain = saved.toObject();
      delete plain.id;
      delete plain.estado;
      console.log("Saved OK:", plain._id.toString());
      console.log("Doc keys:", Object.keys(plain));
    } catch (err) {
      console.error("Create failed at stage:", stage);
      console.error(err?.name || "Error", err?.message || String(err));
      if (err?.stack) console.error(err.stack);
    }
  } catch (e) {
    console.error("Fatal error:", e);
  } finally {
    try { await mongoose.disconnect(); } catch {}
    process.exit(0);
  }
}

main();