import { Router } from "express";
import { obtenerMetricas } from "../controllers/metricas.controller";

const router = Router();

router.get("/", obtenerMetricas);

export default router;