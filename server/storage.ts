import { type User, type InsertUser, type Conversation, type InsertConversation, type FloatAST, type FloatASTRecord, type Zine, type InsertZine } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  getConversations(userId?: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  
  // FloatAST operations
  getFloatASTs(userId?: string): Promise<FloatASTRecord[]>;
  getFloatAST(id: string): Promise<FloatASTRecord | undefined>;
  createFloatAST(id: string, data: FloatAST, userId?: string): Promise<FloatASTRecord>;
  updateFloatAST(id: string, data: FloatAST): Promise<FloatASTRecord | undefined>;
  deleteFloatAST(id: string): Promise<boolean>;
  
  // Zine operations
  getZines(userId?: string): Promise<Zine[]>;
  getZine(id: string): Promise<Zine | undefined>;
  createZine(zine: InsertZine): Promise<Zine>;
  updateZine(id: string, updates: Partial<InsertZine>): Promise<Zine | undefined>;
  deleteZine(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private floatAsts: Map<string, FloatASTRecord>;
  private zines: Map<string, Zine>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.floatAsts = new Map();
    this.zines = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Conversation operations
  async getConversations(userId?: string): Promise<Conversation[]> {
    const allConversations = Array.from(this.conversations.values());
    return userId ? allConversations.filter(c => c.userId === userId) : allConversations;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      floatAstId: insertConversation.floatAstId || null,
      createdAt: new Date(),
      userId: insertConversation.userId || null,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    
    const updated: Conversation = { ...existing, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  // FloatAST operations
  async getFloatASTs(userId?: string): Promise<FloatASTRecord[]> {
    const allAsts = Array.from(this.floatAsts.values());
    return userId ? allAsts.filter(ast => ast.userId === userId) : allAsts;
  }

  async getFloatAST(id: string): Promise<FloatASTRecord | undefined> {
    return this.floatAsts.get(id);
  }

  async createFloatAST(id: string, data: FloatAST, userId?: string): Promise<FloatASTRecord> {
    const record: FloatASTRecord = {
      id,
      data: data as any,
      createdAt: new Date(),
      modifiedAt: new Date(),
      userId: userId || null,
    };
    this.floatAsts.set(id, record);
    return record;
  }

  async updateFloatAST(id: string, data: FloatAST): Promise<FloatASTRecord | undefined> {
    const existing = this.floatAsts.get(id);
    if (!existing) return undefined;
    
    const updated: FloatASTRecord = {
      ...existing,
      data: data as any,
      modifiedAt: new Date(),
    };
    this.floatAsts.set(id, updated);
    return updated;
  }

  async deleteFloatAST(id: string): Promise<boolean> {
    return this.floatAsts.delete(id);
  }

  // Zine operations
  async getZines(userId?: string): Promise<Zine[]> {
    const allZines = Array.from(this.zines.values());
    return userId ? allZines.filter(z => z.userId === userId) : allZines;
  }

  async getZine(id: string): Promise<Zine | undefined> {
    return this.zines.get(id);
  }

  async createZine(insertZine: InsertZine): Promise<Zine> {
    const id = randomUUID();
    const zine: Zine = {
      ...insertZine,
      id,
      status: insertZine.status || "draft",
      userId: insertZine.userId || null,
      floatAstId: insertZine.floatAstId || null,
      createdAt: new Date(),
      publishedAt: null,
    };
    this.zines.set(id, zine);
    return zine;
  }

  async updateZine(id: string, updates: Partial<InsertZine>): Promise<Zine | undefined> {
    const existing = this.zines.get(id);
    if (!existing) return undefined;
    
    const updated: Zine = { ...existing, ...updates };
    this.zines.set(id, updated);
    return updated;
  }

  async deleteZine(id: string): Promise<boolean> {
    return this.zines.delete(id);
  }
}

export const storage = new MemStorage();
