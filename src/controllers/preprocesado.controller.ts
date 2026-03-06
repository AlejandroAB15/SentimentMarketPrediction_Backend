import { Request, Response } from "express";
import mongoose from "mongoose";

export const obtenerResumenPreprocesado = async (
  _req: Request,
  res: Response
) => {
  try {
    const resumen = await mongoose.connection
      .collection("estadisticas_preprocesado")
      .findOne({}, { projection: { _id: 0 } });

    if (!resumen) {
      return res.status(404).json({
        mensaje: "No se encontró información de preprocesado"
      });
    }

    res.json(resumen);

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener estadísticas de preprocesado"
    });
  }
};