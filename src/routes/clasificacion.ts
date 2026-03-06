import { Router } from "express";
import { obtenerClasificacion } from "../controllers/clasificacion.controller";

const router = Router();

router.get("/", obtenerClasificacion);

export default router;