import dotenv from "dotenv";
import mongoose from "mongoose";
import Punto from "../models/Punto.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");
    const result1 = await Punto.collection.updateMany({}, { $unset: { estado: "", id: "", tipo_punto: "" } });
    console.log("🧹 updateMany (native) →", result1);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();