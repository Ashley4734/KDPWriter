# BookGen AI - Nonfiction Book Generator

## Overview

BookGen AI is a comprehensive web application for generating complete nonfiction books optimized for Amazon KDP publishing. The system provides AI-assisted book idea generation, structured outline creation, content writing, and manuscript formatting. The application follows a guided workflow from initial concept through final publication-ready output, designed specifically for productivity and professional book creation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens following Material Design principles
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Context-based theme provider supporting light/dark modes with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints under `/api` prefix with JSON communication
- **Development**: Hot reload via Vite middleware integration
- **Error Handling**: Centralized error middleware with structured error responses
- **Session Management**: Express sessions with PostgreSQL session store

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Normalized tables for users, settings, books, outlines, chapters, and book ideas
- **Migrations**: Drizzle Kit for database schema versioning
- **Connection**: Neon Database serverless PostgreSQL for production deployment

### Authentication and Authorization
- **Current State**: Demo user system with hardcoded user ID for development
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: Prepared for production authentication implementation

### Component Architecture
- **Design System**: Comprehensive UI component library with consistent styling
- **Layout System**: Sidebar-based navigation with collapsible mobile support
- **Form Handling**: React Hook Form with Zod validation schemas
- **Progress Tracking**: Multi-step workflows with visual progress indicators
- **Content Editing**: Rich text editing interfaces for outline and chapter management

### Book Generation Workflow
- **Multi-Step Process**: Idea generation → Outline creation → Review/Approval → Content writing → Export
- **AI Integration**: Prepared for OpenRouter API integration for content generation
- **Content Management**: Hierarchical outline structure with drag-and-drop editing capabilities
- **Progress Tracking**: Real-time word count tracking and completion percentage calculations

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database serverless PostgreSQL for data persistence
- **Development Platform**: Replit with integrated development environment

### AI Services
- **Content Generation**: OpenRouter API integration for accessing multiple AI models (Claude, GPT, etc.)
- **Model Selection**: Configurable AI model selection with pricing and context length awareness

### Frontend Libraries
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Hookform Resolvers for validation
- **Validation**: Zod for runtime type checking and schema validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling**: Tailwind CSS with class-variance-authority for component variants

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for type safety across the entire application
- **Database Tools**: Drizzle Kit for migrations and database management
- **Development Experience**: Replit-specific plugins for enhanced development workflow

### Production Considerations
- **Asset Optimization**: Vite build optimization for production deployment
- **Error Monitoring**: Runtime error overlay for development debugging
- **Performance**: Optimized bundle splitting and lazy loading strategies