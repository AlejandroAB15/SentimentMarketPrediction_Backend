import { Request, Response } from "express";
import { Articulo } from "../models/Articulo";
import mongoose from "mongoose";

export const obtenerMetricas = async (_req: Request, res: Response) => {
  try {
    const totalArticulos = await Articulo.countDocuments();

    const distribucionSentimiento = await Articulo.aggregate([
      { $group: { _id: "$sentimiento", total: { $sum: 1 } } },
      { $project: { sentimiento: "$_id", total: 1, _id: 0 } }
    ]);

    const distribucionFuente = await Articulo.aggregate([
      { $group: { _id: "$fuente", total: { $sum: 1 } } },
      { $project: { fuente: "$_id", total: 1, _id: 0 } }
    ]);

    const rangoFechas = await Articulo.aggregate([
      {
        $group: {
          _id: null,
          fecha_minima: { $min: "$fecha" },
          fecha_maxima: { $max: "$fecha" }
        }
      }
    ]);

    const estadisticas = await mongoose.connection
      .collection("estadisticas_dataset")
      .findOne({});

    res.json({
      totalArticulos,
      estadisticas,
      distribucionSentimiento,
      distribucionFuente,
      rangoFechas: rangoFechas[0] || null
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener métricas"
    });
  }
};