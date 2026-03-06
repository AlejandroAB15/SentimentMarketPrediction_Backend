import express from "express";
import cors from "cors";
import { conectarMongo } from "./config/db";
import metricasRoutes from "./routes/metricas";
import adquisicionRoutes from "./routes/adquisicion";
import clasificacionRoutes from "./routes/clasificacion";
import preprocesadoRoutes from "./routes/preprocesado";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/metricas", metricasRoutes);
app.use("/api/adquisicion", adquisicionRoutes);
app.use("/api/clasificacion", clasificacionRoutes);
app.use("/api/preprocesado", preprocesadoRoutes);

const PORT = 4000;

conectarMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
});