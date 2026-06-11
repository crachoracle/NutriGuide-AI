import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiErrorHandler, createApiApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

const app = createApiApp({ includeErrorHandler: false });
const port = process.env.PORT || 4000;
const host = process.env.HOST || "127.0.0.1";

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

app.use(apiErrorHandler);

app.listen(port, host, () => {
  console.log(`NutriGuide AI running on http://${host}:${port}`);
});
