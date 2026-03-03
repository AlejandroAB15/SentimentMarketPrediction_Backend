import { Schema, model } from "mongoose";

const ArticuloSchema = new Schema(
  {
    titulo: String,
    subtitulo: String,
    fuente: String,
    fecha: Date,
    sentimiento: String,

    close_sp500_t: Number,
    close_sp500_t7: Number,
    variacion_sp500_7d: Number,

    close_nasdaq_t: Number,
    close_nasdaq_t7: Number,
    variacion_nasdaq_7d: Number,

    close_dji_t: Number,
    close_dji_t7: Number,
    variacion_dji_7d: Number,

    fecha_creacion: Date,
  },
  { collection: "articulos" }
);

export const Articulo = model("Articulo", ArticuloSchema);