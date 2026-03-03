import { Request, Response } from "express";
import { Articulo } from "../models/Articulo";
import mongoose from "mongoose";

export const obtenerMetricas = async (_req: Request, res: Response) => {
  try {
    const totalArticulos = await Articulo.countDocuments();

    const distribucionSentimiento = await Articulo.aggregate([
      {
        $group: {
          _id: "$sentimiento",
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          sentimiento: "$_id",
          total: 1
        }
      }
    ]);

    const distribucionFuente = await Articulo.aggregate([
      {
        $group: {
          _id: "$fuente",
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          fuente: "$_id",
          total: 1
        }
      }
    ]);

    const rangoFechasAgg = await Articulo.aggregate([
      {
        $group: {
          _id: null,
          fecha_minima: { $min: "$fecha" },
          fecha_maxima: { $max: "$fecha" }
        }
      },
      {
        $project: {
          _id: 0,
          fecha_minima: 1,
          fecha_maxima: 1
        }
      }
    ]);

    const estadisticas = await mongoose.connection
      .collection("estadisticas_dataset")
      .findOne({}, { projection: { _id: 0 } });

    const totalError = distribucionSentimiento.find(d => d.sentimiento === "ERROR")?.total || 0;
    const tasaError = totalArticulos > 0 ? Number(((totalError / totalArticulos) * 100).toFixed(2)): 0;
    const rango = rangoFechasAgg[0];
    const rangoFormateado = rango ? {
          fecha_minima: rango.fecha_minima.toISOString().split("T")[0],
          fecha_maxima: rango.fecha_maxima.toISOString().split("T")[0]
        }: null;

    res.json({
      totales: {
        articulos: totalArticulos,
        original: estadisticas?.total_original ?? 0,
        relevantes: estadisticas?.total_relevantes ?? 0,
        noRelevantes: estadisticas?.total_no_relevantes ?? 0
      },
      clasificacion: {
        distribucion: distribucionSentimiento,
        tasaError
      },
      fuentes: distribucionFuente,
      rangoFechas: rangoFormateado|| null
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener métricas"
    });
  }
};