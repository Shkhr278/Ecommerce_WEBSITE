import { type User, type InsertUser, type Event, type InsertEvent, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEvents(filters?: {
    category?: string;
    maxPrice?: number;
    location?: { latitude: number; longitude: number; radius: number };
    search?: string;
  }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  getUserFavorites(userId: string): Promise<Event[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, eventId: string): Promise<boolean>;
  isFavorite(userId: string, eventId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.favorites = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed some sample events
    const sampleEvents: Event[] = [
      {
        id: "1",
        title: "Small Business Networking Mixer",
        description: "Connect with local business owners and entrepreneurs. Light refreshments provided.",
        category: "Networking",
        price: "0",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        location: "Downtown Convention Center",
        address: "123 Convention Ave, San Francisco, CA",
        latitude: "37.7749",
        longitude: "-122.4194",
        startDate: new Date("2024-08-04T18:00:00"),
        endDate: new Date("2024-08-04T20:00:00"),
        organizerName: "SF Business Network",
        organizerEmail: "events@sfbiznet.com",
        maxAttendees: 100,
        isActive: true,
      },
      {
        id: "2",
        title: "Digital Marketing for Small Business",
        description: "Learn effective digital marketing strategies on a budget. Includes hands-on exercises and resource guide.",
        category: "Workshop",
        price: "35",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        location: "Tech Hub Co-working Space",
        address: "456 Tech St, San Francisco, CA",
        latitude: "37.7849",
        longitude: "-122.4094",
        startDate: new Date("2024-08-05T14:00:00"),
        endDate: new Date("2024-08-05T17:00:00"),
        organizerName: "Digital Growth Academy",
        organizerEmail: "workshops@digitalgrowth.com",
        maxAttendees: 30,
        isActive: true,
      },
      {
        id: "3",
        title: "Local Business Expo 2024",
        description: "Discover new vendors, attend seminars, and showcase your business. Over 100 exhibitors expected.",
        category: "Trade Show",
        price: "45",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        location: "City Exhibition Hall",
        address: "789 Expo Blvd, San Francisco, CA",
        latitude: "37.7649",
        longitude: "-122.4294",
        startDate: new Date("2024-03-15T09:00:00"),
        endDate: new Date("2024-03-15T18:00:00"),
        organizerName: "Bay Area Business Alliance",
        organizerEmail: "expo@bayareabiz.org",
        maxAttendees: 500,
        isActive: true,
      },
      {
        id: "4",
        title: "Small Business Financial Planning",
        description: "Learn budgeting, cash flow management, and tax planning strategies for small businesses.",
        category: "Seminar",
        price: "0",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        location: "Public Library - Main Branch",
        address: "100 Library St, San Francisco, CA",
        latitude: "37.7549",
        longitude: "-122.4394",
        startDate: new Date("2024-03-18T19:00:00"),
        endDate: new Date("2024-03-18T21:00:00"),
        organizerName: "Financial Literacy Foundation",
        organizerEmail: "seminars@finlit.org",
        maxAttendees: 50,
        isActive: true,
      },
    ];

    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
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

  async getEvents(filters?: {
    category?: string;
    maxPrice?: number;
    location?: { latitude: number; longitude: number; radius: number };
    search?: string;
  }): Promise<Event[]> {
    let events = Array.from(this.events.values()).filter(event => event.isActive);

    if (filters?.category && filters.category !== "all") {
      events = events.filter(event => 
        event.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    if (filters?.maxPrice !== undefined) {
      events = events.filter(event => 
        parseFloat(event.price) <= filters.maxPrice!
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.location) {
      // Simple distance calculation (not precise but good for demo)
      const { latitude, longitude, radius } = filters.location;
      events = events.filter(event => {
        const eventLat = parseFloat(event.latitude);
        const eventLng = parseFloat(event.longitude);
        const distance = Math.sqrt(
          Math.pow(eventLat - latitude, 2) + Math.pow(eventLng - longitude, 2)
        ) * 69; // Rough miles conversion
        return distance <= radius;
      });
    }

    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id, 
      isActive: true,
      price: insertEvent.price || "0"
    };
    this.events.set(id, event);
    return event;
  }

  async getUserFavorites(userId: string): Promise<Event[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);
    
    const favoriteEvents: Event[] = [];
    for (const favorite of userFavorites) {
      const event = this.events.get(favorite.eventId);
      if (event && event.isActive) {
        favoriteEvents.push(event);
      }
    }
    
    return favoriteEvents;
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

  async removeFavorite(userId: string, eventId: string): Promise<boolean> {
    const favoriteEntry = Array.from(this.favorites.entries())
      .find(([_, fav]) => fav.userId === userId && fav.eventId === eventId);
    
    if (favoriteEntry) {
      this.favorites.delete(favoriteEntry[0]);
      return true;
    }
    return false;
  }

  async isFavorite(userId: string, eventId: string): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(fav => fav.userId === userId && fav.eventId === eventId);
  }
}

export const storage = new MemStorage();
