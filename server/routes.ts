import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertZineSchema, type FloatAST, type FloatNode } from "@shared/schema";
import OpenAI from 'openai';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validation = insertConversationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid conversation data", details: validation.error });
      }
      
      const conversation = await storage.createConversation(validation.data);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = insertConversationSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid update data", details: validation.error });
      }
      
      const updated = await storage.updateConversation(id, validation.data);
      if (!updated) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // FloatAST parsing route
  app.post("/api/conversations/:id/parse", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Parse conversation into FloatAST format
      const floatAst = await parseConversationToFloatAST(conversation.content, conversation.title);
      const record = await storage.createFloatAST(floatAst.id, floatAst, conversation.userId || undefined);
      
      // Link the conversation to the FloatAST
      await storage.updateConversation(id, { floatAstId: floatAst.id });
      
      res.json(record);
    } catch (error) {
      console.error("Error parsing conversation:", error);
      res.status(500).json({ error: "Failed to parse conversation" });
    }
  });

  // FloatAST routes
  app.get("/api/float-asts", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const floatAsts = await storage.getFloatASTs(userId);
      res.json(floatAsts);
    } catch (error) {
      console.error("Error fetching FloatASTs:", error);
      res.status(500).json({ error: "Failed to fetch FloatASTs" });
    }
  });

  app.get("/api/float-asts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const floatAst = await storage.getFloatAST(id);
      if (!floatAst) {
        return res.status(404).json({ error: "FloatAST not found" });
      }
      res.json(floatAst);
    } catch (error) {
      console.error("Error fetching FloatAST:", error);
      res.status(500).json({ error: "Failed to fetch FloatAST" });
    }
  });

  // AI fragment extraction route
  app.post("/api/float-asts/:id/extract-fragments", async (req, res) => {
    try {
      const { id } = req.params;
      const { query, maxFragments = 10 } = req.body;
      
      const floatAst = await storage.getFloatAST(id);
      if (!floatAst) {
        return res.status(404).json({ error: "FloatAST not found" });
      }

      const fragments = await extractFragmentsWithAI(floatAst.data as any, query, maxFragments);
      res.json({ fragments });
    } catch (error) {
      console.error("Error extracting fragments:", error);
      res.status(500).json({ error: "Failed to extract fragments" });
    }
  });

  // Zine routes
  app.get("/api/zines", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const zines = await storage.getZines(userId);
      res.json(zines);
    } catch (error) {
      console.error("Error fetching zines:", error);
      res.status(500).json({ error: "Failed to fetch zines" });
    }
  });

  app.post("/api/zines", async (req, res) => {
    try {
      const validation = insertZineSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid zine data", details: validation.error });
      }
      
      const zine = await storage.createZine(validation.data);
      res.status(201).json(zine);
    } catch (error) {
      console.error("Error creating zine:", error);
      res.status(500).json({ error: "Failed to create zine" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to parse conversation text into FloatAST structure
async function parseConversationToFloatAST(content: string, title: string): Promise<FloatAST> {
  const lines = content.split('\n').filter(line => line.trim());
  const nodes: FloatNode[] = [];
  const concepts: Record<string, any> = {};
  const edges: any[] = [];
  
  let currentIndex = 0;
  
  for (const line of lines) {
    // Basic parsing - identify message patterns
    const messageMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (messageMatch) {
      const [, author, text] = messageMatch;
      
      const node: FloatNode = {
        id: `node-${randomUUID()}`,
        type: "message",
        role: author.toLowerCase().includes('assistant') ? 'assistant' : 'human',
        content: {
          raw: text,
          processed: text.trim(),
        },
        position: {
          index: currentIndex++,
          depth: 0,
        }
      };
      
      nodes.push(node);
    } else if (line.trim()) {
      // Handle other content as general nodes
      const node: FloatNode = {
        id: `node-${randomUUID()}`,
        type: "message",
        content: {
          raw: line,
          processed: line.trim(),
        },
        position: {
          index: currentIndex++,
          depth: 0,
        }
      };
      
      nodes.push(node);
    }
  }
  
  const floatAst: FloatAST = {
    id: `ast-${randomUUID()}`,
    version: "1.0",
    type: "conversation",
    temporal: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    metadata: {
      source: "local",
      project: title,
      tags: [],
    },
    nodes,
    concepts,
    patterns: {
      ctx_markers: 0,
      float_dispatches: 0,
      ritual_invocations: 0,
      bridge_creates: 0,
      persona_switches: nodes.filter(n => n.role === 'assistant').length,
    },
    edges,
    transforms: {
      preferred_output: "zine",
      depth_level: 2,
    },
  };
  
  return floatAst;
}

// AI-powered fragment extraction using OpenAI
async function extractFragmentsWithAI(floatAst: FloatAST, query: string, maxFragments: number = 10) {
  try {
    const conversationText = floatAst.nodes.map(node => node.content.raw).join('\n');
    
    const prompt = `
Analyze this conversation and extract ${maxFragments} meaningful fragments related to: "${query}"

Conversation:
${conversationText}

For each fragment, provide:
1. The exact text excerpt
2. A brief explanation of its relevance to the query
3. Keywords or concepts it contains
4. A suggested thread category

Format as JSON array with objects containing: text, relevance, keywords, category
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing conversations and extracting meaningful insights. Focus on finding the most relevant and interesting fragments that relate to the user's query."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      // Fallback: extract fragments manually if AI response isn't valid JSON
      console.warn("AI response wasn't valid JSON, falling back to manual extraction");
      return extractFragmentsManually(floatAst, query, maxFragments);
    }
  } catch (error) {
    console.error("Error with OpenAI:", error);
    // Fallback to manual extraction
    return extractFragmentsManually(floatAst, query, maxFragments);
  }
}

// Fallback manual fragment extraction
function extractFragmentsManually(floatAst: FloatAST, query: string, maxFragments: number) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const fragments: any[] = [];
  
  for (const node of floatAst.nodes) {
    const text = node.content.raw.toLowerCase();
    const relevanceScore = queryWords.reduce((score, word) => {
      return text.includes(word) ? score + 1 : score;
    }, 0);
    
    if (relevanceScore > 0) {
      fragments.push({
        text: node.content.raw,
        relevance: `Contains ${relevanceScore} query terms`,
        keywords: queryWords.filter(word => text.includes(word)),
        category: "General",
        score: relevanceScore,
      });
    }
  }
  
  return fragments
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFragments)
    .map(({ score, ...fragment }) => fragment);
}
