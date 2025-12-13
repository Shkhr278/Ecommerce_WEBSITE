// server/index.js
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import { nanoid } from "nanoid";
import { storage } from "./storage.js";
import { log } from "./vite.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Middleware: Ensure user session
app.use((req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = nanoid();
  }
  next();
});

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===== AUTH ROUTES =====
app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    const { username, password, location, latitude, longitude } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await storage.createUser({
      username,
      password,
      location,
      latitude,
      longitude,
    });

    req.session.userId = user.id;
    log(`User registered: ${username}`, "auth");
    res.status(201).json({ user });
  })
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    log(`User logged in: ${username}`, "auth");
    res.json({ user });
  })
);

app.post(
  "/api/auth/logout",
  asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ ok: true });
    });
  })
);

app.get(
  "/api/auth/me",
  asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    res.json({ user });
  })
);

// ===== PRODUCTS ROUTES =====
app.get(
  "/api/products",
  asyncHandler(async (req, res) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      limit = 50,
      offset = 0,
    } = req.query;
    const filters = { search, category, minPrice, maxPrice, brand };
    const products = await storage.getProducts(filters);
    const paginated = products.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    res.json({
      data: paginated,
      total: products.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  })
);

app.get(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  })
);

app.post(
  "/api/products",
  asyncHandler(async (req, res) => {
    const product = await storage.createProduct(req.body);
    log(`Product created: ${product.id}`, "products");
    res.status(201).json(product);
  })
);

// ===== CART ROUTES =====
app.get(
  "/api/cart",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const items = await storage.getCartItems(userId);
    res.json(items);
  })
);

app.post(
  "/api/cart",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId required" });
    }

    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const item = await storage.addToCart({ userId, productId, quantity });
    log(`Item added to cart: ${productId}`, "cart");
    res.status(201).json(item);
  })
);

app.put(
  "/api/cart/:productId",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be >= 1" });
    }

    const success = await storage.updateCartItem(userId, productId, quantity);
    if (!success) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    log(`Cart item updated: ${productId}`, "cart");
    res.json({ ok: true });
  })
);

app.delete(
  "/api/cart/:productId",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;

    const success = await storage.removeFromCart(userId, productId);
    if (!success) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    log(`Item removed from cart: ${productId}`, "cart");
    res.json({ ok: true });
  })
);

app.post(
  "/api/cart/clear",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    await storage.clearCart(userId);
    log(`Cart cleared for user: ${userId}`, "cart");
    res.json({ ok: true });
  })
);

// ===== FAVORITES ROUTES =====
app.get(
  "/api/favorites",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const favorites = await storage.getUserFavorites(userId);
    res.json(favorites);
  })
);

app.post(
  "/api/favorites",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId required" });
    }

    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const isFav = await storage.isFavorite(userId, productId);
    if (isFav) {
      return res.status(409).json({ error: "Already in favorites" });
    }

    const favorite = await storage.addFavorite({ userId, productId });
    log(`Product added to favorites: ${productId}`, "favorites");
    res.status(201).json(favorite);
  })
);

app.delete(
  "/api/favorites/:productId",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;

    const success = await storage.removeFavorite(userId, productId);
    if (!success) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    log(`Product removed from favorites: ${productId}`, "favorites");
    res.json({ ok: true });
  })
);

app.get(
  "/api/favorites/:productId/check",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { productId } = req.params;

    const isFavorite = await storage.isFavorite(userId, productId);
    res.json({ isFavorite });
  })
);

// ===== EVENTS ROUTES =====
app.get(
  "/api/events",
  asyncHandler(async (req, res) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      limit = 50,
      offset = 0,
    } = req.query;
    const filters = { search, category, minPrice, maxPrice };
    const events = await storage.getEvents(filters);
    const paginated = events.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    res.json({
      data: paginated,
      total: events.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  })
);

app.get(
  "/api/events/:id",
  asyncHandler(async (req, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  })
);

app.post(
  "/api/events",
  asyncHandler(async (req, res) => {
    const event = await storage.createEvent(req.body);
    log(`Event created: ${event.id}`, "events");
    res.status(201).json(event);
  })
);

// ===== REGISTRATIONS ROUTES =====
app.get(
  "/api/registrations",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const registrations = await storage.getUserRegistrations(userId);
    res.json(registrations);
  })
);

app.post(
  "/api/registrations",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: "eventId required" });
    }

    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const existing = await storage.getRegistration(userId, eventId);
    if (existing) {
      return res.status(409).json({ error: "Already registered" });
    }

    const registration = await storage.registerForEvent({ userId, eventId });
    log(`User registered for event: ${eventId}`, "registrations");
    res.status(201).json(registration);
  })
);

app.delete(
  "/api/registrations/:eventId",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { eventId } = req.params;

    const success = await storage.cancelRegistration(userId, eventId);
    if (!success) {
      return res.status(404).json({ error: "Registration not found" });
    }

    log(`User cancelled registration: ${eventId}`, "registrations");
    res.json({ ok: true });
  })
);

// ===== SEARCH ROUTES =====
app.get(
  "/api/search",
  asyncHandler(async (req, res) => {
    const { q, type = "all" } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: "Query must be at least 2 characters" });
    }

    const results = { products: [], events: [] };

    if (type === "all" || type === "products") {
      results.products = await storage.searchProducts(q);
    }

    if (type === "all" || type === "events") {
      results.events = await storage.searchEvents(q);
    }

    res.json(results);
  })
);

// ===== CATEGORIES ROUTES =====
app.get(
  "/api/categories/products",
  asyncHandler(async (req, res) => {
    const categories = await storage.getProductCategories();
    res.json(categories);
  })
);

app.get(
  "/api/categories/events",
  asyncHandler(async (req, res) => {
    const categories = await storage.getEventCategories();
    res.json(categories);
  })
);

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  log(`Error: ${err.message}`, "error");
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    log(`Express server running on port ${PORT}`, "server");
  });
}

export default app;
