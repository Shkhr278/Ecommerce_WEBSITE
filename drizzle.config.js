import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found. Make sure your database is provisioned.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.js", // CHANGED from .ts → .js
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
