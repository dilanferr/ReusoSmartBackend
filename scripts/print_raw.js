import dotenv from "dotenv";
import mongoose from "mongoose";
import Punto from "../models/Punto.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const docs = await Punto.collection.find({}).sort({ _id: 1 }).limit(1).toArray();
  console.log(JSON.stringify(docs[0], null, 2));
  const lastDocs = await Punto.collection.find({}).sort({ _id: -1 }).limit(1).toArray();
  console.log("LAST:", JSON.stringify(lastDocs[0], null, 2));
  await mongoose.disconnect();
}

run();