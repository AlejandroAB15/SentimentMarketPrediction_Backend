import { Router } from "express";
import {
  obtenerPredicciones,
  obtenerMetricasModelo
} from "../controllers/prediccion.controller";

const router = Router();

router.get("/:indice", obtenerPredicciones);
router.get("/:indice/metricas", obtenerMetricasModelo);

export default router;