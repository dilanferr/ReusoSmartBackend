import dotenv from "dotenv";
import mongoose from "mongoose";
import Punto from "../models/Punto.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const withId = await Punto.collection.countDocuments({ id: { $exists: true } });
  const withEstado = await Punto.collection.countDocuments({ estado: { $exists: true } });
  console.log({ withId, withEstado });
  await mongoose.disconnect();
}

run();