import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// FloatAST Core Types (based on product spec)
export interface Persona {
  id: string;
  name: string;
  role: "sysop" | "author" | "editor" | "researcher";
  colorToken?: string;
}

export interface Message {
  id: string;
  convoId: string;
  author: Persona;
  createdAt: string;
  text: string;
  meta?: Record<string, unknown>;
}

export interface FloatNode {
  id: string;
  type: "message" | "artifact" | "annotation" | "dispatch" | "ritual";
  role?: "human" | "assistant" | "system";
  content: {
    raw: string;
    processed?: string;
    structured?: any;
  };
  semantic?: {
    intent?: "question" | "statement" | "command" | "reflection";
    emotional_tone?: string;
    certainty?: number;
  };
  float_markers?: {
    dispatch?: string;
    bridge?: string;
    highlight?: string;
    eureka?: string;
    decision?: string;
  };
  children?: FloatNode[];
  position: {
    index: number;
    depth: number;
    parent?: string;
  };
}

export interface FloatEdge {
  id: string;
  type: "responds_to" | "references" | "contradicts" | "elaborates" | "summarizes" | "questions" | "implements" | "bridges";
  source: string;
  target: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface Concept {
  title: string;
  description?: string;
  appearances: NodeReference[];
  references: NodeReference[];
  weight: number;
}

export interface NodeReference {
  node_id: string;
  chunk?: string;
  context?: string;
  strength?: number;
}

export interface PatternStats {
  ctx_markers: number;
  float_dispatches: number;
  ritual_invocations: number;
  bridge_creates: number;
  persona_switches: number;
}

export interface FloatAST {
  id: string;
  version: "1.0";
  type: "conversation" | "artifact" | "bridge" | "dispatch";
  temporal: {
    created: string;
    modified?: string;
    ctx_marker?: string;
    duration?: number;
    continuity_id?: string;
  };
  metadata: {
    source: "claude" | "chatgpt" | "gemini" | "local" | "composite";
    mode?: string;
    project?: string;
    personas?: string[];
    sigils?: string[];
    tags?: string[];
    domain?: "concept" | "framework" | "metaphor";
  };
  nodes: FloatNode[];
  concepts: Record<string, Concept>;
  patterns: PatternStats;
  edges: FloatEdge[];
  transforms: {
    preferred_output: "thread_reader" | "zine" | "microsite" | "knowledge_base";
    imprint_routing?: string[];
    depth_level: 1 | 2 | 3 | 4 | 5;
  };
}

// Database tables for persistent storage
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  floatAstId: varchar("float_ast_id").references(() => floatAsts.id),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const floatAsts = pgTable("float_asts", {
  id: varchar("id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const zines = pgTable("zines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  floatAstId: varchar("float_ast_id").references(() => floatAsts.id),
  status: text("status").notNull().default("draft"), // draft, published, archived
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  userId: varchar("user_id").references(() => users.id),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
  content: true,
  userId: true,
  floatAstId: true,
});

export const insertZineSchema = createInsertSchema(zines).pick({
  title: true,
  content: true,
  floatAstId: true,
  status: true,
  userId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertZine = z.infer<typeof insertZineSchema>;
export type Zine = typeof zines.$inferSelect;
export type FloatASTRecord = typeof floatAsts.$inferSelect;