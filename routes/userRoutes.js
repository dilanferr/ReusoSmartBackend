const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// =====================
// REGISTRO DE USUARIO
// =====================
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "Usuario ya existe" });
    }

    // Contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Contraseña insegura. Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      });
    }

    // Hash con bcrypt
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      credenciales: {
        hash,
        algoritmo: "bcrypt",
        ultimo_cambio: new Date(),
      },
      fecha_registro: new Date(),
      activo: true,
      seguridad: { intentos_fallidos: 0, ultimo_acceso: null, bloqueado: false },
    });

    await newUser.save();
    res.status(201).json({ msg: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al registrar usuario", error });
  }
});

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Verificar si el usuario está bloqueado
    if (user.seguridad.bloqueado) {
      return res.status(403).json({ msg: "Usuario bloqueado temporalmente" });
    }

    const match = await bcrypt.compare(password, user.credenciales.hash);

    if (!match) {
      // Incrementar intentos fallidos
      user.seguridad.intentos_fallidos += 1;

      // Bloquear usuario si llega a 5 intentos
      if (user.seguridad.intentos_fallidos >= 5) {
        user.seguridad.bloqueado = true;
      }

      await user.save();
      return res.status(400).json({
        msg: `Contraseña incorrecta. Intentos fallidos: ${user.seguridad.intentos_fallidos}`,
      });
    }

    // Login exitoso: resetear intentos
    user.seguridad.intentos_fallidos = 0;
    user.seguridad.ultimo_acceso = new Date();
    await user.save();

    // Generar JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "1h" }
    );

    res.json({
      msg: "Login exitoso",
      usuario: { nombre: user.nombre, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al hacer login", error });
  }
});

// =====================
// PROFILE (protegido con JWT)
// =====================
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "No autorizado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_clave_secreta");

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json({ nombre: user.nombre, email: user.email });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener profile", error });
  }
});

// =====================
// OLVIDÉ CONTRASEÑA (enviar código real)
// =====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    // Nodemailer real
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ReusoSmart - Código de recuperación",
      text: `Tu código de recuperación es: ${resetCode}\nEs válido por 10 minutos.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ msg: "Código enviado al correo" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en forgot-password", error });
  }
});

// =====================
// RESET PASSWORD (código + nueva contraseña)
// =====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetCode,
      resetCodeExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Código inválido o expirado" });

    // Contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        msg: "Contraseña insegura. Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      });
    }

    // Guardar nueva contraseña
    const hash = await bcrypt.hash(newPassword, 10);
    user.credenciales.hash = hash;
    user.credenciales.algoritmo = "bcrypt";
    user.credenciales.ultimo_cambio = new Date();
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    res.json({ msg: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ msg: "Error en reset-password", error });
  }
});

module.exports = router;
