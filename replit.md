# Overview

This is a full-stack web application that provides a proxy server service with a modern React frontend. The application allows users to browse websites through a proxy server, providing features like connection logging, SSL verification, and configurable proxy settings. The frontend offers a clean interface with quick access to popular sites, real-time connection monitoring, and comprehensive proxy management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with **React** and **TypeScript**, using modern development practices:

- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side is built with **Express.js** and **TypeScript**:

- **API Structure**: RESTful endpoints for proxy connections, settings management, and connection testing
- **Proxy Implementation**: Custom HTTP/HTTPS proxy server with CONNECT method support for secure tunneling
- **Request Logging**: Comprehensive logging of API requests and proxy connections with response times
- **Error Handling**: Centralized error handling middleware for consistent error responses

## Data Storage Solutions
The application uses a flexible storage abstraction with multiple implementation options:

- **Database Schema**: PostgreSQL schema defined with Drizzle ORM for proxy connections and settings
- **In-Memory Storage**: Alternative MemStorage implementation for development or lightweight deployments
- **Schema Validation**: Zod schemas for runtime type validation of database operations

## Authentication and Authorization
Currently, the application does not implement user authentication, operating as a single-user proxy service. The architecture supports future authentication integration through middleware.

## Component Architecture
The frontend follows a modular component structure:

- **UI Components**: Reusable UI primitives in `components/ui/`
- **Feature Components**: Domain-specific components for proxy functionality
- **Page Components**: Route-level components for different application views
- **Shared Types**: TypeScript interfaces shared between client and server

## Configuration Management
The application uses environment-based configuration:

- **Database Configuration**: Drizzle configuration for PostgreSQL connections
- **Proxy Settings**: Configurable timeout, SSL verification, and connection limits
- **Development Tools**: Integrated development server with hot reloading and error overlays

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **express**: Web application framework for the backend API server
- **react**: Frontend UI library with hooks and modern patterns
- **vite**: Build tool and development server for the frontend application

## UI and Styling Dependencies
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating type-safe CSS class variants
- **lucide-react**: Icon library providing consistent iconography

## State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching, synchronization, and error handling
- **react-hook-form**: Form state management with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

## Development and Build Tools
- **typescript**: Static type checking for both frontend and backend
- **drizzle-kit**: CLI tools for database schema management and migrations
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment
- **esbuild**: Fast JavaScript bundler for production builds

## Validation and Utilities
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities
- **wouter**: Lightweight client-side routing
- **clsx**: Conditional CSS class name utility