# Architecture Documentation

## System Overview

The Agentic Zine Network follows a three-tier architecture with clear separation between presentation, business logic, and data persistence.

```
┌──────────────────────────────────────────────────────────┐
│                    Client Layer (React)                   │
│  - Component-based UI                                     │
│  - TanStack Query for data fetching                       │
│  - Wouter for routing                                     │
│  - Context API for global state                           │
└──────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌──────────────────────────────────────────────────────────┐
│                  Application Layer (Express)              │
│  - RESTful API endpoints                                  │
│  - Request validation (Zod)                               │
│  - OpenAI integration                                     │
│  - Business logic orchestration                           │
└──────────────────────────────────────────────────────────┘
                            ↓ IStorage
┌──────────────────────────────────────────────────────────┐
│                   Data Layer (Storage)                    │
│  - Storage interface (IStorage)                           │
│  - MemStorage (in-memory) or PostgreSQL                   │
│  - Data persistence and retrieval                         │
└──────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### Page Components
Located in `client/src/pages/`

- **Home.tsx** - Dashboard with statistics and quick actions
- **Conversations.tsx** - Conversation management and upload
- **AST.tsx** - FloatAST explorer and visualization
- **Threads.tsx** - Thread builder and management
- **Zines.tsx** - Zine editor and publishing

#### Feature Components
Located in `client/src/components/`

- **ConversationReader** - Displays parsed conversations with FloatNode annotations
- **CommandPalette** - Modal interface for /sift and /bind operations
- **ThreadBuilder** - UI for organizing fragments into threads
- **ZineEditor** - WYSIWYG editor for zine creation
- **Dashboard** - Statistics and recent activity overview
- **AppSidebar** - Navigation using Shadcn sidebar primitives

#### UI Components
Located in `client/src/components/ui/`

Shadcn UI components built on Radix primitives:
- Forms, buttons, cards, dialogs, inputs
- Accessible by default with ARIA attributes
- Themeable via CSS custom properties

### Backend Architecture

#### Route Handler Pattern

```typescript
// server/routes.ts
app.get('/api/resource', async (req, res) => {
  try {
    const data = await storage.getResource();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Storage Interface Pattern

```typescript
// server/storage.ts
export interface IStorage {
  // CRUD methods
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(data: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  // Specialized methods
  getConversations(): Promise<Conversation[]>;
  createFloatAST(id: string, data: FloatAST, userId?: string): Promise<FloatASTRecord>;
}
```

**Benefits:**
- Easy to swap implementations (MemStorage ↔ PostgreSQL)
- Testable with mock implementations
- Type-safe with TypeScript
- Single source of truth for data operations

## Data Flow

### Conversation Upload Flow

```
1. User fills form → ConversationFormData
2. Form validation → Zod schema
3. POST /api/conversations
4. Storage.createConversation()
5. Return Conversation object
6. TanStack Query cache invalidation
7. UI updates with new conversation
```

### FloatAST Parsing Flow

```
1. User clicks "Parse to FloatAST"
2. POST /api/conversations/:id/parse
3. Fetch conversation from storage
4. parseConversationToFloatAST()
   - Split into lines
   - Extract author/content
   - Create FloatNodes with semantic analysis
   - Generate edges between nodes
   - Extract concepts
5. storage.createFloatAST()
6. Update conversation.floatAstId
7. Return FloatAST record
8. UI displays parsed structure
```

### AI Fragment Extraction Flow

```
1. User opens Command Palette (⌘K)
2. Types /sift → enters query
3. POST /api/float-asts/:id/extract-fragments
   {
     query: "user query",
     maxFragments: 10
   }
4. Fetch FloatAST from storage
5. Call OpenAI API with:
   - System prompt (fragment extraction instructions)
   - User prompt (query + FloatAST context)
6. Parse AI response → Fragment[]
7. Return fragments with:
   - content (extracted text)
   - nodeIds (source references)
   - summary (AI-generated)
   - keywords (topic tags)
   - relevance (0-1 score)
8. UI displays fragments in Command Palette
9. User can proceed to /bind for threading
```

## State Management

### Global State (React Context)

```typescript
// client/src/App.tsx
interface AppContextType {
  currentConversationId?: string;
  currentFloatAstId?: string;
  setCurrentConversationId: (id: string | undefined) => void;
  setCurrentFloatAstId: (id: string | undefined) => void;
}
```

**Usage:**
- Track active conversation across pages
- Share FloatAST ID for /sift operations
- Display context in header
- Enable cross-component operations

### Server State (TanStack Query)

```typescript
// Queries - fetching data
const { data: conversations } = useQuery({
  queryKey: ['/api/conversations'],
  // Default fetcher configured in queryClient
});

// Mutations - modifying data
const createMutation = useMutation({
  mutationFn: (data) => apiRequest('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    toast({ title: "Success!" });
  },
});
```

**Cache Invalidation Strategy:**
- Invalidate lists after create/update/delete
- Use array keys for hierarchical invalidation: `['/api/conversations', id]`
- Optimistic updates for better UX

## API Design Patterns

### RESTful Conventions

- `GET /api/resources` - List all
- `GET /api/resources/:id` - Get one
- `POST /api/resources` - Create
- `PUT /api/resources/:id` - Update
- `DELETE /api/resources/:id` - Delete

### Specialized Endpoints

- `POST /api/conversations/:id/parse` - Action endpoint for parsing
- `POST /api/float-asts/:id/extract-fragments` - AI operation

### Request/Response Format

**Request Body:**
```typescript
// Always validated with Zod schemas
POST /api/conversations
{
  title: string,
  content: string,
  userId?: string
}
```

**Success Response:**
```typescript
{
  id: "uuid",
  title: "...",
  content: "...",
  createdAt: Date,
  floatAstId: null
}
```

**Error Response:**
```typescript
{
  error: "Error message"
}
```

## Security Considerations

### Input Validation
- All API inputs validated with Zod schemas
- Type-safe at compile time with TypeScript
- Runtime validation prevents invalid data

### API Key Management
- OpenAI key stored in environment variables
- Never exposed to frontend
- Server-side only usage

### CORS and Headers
- Same-origin policy (frontend/backend on same port)
- No CORS configuration needed
- Content-Type: application/json enforced

## Performance Optimizations

### Frontend

1. **Code Splitting** - Lazy load pages with Vite
2. **Query Caching** - TanStack Query caches API responses
3. **Optimistic Updates** - Instant UI feedback before server confirmation
4. **Debounced Search** - Prevent excessive API calls in Command Palette

### Backend

1. **In-Memory Storage** - Fast reads/writes for MemStorage
2. **Lazy Parsing** - FloatAST only generated on demand
3. **OpenAI Rate Limiting** - maxFragments parameter to control costs

## Deployment Architecture

### Development
```
Vite Dev Server (frontend) + Express (backend)
Single port (5000)
Hot module replacement
```

### Production
```
Express serves built Vite assets
Static file serving
Environment-based configuration
```

## Extension Points

### Adding New Storage Backend

1. Implement `IStorage` interface
2. Replace `MemStorage` instantiation
3. No changes to routes or frontend

### Adding New AI Operations

1. Add endpoint to `server/routes.ts`
2. Implement OpenAI call with custom prompt
3. Add command to Command Palette
4. Wire up mutation in frontend

### Adding New Visualizations

1. Create component in `client/src/components/`
2. Add route in `client/src/App.tsx`
3. Add sidebar link in `AppSidebar.tsx`
4. Fetch data with TanStack Query

## Error Handling Strategy

### Frontend
- Toast notifications for user-facing errors
- Error boundaries for component crashes
- Loading states for async operations

### Backend
- Try/catch blocks in all route handlers
- Consistent error response format
- Logging to console (extensible to logging service)

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Storage interface mocking
- Zod schema validation

### Integration Tests
- API endpoint testing with supertest
- End-to-end flows with Playwright
- OpenAI mock responses for testing

### Manual Testing
- Command Palette operations
- Conversation parsing edge cases
- UI accessibility with screen readers
