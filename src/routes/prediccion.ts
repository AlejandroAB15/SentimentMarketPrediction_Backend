import { Router } from "express";
import {
  obtenerPredicciones,
  obtenerMetricasModelo,
  obtenerResumenModelos
} from "../controllers/prediccion.controller";

const router = Router();

router.get("/resumen_modelos", obtenerResumenModelos);
router.get("/:indice", obtenerPredicciones);
router.get("/:indice/metricas", obtenerMetricasModelo);


export default router;