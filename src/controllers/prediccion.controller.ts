import { Request, Response } from "express";
import mongoose from "mongoose";

export const obtenerPredicciones = async (req: Request, res: Response) => {
  try {
    const { indice } = req.params;

    const data = await mongoose.connection
      .collection("predicciones_modelo")
      .find({ indice })
      .sort({ fecha: 1 })
      .toArray();

    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener predicciones"
    });
  }
};

export const obtenerMetricasModelo = async (req: Request, res: Response) => {
  try {
    const { indice } = req.params;

    const collection = mongoose.connection.collection("predicciones_modelo");

    const calcularMAPE = async (path: string) => {
      const result = await collection.aggregate([
        {
          $match: {
            indice,
            segmento: "test"
          }
        },
        {
          $project: {
            pred: `$${path}`,
            error: {
              $abs: {
                $divide: [
                  { $subtract: ["$close_real", `$${path}`] },
                  "$close_real"
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            mape: { $avg: "$error" }
          }
        }
      ]).toArray();

      return result[0]?.mape * 100 || 0;
    };

    const mapeGeneralBase = await calcularMAPE("modelos.general.base.pred");
    const mapeGeneralPond = await calcularMAPE("modelos.general.ponderado.pred");

    const mapeEspecificoBase = await calcularMAPE("modelos.especifico.base.pred");
    const mapeEspecificoPond = await calcularMAPE("modelos.especifico.ponderado.pred");

    res.json({
      indice,
      general: {
        base: Number(mapeGeneralBase.toFixed(2)),
        ponderado: Number(mapeGeneralPond.toFixed(2))
      },
      especifico: {
        base: Number(mapeEspecificoBase.toFixed(2)),
        ponderado: Number(mapeEspecificoPond.toFixed(2))
      }
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al calcular métricas del modelo"
    });
  }
};

export const obtenerResumenModelos = async (_: Request, res: Response) => {
  try {
    const data = await mongoose.connection
      .collection("resumen_modelos")
      .findOne({});

    if (!data) {
      return res.status(404).json({
        error: "No se encontró el resumen de modelos"
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener resumen de modelos"
    });
  }
};