const express = require("express");
const Punto = require("../models/Punto.js");

const router = express.Router();

// Obtener todos los puntos
router.get("/", async (req, res) => {
  try {
    const puntos = await Punto.find();
    res.json(puntos);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener puntos" });
  }
});

module.exports = router;
