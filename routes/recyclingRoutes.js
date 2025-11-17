import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Reciclaje from "../models/Reciclaje.js";
import User from "../models/User.js";
import Punto from "../models/Punto.js";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// =======================
// ☁️ Configurar Cloudinary
// =======================
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =======================
// ♻️ REGISTRAR NUEVO RECICLAJE
// =======================
router.post("/nuevo", upload.single("imagen"), async (req, res) => {
  try {
    const { email, puntoId } = req.body;

    console.log("📩 Datos recibidos:", req.body);

    if (!email || !puntoId || !req.file) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan datos obligatorios: email, puntoId o imagen.",
      });
    }

    // Buscar usuario por correo
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado." });
    }

    // Buscar punto
    const punto = await Punto.findById(puntoId);
    if (!punto) {
      return res.status(404).json({ ok: false, msg: "Punto no encontrado." });
    }

    // =======================
    // ☁️ Subir imagen a Cloudinary
    // =======================
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: "reusosmart", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    console.log("✅ Imagen subida a Cloudinary:", uploadResult.secure_url);

    // =======================
    // 🤖 Detección de objeto (Replicate)
    // =======================
    let tipoDetectado = "desconocido";

    try {
      console.log("🔍 Analizando imagen con Replicate...");

      const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REPLICATE_TOKEN}`,
        },
        body: JSON.stringify({
          version: "a16ed0a65d9f73e7b6a8ac9cbab1a370642a37d69e7a27b035727290b455ec3c", // modelo estable
          input: {
            image: uploadResult.secure_url,
          },
        }),
      });

      const replicateData = await replicateResponse.json();
      console.log("📊 Resultado Replicate:", replicateData);

      if (replicateData?.output?.length > 0) {
        tipoDetectado = replicateData.output[0].label || "desconocido";
      }
    } catch (error) {
      console.error("⚠️ Error con Replicate:", error.message);
    }

    console.log("🧩 Tipo detectado final:", tipoDetectado);

    // =======================
    // 🗃️ Guardar reciclaje en MongoDB
    // =======================
    const nuevoReciclaje = new Reciclaje({
      userEmail: usuario.email,
      puntoId,
      tipo_electronico: tipoDetectado,
      imagen_validacion: uploadResult.secure_url,
      validadoIA: tipoDetectado !== "desconocido",
      puntos_obtenidos: tipoDetectado === "desconocido" ? 0 : 10,
      fecha_registro: new Date(),
    });

    await nuevoReciclaje.save();

    res.json({
      ok: true,
      msg: "♻️ Reciclaje registrado correctamente",
      tipo_detectado: tipoDetectado,
      imagen: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("❌ Error al registrar reciclaje:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno al registrar reciclaje.",
    });
  }
});

// =======================
// 📜 HISTORIAL POR USUARIO (email)
// =======================
router.get("/usuario/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const reciclajes = await Reciclaje.find({ userEmail: email }).populate(
      "puntoId",
      "comuna_nombre direccion_completa"
    );

    if (reciclajes.length === 0) {
      return res.json({
        ok: true,
        mensaje: "El usuario aún no tiene reciclajes.",
        reciclajes: [],
        totalPuntos: 0,
        totalReciclajes: 0,
      });
    }

    const totalPuntos = reciclajes.reduce((acc, r) => acc + (r.puntos_obtenidos || 0), 0);
    res.json({
      ok: true,
      reciclajes,
      totalPuntos,
      totalReciclajes: reciclajes.length,
    });
  } catch (error) {
    console.error("❌ Error al obtener reciclajes:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener historial del usuario.",
    });
  }
});

export default router;
