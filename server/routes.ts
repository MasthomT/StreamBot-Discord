import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { discordService } from "./services/discord";
import { monitoringService } from "./services/monitoring";
import { twitchService } from "./services/twitch";
import { youtubeService } from "./services/youtube";
import { insertStreamerSchema, insertConfigurationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const streamers = await storage.getStreamers();
      const liveStreamers = streamers.filter(s => s.isLive);
      const logs = await storage.getActivityLogs(100);
      const notificationsSent = logs.filter(l => l.message.includes('Notification sent')).length;
      
      res.json({
        totalStreamers: streamers.length,
        liveStreamers: liveStreamers.length,
        notificationsSent,
        uptime: process.uptime(),
        botConnected: discordService.isConnected(),
        monitoringActive: monitoringService.isMonitoring(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Streamers CRUD
  app.get("/api/streamers", async (req, res) => {
    try {
      const streamers = await storage.getStreamers();
      res.json(streamers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get streamers" });
    }
  });

  app.post("/api/streamers", async (req, res) => {
    try {
      const data = insertStreamerSchema.parse(req.body);
      
      // Check if streamer already exists
      const existing = await storage.getStreamerByUsername(data.username, data.platform);
      if (existing) {
        return res.status(409).json({ error: "Streamer already exists" });
      }

      const streamer = await storage.createStreamer(data);
      
      await storage.createActivityLog({
        type: 'success',
        message: `Added new streamer: ${streamer.displayName}`,
        details: `Platform: ${streamer.platform}`,
      });

      res.json(streamer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create streamer" });
    }
  });

  app.delete("/api/streamers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const streamer = await storage.getStreamer(id);
      
      if (!streamer) {
        return res.status(404).json({ error: "Streamer not found" });
      }

      // Delete associated Discord messages
      await discordService.deleteNotificationsForStreamer(id);
      
      await storage.deleteStreamer(id);
      
      await storage.createActivityLog({
        type: 'info',
        message: `Removed streamer: ${streamer.displayName}`,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete streamer" });
    }
  });

  // Configuration
  app.get("/api/configuration", async (req, res) => {
    try {
      const config = await storage.getConfiguration();
      
      // Don't send sensitive data to frontend
      const safeConfig = {
        ...config,
        discordToken: config?.discordToken ? "***" : null,
        twitchClientSecret: config?.twitchClientSecret ? "***" : null,
        youtubeApiKey: config?.youtubeApiKey ? "***" : null,
      };
      
      res.json(safeConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  app.post("/api/configuration", async (req, res) => {
    try {
      const data = insertConfigurationSchema.parse(req.body);
      const config = await storage.updateConfiguration(data);
      
      await storage.createActivityLog({
        type: 'info',
        message: 'Configuration updated',
      });

      // Restart services if needed
      if (data.discordToken) {
        try {
          await discordService.disconnect();
          await discordService.initialize();
        } catch (error) {
          await storage.createActivityLog({
            type: 'error',
            message: 'Failed to restart Discord service',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      if (data.checkInterval) {
        await monitoringService.updateInterval(data.checkInterval);
      }

      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });

  // Activity logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  app.delete("/api/logs", async (req, res) => {
    try {
      await storage.clearActivityLogs();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  // Bot controls
  app.post("/api/bot/start", async (req, res) => {
    try {
      const config = await storage.getConfiguration();
      
      if (!config?.discordToken) {
        return res.status(400).json({ error: "Discord token not configured" });
      }

      if (!discordService.isConnected()) {
        await discordService.initialize();
      }

      if (!monitoringService.isMonitoring()) {
        await monitoringService.start();
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  app.post("/api/bot/stop", async (req, res) => {
    try {
      await monitoringService.stop();
      await discordService.disconnect();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  // Test notification
  app.post("/api/test-notification", async (req, res) => {
    try {
      const { streamerId } = req.body;
      const streamer = await storage.getStreamer(streamerId);
      
      if (!streamer) {
        return res.status(404).json({ error: "Streamer not found" });
      }

      await discordService.sendNotification(streamer);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  // Manual refresh
  app.post("/api/refresh", async (req, res) => {
    try {
      await monitoringService.checkStreamers();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh" });
    }
  });

  const httpServer = createServer(app);

  // Initialize services on startup
  setTimeout(async () => {
    try {
      const config = await storage.getConfiguration();
      if (config?.discordToken) {
        await discordService.initialize();
        await monitoringService.start();
      }
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }, 1000);

  return httpServer;
}
