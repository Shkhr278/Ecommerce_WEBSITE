import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.maxPrice) {
        filters.maxPrice = parseFloat(req.query.maxPrice as string);
      }

      if (req.query.minPrice) {
        filters.minPrice = parseFloat(req.query.minPrice as string);
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      if (req.query.brand) {
        filters.brand = req.query.brand as string;
      }
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get shopping cart items
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const schema = z.object({
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      });
      
      const { productId, quantity } = schema.parse(req.body);
      const userId = "mock-user"; // In real app, get from session
      
      const cartItem = await storage.addToCart({ userId, productId, quantity });
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  // Update cart item quantity
  app.put("/api/cart/:productId", async (req, res) => {
    try {
      const schema = z.object({
        quantity: z.number().min(1),
      });
      
      const { quantity } = schema.parse(req.body);
      const userId = "mock-user"; // In real app, get from session
      
      const success = await storage.updateCartItem(userId, req.params.productId, quantity);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const success = await storage.removeFromCart(userId, req.params.productId);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
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
        productId: z.string(),
      });
      
      const { productId } = schema.parse(req.body);
      const userId = "mock-user"; // In real app, get from session
      
      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(userId, productId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ error: "Product already in favorites" });
      }
      
      const favorite = await storage.addFavorite({ userId, productId });
      res.json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:productId", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const success = await storage.removeFavorite(userId, req.params.productId);
      
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Check if product is favorited
  app.get("/api/favorites/:productId/check", async (req, res) => {
    try {
      const userId = "mock-user"; // In real app, get from session
      const isFavorite = await storage.isFavorite(userId, req.params.productId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
