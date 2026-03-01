# BrainMate AI - Educational Technology Platform

## Overview

BrainMate AI is a modern educational technology platform that enables educators to create intelligent AI tutors from their educational content. The platform features a full-stack architecture with React frontend, Express backend, and PostgreSQL database, deployed on Replit with integrated authentication and payment processing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Shadcn/UI component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express-session with PostgreSQL store
- **File Processing**: Multer for file uploads with multiple format support

### Database Architecture
- **Primary Database**: PostgreSQL 16 (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions with 1-week TTL
- **User Management**: Role-based access (educator, student, admin)
- **Authorization**: JWT-based authentication with middleware protection

### AI Tutor System
- **Content Processing**: Multi-format file support (PDF, DOCX, TXT, YouTube)
- **AI Integration**: Groq API for fast inference with Llama models
- **Tutor Creation**: Dynamic AI tutor generation from uploaded content
- **Chat Interface**: Real-time conversational AI with voice support

### Payment Integration
- **Provider**: Razorpay for Indian market
- **Subscription Tiers**: Free, Pro, Premium with feature gating
- **Customer Management**: Integrated customer and subscription tracking

### Analytics System
- **Engagement Tracking**: Session-based analytics with user behavior
- **Performance Metrics**: Chat analytics, content engagement, user retention
- **Real-time Features**: Live analytics dashboard with charts

### File Management
- **Upload Processing**: Multi-format content extraction and analysis
- **Content Storage**: File-based storage with metadata tracking
- **Format Support**: PDF parsing, document processing, YouTube integration

## Data Flow

### User Registration Flow
1. User authenticates via Replit Auth OIDC
2. User data stored in PostgreSQL users table
3. Session created with express-session
4. Role-based dashboard access granted

### Tutor Creation Flow
1. Educator uploads content files via form
2. Files processed and content extracted
3. AI tutor created with content knowledge base
4. Tutor metadata stored in database
5. Real-time chat interface generated

### Chat Interaction Flow
1. Student accesses tutor via public link
2. Chat session created with unique token
3. Messages processed through Groq AI
4. Responses generated with context awareness
5. Analytics tracked for engagement metrics

### Payment Processing Flow
1. User selects subscription plan
2. Razorpay checkout initiated
3. Payment verification and webhook processing
4. Subscription status updated in database
5. Feature access granted based on tier

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Groq API**: Fast AI inference for chat responses
- **Razorpay**: Payment processing for Indian market
- **Replit Auth**: Authentication and user management

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Drizzle Kit**: Database schema management
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Utility-first styling framework

### Third-party Libraries
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Port Configuration**: 5000 internal, 80 external
- **Hot Reload**: Vite HMR with backend auto-restart

### Production Build
- **Frontend**: Vite production build to dist/public
- **Backend**: ESBuild bundle for Node.js
- **Deployment**: Replit autoscale with optimized builds
- **Environment**: Production NODE_ENV with appropriate configs

### Database Management
- **Migrations**: Drizzle Kit schema management
- **Connection**: Neon serverless with connection pooling
- **Schema**: Shared schema definitions between frontend/backend

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 30, 2025. Removed voice chat feature completely - deleted VoiceChatPage, VoiceAssistant, VoiceAvatar components and related routes
- July 30, 2025. Updated tutor cards to show single "Start Chat" button instead of separate text/voice chat options
- July 25, 2025. Implemented complete Ezoic dynamic content system with infinite scroll, page routing, and ad lifecycle management
- July 25, 2025. Added EzoicDynamicAd, EzoicInfiniteScroll, and EzoicPageRouter components for SPA functionality
- July 25, 2025. Enhanced documentation with dynamic content patterns, infinite scroll examples, and cleanup procedures
- July 25, 2025. Completed full Ezoic integration with showAds functionality and placement management
- July 25, 2025. Created comprehensive ad management system with EzoicAd, EzoicMultiAd, and AdManager components
- July 25, 2025. Added EZOIC_INTEGRATION.md documentation with setup instructions and usage examples
- July 25, 2025. Updated domain configuration to brainmate.online across all meta tags and ads.txt
- July 25, 2025. Added Ezoic advertising network integration with privacy compliance scripts and ads.txt setup
- July 25, 2025. Created EzoicAd component for proper ad placement and management
- July 25, 2025. Cleaned up advertising scripts - removed all ad networks except Monetag and AdSense
- July 25, 2025. Replaced obfuscated service worker with clean, minimal caching functionality
- July 25, 2025. Removed Google Analytics, Cloudflare Analytics, ProfitableRateCPM, and groleegni.net scripts
- July 25, 2025. Added Google Analytics (G-PLBJLYCJVQ) tracking for comprehensive user engagement analytics
- July 25, 2025. Fixed AdSense policy violations by replacing ad placements with substantial educational content
- July 25, 2025. Enhanced landing page with detailed AI tutoring technology explanations and features
- July 25, 2025. Added special service worker file (sw.js) for enhanced analytics and ad compliance
- July 25, 2025. Integrated Monetag verification meta tag and loading script for additional monetization capabilities
- July 25, 2025. Added ProfitableRateCPM ad network integration for expanded revenue streams
- June 26, 2025. Initial setup