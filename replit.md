# StreamBot Discord Notification System

## Overview

StreamBot is a Discord notification system that monitors Twitch and YouTube streamers and sends notifications to Discord channels when they go live. The application features a modern web dashboard for managing streamers, configurations, and monitoring system activity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **External APIs**: Discord.js, Twitch API, YouTube API
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **Scheduling**: node-cron for periodic stream monitoring

### Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   ├── lib/         # Utilities and query client
│   │   └── hooks/       # Custom React hooks
├── server/          # Express backend
│   ├── services/    # External API integrations
│   ├── routes.ts    # API endpoints
│   ├── storage.ts   # Database abstraction
│   └── vite.ts      # Development server setup
├── shared/          # Shared types and schemas
└── migrations/      # Database migrations
```

## Key Components

### Database Schema
- **streamers**: Stores streamer information (username, platform, live status, viewer count, etc.)
- **discord_messages**: Tracks sent Discord notifications for cleanup
- **configuration**: System settings (API keys, Discord config, check intervals)
- **activity_logs**: System activity and error logging

### Core Services
- **Discord Service**: Manages Discord bot connection and notification sending
- **Twitch Service**: Handles Twitch API authentication and stream status checking
- **YouTube Service**: Manages YouTube API integration for live stream detection
- **Monitoring Service**: Orchestrates periodic stream checks using cron jobs

### API Endpoints
- `/api/stats` - Dashboard statistics
- `/api/streamers` - CRUD operations for streamers
- `/api/configuration` - System configuration management
- `/api/logs` - Activity log retrieval and management

### Frontend Pages
- **Dashboard**: Overview with statistics and quick actions
- **Streamers**: Manage tracked streamers
- **Configuration**: API keys and system settings
- **Notifications**: View active Discord notifications
- **Logs**: System activity and error logs

## Data Flow

1. **Stream Monitoring**: Cron job periodically checks all tracked streamers
2. **API Calls**: Services query Twitch/YouTube APIs for live status
3. **Status Updates**: Database updated with current stream information
4. **Notifications**: Discord messages sent for newly live streamers
5. **Message Tracking**: Discord message IDs stored for potential cleanup
6. **Activity Logging**: All actions logged to activity_logs table

## External Dependencies

### Required API Keys
- **Discord Bot Token**: For sending notifications
- **Twitch Client ID/Secret**: For Twitch API access
- **YouTube API Key**: For YouTube live stream detection

### Key Libraries
- **Discord.js**: Discord bot functionality
- **Drizzle ORM**: Type-safe database queries
- **Zod**: Runtime type validation
- **TanStack Query**: Server state management
- **shadcn/ui**: Pre-built UI components
- **Tailwind CSS**: Utility-first styling

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for TypeScript execution
- Concurrent frontend/backend development

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Single Node.js process serves both frontend and API

### Database Management
- Drizzle migrations in `migrations/` directory
- `db:push` command for schema synchronization
- PostgreSQL connection via DATABASE_URL environment variable

### Environment Setup
- PostgreSQL database (configured via DATABASE_URL)
- Discord bot token and channel configuration
- Twitch and YouTube API credentials
- Configurable check intervals (minimum 30 seconds)

The system is designed to be self-contained with minimal external dependencies, using a monorepo structure that shares types between frontend and backend for type safety.