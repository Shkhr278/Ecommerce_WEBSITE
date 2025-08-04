import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get events with optional filters
  app.get("/api/events", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.maxPrice) {
        filters.maxPrice = parseFloat(req.query.maxPrice as string);
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.lat && req.query.lng && req.query.radius) {
        filters.location = {
          latitude: parseFloat(req.query.lat as string),
          longitude: parseFloat(req.query.lng as string),
          radius: parseFloat(req.query.radius as string),
        };
      }
      
      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get single event
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Get user favorites (mock user for now)
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const schema = z.object({
        eventId: z.string(),
      });
      
      const { eventId } = schema.parse(req.body);
      const userId = "mock-user"; // In real app, get from session
      
      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(userId, eventId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ error: "Event already in favorites" });
      }
      
      const favorite = await storage.addFavorite({ userId, eventId });
      res.json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:eventId", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const success = await storage.removeFavorite(userId, req.params.eventId);
      
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Check if event is favorited
  app.get("/api/favorites/:eventId/check", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const isFavorite = await storage.isFavorite(userId, req.params.eventId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
