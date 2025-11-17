# Agentic Zine Network

A sophisticated web application for converting messy conversations into structured, beautifully formatted digital publications (zines) using AI-powered analysis and neurodivergent-first design principles.

![Terminal-inspired dark interface with purple accents]

## Overview

The Agentic Zine Network transforms unstructured conversation logs into publishable content through:

1. **FloatAST Parsing** - Converts conversations into structured Abstract Syntax Trees
2. **AI Fragment Extraction** - Uses OpenAI to identify meaningful insights and patterns
3. **Thread Organization** - Groups related fragments into coherent narrative threads
4. **Zine Generation** - Renders formatted HTML publications with professional styling

Built with accessibility and cognitive ease in mind, the interface features a terminal-inspired dark theme optimized for neurodivergent users.

## Features

### Core Capabilities

- **Conversation Management** - Upload, parse, and analyze conversation logs
- **FloatAST Explorer** - Navigate conversation structure with nodes, edges, and concepts
- **Command Palette** - Terminal-style interface with powerful operations:
  - `/sift` - AI-powered fragment extraction
  - `/bind` - Cluster fragments into threads
  - `/render` - Generate zines from threads
  - `/ast` - View FloatAST structure
- **Thread Builder** - Organize extracted fragments into thematic collections
- **Zine Editor** - Create and publish formatted digital zines
- **Real-time Analysis** - Semantic intent, emotional tone, and certainty scoring

### Design Philosophy

**Neurodivergent-First Principles:**
- High contrast terminal aesthetic
- Monospace fonts for technical clarity
- Minimal cognitive load through clear hierarchy
- Reduced animation and sensory overwhelm
- Consistent, predictable interactions

## Technology Stack

### Frontend
- React with TypeScript
- Wouter (lightweight routing)
- TanStack Query v5 (data fetching/caching)
- Shadcn UI + Radix UI (accessible components)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React Hook Form + Zod (forms/validation)

### Backend
- Express.js server
- Vite (development + bundling)
- OpenAI API (AI analysis)
- Drizzle ORM (type-safe schemas)
- In-memory storage (MemStorage, swappable for PostgreSQL)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add to Replit Secrets or .env file
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open `http://localhost:5000` in your browser

## Usage

### Upload a Conversation

1. Navigate to **Conversations** page
2. Click **Import Conversation**
3. Paste conversation content (format: `Author: message text`)
4. Click **Parse to FloatAST** to analyze

### Extract Fragments with AI

1. Open Command Palette (`⌘K` or `Ctrl+K`)
2. Type `/sift` and press Enter
3. Enter a query (e.g., "key insights about collaboration")
4. Review extracted fragments with AI-generated summaries

### Build Threads

1. After extracting fragments, use `/bind` command
2. Organize fragments into thematic threads
3. Add titles and descriptions

### Generate Zines

1. Navigate to **Zines** page
2. Select threads to include
3. Customize layout and styling
4. Preview and publish

## Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── ConversationReader.tsx
│   │   │   ├── ThreadBuilder.tsx
│   │   │   ├── ZineEditor.tsx
│   │   │   └── ui/          # Shadcn components
│   │   ├── pages/           # Route pages
│   │   ├── lib/             # Utilities
│   │   └── App.tsx          # Main app + routing
│   └── index.html
├── server/                  # Backend Express server
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Storage interface
│   └── index.ts             # Server setup
├── shared/                  # Shared types
│   └── schema.ts            # Data models + validation
└── design_guidelines.md     # UI/UX specifications
```

## API Endpoints

```
GET    /api/conversations              # List all conversations
POST   /api/conversations              # Create conversation
GET    /api/conversations/:id          # Get conversation
PUT    /api/conversations/:id          # Update conversation
DELETE /api/conversations/:id          # Delete conversation
POST   /api/conversations/:id/parse    # Parse to FloatAST

GET    /api/float-asts                 # List FloatASTs
GET    /api/float-asts/:id             # Get FloatAST
POST   /api/float-asts/:id/extract-fragments  # AI extraction

GET    /api/threads                    # List threads
POST   /api/threads                    # Create thread

GET    /api/zines                      # List zines
POST   /api/zines                      # Create zine
```

## Data Models

### Conversation
```typescript
{
  id: string
  title: string
  content: string
  floatAstId: string
  createdAt: Date
}
```

### FloatAST
```typescript
{
  id: string
  version: "1.0"
  type: "conversation" | "artifact" | "bridge" | "dispatch"
  nodes: FloatNode[]
  edges: FloatEdge[]
  concepts: Record<string, Concept>
  patterns: PatternStats
  metadata: { source, personas, tags, ... }
  temporal: { created, modified, ... }
}
```

### FloatNode
```typescript
{
  id: string
  type: "message" | "artifact" | "annotation"
  content: { raw, processed, structured }
  semantic: { intent, emotional_tone, certainty }
  float_markers: { highlight, bridge, dispatch, eureka, decision }
  position: { index, depth, parent }
}
```

## Configuration

### Theme Customization

Edit `client/src/index.css` to customize colors:

```css
:root {
  --primary: 260 85% 65%;        /* Purple accent */
  --background: 222 47% 11%;     /* Dark background */
  --foreground: 213 31% 91%;     /* Light text */
}
```

### Storage Backend

To switch from in-memory to PostgreSQL:

1. Update `server/storage.ts` to implement PostgreSQL
2. Use Drizzle migrations: `npm run db:generate && npm run db:migrate`
3. Update `IStorage` interface methods

## Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow and guidelines.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture.

## FloatAST Specification

See [FLOATAST.md](./FLOATAST.md) for complete FloatAST data model documentation.

## License

MIT

## Acknowledgments

Built with neurodivergent-first design principles, inspired by the need for tools that transform scattered conversations into coherent knowledge artifacts.
