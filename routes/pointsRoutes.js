import express from "express";
import Punto from "../models/Punto.js";

const router = express.Router();

// Obtener todos los puntos
router.get("/", async (req, res) => {
  try {
    const { region } = req.query;
    let filter = {};
    if (region) {
      // Filtrar por región usando nombre o abreviatura (insensible a mayúsculas)
      const regex = new RegExp(region, "i");
      filter = { $or: [{ region_nombre: regex }, { region_abreviatura: regex }] };
    }
    const puntos = await Punto.find(filter);
    res.json(puntos);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener puntos" });
  }
});

// Conteo rápido de puntos (con filtro opcional por región)
router.get("/count", async (req, res) => {
  try {
    const { region } = req.query;
    let filter = {};
    if (region) {
      const regex = new RegExp(region, "i");
      filter = { $or: [{ region_nombre: regex }, { region_abreviatura: regex }] };
    }
    const total = await Punto.countDocuments(filter);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener conteo de puntos" });
  }
});

export default router;
