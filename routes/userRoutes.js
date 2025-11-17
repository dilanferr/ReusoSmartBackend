import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

// =====================
// REGISTRO DE USUARIO
// =====================
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

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

    // Rol: 1 = usuario normal (por defecto), 2 = admin
    const rolNumero = rol === 2 ? 2 : 1;

    const newUser = new User({
      nombre,
      email,
      credenciales: {
        hash,
        algoritmo: "bcrypt",
        ultimo_cambio: new Date(),
      },
      rol: rolNumero,
      fecha_registro: new Date(),
      activo: true,
      seguridad: { intentos_fallidos: 0, ultimo_acceso: null, bloqueado: false },
    });

    await newUser.save();
    res.status(201).json({ msg: "Usuario registrado exitosamente", rol: newUser.rol });
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

    // Validar contraseña
    const match = await bcrypt.compare(password, user.credenciales.hash);
    if (!match) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // Generar JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "1h" }
    );

    user.seguridad.ultimo_acceso = new Date();
    await user.save();

    res.json({
      msg: "Login exitoso",
      usuario: { nombre: user.nombre, email: user.email, rol: user.rol },
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

// =====================
// STATS / COUNT USERS
// =====================
router.get("/count", async (_req, res) => {
  try {
    const total = await User.countDocuments({});
    const admins = await User.countDocuments({ rol: 2 });
    const activos = await User.countDocuments({ activo: true });
    res.json({ total, admins, activos });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener conteo de usuarios", error });
  }
});

// =====================
// LISTAR USUARIOS (solo campos públicos)
// =====================
router.get("/", async (_req, res) => {
  try {
    const users = await User.find(
      {},
      {
        nombre: 1,
        email: 1,
        rol: 1,
        activo: 1,
        fecha_registro: 1,
        seguridad: 1,
      }
    ).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error al listar usuarios", error });
  }
});

// =====================
// CAMBIAR ROL DE USUARIO (1 usuario, 2 admin)
// =====================
router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const nuevoRol = Number(rol);
    if (![1, 2].includes(nuevoRol)) {
      return res.status(400).json({ msg: "Rol inválido. Use 1 o 2" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    user.rol = nuevoRol;
    await user.save();

    res.json({ msg: "Rol actualizado", usuario: { _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar rol", error });
  }
});

export default router;
