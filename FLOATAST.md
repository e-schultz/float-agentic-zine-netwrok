# FloatAST Specification

## Overview

FloatAST (Floating Abstract Syntax Tree) is a structured data format for representing conversations as analyzable, queryable knowledge graphs. It preserves the temporal flow of dialogue while adding semantic annotations, relationship mappings, and conceptual extraction.

## Core Principles

1. **Temporal Preservation** - Maintain conversation chronology
2. **Semantic Enrichment** - Add intent, tone, and certainty analysis
3. **Relationship Mapping** - Track how messages relate to each other
4. **Concept Extraction** - Identify and weight emergent themes
5. **Marker System** - Annotate significant moments (highlights, bridges, dispatches)

## Data Model

### FloatAST Root

```typescript
interface FloatAST {
  id: string;                    // Unique identifier
  version: "1.0";                // Specification version
  type: "conversation" | "artifact" | "bridge" | "dispatch";
  
  temporal: {
    created: string;             // ISO 8601 timestamp
    modified?: string;
    ctx_marker?: string;         // Context checkpoint
    duration?: number;           // Conversation length (ms)
    continuity_id?: string;      // Links to previous conversations
  };
  
  metadata: {
    source: "claude" | "chatgpt" | "gemini" | "local" | "composite";
    mode?: string;               // e.g., "coding", "brainstorm"
    project?: string;
    personas?: string[];         // Participant identifiers
    sigils?: string[];           // Special markers
    tags?: string[];
    domain?: "concept" | "framework" | "metaphor";
  };
  
  nodes: FloatNode[];            // Messages and content units
  edges: FloatEdge[];            // Relationships between nodes
  concepts: Record<string, Concept>;  // Extracted themes
  patterns: PatternStats;        // Conversation analytics
  
  transforms: {
    preferred_output: "thread_reader" | "zine" | "microsite" | "knowledge_base";
    imprint_routing?: string[];
    depth_level: 1 | 2 | 3 | 4 | 5;  // Analysis depth
  };
}
```

### FloatNode

Represents an individual message or content unit.

```typescript
interface FloatNode {
  id: string;
  type: "message" | "artifact" | "annotation" | "dispatch" | "ritual";
  role?: "human" | "assistant" | "system";
  
  content: {
    raw: string;                 // Original text
    processed?: string;          // Cleaned/formatted version
    structured?: any;            // Parsed data (JSON, code, etc.)
  };
  
  semantic?: {
    intent?: "question" | "statement" | "command" | "reflection";
    emotional_tone?: string;     // "curious", "contemplative", etc.
    certainty?: number;          // 0.0 - 1.0
  };
  
  float_markers?: {
    dispatch?: string;           // Launch point for new thread
    bridge?: string;             // Connection to another concept
    highlight?: string;          // Key insight
    eureka?: string;             // Breakthrough moment
    decision?: string;           // Commitment or choice
  };
  
  children?: FloatNode[];        // Nested nodes
  
  position: {
    index: number;               // Order in conversation
    depth: number;               // Nesting level
    parent?: string;             // Parent node ID
  };
}
```

### FloatEdge

Represents relationships between nodes.

```typescript
interface FloatEdge {
  id: string;
  type: "responds_to" | "references" | "contradicts" | 
        "elaborates" | "summarizes" | "questions" | 
        "implements" | "bridges";
  source: string;                // Source node ID
  target: string;                // Target node ID
  weight?: number;               // Relationship strength (0.0 - 1.0)
  metadata?: Record<string, any>;
}
```

**Edge Types Explained:**
- **responds_to** - Direct reply to previous message
- **references** - Mentions or builds on earlier point
- **contradicts** - Disagrees or offers counter-perspective
- **elaborates** - Expands on previous thought
- **summarizes** - Condenses multiple points
- **questions** - Poses question about earlier content
- **implements** - Executes or applies prior suggestion
- **bridges** - Connects disparate concepts

### Concept

Extracted themes and topics from the conversation.

```typescript
interface Concept {
  title: string;                 // Concept name
  description?: string;
  appearances: NodeReference[];  // Where it appears
  references: NodeReference[];   // Related mentions
  weight: number;                // Importance score (0.0 - 1.0)
}

interface NodeReference {
  node_id: string;
  chunk?: string;                // Relevant excerpt
  context?: string;              // Surrounding text
  strength?: number;             // Relevance (0.0 - 1.0)
}
```

### PatternStats

Conversation analytics and metadata.

```typescript
interface PatternStats {
  ctx_markers: number;           // Context checkpoints
  float_dispatches: number;      // New thread launches
  ritual_invocations: number;    // Pattern repetitions
  bridge_creates: number;        // Cross-concept connections
  persona_switches: number;      // Speaker changes
}
```

## FloatAST Generation Process

### 1. Parsing Phase

Input conversation format:
```
Author1: First message content
Author2: Response to first message
Author1: Follow-up question
```

**Steps:**
1. Split by newlines
2. Extract author and content with regex: `/^(.+?):\s*(.+)$/`
3. Create FloatNode for each message
4. Assign sequential indices
5. Determine role based on author pattern

### 2. Semantic Analysis Phase

For each node, analyze:
- **Intent detection** - Question? Statement? Command?
- **Emotional tone** - Curious, frustrated, excited, etc.
- **Certainty scoring** - How confident is the speaker?

**AI-Powered Analysis** (via OpenAI):
```typescript
const prompt = `Analyze this message for intent, tone, and certainty:
"${content}"

Respond with JSON:
{
  "intent": "question|statement|command|reflection",
  "emotional_tone": "one_word_description",
  "certainty": 0.0-1.0
}`;
```

### 3. Edge Generation Phase

Detect relationships between nodes:
- **responds_to** - Adjacent messages (index + 1)
- **references** - Keyword overlap detection
- **elaborates** - Same author, expanding topic
- **questions** - Contains "?", references earlier node

### 4. Concept Extraction Phase

**AI-Powered** (via OpenAI):
```typescript
const prompt = `Extract 5-10 key concepts from this conversation.
For each concept provide:
- title: concept name
- description: brief explanation
- node_ids: which messages discuss it
- weight: importance score 0.0-1.0

Conversation:
${nodes.map(n => n.content.raw).join('\n\n')}
`;
```

### 5. Marker Assignment Phase

Identify special moments:
- **Highlight** - Keyword: "insight", "realize", "important"
- **Bridge** - References multiple concepts
- **Dispatch** - Phrases like "let's explore", "new direction"
- **Eureka** - "aha!", "that's it!", "breakthrough"
- **Decision** - "I will", "we should", "let's go with"

## FloatQL - Querying FloatASTs

### Concept Queries

```javascript
// Find nodes related to a concept
const nodes = floatAST.concepts["knowledge_preservation"]
  .appearances
  .map(ref => floatAST.nodes.find(n => n.id === ref.node_id));

// Get concept by weight
const topConcepts = Object.entries(floatAST.concepts)
  .sort((a, b) => b[1].weight - a[1].weight)
  .slice(0, 5);
```

### Pattern Queries

```javascript
// Find all questions
const questions = floatAST.nodes.filter(n => 
  n.semantic?.intent === "question"
);

// Find bridges between concepts
const bridges = floatAST.edges.filter(e => 
  e.type === "bridges"
);

// Get conversation flow
const timeline = floatAST.nodes
  .sort((a, b) => a.position.index - b.position.index);
```

### Marker Queries

```javascript
// Find all highlights
const highlights = floatAST.nodes.filter(n => 
  n.float_markers?.highlight
);

// Get decision points
const decisions = floatAST.nodes.filter(n =>
  n.float_markers?.decision
);
```

## Use Cases

### 1. Fragment Extraction

**Goal:** Find meaningful excerpts for a specific topic

```typescript
// Query: "insights about collaboration"
const fragments = floatAST.nodes
  .filter(node => {
    const content = node.content.raw.toLowerCase();
    return content.includes("collaborat") || 
           content.includes("teamwork") ||
           node.float_markers?.highlight;
  })
  .map(node => ({
    content: node.content.raw,
    summary: node.semantic?.intent,
    nodeId: node.id
  }));
```

### 2. Thread Building

**Goal:** Group related fragments into narrative threads

```typescript
// Start with a concept
const conceptNodes = floatAST.concepts["distributed_cognition"]
  .appearances
  .map(ref => floatAST.nodes.find(n => n.id === ref.node_id));

// Follow edges to related nodes
const thread = [];
conceptNodes.forEach(node => {
  const related = floatAST.edges
    .filter(e => e.source === node.id && e.type === "elaborates")
    .map(e => floatAST.nodes.find(n => n.id === e.target));
  
  thread.push(node, ...related);
});
```

### 3. Zine Generation

**Goal:** Transform threads into formatted publication

```typescript
const zineContent = thread.map(node => `
<div class="fragment">
  <blockquote>${node.content.raw}</blockquote>
  ${node.semantic?.intent ? 
    `<span class="intent">${node.semantic.intent}</span>` : ''
  }
  ${node.float_markers?.highlight ?
    `<span class="highlight">💡 ${node.float_markers.highlight}</span>` : ''
  }
</div>
`).join('\n');
```

## Future Extensions

### Multi-Modal Support
- Code blocks as structured nodes
- Image/media references
- External links as bridge edges

### Advanced Semantic Analysis
- Argument mapping (premises → conclusions)
- Rhetorical devices detection
- Sentiment tracking over time

### Collaborative Features
- Multi-person conversations
- Speaker attribution with personas
- Role-based analysis (facilitator, critic, etc.)

### Export Formats
- Obsidian-compatible markdown
- Graph database (Neo4j)
- RDF/semantic web formats
