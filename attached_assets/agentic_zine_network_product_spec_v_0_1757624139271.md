# Agentic Zine Network — Product Spec (v0.5)

*A terminal‑inspired, web‑native system where messy chats consolidate into cohesive thread‑readers and personal zine releases. Futuristic aesthetics in service of readability. Neurodivergent‑first by design.*

---

## 1) Product Thesis
A personal publishing environment that treats conversations as source material. Long, rambling chats are captured, distilled into **insight fragments**, clustered into **threads**, and curated into **zine issues**. The system is an **agentic interface**: it observes, suggests, and executes—yet always defers to human intent, with clear controls and reversibility.

**North‑Star Outcome:** Users regularly convert unstructured conversation into durable, meaningful publications (threads/zines) with minimal friction and maximum legibility.

---

## 2) ND‑First Design Principles
1. **Minimize Executive Load:** One primary action per surface. Defaults over choices. Predictable keyboarding.
2. **Progressive Disclosure:** Start simple; reveal detail and power features on demand.
3. **Local Focus Modes:** Low‑stimulus “Focus” scenes: dim side panels, freeze motion, quiet notifications.
4. **Sane Motion:** Prefer static transitions; disable micro‑animations by default. No CRT/scanline effects.
5. **Pacing Controls:** Batch notifications; digest insights. Snooze/hold queues.
6. **Structure Without Punishment:** Drafts auto‑save; undo everywhere; soft constraints (warnings over blocks).
7. **Terminology Hygiene:** Use concrete nouns (Chat, Fragment, Thread, Zine). Avoid metaphor overload in UI text.

---

## 3) Core Objects & Data Model (TypeScript‑style)

This spec now integrates the **FloatAST** schema as the unifying interchange format across all proof‑of‑concepts.

```ts
// Persona & Message remain as primitives
export type Persona = { id: string; name: string; role: "sysop"|"author"|"editor"|"researcher"; colorToken?: string };
export type Message = { id: string; convoId: string; author: Persona; createdAt: string; text: string; meta?: Record<string,unknown> };

// FloatAST unified schema
export interface FloatAST {
  id: string; version: "1.0";
  type: "conversation" | "artifact" | "bridge" | "dispatch";
  temporal: { created: string; modified?: string; ctx_marker?: string; duration?: number; continuity_id?: string };
  metadata: { source: string; mode?: string; project?: string; personas?: string[]; sigils?: string[]; tags?: string[]; domain?: string };
  nodes: FloatNode[];
  concepts: Record<string, Concept>;
  patterns: PatternStats;
  edges: FloatEdge[];
  transforms: TransformHints;
}

export interface FloatNode {
  id: string; type: "message"|"artifact"|"annotation"|"dispatch"|"ritual";
  role?: "human"|"assistant"|"system";
  content: { raw: string; processed?: string; structured?: any };
  semantic: { intent?: string; emotional_tone?: string; certainty?: number };
  float_markers?: { dispatch?: string; bridge?: string; highlight?: string; eureka?: string; decision?: string };
  children?: FloatNode[];
  position: { index: number; depth: number; parent?: string };
}
```

**Implication:** All objects (Fragments, Threads, Zines) are derived views or renderers of the FloatAST, not siloed models.


## 3.1 Keystone: FloatAST Interchange (v1.0)

**Problem:** Manual bridges between Conversation → JSON → Artifact create friction and context loss.

**Solution:** Adopt a single, versioned interchange schema (**FloatAST**) that every parser emits and every renderer consumes.

```
Conversation/log  ──▶  Parser (LLM + rules)  ──▶  FloatAST (v1.0)  ──▶  Router  ──▶  Renderer
                                                                    │             ├─ Thread Reader
                                                                    │             ├─ Zine
                                                                    │             └─ Microsite
                                                             FloatQL Queries
```

**Key guarantees**
- **Stable core fields** (id, version, temporal, metadata, nodes, edges, transforms).
- **Recursive nodes** with `content.raw|processed|structured` to preserve ground truth.
- **Concept graph** and **edges** enable cross‑artifact linking without ad‑hoc parsers.
- **Transform hints** (`transforms.preferred_output`, `imprint_routing`, `depth_level`) guide routing.
- **Versioning** via `ast.version` (semver) + migrations (`migrations/1.0→1.1.ts`).

**Renderer contract (read‑only):**
- Input: `FloatAST` (validated). No mutation. Pure render from AST + options.
- Must tolerate missing optional fields and respect `ThemeSpec`/accessibility.

**Router rules (deterministic, overridable):**
1) Use `transforms.preferred_output` if set.
2) Else infer from dominant node/intent mix.
3) Allow manual override from Command Palette.

## 3.2 Parser Layer (connective tissue)
- **Conversation parsers:** tokenize turns, detect personas, intents, markers (`dispatch::`, `bridge::`, etc.), produce `FloatNode[]` + `FloatEdge[]`.
- **Structure detectors:** YAML/JSON blocks → `content.structured`; keep `content.raw` intact.
- **Safety:** PII redaction profile runs before persistence. Raw kept locally; exports use processed text.
- **Workers:** streaming incremental parse; debounce to avoid UI thrash.

## 3.3 FloatQL (query over AST)
Use FloatQL to extract threads, filter nodes, and assemble artifacts. Examples:

```json
{
  "select": { "nodes": true },
  "where": { "semantic": { "intent": ["reflection"] }, "temporal": { "after": "2025-09-01" } },
  "transform": { "to": "thread_reader", "options": { "depth": 2 } }
}
```

---

## 4) System Flows (Happy Paths)

### 4.1 Unified Flow: Conversation → FloatAST → Renderer
1. **Parser:** Conversations/logs parsed into FloatAST.
2. **Query:** FloatQL queries extract candidate fragments and clusters.
3. **Renderer:** Outputs chosen format — Thread Reader, Zine, Microsite, Knowledge Base.
4. **Loop:** All edits commit back into FloatAST so every renderer stays in sync.

### 4.2 Retrieval & Re‑entry
- From any node, **Jump‑To**: FloatAST origin, containing thread, or zine section.
- Quick Open (⌘K) queries FloatAST objects with semantic/context boosts.

### 4.3 Review Loop
- Digest generated via FloatQL: orphan nodes, high‑weight concepts, draft clusters.
- One‑click **Promote to Issue** → automatically routes FloatAST subset to Zine renderer.

### 4.4 Onboarding
- Import one transcript → parser generates FloatAST → auto‑extract 10 fragments → cluster into threads → propose Issue Zero.

### 4.5 Low‑Spoon Mode
- Narrow FloatQL query → Inbox only → accept/discard nodes. Keeps scope minimal.

---

## 5) UI Anatomy

- **Shell, Surfaces, and Wireframes** remain, but now backed by FloatAST queries.
- Chat Reader shows FloatAST node stream. Inline badges = node/edge references.
- Thread Builder arranges FloatAST node clusters. Agent proposes order via edge weights.
- Zine Editor consumes FloatAST subset. Layout auto‑generated from section nodes.
- Command Palette = FloatQL query executor with slash shortcuts.

---

## 6) Agentic Behavior

Agents are **FloatAST mutators**:
- **Fragmentor** → propose new nodes from raw text.
- **Clusterer** → add edges between related nodes.
- **Titulist** → suggest metadata updates (titles).
- **Publisher** → validate FloatAST subsets before rendering.

All reversible, logged in FloatAST `patterns` + `edges`.

---

## 7) FloatQL: Query Language

Declarative query layer for all renderers.

```ts
const generateReader = {
  select: { nodes: true, concepts: true },
  transform: { to: "thread_reader", options: { depth: 2, include_personas: true } }
}
```

Use FloatQL in:
- Command Palette (e.g., `/sift`, `/bind` → compile into FloatQL).
- Agents (self‑audits run FloatQL aggregate queries).
- Exports (renderers consume FloatAST via FloatQL transforms).

---

## 8) Example Scenarios
- **Unified Release:** Transcript → FloatAST → `/sift` query → accept fragments → `/bind` cluster → FloatQL transform → Zine renderer.
- **Microsite Fork:** Subset of FloatAST piped to microsite template. Same AST, new skin.
- **Cross‑Artifact Search:** Run FloatQL across ASTs: find recurring sigils, concepts, bridges.

---

## 9) Implementation Plan (Revised)

### 9.1 MVP
- Build FloatAST parser for .txt/.md logs.
- React shell surfaces read/write from FloatAST.
- Export to simple HTML zine via FloatQL.

### 9.2 Agent Layer
- Workers mutate FloatAST (propose fragments, clusters).
- Insight Queue now = FloatAST diff viewer.

### 9.3 Multi‑Renderer Support
- Implement Thread Reader + Zine renderer.
- Microsite renderer stub.

---

## 10) Architecture Notes
- FloatAST = single source of truth. Renderers = projections.
- Workers = FloatAST mutators, always reversible.
- State machines manage transformations. 
- Storage: Local‑first, append‑only AST journals.

---

## 11–13) Controls, Accessibility, Visual Language
(unchanged, but now explicitly apply to FloatAST renderers).

---

## 14) Agent Prompts (Agentic Coder)
Prompts now specify FloatAST as contract:

```
Implement FloatAST parser: Input conversation → Output FloatAST v1.0 JSON.
All agents must consume/produce FloatAST diffs, not bespoke objects.
```


---

## 15) FloatAST Schema (v1.0) — Full Interfaces

> Canonical interchange used by parsers, router, and all renderers.

```ts
// FloatAST: Abstract Syntax Tree for FLOAT conversations and consciousness artifacts
// RitualAST: Subset focused on ritual patterns and recursive structures

export interface FloatAST {
  id: string;                    // UUID or float_TIMESTAMP_HASH format
  version: "1.0";
  type: "conversation" | "artifact" | "bridge" | "dispatch";
  temporal: {
    created: string; modified?: string; ctx_marker?: string; duration?: number; continuity_id?: string;
  };
  metadata: {
    source: "claude" | "chatgpt" | "gemini" | "local" | "composite";
    mode?: string; project?: string; personas?: string[]; sigils?: string[]; tags?: string[];
    domain?: "concept" | "framework" | "metaphor";
  };
  nodes: FloatNode[];
  concepts: Record<string, {
    title: string; description?: string; appearances: NodeReference[]; references: NodeReference[]; weight: number;
  }>;
  patterns: { ctx_markers: number; float_dispatches: number; ritual_invocations: number; bridge_creates: number; persona_switches: number; };
  edges: FloatEdge[];
  transforms: {
    preferred_output: "thread_reader" | "zine" | "microsite" | "knowledge_base";
    imprint_routing?: string[]; depth_level: 1 | 2 | 3 | 4 | 5;
  };
}

export interface FloatNode {
  id: string;
  type: "message" | "artifact" | "annotation" | "dispatch" | "ritual";
  role?: "human" | "assistant" | "system";
  content: { raw: string; processed?: string; structured?: any; };
  semantic?: { intent?: "question" | "statement" | "command" | "reflection"; emotional_tone?: string; certainty?: number; };
  float_markers?: { dispatch?: string; bridge?: string; highlight?: string; eureka?: string; decision?: string; };
  children?: FloatNode[];
  position: { index: number; depth: number; parent?: string; };
}

export interface FloatEdge {
  id: string;
  type: "responds_to" | "references" | "contradicts" | "elaborates" | "summarizes" | "questions" | "implements" | "bridges";
  source: string; target: string; weight?: number; metadata?: Record<string, any>;
}

export interface NodeReference { node_id: string; chunk?: string; context?: string; strength?: number; }

export interface RitualAST extends FloatAST {
  type: "ritual";
  ritual: { invocation?: string; sigils: string[]; stage: "invoke" | "process" | "manifest" | "complete"; recursion_depth: number; };
  nodes: RitualNode[];
  sacred: { seeds?: string[]; loops?: RitualLoop[]; transforms?: Transform[]; };
}

export interface RitualNode extends FloatNode {
  type: "invocation" | "incantation" | "manifestation" | "transformation";
  ritual_markers?: { sigil?: string; sacred_text?: string; loop_reference?: string; transformation?: { from: string; to: string; catalyst: string; } };
}

export interface RitualLoop { id: string; pattern: string; occurrences: string[]; depth: number; significance?: string; }
export interface Transform { id: string; type: "consciousness" | "structural" | "semantic" | "temporal"; from_state: any; to_state: any; catalyst: string; timestamp: string; }

export type FloatQL = {
  select: { nodes?: boolean | string[]; concepts?: boolean | string[]; patterns?: boolean; edges?: boolean | EdgeFilter; };
  where?: { type?: string | string[]; role?: string | string[]; temporal?: { after?: string; before?: string; duration?: { min?: number; max?: number } }; semantic?: { intent?: string[]; tone?: string[]; certainty?: { min?: number; max?: number } }; contains?: { text?: string; patterns?: string[]; concepts?: string[] }; personas?: string[]; mode?: string[]; };
  aggregate?: { count?: ("nodes" | "concepts" | "patterns" | "edges")[]; group_by?: string[]; summarize?: boolean; };
  transform?: { to: "thread_reader" | "zine" | "microsite" | "summary"; options?: Record<string, any>; };
  order_by?: { field: string; direction: "asc" | "desc"; }[]; limit?: number; offset?: number;
};

export interface EdgeFilter { type?: string[]; weight?: { min?: number; max?: number }; between?: { source?: string[]; target?: string[]; } }
```

**Versioning & Registry**
- Registry path: `/schemas/floatast/1.0.json` (JSON Schema + Zod).
- Migrations: `/migrations/floatast/1.0_to_1.1.ts` with `up()`/`down()`.
- CI check: validate + snapshot render parity across versions.

## 16) Router & Renderer Contracts

**Router inputs:** `FloatAST`, user override, environment (quiet mode, theme).  
**Decision order:** transforms.hints → inference → override.  
**Emits:** `{target, options}` to a renderer.

**Renderer contract (per target):**
- **Thread Reader:** consumes nodes+edges; respects anchor fragments; produces linear narrative.
- **Zine:** groups threads into sections; TOC + theme preview; export HTML/MD/JSON.
- **Microsite:** maps `concepts` and `edges` to nav + section pages.

## 17) AST‑First UI Additions

- **AST Inspector (⌘I):** right panel tab showing current node, edges, concepts; jump to source.
- **Badges in Chat Reader:** each harvested node shows an AST badge; hover reveals `summary/confidence`.
- **One‑click Promote:** node → fragment → thread via palette, without leaving context.

```
┌── Chat Reader ─────────────────────┬─ AST Inspector ────────────┐
│ [.. transcript ..]                 │ Node: msg_01HC             │
│  ↳ [AST] Fragment #F12 (0.78)      │ Type: message              │
│                                    │ Edges: responds_to msg_01HB│
│ ⌘E Extract  ⌘B Bind to Thread      │ Concepts: agentic, zine    │
└────────────────────────────────────┴─────────────────────────────┘
```

## 18) Automation & Deployment

**CLI (floatctl):**
```
floatctl parse logs/today.md -o ast.json
floatctl validate ast.json
floatctl render ast.json --target thread-reader --out dist/
floatctl publish dist/ --provider vercel
```

**GitHub Action (sketch)**
```yaml
name: build-release
on: [push]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm i
      - run: pnpm floatctl parse input.md -o ast.json
      - run: pnpm floatctl validate ast.json
      - run: pnpm floatctl render ast.json --target zine --out dist
      - uses: vercel/actions/deploy@v1
        with: { path: dist }
```

## 19) End‑to‑End Example (mini)

**Input (conversation snippet)** → Parser yields:
```json
{
  "id":"01J-AGENTIC","version":"1.0","type":"conversation",
  "temporal":{"created":"2025-09-11T20:05:00Z"},
  "metadata":{"source":"chatgpt","personas":["sysop","author"],"tags":["vision"]},
  "nodes":[
    {"id":"n1","type":"message","role":"human","content":{"raw":"If twitter was Tumblr..."},"position":{"index":0,"depth":0}},
    {"id":"n2","type":"annotation","content":{"processed":"Vision: chat→fragments→threads→zine"},"position":{"index":1,"depth":0}}
  ],
  "edges":[{"id":"e1","type":"summarizes","source":"n2","target":"n1"}],
  "concepts":{"agentic":{"title":"Agentic UX","appearances":[{"node_id":"n1"}],"references":[],"weight":0.7}},
  "patterns":{"ctx_markers":0,"float_dispatches":0,"ritual_invocations":0,"bridge_creates":0,"persona_switches":0},
  "transforms":{"preferred_output":"thread_reader","depth_level":2}
}
```
Router selects **Thread Reader** → Renderer outputs a linear reader; user promotes to Zine section.

## 20) Agentic Coder Prompts — AST Pipeline

**Schema & Validation**
```
Implement FloatAST v1.0 as JSON Schema + Zod. Provide `validateAst(json)`.
Add CI to fail on invalid AST; include snapshot tests for renderer parity.
```

**Parser**
```
Build a streaming conversation parser that emits FloatNodes and Edges.
Detect personas, intents, and fenced code/JSON blocks → `content.structured`.
Attach rationales and confidence for extracted fragments.
```

**Router**
```
Deterministic router: consult transforms.hints; fallback to inference; expose override hook.
Emit `{target, options}` compatible with each renderer.
```

**Renderers**
```
Implement Thread Reader and Zine as pure functions from AST.
Respect accessibility settings; no mutation. Provide HTML/MD/JSON exports.
```

**Self‑Audit**
```
Log: draft→final edit distance, fragment acceptance rate, time‑to‑release.
Weekly, output a 5‑bullet improvement memo and apply one change.
```

## 21) QA Checklist (Connective Tissue)
- [ ] Parser emits valid FloatAST for sample logs and real chats.
- [ ] Router produces stable target choices given the same AST.
- [ ] Renderers accept only AST, no hidden adapters.
- [ ] CLI/Action validates and publishes without manual steps.
- [ ] Accessibility: high‑contrast + reduce‑motion honored in all outputs.

