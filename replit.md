# Agentic Zine Network - Project Memory

## Overview
A sophisticated web application for converting messy conversations into structured, beautifully formatted digital publications (zines) using AI-powered analysis and neurodivergent-first design principles.

## Recent Changes (2025-09-26)

### Implemented Features
1. **Conversation Management System**
   - Upload and parse conversation logs
   - CRUD operations via REST API
   - FloatAST generation from raw conversation text
   - Conversation-FloatAST linking with `floatAstId` field

2. **OpenAI Fragment Extraction**
   - `/api/float-asts/:id/extract-fragments` endpoint
   - AI-powered semantic analysis
   - Fragment extraction with summaries and keywords
   - Command palette `/sift` integration

3. **Command Palette**
   - Modal interface with keyboard shortcuts (⌘K)
   - Three modes: commands, sift (fragment extraction), bind (thread building)
   - AI-powered operations integrated

4. **Global Context Management**
   - AppContext provider for sharing conversation/FloatAST state
   - Header displays current conversation and AST IDs
   - Context accessible via `useAppContext()` hook

5. **UI Components**
   - ConversationReader with FloatNode display
   - Dashboard with statistics
   - Full Shadcn UI component library
   - AppSidebar navigation
   - Terminal-inspired dark theme

## Architecture

### Stack
- **Frontend**: React + TypeScript, Wouter routing, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Vite middleware (same port), OpenAI integration
- **Storage**: In-memory MemStorage (implements IStorage interface, swappable for PostgreSQL)
- **Data**: Drizzle ORM schemas, Zod validation

### Key Files
- `client/src/App.tsx` - Main app with routing and AppContext provider
- `client/src/components/CommandPalette.tsx` - /sift and /bind operations
- `client/src/components/ConversationReader.tsx` - Conversation display with FloatNodes
- `client/src/pages/Conversations.tsx` - Conversation management page
- `server/routes.ts` - API endpoints
- `server/storage.ts` - IStorage interface and MemStorage implementation
- `shared/schema.ts` - Data models (Conversation, FloatAST, Thread, Zine)

### API Endpoints
```
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:id
PUT    /api/conversations/:id
DELETE /api/conversations/:id
POST   /api/conversations/:id/parse

GET    /api/float-asts
GET    /api/float-asts/:id
POST   /api/float-asts/:id/extract-fragments

GET    /api/threads
POST   /api/threads

GET    /api/zines
POST   /api/zines
```

## Design System

### Colors (HSL format in index.css)
- Primary: `260 85% 65%` (purple accent)
- Background: `222 47% 11%` (dark)
- Foreground: `213 31% 91%` (light text)
- Card: `222 47% 15%` (elevated surface)
- Muted: `217 33% 17%` (secondary backgrounds)

### Custom Tailwind Utilities
- `hover-elevate` - Subtle background elevation on hover
- `active-elevate-2` - More dramatic elevation on press
- `toggle-elevate` + `toggle-elevated` - Toggle state styling

### Typography
- Headings: `font-mono` for technical aesthetic
- Body: Default sans-serif
- Monospace for code, IDs, technical content

## User Preferences

### Design Principles
- **Neurodivergent-first**: High contrast, clear hierarchy, minimal cognitive load
- **Terminal aesthetic**: Dark theme, monospace fonts, command-driven
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Consistency**: Unified spacing, color system, interaction patterns

### Workflow
1. User uploads conversation text
2. Parse to FloatAST structure
3. Use /sift command to extract fragments with AI
4. Use /bind command to organize into threads
5. Generate formatted zine from threads

## Known Issues / TODO

### Completed Tasks
- ✅ Conversation CRUD with FloatAST parsing
- ✅ OpenAI fragment extraction integrated
- ✅ Command palette with /sift operation
- ✅ Global AppContext for state sharing
- ✅ Conversation-FloatAST linking

### In Progress
- Thread organization system
- Zine generation and rendering
- /bind command implementation

### Future Enhancements
- PostgreSQL migration (replace MemStorage)
- Advanced FloatAST visualizations
- Multi-user authentication
- Export formats (PDF, markdown, HTML)
- Collaborative editing
- Version history

## Environment

### Required Secrets
- `OPENAI_API_KEY` - For AI fragment extraction

### Scripts
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run db:generate` - Generate Drizzle migrations (future)
- `npm run db:migrate` - Run migrations (future)

## Development Notes

### Storage Pattern
```typescript
// IStorage interface makes backend swappable
export interface IStorage {
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(data: InsertConversation): Promise<Conversation>;
  // ... more methods
}

// Current: MemStorage (in-memory Map)
// Future: PostgresStorage (Drizzle + pg)
```

### Data Flow
```
User Action → React Component → TanStack Query → 
API Endpoint → Zod Validation → Storage Interface → 
MemStorage/PostgreSQL → Response → Cache Update → UI Refresh
```

### FloatAST Parsing
```typescript
// Input: "Author: message text"
// Output: FloatAST with nodes, edges, concepts
const floatAst = await parseConversationToFloatAST(content, title);
```

### AI Integration
```typescript
// OpenAI client initialized in routes.ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Used for fragment extraction with structured prompts
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "system", content: systemPrompt }, ...],
});
```

## Session Context

This project was built iteratively with focus on:
1. Clean architecture with separation of concerns
2. Type safety throughout (TypeScript + Zod)
3. Accessibility and neurodivergent-friendly design
4. Extensibility (IStorage interface, component patterns)
5. Developer experience (hot reload, LSP support, clear patterns)

The codebase follows fullstack JavaScript guidelines with Shadcn UI, Tailwind, and modern React patterns. All major features are functional and tested manually through the UI.
