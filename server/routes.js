import express from "express";

export const routes = express.Router();

const products = [
  {
    id: "1",
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated steel bottle that keeps drinks cold for 24 hours and hot for 12.",
    price: "24.99",
    originalPrice: "34.99",
    imageUrl:
      "https://images.pexels.com/photos/3735840/pexels-photo-3735840.jpeg",
    category: "Sports & Outdoors",
    brand: "HydroLife",
    rating: "4.7",
    reviewCount: 89,
    stockQuantity: 100,
    tags: ["eco-friendly", "reusable"],
  },
  {
    id: "2",
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: "89.99",
    originalPrice: "129.99",
    imageUrl:
      "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg",
    category: "Electronics",
    brand: "TechSound",
    rating: "4.5",
    reviewCount: 245,
    stockQuantity: 50,
    tags: ["wireless", "audio", "noise cancelling"],
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description:
      "Super soft organic cotton t-shirt in various colors. Sustainable fashion choice.",
    price: "29.99",
    originalPrice: "0",
    imageUrl:
      "https://images.pexels.com/photos/7671165/pexels-photo-7671165.jpeg",
    category: "Clothing",
    brand: "EcoWear",
    rating: "4.4",
    reviewCount: 67,
    stockQuantity: 200,
    tags: ["organic", "cotton"],
  },
];

// ---------------------------
// Helpers
// ---------------------------

function getSessionCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function getSessionFavorites(req) {
  if (!req.session.favorites) req.session.favorites = [];
  return req.session.favorites;
}

// ---------------------------
// PRODUCTS
// ---------------------------

// GET /api/products?search=&category=&maxPrice=
routes.get("/products", (req, res) => {
  let list = [...products];

  const { search, category, maxPrice } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (category && category !== "all") {
    const c = String(category).toLowerCase();
    list = list.filter((p) => p.category.toLowerCase().includes(c));
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) {
      list = list.filter((p) => Number(p.price) <= max);
    }
  }

  res.json(list);
});

// GET /api/products/:id
routes.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

// ---------------------------
// CART (session-based)
// ---------------------------

// GET /api/cart
routes.get("/cart", (req, res) => {
  const cart = getSessionCart(req);
  const detailed = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      id: item.productId,
      product,
      quantity: item.quantity,
    };
  });
  res.json(detailed);
});

// POST /api/cart { productId, quantity }
routes.post("/cart", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find((p) => p.id === String(productId));
  if (!product) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const cart = getSessionCart(req);
  const existing = cart.find((i) => i.productId === product.id);
  if (existing) {
    existing.quantity += Number(quantity) || 1;
  } else {
    cart.push({ productId: product.id, quantity: Number(quantity) || 1 });
  }

  res.status(201).json({ ok: true });
});

// PUT /api/cart/:productId { quantity }
routes.put("/cart/:productId", (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = getSessionCart(req);
  const item = cart.find((i) => i.productId === productId);
  if (!item) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  const q = Number(quantity);
  if (!q || q < 1) {
    return res.status(400).json({ message: "Quantity must be >= 1" });
  }

  item.quantity = q;
  res.json({ ok: true });
});

// DELETE /api/cart/:productId
routes.delete("/cart/:productId", (req, res) => {
  const { productId } = req.params;
  let cart = getSessionCart(req);
  cart = cart.filter((i) => i.productId !== productId);
  req.session.cart = cart;
  res.json({ ok: true });
});

// ---------------------------
// FAVORITES (session-based)
// ---------------------------

// GET /api/favorites
routes.get("/favorites", (req, res) => {
  const favorites = getSessionFavorites(req);
  const favProducts = products.filter((p) => favorites.includes(p.id));
  res.json(favProducts);
});

// POST /api/favorites { productId }
routes.post("/favorites", (req, res) => {
  const { productId } = req.body;
  const product = products.find((p) => p.id === String(productId));
  if (!product) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  const favorites = getSessionFavorites(req);
  if (!favorites.includes(product.id)) {
    favorites.push(product.id);
  }

  res.status(201).json({ ok: true });
});

// DELETE /api/favorites/:id
routes.delete("/favorites/:id", (req, res) => {
  const { id } = req.params;
  let favorites = getSessionFavorites(req);
  favorites = favorites.filter((pid) => pid !== id);
  req.session.favorites = favorites;
  res.json({ ok: true });
});

// GET /api/favorites/:id/check -> { isFavorite: boolean }
routes.get("/favorites/:id/check", (req, res) => {
  const { id } = req.params;
  const favorites = getSessionFavorites(req);
  res.json({ isFavorite: favorites.includes(id) });
});

// ---------------------------
// NOTIFICATIONS
// ---------------------------

routes.get("/notifications", (req, res) => {
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

// Optional default export (not required, but harmless)
export default routes;
