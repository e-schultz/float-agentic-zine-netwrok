# Development Guide

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key
- Text editor (VS Code recommended)

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd agentic-zine-network
npm install
```

2. **Environment Configuration**
```bash
# Add to Replit Secrets or create .env file
OPENAI_API_KEY=sk-...your-key-here
```

3. **Start Development Server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Project Structure

```
agentic-zine-network/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── ConversationReader.tsx
│   │   │   ├── ThreadBuilder.tsx
│   │   │   └── ZineEditor.tsx
│   │   ├── pages/            # Route pages
│   │   ├── lib/              # Utilities
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   └── index.html
├── server/                   # Backend application
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Storage interface
│   ├── index.ts             # Express server
│   └── vite.ts              # Vite middleware
├── shared/                  # Shared code
│   └── schema.ts           # Data models + Zod schemas
├── design_guidelines.md    # UI/UX design system
└── package.json
```

## Development Workflow

### Adding a New Feature

1. **Update Data Model** (`shared/schema.ts`)
```typescript
export const newTable = pgTable("new_table", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertNewSchema = createInsertSchema(newTable);
export type NewItem = typeof newTable.$inferSelect;
```

2. **Update Storage Interface** (`server/storage.ts`)
```typescript
export interface IStorage {
  // Add CRUD methods
  getNewItem(id: string): Promise<NewItem | undefined>;
  createNewItem(data: InsertNew): Promise<NewItem>;
}

export class MemStorage implements IStorage {
  private newItems: Map<string, NewItem> = new Map();
  
  async getNewItem(id: string) {
    return this.newItems.get(id);
  }
  
  async createNewItem(data: InsertNew) {
    const id = randomUUID();
    const item: NewItem = { ...data, id };
    this.newItems.set(id, item);
    return item;
  }
}
```

3. **Add API Routes** (`server/routes.ts`)
```typescript
app.get("/api/new-items", async (req, res) => {
  try {
    const items = await storage.getAllNewItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/new-items", async (req, res) => {
  try {
    const data = insertNewSchema.parse(req.body);
    const item = await storage.createNewItem(data);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

4. **Create Frontend Component** (`client/src/components/NewFeature.tsx`)
```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function NewFeature() {
  const { data: items } = useQuery({
    queryKey: ["/api/new-items"],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: InsertNew) => {
      const response = await fetch("/api/new-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/new-items"] });
    },
  });
  
  return <div>...</div>;
}
```

5. **Add Route** (`client/src/App.tsx`)
```typescript
import NewFeature from "@/pages/NewFeature";

<Route path="/new-feature" component={NewFeature} />
```

6. **Add Sidebar Link** (`client/src/components/AppSidebar.tsx`)
```typescript
const items = [
  // ...existing items
  {
    title: "New Feature",
    url: "/new-feature",
    icon: IconName,
  },
];
```

### Code Style Guidelines

#### TypeScript
- Use TypeScript for all files
- Prefer interfaces over types for objects
- Use type inference where possible
- Avoid `any` - use `unknown` if needed

#### React
- Functional components only
- Use hooks (useState, useEffect, etc.)
- Destructure props
- Add data-testid to interactive elements

#### Naming Conventions
```typescript
// Components: PascalCase
export function CommandPalette() {}

// Functions: camelCase
async function parseConversation() {}

// Constants: UPPER_SNAKE_CASE
const MAX_FRAGMENTS = 10;

// Types/Interfaces: PascalCase
interface FloatNode {}
type ConversationId = string;
```

#### File Organization
```typescript
// 1. Imports (external, then internal)
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface Props {
  id: string;
}

// 3. Constants
const DEFAULT_LIMIT = 10;

// 4. Component
export function Component({ id }: Props) {
  // ...
}
```

### Styling Guidelines

#### Tailwind Classes Order
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Display (hidden, inline)
4. Spacing (p-, m-, gap-)
5. Sizing (w-, h-)
6. Typography (text-, font-)
7. Colors (bg-, text-, border-)
8. Effects (shadow-, opacity-)
9. Interactions (hover:, active:)

```tsx
<div className="flex flex-col gap-4 p-6 bg-card border rounded-md hover-elevate">
```

#### Custom Interactions
```tsx
// Use custom elevation utilities
<Button className="hover-elevate active-elevate-2">
  Click me
</Button>

// For toggle states
<Button className="toggle-elevate toggle-elevated">
  Active
</Button>
```

#### Dark Mode
```tsx
// Explicit dark variants when needed
<div className="bg-white dark:bg-black text-black dark:text-white">
```

## Testing

### Manual Testing Checklist

**Conversation Upload:**
- [ ] Upload valid conversation
- [ ] Upload malformed content
- [ ] Parse to FloatAST
- [ ] View parsed nodes
- [ ] Check FloatAST linked to conversation

**/sift Command:**
- [ ] Open command palette (⌘K)
- [ ] Type /sift
- [ ] Enter query
- [ ] Verify AI extraction
- [ ] Check fragment display

**/bind Command:**
- [ ] Extract fragments first
- [ ] Use /bind command
- [ ] Create thread
- [ ] Verify fragments organized

**Zine Generation:**
- [ ] Create thread
- [ ] Generate zine
- [ ] Preview formatting
- [ ] Publish zine

### Debugging

#### Frontend Issues

```typescript
// Add console logs
console.log("Data:", data);

// React DevTools
// Install browser extension to inspect component tree

// Network tab
// Check API requests/responses in browser DevTools
```

#### Backend Issues

```typescript
// Server logs
console.log("Request body:", req.body);
console.error("Error:", error);

// Check workflow logs in Replit
```

#### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Module not found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**TypeScript errors:**
```bash
# Check types
npx tsc --noEmit
```

## OpenAI Integration

### Testing Without API Key

Use mock responses for development:

```typescript
// server/routes.ts
const MOCK_MODE = !process.env.OPENAI_API_KEY;

if (MOCK_MODE) {
  return res.json({
    fragments: [
      {
        content: "Mock fragment",
        nodeIds: ["node1"],
        summary: "Mock summary",
        keywords: ["test"],
        relevance: 0.8,
      },
    ],
  });
}
```

### Rate Limiting

```typescript
// Limit fragments to control costs
const maxFragments = Math.min(req.body.maxFragments || 10, 20);
```

### Prompt Engineering

```typescript
const systemPrompt = `You are a conversation analyst.
Extract meaningful fragments that match the user's query.
Focus on insights, not trivial statements.
Return JSON only.`;

const userPrompt = `Query: "${query}"

Conversation nodes:
${nodes.map(n => `[${n.id}] ${n.content.raw}`).join('\n')}

Extract up to ${maxFragments} relevant fragments.`;
```

## Database Migration (Future)

### Switching to PostgreSQL

1. **Install Drizzle Kit**
```bash
npm install -D drizzle-kit
```

2. **Configure** (`drizzle.config.ts`)
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
```

3. **Generate Migration**
```bash
npm run db:generate
```

4. **Run Migration**
```bash
npm run db:migrate
```

5. **Update Storage Implementation**
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  async getConversation(id: string) {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }
  
  async createConversation(data: InsertConversation) {
    const [conversation] = await db
      .insert(conversations)
      .values(data)
      .returning();
    return conversation;
  }
}
```

## Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

### Environment Variables

```
OPENAI_API_KEY=sk-...
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...  # If using PostgreSQL
```

### Performance Optimization

- Enable gzip compression
- Set cache headers for static assets
- Use CDN for assets (if needed)
- Monitor OpenAI API usage

## Contributing

1. Create feature branch
2. Make changes following style guide
3. Test thoroughly
4. Submit pull request
5. Code review
6. Merge to main

## Resources

- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [OpenAI API](https://platform.openai.com/docs)
