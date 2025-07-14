// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path"; // Ajout du module 'path'

const app = express();
app.use(express.json());
// La ligne app.use(express.static(...)) est déjà présente dans votre code.
// Il est préférable de la placer ici pour servir les fichiers statiques.
app.use(express.static(path.join(__dirname, "..", "dist", "public")));

app.use((req, res, next) => {
  const start = Date.now();
  const currentPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (currentPath.startsWith("/api")) {
      let logLine = `${req.method} ${currentPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Ajoutez cette route pour le "health check" de la plateforme
app.get("/health", (_req, res) => {
    res.status(200).send("OK");
});

// La route pour servir index.html à la racine est en double.
// La ligne app.use(express.static(...)) ci-dessus gère déjà cela de manière plus générale.
// Laisser les deux pourrait causer des conflits, nous la supprimons.
// app.get("/", (_req, res) => {
//   res.sendFile(path.resolve(__dirname, "..", "dist", "public", "index.html"));
// });


(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 8080;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();