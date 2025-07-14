// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path"; // Ajoutez cette ligne pour importer le module 'path'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const currentPath = req.path; // Renommé 'path' en 'currentPath' pour éviter le conflit avec le module 'path'
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

// Ajoutez cette route pour servir le fichier index.html à la racine
// Cela résoudra l'erreur 404 sur l'URL principale
app.get("/", (_req, res) => {
  // Utilisez path.resolve pour construire le chemin absolu vers index.html
  // __dirname est le répertoire du fichier actuel (server)
  // ".." remonte d'un niveau (à la racine du projet)
  // "dist", "public" sont les dossiers où Vite construit le frontend en production
  res.sendFile(path.resolve(__dirname, "..", "dist", "public", "index.html"));
});


(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Utilise le port fourni par l'environnement (Render/Railway) ou 8080 par défaut
  const port = process.env.PORT || 8080;
  server.listen({
    port,
    host: "0.0.0.0", // Utilisez 0.0.0.0 pour les serveurs d'hébergement comme Railway/Render
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();