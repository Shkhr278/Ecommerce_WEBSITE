### README.md (Merged & Sleek)

# Full-Stack E-Commerce + Event Platform (React + Express + Drizzle)

A mobile-first full-stack web application built with React (Vite) on the frontend and Express.js on the backend. It supports e-commerce features, event listings, authentication, session management, and PostgreSQL via Drizzle ORM. The application is optimized for production with Vite, esbuild, and includes WebSocket support.

---

## Features

* Mobile-first React frontend with Tailwind CSS and shadcn/ui
* Lightweight routing using Wouter
* Express.js backend with session-based authentication
* Drizzle ORM + PostgreSQL (Neon)
* Product listing, filtering, categories, and detail pages
* Event listing with category, price, search & geolocation filters
* Favorites system tied to user sessions
* WebSocket integration
* Production-ready client + server builds

---

## Tech Stack

### Frontend

* React 18 + TypeScript
* Vite
* Tailwind CSS
* shadcn/ui + Radix UI
* TanStack Query (React Query)
* Wouter
* React Hook Form + Zod

### Backend

* Node.js + Express.js
* TypeScript
* RESTful APIs
* connect-pg-simple (PostgreSQL session storage)
* WebSocket support

### Database

* PostgreSQL (Neon)
* Drizzle ORM + Drizzle-Zod
* Schema includes:

  * Users (auth + location)
  * Events (metadata, pricing, geolocation)
  * Favorites (user-event relations)

---

## API Endpoints

* `GET /api/events` – List events with filters
* `GET /api/events/:id` – Event details
* `POST /api/favorites` – Add favorite
* `DELETE /api/favorites/:id` – Remove favorite
* `GET /api/favorites/:id/check` – Check favorite status

---

## Setup

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```
3. Add environment variables:

   * `DATABASE_URL`
   * `SESSION_SECRET`
   * `PORT` (optional)

---

## Development

Start dev server (Express + Vite HMR):

```
npm run dev
```

---

## Build

Production build:

```
npm run build
```

Starts Vite build for client and esbuild bundling for server.

---

## Production

```
npm run start
```

---

## Database

```
npm run db:push
```

Push schema changes to PostgreSQL.

---

## Project Structure

* `client/` – React frontend
* `server/` – Express backend
* `shared/` – Shared types, schemas
* `dist/` – Production output

---
