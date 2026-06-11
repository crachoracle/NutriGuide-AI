import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";

function registerApiRoutes(app, prefix) {
  const routePrefix = prefix || "/";

  app.get(`${prefix}/health`, (_req, res) => {
    res.json({ ok: true, service: "NutriGuide AI API" });
  });

  app.use(routePrefix, menuRoutes);
  app.use(routePrefix, recommendationRoutes);
  app.use(routePrefix, journalRoutes);
}

export function apiErrorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong while processing the request."
  });
}

export function createApiApp({ includeRootRoutes = false, includeErrorHandler = true } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  registerApiRoutes(app, "/api");

  if (includeRootRoutes) {
    registerApiRoutes(app, "");
  }

  if (includeErrorHandler) {
    app.use(apiErrorHandler);
  }

  return app;
}

export default createApiApp();
