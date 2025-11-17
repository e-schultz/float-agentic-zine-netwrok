# Agentic Zine Network - Recreation Prompt

Use this prompt to recreate the Agentic Zine Network from scratch:

---

## Project Brief

Build an **Agentic Zine Network** - a sophisticated web application for converting messy conversations into structured, beautifully formatted digital publications (zines) using AI-powered analysis.

## Core Concept

Transform unstructured conversation logs into publishable content through:
1. FloatAST parsing (conversation → structured Abstract Syntax Tree)
2. AI fragment extraction (OpenAI-powered semantic analysis)
3. Thread organization (group related fragments)
4. Zine generation (formatted HTML publications)

## Technical Requirements

### Stack
- **Frontend**: React + TypeScript, Wouter routing, TanStack Query v5, Shadcn UI, Tailwind CSS
- **Backend**: Express.js + Vite (same port 5000), OpenAI API integration
- **Storage**: In-memory MemStorage with IStorage interface (easily swappable for PostgreSQL)
- **Validation**: Zod schemas, Drizzle ORM for type-safe data models

### Design System
- **Theme**: Terminal-inspired dark UI
- **Colors**: Purple primary (HSL: 260 85% 65%), dark background (222 47% 11%)
- **Typography**: Monospace fonts for technical elements
- **Principles**: Neurodivergent-first design - high contrast, clear hierarchy, minimal cognitive load
- **Components**: Use Shadcn UI library throughout

### Data Models

**Conversation**
```typescript
{
  id: string
  title: string
  content: string
  floatAstId: string | null  // Links to parsed FloatAST
  createdAt: Date
}
```

**FloatAST** (Abstract Syntax Tree)
```typescript
{
  id: string
  version: "1.0"
  type: "conversation" | "artifact" | "bridge" | "dispatch"
  nodes: FloatNode[]        // Messages with semantic analysis
  edges: FloatEdge[]        // Relationships between nodes
  concepts: Record<string, Concept>  // Extracted themes
  patterns: PatternStats    // Conversation analytics
  metadata: { source, personas, tags, ... }
  temporal: { created, modified, ... }
}
```

**FloatNode**
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

**FloatEdge**
```typescript
{
  id: string
  type: "responds_to" | "elaborates" | "contradicts" | "bridges" | ...
  source: string  // Node ID
  target: string  // Node ID
  weight: number  // 0.0 - 1.0
}
```

**Thread**
```typescript
{
  id: string
  title: string
  description: string
  fragments: Fragment[]
  floatAstId: string
}
```

**Zine**
```typescript
{
  id: string
  title: string
  content: string  // HTML
  status: "draft" | "published" | "archived"
  floatAstId: string
  publishedAt: Date | null
}
```

## Core Features to Implement

### 1. Conversation Management
- Upload conversation text (format: `Author: message text`)
- Parse into FloatAST structure with nodes and edges
- CRUD operations via REST API
- Display parsed conversations with semantic annotations

**API Endpoints:**
```
POST   /api/conversations
GET    /api/conversations
GET    /api/conversations/:id
PUT    /api/conversations/:id
DELETE /api/conversations/:id
POST   /api/conversations/:id/parse  // Generate FloatAST
```

### 2. FloatAST Parsing Logic
```typescript
function parseConversationToFloatAST(content: string, title: string): FloatAST {
  // 1. Split by lines, extract "Author: text" format
  // 2. Create FloatNode for each message with:
  //    - Unique ID
  //    - Sequential position.index
  //    - Role (human/assistant based on author)
  // 3. Generate edges (responds_to for sequential messages)
  // 4. Extract concepts (AI-powered or keyword-based)
  // 5. Calculate pattern stats
  // 6. Return complete FloatAST structure
}
```

### 3. AI Fragment Extraction
- Integrate OpenAI API for semantic analysis
- Extract meaningful fragments from FloatAST based on user query
- Return fragments with summaries, keywords, and relevance scores

**API Endpoint:**
```
POST /api/float-asts/:id/extract-fragments
Body: { query: string, maxFragments: number }
Response: { fragments: Fragment[] }
```

**Fragment Structure:**
```typescript
{
  content: string      // Extracted text
  nodeIds: string[]    // Source FloatNode IDs
  summary: string      // AI-generated summary
  keywords: string[]   // Topic tags
  relevance: number    // 0.0 - 1.0 score
}
```

### 4. Command Palette
Terminal-style modal interface with keyboard shortcuts (⌘K):

**Commands:**
- `/sift` - Extract fragments from conversation using AI query
- `/bind` - Organize fragments into threads
- `/render` - Generate zine from threads
- `/ast` - View FloatAST structure

**Implementation:**
- Three modes: commands list, sift mode, bind mode
- Keyboard navigation (arrow keys, enter)
- Real-time search filtering
- Mutation-based operations with toast notifications

### 5. Thread Builder
- Display extracted fragments in organized view
- Drag-and-drop to reorder
- Group fragments into thematic threads
- Add titles and descriptions

### 6. Zine Editor
- Convert threads into formatted HTML
- Preview with terminal-inspired styling
- Publish and share capabilities
- Export options (HTML, PDF future)

## UI Pages

1. **Home** (Dashboard) - Statistics, recent activity, quick actions
2. **Conversations** - Upload, list, view, parse conversations
3. **AST** - Visualize FloatAST structure (nodes, edges, concepts)
4. **Threads** - Build and manage threads from fragments
5. **Zines** - Create, edit, publish zines

## Architecture Pattern

```
Frontend (React)
  ↓ TanStack Query
API Routes (Express)
  ↓ Zod Validation
Storage Interface (IStorage)
  ↓
MemStorage (Map-based) OR PostgreSQL (Drizzle ORM)
```

**Benefits:**
- Swappable storage backend
- Type-safe data flow
- Testable with mocks
- Clear separation of concerns

## Design Guidelines

### Color System (in `index.css`)
```css
:root {
  --primary: 260 85% 65%;       /* Purple */
  --background: 222 47% 11%;    /* Dark */
  --foreground: 213 31% 91%;    /* Light text */
  --card: 222 47% 15%;          /* Elevated */
  --muted: 217 33% 17%;         /* Secondary */
}
```

### Custom Tailwind Utilities
```css
.hover-elevate { /* Subtle hover background lift */ }
.active-elevate-2 { /* Press-down elevation */ }
.toggle-elevate { /* Toggleable element base */ }
.toggle-elevated { /* Active toggle state */ }
```

### Component Patterns
- Use Shadcn UI for all base components (Button, Card, Dialog, etc.)
- Monospace fonts for technical elements: `className="font-mono"`
- High contrast color choices for accessibility
- Minimal animations (neurodivergent-friendly)
- Clear visual hierarchy with spacing

### Routing with Wouter
```typescript
import { Route, Switch } from "wouter";

<Switch>
  <Route path="/" component={Home} />
  <Route path="/conversations" component={Conversations} />
  <Route path="/threads" component={Threads} />
  <Route path="/zines" component={Zines} />
  <Route path="/ast" component={AST} />
</Switch>
```

### Data Fetching with TanStack Query
```typescript
// Queries (GET)
const { data } = useQuery({
  queryKey: ['/api/conversations'],
});

// Mutations (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
  },
});
```

## Implementation Order

1. **Setup** - Project structure, Vite + Express, Tailwind + Shadcn
2. **Data Models** - Define schemas in `shared/schema.ts` with Drizzle + Zod
3. **Storage Interface** - Create IStorage interface and MemStorage implementation
4. **Conversation CRUD** - API routes + frontend pages for conversation management
5. **FloatAST Parsing** - Implement parser and `/parse` endpoint
6. **OpenAI Integration** - Fragment extraction endpoint
7. **Command Palette** - Build terminal-style UI with /sift and /bind
8. **Thread System** - Thread CRUD and organization UI
9. **Zine Generation** - Render threads as formatted HTML
10. **Polish** - Accessibility, loading states, error handling

## Key Developer Notes

- **Never modify** `vite.config.ts` or `server/vite.ts` (already configured)
- **Always use** Shadcn UI components instead of custom styling
- **Follow** fullstack JavaScript guidelines (see development_guidelines.md)
- **Use** TanStack Query for all API calls (no manual fetch in components)
- **Validate** all API inputs with Zod schemas
- **Add** `data-testid` attributes to all interactive elements

## Testing Workflow

1. Upload conversation: "Alice: Hello\nBob: Hi there\nAlice: How are you?"
2. Click "Parse to FloatAST"
3. Open Command Palette (⌘K)
4. Type `/sift`, enter query: "greeting patterns"
5. Review extracted fragments
6. Click "/bind" to organize into thread
7. Navigate to Zines, create publication
8. Preview and publish

## Success Criteria

- [ ] Can upload and parse conversations
- [ ] FloatAST structure visible in AST page
- [ ] /sift command extracts fragments with AI
- [ ] /bind command creates threads
- [ ] Zines render with proper formatting
- [ ] Terminal aesthetic consistent throughout
- [ ] High accessibility scores
- [ ] Keyboard navigation works everywhere
- [ ] All CRUD operations functional
- [ ] Error states handled gracefully

---

This prompt captures the complete system architecture, data models, and implementation approach for recreating the Agentic Zine Network from scratch.
