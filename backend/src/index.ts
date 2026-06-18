import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { assetRoutes } from "./routes/assets";
import { eventsRoutes } from "./routes/events";
import { healthRoutes } from "./routes/health";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/events", eventsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`RWA Nexus API running on http://localhost:${PORT}`);
});

export { app };
