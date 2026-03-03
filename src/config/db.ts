import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const conectarMongo = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("No se encontro MONGO_URI");
    }

    await mongoose.connect(uri);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
};