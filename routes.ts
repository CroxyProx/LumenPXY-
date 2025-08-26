import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ProxyServer } from "./proxy";
import { insertProxyConnectionSchema, insertProxySettingsSchema } from "@shared/schema";
import { z } from "zod";

let proxyServer: ProxyServer | null = null;
const PROXY_PORT = 8001;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize proxy server
  const settings = await storage.getSettings() || await storage.createDefaultSettings();
  proxyServer = new ProxyServer({
    enableLogging: settings.enableLogging,
    connectionTimeout: settings.connectionTimeout * 1000,
    maxConnections: settings.maxConnections,
    sslVerification: settings.sslVerification,
  });

  proxyServer.listen(PROXY_PORT, () => {
    console.log(`Proxy server listening on port ${PROXY_PORT}`);
  });

  // Get proxy connections
  app.get("/api/connections", async (req, res) => {
    try {
      const connections = await storage.getConnections();
      res.json(connections);
    } catch (error) {
      console.error("Failed to get connections:", error);
      res.status(500).json({ error: "Failed to get connections" });
    }
  });

  // Clear proxy connections
  app.delete("/api/connections", async (req, res) => {
    try {
      await storage.clearConnections();
      res.json({ message: "Connections cleared" });
    } catch (error) {
      console.error("Failed to clear connections:", error);
      res.status(500).json({ error: "Failed to clear connections" });
    }
  });

  // Get proxy settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings() || await storage.createDefaultSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to get settings:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  // Update proxy settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedSettings = insertProxySettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSettings(validatedSettings);
      
      // Update proxy server with new settings
      if (proxyServer) {
        proxyServer.updateOptions({
          enableLogging: updatedSettings.enableLogging,
          connectionTimeout: updatedSettings.connectionTimeout * 1000,
          maxConnections: updatedSettings.maxConnections,
          sslVerification: updatedSettings.sslVerification,
        });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        console.error("Failed to update settings:", error);
        res.status(500).json({ error: "Failed to update settings" });
      }
    }
  });

  // Test proxy connection
  app.post("/api/test-connection", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }

      // For now, just return success since the actual proxy handling is done by the ProxyServer
      res.json({ 
        success: true, 
        message: "Connection test initiated",
        proxyUrl: `http://localhost:${PROXY_PORT}`,
      });
    } catch (error) {
      console.error("Failed to test connection:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Web proxy browsing endpoint - redirect users to browse through proxy
  app.post("/api/browse", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }

      // Return the proxy URL for the user to access the website
      res.json({ 
        success: true, 
        message: "Ready to browse through proxy",
        proxyUrl: `http://localhost:${PROXY_PORT}/${url}`,
        directAccess: `Use the proxy server at localhost:${PROXY_PORT} in your browser settings`,
      });
    } catch (error) {
      console.error("Failed to setup browsing:", error);
      res.status(500).json({ error: "Failed to setup browsing" });
    }
  });

  // Get proxy server status
  app.get("/api/status", async (req, res) => {
    try {
      const settings = await storage.getSettings() || await storage.createDefaultSettings();
      const activeConnections = proxyServer?.getActiveConnectionsCount() || 0;
      const recentConnections = await storage.getConnectionsByStatus('connected');
      
      res.json({
        isOnline: true,
        proxyPort: PROXY_PORT,
        activeConnections,
        settings,
        recentConnectionsCount: recentConnections.length,
        uptime: process.uptime(),
      });
    } catch (error) {
      console.error("Failed to get status:", error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
