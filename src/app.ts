import express from "express";
import cors from "cors";
import { conectarMongo } from "./config/db";
import metricasRoutes from "./routes/metricas";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/metricas", metricasRoutes);

const PORT = 4000;

conectarMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
});