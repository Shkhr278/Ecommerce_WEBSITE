# E-Commerce Platform for Third-Party Products

## Overview

This is a mobile-first e-commerce platform built with React and Express.js. The app allows users to browse products by categories, filter by price, view product details, manage shopping cart, and process payments through Stripe. It features a responsive design optimized for mobile devices with native-like navigation and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development
- **UI Framework**: shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mobile-First Design**: Bottom navigation pattern with responsive layouts optimized for mobile screens

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage with seeded sample data (MemStorage class)
- **Development Server**: Vite integration for hot module replacement in development

### Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions:
- **Users**: Authentication and location data
- **Events**: Event details with geolocation, pricing, and metadata
- **Favorites**: User-event relationship tracking

Key entities:
- Users with location coordinates for proximity-based searches
- Events with comprehensive metadata (title, description, category, pricing, location, dates)
- Favorites system for user event bookmarking

### Authentication & Authorization
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- User location tracking for proximity-based event discovery
- Favorite management tied to user sessions

### API Structure
RESTful endpoints following standard conventions:
- `GET /api/events` - Event listing with filtering (category, price, location, search)
- `GET /api/events/:id` - Individual event details
- `POST /api/favorites` - Add event to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `GET /api/favorites/:id/check` - Check favorite status

### Mobile Experience Features
- Geolocation integration for location-based event discovery
- Touch-optimized interface with bottom navigation
- Loading states and error handling for network requests
- Responsive design that adapts to various screen sizes

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Build Tools**: Vite with TypeScript support, ESBuild for production builds
- **Development**: TSX for TypeScript execution, Replit development plugins

### UI & Styling
- **Component Library**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS, Class Variance Authority for component variants
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Zod validation resolvers

### Data & API Management
- **HTTP Client**: Native fetch with TanStack Query for caching and state management
- **Validation**: Zod for runtime type checking and schema validation
- **ORM**: Drizzle ORM with Drizzle-Zod integration
- **Date Handling**: date-fns for date manipulation and formatting

### Database & Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Development**: In-memory storage with sample data seeding

### Utility Libraries
- **Class Management**: clsx and tailwind-merge for conditional CSS classes
- **Command Interface**: cmdk for search and command functionality
- **Carousel**: Embla Carousel React for image/content sliding

### Development & Testing
- **TypeScript**: Full type safety across frontend and backend
- **Path Mapping**: Configured aliases for clean imports (@/, @shared/, @assets/)
- **Hot Reload**: Vite HMR with Express middleware integration