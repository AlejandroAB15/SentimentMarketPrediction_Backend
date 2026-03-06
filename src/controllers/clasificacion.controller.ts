import { Request, Response } from "express";
import { Articulo } from "../models/Articulo";

const STOPWORDS = new Set([
  "de","la","el","los","las","un","una","y",
  "a","en","por","para","con","del","al",
  "que","se","es","no","lo","como","más",
  "tras","ante","desde","sobre","este",
  "esta","entre","sin","sus","también",
  "trump",
  "donald",
  "dice"
]);

type SentimientoValido = "POS" | "NEG" | "NEU";

function limpiarTexto(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(palabra =>
      palabra.length > 3 &&
      !STOPWORDS.has(palabra) &&
      !/^\d+$/.test(palabra)
    );
}

export const obtenerClasificacion = async (_req: Request, res: Response) => {
  try {

    const totalClasificados = await Articulo.countDocuments();
    const distribucionGlobal = await Articulo.aggregate([
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

    const totalError = distribucionGlobal.find(d => d.sentimiento === "ERROR")?.total || 0;

    const tasaError =
      totalClasificados > 0
        ? Number(((totalError / totalClasificados) * 100).toFixed(2))
        : 0;

    const evolucionRaw = await Articulo.aggregate([
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$fecha" },
            week: { $isoWeek: "$fecha" },
            sentimiento: "$sentimiento"
          },
          total: { $sum: 1 }
        }
      }
    ]);

    const evolucionTemporal: Record<string, any> = {};

    for (const item of evolucionRaw) {
      const { year, week, sentimiento } = item._id;

      const periodo = `Semana ${year}-${String(week).padStart(2, "0")}`;

      if (!evolucionTemporal[periodo]) {
        evolucionTemporal[periodo] = {
          periodo,
          POS: 0,
          NEG: 0,
          NEU: 0,
          ERROR: 0
        };
      }

      evolucionTemporal[periodo][sentimiento] = item.total;
    }

    const evolucionOrdenada = Object.values(evolucionTemporal)
      .sort((a: any, b: any) => a.periodo.localeCompare(b.periodo));

    const articulosValidos = await Articulo.find({
      sentimiento: { $in: ["POS", "NEG", "NEU"] }
    }).select("titulo sentimiento -_id").lean();

    //Hashmap para palabras mas frecuentes
    const conteo: Record<SentimientoValido, Record<string, number>> = {
                    POS: {},
                    NEG: {},
                    NEU: {}
                    };

    for (const articulo of articulosValidos) {
        const sentimiento = articulo.sentimiento as SentimientoValido;

        if (!articulo.titulo) continue;

        //Se quitan stopwords, acentos y simbolos de titulos de cada articulo
        const palabras = limpiarTexto(articulo.titulo);

        for (const palabra of palabras) {
            conteo[sentimiento][palabra] =
            (conteo[sentimiento][palabra] || 0) + 1;
        }
    }

    const TOP = 20;
    const palabrasFrecuentes: Record<
      string,
      { palabra: string; frecuencia: number }[]
    > = {};

    for (const sentimiento of Object.keys(conteo) as SentimientoValido[]) {
    const entries = Object.entries(conteo[sentimiento]) as [string, number][];

    palabrasFrecuentes[sentimiento] = entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP)
        .map(([palabra, frecuencia]) => ({
        palabra,
        frecuencia
        }));
    }

    res.json({
      resumen: {
        totalClasificados,
        tasaError
      },
      distribucionGlobal,
      evolucionTemporal: evolucionOrdenada,
      palabrasFrecuentes
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al obtener datos de clasificación"
    });
  }
};