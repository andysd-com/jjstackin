# StackRunner - Gig Planning and Route Optimization Platform

## Overview

StackRunner is a unified gig and secret-shop planner designed to maximize earnings per hour for field workers. The application allows users to intake tasks from various platforms (Instacart, DoorDash, Uber, Field Agent, etc.), visualize them on a map, optimize routes, and track earnings. Built as a full-stack web application with React frontend and Express backend, it emphasizes premium UX design and accessibility while maintaining radical simplicity for quick task management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack Query for server state management with optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules for modern development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Development**: Hot-reload setup with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **ORM**: Drizzle with code-first schema definitions in TypeScript
- **Schema Structure**: 
  - Users table for authentication and preferences
  - Jobs table for gig/task data with platform integration
  - Routes table for optimized delivery sequences
  - Earnings table for financial tracking and analytics
- **Development Storage**: In-memory storage implementation for rapid prototyping

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with secure cookie storage
- **Development Mode**: Mock user system for rapid development
- **Future Production**: Designed for easy integration with OAuth providers

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Development Platform**: Replit integration with specialized vite plugins
- **Package Management**: npm with lockfile for dependency consistency

### Frontend Libraries
- **UI Components**: Comprehensive Radix UI primitive collection for accessibility
- **State Management**: TanStack Query for server synchronization
- **Styling**: Tailwind CSS with PostCSS for optimal CSS processing
- **Development**: Vite with React plugin and runtime error overlay

### Backend Services
- **Database Driver**: @neondatabase/serverless with WebSocket support
- **ORM**: Drizzle with PostgreSQL dialect and migration support
- **Build Tools**: esbuild for production bundling with external package handling

### Planned Integrations
- **Mapping Services**: Google Maps API or similar for route optimization
- **Platform APIs**: Integration endpoints for major gig platforms
- **Payment Tracking**: Automated earnings reconciliation with platform payouts
- **Geolocation Services**: Real-time location tracking for route execution