import { Request, Response } from "express";
import { Articulo } from "../models/Articulo";

export const obtenerAdquisicion = async (_req: Request, res: Response) => {
  try {

    const totalArticulos = await Articulo.countDocuments();

    const articulosPorFuente = await Articulo.aggregate([
      { $group: { _id: "$fuente", total: { $sum: 1 } } },
      { $project: { _id: 0, fuente: "$_id", total: 1 } },
      { $sort: { total: -1 } }
    ]);

    const numeroFuentes = articulosPorFuente.length;

    const sentimientoPorFuente = await Articulo.aggregate([
      {
        $group: {
          _id: { fuente: "$fuente", sentimiento: "$sentimiento" },
          total: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.fuente",
          sentimientos: {
            $push: {
              sentimiento: "$_id.sentimiento",
              total: "$total"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          fuente: "$_id",
          sentimientos: 1
        }
      }
    ]);

    const articulosPorDia = await Articulo.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$fecha" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          fecha: "$_id",
          total: 1
        }
      },
      { $sort: { fecha: 1 } }
    ]);

    res.json({
      resumen: {
        numeroFuentes,
        totalArticulos
      },
      articulosPorFuente,
      sentimientoPorFuente,
      articulosPorDia
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener datos de adquisición"
    });
  }
};