import { randomUUID } from "crypto";

/**
 * In-memory storage implementation.
 * Methods are async to mimic DB calls.
 */

class MemStorage {
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.events = new Map();
    this.cartItems = new Map(); // key: id -> { id, userId, productId, quantity, createdAt }
    this.favorites = new Map(); // key: id -> { id, userId, productId, createdAt }
    this.registrations = new Map();
    this.seedData();
  }

  seedData() {
    const sampleProducts = [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        description:
          "Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
        category: "Electronics",
        price: "89.99",
        originalPrice: "129.99",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "TechSound",
        rating: "4.5",
        reviewCount: 245,
        stockQuantity: 50,
        sku: "TS-WBH-001",
        tags: ["wireless", "bluetooth", "noise-cancelling"],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Ergonomic Office Chair",
        description:
          "Comfortable ergonomic office chair with lumbar support and adjustable height. Ideal for long working hours.",
        category: "Furniture",
        price: "199.99",
        originalPrice: "299.99",
        imageUrl:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "ComfortDesk",
        rating: "4.3",
        reviewCount: 156,
        stockQuantity: 25,
        sku: "CD-EOC-002",
        tags: ["ergonomic", "office", "adjustable"],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Stainless Steel Water Bottle",
        description:
          "Insulated stainless steel water bottle that keeps drinks cold for 24 hours and hot for 12 hours. BPA-free and eco-friendly.",
        category: "Sports & Outdoors",
        price: "24.99",
        originalPrice: "34.99",
        imageUrl:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "HydroLife",
        rating: "4.7",
        reviewCount: 89,
        stockQuantity: 100,
        sku: "HL-SSW-003",
        tags: ["insulated", "stainless-steel", "eco-friendly"],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Smart Fitness Tracker",
        description:
          "Advanced fitness tracker with heart rate monitoring, sleep tracking, and 7-day battery life. Compatible with iOS and Android.",
        category: "Electronics",
        price: "79.99",
        originalPrice: "99.99",
        imageUrl:
          "https://images.unsplash.com/photo-1544117519-31a4b719223d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "FitTech",
        rating: "4.2",
        reviewCount: 203,
        stockQuantity: 75,
        sku: "FT-SFT-004",
        tags: ["fitness", "smartwatch", "health"],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "5",
        name: "Organic Cotton T-Shirt",
        description:
          "Super soft organic cotton t-shirt in various colors. Sustainable fashion choice with comfortable fit.",
        category: "Clothing",
        price: "29.99",
        originalPrice: null,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "EcoWear",
        rating: "4.4",
        reviewCount: 67,
        stockQuantity: 200,
        sku: "EW-OCT-005",
        tags: ["organic", "cotton", "sustainable"],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleEvents = [
      {
        id: "evt-1",
        title: "Tech Summit 2024",
        description:
          "Annual tech conference featuring keynotes from industry leaders, workshops, and networking opportunities.",
        category: "Technology",
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "49.99",
        startDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
        location: "San Francisco, CA",
        address: "Moscone Center, 747 Howard St",
        latitude: "37.7839",
        longitude: "-122.3988",
        organizerName: "TechEvents Inc",
        organizerEmail: "hello@techevents.com",
        maxAttendees: 500,
        currentAttendees: 245,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "evt-2",
        title: "Web Development Workshop",
        description:
          "Hands-on workshop covering modern web development practices, React, and best practices.",
        category: "Education",
        imageUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "0",
        startDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
        ).toISOString(),
        location: "New York, NY",
        address: "Tech Hub NYC, 123 Broadway",
        latitude: "40.7128",
        longitude: "-74.0060",
        organizerName: "Code Academy",
        organizerEmail: "workshops@codeacademy.com",
        maxAttendees: 50,
        currentAttendees: 32,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "evt-3",
        title: "Startup Networking Event",
        description:
          "Meet founders, investors, and entrepreneurs. Great opportunity to showcase your startup or find co-founders.",
        category: "Networking",
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "25.00",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
        ).toISOString(),
        location: "Austin, TX",
        address: "Innovation District, 200 Congress Ave",
        latitude: "30.2672",
        longitude: "-97.7431",
        organizerName: "Austin Startup Scene",
        organizerEmail: "events@austinstartups.com",
        maxAttendees: 100,
        currentAttendees: 67,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "evt-4",
        title: "AI & Machine Learning Summit",
        description:
          "Deep dive into AI/ML trends, practical applications, and future of artificial intelligence.",
        category: "Science",
        imageUrl:
          "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        price: "79.99",
        startDate: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Seattle, WA",
        address: "Convention Center, 800 Convention Pl",
        latitude: "47.6205",
        longitude: "-122.3493",
        organizerName: "AI Community",
        organizerEmail: "contact@aicommunity.com",
        maxAttendees: 300,
        currentAttendees: 156,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    sampleProducts.forEach((p) => this.products.set(p.id, p));
    sampleEvents.forEach((e) => this.events.set(e.id, e));
  }

  // Users
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      id,
      ...insertUser,
      location: insertUser.location || null,
      latitude: insertUser.latitude || null,
      longitude: insertUser.longitude || null,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(filters) {
    let products = Array.from(this.products.values()).filter((p) => p.isActive);

    if (filters) {
      if (filters.category && filters.category !== "all") {
        products = products.filter(
          (p) =>
            String(p.category).toLowerCase() ===
            String(filters.category).toLowerCase()
        );
      }

      if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
        products = products.filter(
          (p) => parseFloat(p.price) <= Number(filters.maxPrice)
        );
      }

      if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
        products = products.filter(
          (p) => parseFloat(p.price) >= Number(filters.minPrice)
        );
      }

      if (filters.brand) {
        products = products.filter(
          (p) =>
            String(p.brand).toLowerCase() ===
            String(filters.brand).toLowerCase()
        );
      }

      if (filters.search) {
        const q = String(filters.search).toLowerCase();
        products = products.filter(
          (p) =>
            String(p.name).toLowerCase().includes(q) ||
            String(p.description).toLowerCase().includes(q) ||
            String(p.category).toLowerCase().includes(q) ||
            (p.brand && String(p.brand).toLowerCase().includes(q)) ||
            (Array.isArray(p.tags) &&
              p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }
    }

    // sort by rating desc
    products.sort(
      (a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0")
    );

    return products;
  }

  async getProduct(id) {
    return this.products.get(String(id));
  }

  async createProduct(insertProduct) {
    const id = randomUUID();
    const product = {
      id,
      ...insertProduct,
      isActive: true,
      createdAt: new Date().toISOString(),
      rating: insertProduct.rating || "0",
      reviewCount: insertProduct.reviewCount || 0,
      stockQuantity: insertProduct.stockQuantity || 0,
    };
    this.products.set(id, product);
    return product;
  }

  // Events
  async getEvents(filters) {
    let events = Array.from(this.events.values()).filter((e) => e.isActive);

    if (filters) {
      if (filters.category && filters.category !== "all") {
        events = events.filter(
          (e) =>
            String(e.category).toLowerCase() ===
            String(filters.category).toLowerCase()
        );
      }

      if (filters.maxPrice !== undefined && !Number.isNaN(filters.maxPrice)) {
        events = events.filter(
          (e) => parseFloat(e.price) <= Number(filters.maxPrice)
        );
      }

      if (filters.minPrice !== undefined && !Number.isNaN(filters.minPrice)) {
        events = events.filter(
          (e) => parseFloat(e.price) >= Number(filters.minPrice)
        );
      }

      if (filters.search) {
        const q = String(filters.search).toLowerCase();
        events = events.filter(
          (e) =>
            String(e.title).toLowerCase().includes(q) ||
            String(e.description).toLowerCase().includes(q) ||
            String(e.category).toLowerCase().includes(q)
        );
      }
    }

    return events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  async getEvent(id) {
    return this.events.get(String(id));
  }

  async createEvent(insertEvent) {
    const id = randomUUID();
    const event = {
      id,
      ...insertEvent,
      isActive: true,
      currentAttendees: 0,
      createdAt: new Date().toISOString(),
    };
    this.events.set(id, event);
    return event;
  }

  // Cart
  async getCartItems(userId) {
    const items = [];
    for (const item of this.cartItems.values()) {
      if (item.userId === userId) {
        const product = this.products.get(item.productId);
        if (product && product.isActive) items.push({ ...item, product });
      }
    }
    return items;
  }

  async addToCart(insertCartItem) {
    const { userId, productId, quantity = 1 } = insertCartItem;

    // merge if exists
    for (const item of this.cartItems.values()) {
      if (item.userId === userId && item.productId === productId) {
        item.quantity = (item.quantity || 0) + quantity;
        return item;
      }
    }

    const id = randomUUID();
    const cartItem = {
      id,
      userId,
      productId,
      quantity,
      createdAt: new Date().toISOString(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(userId, productId, quantity) {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.userId === userId && item.productId === productId) {
        item.quantity = quantity;
        return true;
      }
    }
    return false;
  }

  async removeFromCart(userId, productId) {
    for (const [id, fav] of this.cartItems.entries()) {
      if (fav.userId === userId && fav.productId === productId) {
        this.cartItems.delete(id);
        return true;
      }
    }
    return false;
  }

  async clearCart(userId) {
    for (const [id, item] of this.cartItems.entries()) {
      if (item.userId === userId) this.cartItems.delete(id);
    }
    return true;
  }

  // Favorites
  async getUserFavorites(userId) {
    const favs = [];
    for (const fav of this.favorites.values()) {
      if (fav.userId === userId) {
        const product = this.products.get(fav.productId);
        if (product && product.isActive) favs.push(product);
      }
    }
    return favs;
  }

  async addFavorite(insertFavorite) {
    const id = randomUUID();
    const favorite = {
      id,
      ...insertFavorite,
      createdAt: new Date().toISOString(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId, productId) {
    for (const [id, fav] of this.favorites.entries()) {
      if (fav.userId === userId && fav.productId === productId) {
        this.favorites.delete(id);
        return true;
      }
    }
    return false;
  }

  async isFavorite(userId, productId) {
    for (const fav of this.favorites.values()) {
      if (fav.userId === userId && fav.productId === productId) return true;
    }
    return false;
  }

  // Registrations
  async getUserRegistrations(userId) {
    const regs = [];
    for (const reg of this.registrations.values()) {
      if (reg.userId === userId) {
        const event = this.events.get(reg.eventId);
        if (event && event.isActive) regs.push({ ...reg, event });
      }
    }
    return regs;
  }

  async registerForEvent(insertReg) {
    const id = randomUUID();
    const registration = {
      id,
      ...insertReg,
      createdAt: new Date().toISOString(),
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async getRegistration(userId, eventId) {
    for (const reg of this.registrations.values()) {
      if (reg.userId === userId && reg.eventId === eventId) return reg;
    }
    return undefined;
  }

  async cancelRegistration(userId, eventId) {
    for (const [id, reg] of this.registrations.entries()) {
      if (reg.userId === userId && reg.eventId === eventId) {
        this.registrations.delete(id);
        return true;
      }
    }
    return false;
  }

  // Search
  async searchProducts(query) {
    const q = String(query).toLowerCase();
    return Array.from(this.products.values())
      .filter(
        (p) =>
          p.isActive &&
          (String(p.name).toLowerCase().includes(q) ||
            String(p.description).toLowerCase().includes(q) ||
            String(p.category).toLowerCase().includes(q))
      )
      .slice(0, 10);
  }

  async searchEvents(query) {
    const q = String(query).toLowerCase();
    return Array.from(this.events.values())
      .filter(
        (e) =>
          e.isActive &&
          (String(e.title).toLowerCase().includes(q) ||
            String(e.description).toLowerCase().includes(q) ||
            String(e.category).toLowerCase().includes(q))
      )
      .slice(0, 10);
  }

  // Categories
  async getProductCategories() {
    const categories = new Set(
      Array.from(this.products.values())
        .filter((p) => p.isActive)
        .map((p) => p.category)
    );
    return Array.from(categories).sort();
  }

  async getEventCategories() {
    const categories = new Set(
      Array.from(this.events.values())
        .filter((e) => e.isActive)
        .map((e) => e.category)
    );
    return Array.from(categories).sort();
  }
}

export const storage = new MemStorage();
