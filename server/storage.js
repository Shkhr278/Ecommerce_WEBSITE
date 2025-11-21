import { type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(filters?: {
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    brand?: string;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<boolean>;
  removeFromCart(userId: string, productId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  getUserFavorites(userId: string): Promise<Product[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, productId: string): Promise<boolean>;
  isFavorite(userId: string, productId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.favorites = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed sample products
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        description: "Premium quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
        category: "Electronics",
        price: "89.99",
        originalPrice: "129.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "TechSound",
        rating: "4.5",
        reviewCount: 245,
        stockQuantity: 50,
        sku: "TS-WBH-001",
        tags: ["wireless", "bluetooth", "noise-cancelling"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "Ergonomic Office Chair",
        description: "Comfortable ergonomic office chair with lumbar support and adjustable height. Ideal for long working hours.",
        category: "Furniture",
        price: "199.99",
        originalPrice: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "ComfortDesk",
        rating: "4.3",
        reviewCount: 156,
        stockQuantity: 25,
        sku: "CD-EOC-002",
        tags: ["ergonomic", "office", "adjustable"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "3",
        name: "Stainless Steel Water Bottle",
        description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours and hot for 12 hours. BPA-free and eco-friendly.",
        category: "Sports & Outdoors",
        price: "24.99",
        originalPrice: "34.99",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "HydroLife",
        rating: "4.7",
        reviewCount: 89,
        stockQuantity: 100,
        sku: "HL-SSW-003",
        tags: ["insulated", "stainless-steel", "eco-friendly"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "4",
        name: "Smart Fitness Tracker",
        description: "Advanced fitness tracker with heart rate monitoring, sleep tracking, and 7-day battery life. Compatible with iOS and Android.",
        category: "Electronics",
        price: "79.99",
        originalPrice: "99.99",
        imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "FitTech",
        rating: "4.2",
        reviewCount: 203,
        stockQuantity: 75,
        sku: "FT-SFT-004",
        tags: ["fitness", "smartwatch", "health"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "5",
        name: "Organic Cotton T-Shirt",
        description: "Super soft organic cotton t-shirt in various colors. Sustainable fashion choice with comfortable fit.",
        category: "Clothing",
        price: "29.99",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        brand: "EcoWear",
        rating: "4.4",
        reviewCount: 67,
        stockQuantity: 200,
        sku: "EW-OCT-005",
        tags: ["organic", "cotton", "sustainable"],
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      location: insertUser.location || null,
      latitude: insertUser.latitude || null,
      longitude: insertUser.longitude || null
    };
    this.users.set(id, user);
    return user;
  }

  async getProducts(filters?: {
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
    brand?: string;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(product => product.isActive);

    if (filters?.category && filters.category !== "all") {
      products = products.filter(product => 
        product.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    if (filters?.maxPrice !== undefined) {
      products = products.filter(product => 
        parseFloat(product.price) <= filters.maxPrice!
      );
    }

    if (filters?.minPrice !== undefined) {
      products = products.filter(product => 
        parseFloat(product.price) >= filters.minPrice!
      );
    }

    if (filters?.brand) {
      products = products.filter(product => 
        product.brand?.toLowerCase() === filters.brand?.toLowerCase()
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return products.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      isActive: true,
      createdAt: new Date(),
      rating: insertProduct.rating || "0",
      reviewCount: insertProduct.reviewCount || 0,
      stockQuantity: insertProduct.stockQuantity || 0
    };
    this.products.set(id, product);
    return product;
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    const cartWithProducts: (CartItem & { product: Product })[] = [];
    for (const cartItem of userCartItems) {
      const product = this.products.get(cartItem.productId);
      if (product && product.isActive) {
        cartWithProducts.push({ ...cartItem, product });
      }
    }
    
    return cartWithProducts;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId);
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCartItem.quantity;
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id, 
      createdAt: new Date() 
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<boolean> {
    const cartItemEntry = Array.from(this.cartItems.entries())
      .find(([_, item]) => item.userId === userId && item.productId === productId);
    
    if (cartItemEntry) {
      cartItemEntry[1].quantity = quantity;
      return true;
    }
    return false;
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    const cartItemEntry = Array.from(this.cartItems.entries())
      .find(([_, item]) => item.userId === userId && item.productId === productId);
    
    if (cartItemEntry) {
      this.cartItems.delete(cartItemEntry[0]);
      return true;
    }
    return false;
  }

  async clearCart(userId: string): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId);
    
    userCartItems.forEach(([id]) => {
      this.cartItems.delete(id);
    });
    
    return true;
  }

  async getUserFavorites(userId: string): Promise<Product[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    const favoriteProducts: Product[] = [];
    for (const favorite of userFavorites) {
      const product = this.products.get(favorite.productId);
      if (product && product.isActive) {
        favoriteProducts.push(product);
      }
    }
    
    return favoriteProducts;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date() 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const favoriteEntry = Array.from(this.favorites.entries())
      .find(([_, fav]) => fav.userId === userId && fav.productId === productId);
    
    if (favoriteEntry) {
      this.favorites.delete(favoriteEntry[0]);
      return true;
    }
    return false;
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(fav => fav.userId === userId && fav.productId === productId);
  }
}

export const storage = new MemStorage();
