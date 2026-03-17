import { Router } from "express";
import {
  obtenerPredicciones,
  obtenerMetricasModelo,
  obtenerResumenModelos
} from "../controllers/prediccion.controller";

const router = Router();

router.get("/:indice", obtenerPredicciones);
router.get("/:indice/metricas", obtenerMetricasModelo);
router.get("/prediccion/resumen_modelos", obtenerResumenModelos);

export default router;