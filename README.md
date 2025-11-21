# **Full-Stack E-Commerce + Event Platform**

### *React + Express + Drizzle + PostgreSQL*

A modern, mobile-first full-stack application combining **e-commerce**, **events**, **user favorites**, and **session-based authentication**.
Built with **React (Vite)** on the frontend and **Express.js + Drizzle ORM** on the backend.

---

## **✨ Features**

* Mobile-optimized custom UI with **Tailwind CSS** & **shadcn/ui**
* Client routing using **Wouter**
* **Session-based authentication** with PostgreSQL store
* Complete **E-Commerce Module**
  – Products, filtering, search, categories, cart, favorites
* Complete **Event Module**
  – Event listings, search, categories, pricing, geolocation filters
* **Favorites system** synced with session
* **WebSocket** enabled backend
* Optimized builds (Vite + esbuild)
* Shared schema via **Drizzle + Zod**
* Clean folder structure with strict aliasing

---

## **🧱 Tech Stack Overview**

### **Frontend**

* React 18
* Vite
* Tailwind CSS
* shadcn/ui + Radix UI primitives
* TanStack Query (React Query)
* Wouter
* React Hook Form + Zod
* TypeScript

### **Backend**

* Node.js + Express.js
* TypeScript
* REST APIs
* WebSocket server
* connect-pg-simple (session store)

### **Database**

* PostgreSQL (Neon recommended)
* Drizzle ORM
* Drizzle-Zod validation
* Shared schema between client/server

---

## **📡 API Endpoints**

### **Events**

* `GET /api/events` – list events with filters
* `GET /api/events/:id` – single event details

### **Favorites**

* `POST /api/favorites` – add to favorites
* `DELETE /api/favorites/:id` – remove
* `GET /api/favorites/:id/check` – check favorite status

### **Products**

* `GET /api/products` – list products
* `GET /api/products/:id` – product details
* `POST /api/cart` – add to cart
* `PUT /api/cart/:id` – update quantity
* `DELETE /api/cart/:id` – remove

---

## **⚙️ Setup**

### **1. Install dependencies**

```
npm install
```

### **2. Add environment variables**

* `DATABASE_URL`
* `SESSION_SECRET`
* `PORT` (optional)

---

## **🧑‍💻 Development**

Start full dev environment (Express + Vite HMR):

```
npm run dev
```

---

## **📦 Build**

Production build:

```
npm run build
```

This generates:

* `/dist/public` – built React app
* `/dist/server` – bundled Express server

---

## **🚀 Production**

```
npm start
```

Starts the compiled Express server + serves built client.

---

## **🗄️ Database Commands**

Push schema updates:

```
npm run db:push
```

---

## **📁 Project Structure**

```
client/   – React frontend
server/   – Express backend
shared/   – Shared types + Drizzle schema
dist/     – Production output
```

---