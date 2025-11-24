// server/api/router.js
import express from "express";

const router = express.Router();

/**
 * Note:
 * - This file uses `storage` for data access.
 * - In a real app replace mock user with session user (e.g. req.session.userId).
 */

function getUserId(req) {
  // Replace with real session-backed user id in production
  return (req.session && req.session.userId) || "mock-user";
}

// GET /api/products
router.get("/products", async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = String(req.query.category);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(String(req.query.maxPrice));
    if (req.query.minPrice) filters.minPrice = parseFloat(String(req.query.minPrice));
    if (req.query.search) filters.search = String(req.query.search);
    if (req.query.brand) filters.brand = String(req.query.brand);

    const products = await storage.getProducts(filters);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const product = await storage.getProduct(String(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/cart
router.get("/cart", async (req, res) => {
  try {
    const userId = getUserId(req);
    const cartItems = await storage.getCartItems(userId);
    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

// POST /api/cart
router.post("/cart", async (req, res) => {
  const schema = z.object({
    productId: z.string(),
    quantity: z.number().min(1).optional().default(1),
  });

  try {
    const { productId, quantity } = schema.parse(req.body);
    const userId = getUserId(req);
    const cartItem = await storage.addToCart({ userId, productId, quantity });
    res.json(cartItem);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data" });
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PUT /api/cart/:productId
router.put("/cart/:productId", async (req, res) => {
  const schema = z.object({
    quantity: z.number().min(1),
  });

  try {
    const { quantity } = schema.parse(req.body);
    const userId = getUserId(req);
    const success = await storage.updateCartItem(userId, String(req.params.productId), quantity);
    if (!success) return res.status(404).json({ error: "Cart item not found" });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data" });
    console.error(err);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// DELETE /api/cart/:productId
router.delete("/cart/:productId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const success = await storage.removeFromCart(userId, String(req.params.productId));
    if (!success) return res.status(404).json({ error: "Cart item not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

// GET /api/favorites
router.get("/favorites", async (req, res) => {
  try {
    const userId = getUserId(req);
    const favorites = await storage.getUserFavorites(userId);
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// POST /api/favorites
router.post("/favorites", async (req, res) => {
  const schema = z.object({
    productId: z.string(),
  });

  try {
    const { productId } = schema.parse(req.body);
    const userId = getUserId(req);

    const already = await storage.isFavorite(userId, productId);
    if (already) return res.status(400).json({ error: "Product already in favorites" });

    const favorite = await storage.addFavorite({ userId, productId });
    res.json(favorite);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data" });
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// DELETE /api/favorites/:productId
router.delete("/favorites/:productId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const success = await storage.removeFavorite(userId, String(req.params.productId));
    if (!success) return res.status(404).json({ error: "Favorite not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// GET /api/favorites/:productId/check
router.get("/favorites/:productId/check", async (req, res) => {
  try {
    const userId = getUserId(req);
    const isFavorite = await storage.isFavorite(userId, String(req.params.productId));
    res.json({ isFavorite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
});


router.get("/notifications", (req, res) => {
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Your order has been shipped!",
      message: "Your product is on the way.",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 2,
      type: "favorites",
      title: "New product added!",
      message: "A new item has been added to your favorites.",
      timestamp: new Date().toISOString(),
      read: false,
    },
  ];

  res.json(notifications);
});

export default router;
