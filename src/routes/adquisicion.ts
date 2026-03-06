import { Router } from "express";
import { obtenerAdquisicion } from "../controllers/adquisicion.controller";

const router = Router();

router.get("/", obtenerAdquisicion);

export default router;