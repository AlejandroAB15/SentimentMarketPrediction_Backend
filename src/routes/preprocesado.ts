import { Router } from "express";
import { obtenerResumenPreprocesado } from "../controllers/preprocesado.controller";

const router = Router();

router.get("/", obtenerResumenPreprocesado);

export default router;