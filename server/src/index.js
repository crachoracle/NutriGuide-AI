import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import menuRoutes from "./routes/menuRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "127.0.0.1";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "NutriGuide AI API" });
});

app.use("/api", menuRoutes);
app.use("/api", recommendationRoutes);
app.use("/api", journalRoutes);

app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(clientIndexPath, (error) => {
    if (error) {
      res.status(404).json({
        error: "Client build not found. Run npm run build before npm start."
      });
    }
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong while processing the request."
  });
});

app.listen(port, host, () => {
  console.log(`NutriGuide AI running on http://${host}:${port}`);
});
