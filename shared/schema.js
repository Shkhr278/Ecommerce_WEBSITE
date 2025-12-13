import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  decimal,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable(
  "users",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    location: text("location"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      usernameIdx: index("username_idx").on(table.username),
    };
  }
);

export const products = pgTable(
  "products",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    imageUrl: text("image_url"),
    brand: text("brand"),
    rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
    reviewCount: integer("review_count").default(0),
    stockQuantity: integer("stock_quantity").default(0),
    sku: varchar("sku").unique(),
    tags: text("tags"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      categoryIdx: index("category_idx").on(table.category),
      nameIdx: index("name_idx").on(table.name),
    };
  }
);

export const events = pgTable(
  "events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    imageUrl: text("image_url"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    location: text("location"),
    address: text("address"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    organizerName: text("organizer_name"),
    organizerEmail: text("organizer_email"),
    maxAttendees: integer("max_attendees"),
    currentAttendees: integer("current_attendees").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      categoryIdx: index("event_category_idx").on(table.category),
      titleIdx: index("title_idx").on(table.title),
      dateIdx: index("start_date_idx").on(table.startDate),
    };
  }
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: varchar("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      userIdIdx: index("cart_user_idx").on(table.userId),
      productIdIdx: index("cart_product_idx").on(table.productId),
    };
  }
);

export const favorites = pgTable(
  "favorites",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: varchar("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      userIdIdx: index("fav_user_idx").on(table.userId),
      productIdIdx: index("fav_product_idx").on(table.productId),
    };
  }
);

export const registrations = pgTable(
  "registrations",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: varchar("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      userIdIdx: index("reg_user_idx").on(table.userId),
      eventIdIdx: index("reg_event_idx").on(table.eventId),
    };
  }
);

// Validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
});
