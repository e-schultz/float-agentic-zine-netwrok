import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Bot, User, Zap, Link, Lightbulb } from "lucide-react";
import type { FloatNode, Message, Persona } from "@shared/schema";

interface ConversationReaderProps {
  conversation: string;
  floatNodes?: FloatNode[];
}

// Mock data for demonstration
const mockPersonas: Persona[] = [
  { id: "1", name: "Alice", role: "author", colorToken: "text-blue-400" },
  { id: "2", name: "Claude", role: "researcher", colorToken: "text-purple-400" },
];

const mockMessages: Message[] = [
  {
    id: "1",
    convoId: "conv1",
    author: mockPersonas[0],
    createdAt: "2025-09-12T10:00:00Z",
    text: "I've been thinking about how we process information in the digital age. There's something profound about the way conversations can reveal patterns we didn't know existed.",
  },
  {
    id: "2",
    convoId: "conv1",
    author: mockPersonas[1],
    createdAt: "2025-09-12T10:01:00Z",
    text: "That's a fascinating insight! The layered nature of dialogue does seem to create emergent meaning. Are you thinking about how this relates to knowledge preservation?",
  },
  {
    id: "3",
    convoId: "conv1",
    author: mockPersonas[0],
    createdAt: "2025-09-12T10:02:00Z",
    text: "Exactly! And not just preservation, but transformation. Like how scattered thoughts can become coherent narratives through the right kind of processing.",
  },
];

const mockFloatNodes: FloatNode[] = [
  {
    id: "node1",
    type: "message",
    role: "human",
    content: {
      raw: mockMessages[0].text,
      processed: "Reflection on digital information processing patterns",
    },
    semantic: {
      intent: "reflection",
      emotional_tone: "contemplative",
      certainty: 0.8,
    },
    float_markers: {
      highlight: "information processing patterns",
    },
    position: { index: 0, depth: 0 },
  },
  {
    id: "node2",
    type: "message",
    role: "assistant",
    content: {
      raw: mockMessages[1].text,
      processed: "Response building on emergent meaning concept",
    },
    semantic: {
      intent: "question",
      emotional_tone: "curious",
      certainty: 0.7,
    },
    float_markers: {
      bridge: "knowledge preservation",
    },
    position: { index: 1, depth: 0 },
  },
];

export function ConversationReader({ conversation, floatNodes = mockFloatNodes }: ConversationReaderProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const messages = mockMessages; // todo: remove mock functionality

  const getMarkerIcon = (markers?: FloatNode['float_markers']) => {
    if (!markers) return null;
    if (markers.highlight) return <Lightbulb className="h-3 w-3" />;
    if (markers.bridge) return <Link className="h-3 w-3" />;
    if (markers.dispatch) return <Zap className="h-3 w-3" />;
    return null;
  };

  const getMarkerColor = (markers?: FloatNode['float_markers']) => {
    if (!markers) return "bg-muted";
    if (markers.highlight) return "bg-yellow-500/20 text-yellow-400";
    if (markers.bridge) return "bg-blue-500/20 text-blue-400";
    if (markers.dispatch) return "bg-purple-500/20 text-purple-400";
    return "bg-muted";
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case "question":
        return "bg-blue-500/10 text-blue-400";
      case "reflection":
        return "bg-purple-500/10 text-purple-400";
      case "statement":
        return "bg-green-500/10 text-green-400";
      case "command":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="h-full flex">
      {/* Message Stream */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <MessageSquare className="h-5 w-5" />
              Conversation Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message, index) => {
                  const node = floatNodes.find(n => n.content.raw === message.text);
                  const isSelected = selectedNode === node?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`group cursor-pointer ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedNode(node?.id || null)}
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {message.author.role === "author" ? (
                            <User className="h-6 w-6 text-blue-400" />
                          ) : (
                            <Bot className="h-6 w-6 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${message.author.colorToken || 'text-foreground'}`}>
                              {message.author.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.author.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {message.text}
                          </div>
                          {node && (
                            <div className="flex items-center gap-2 pt-2">
                              {node.semantic?.intent && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getIntentColor(node.semantic.intent)}`}
                                >
                                  {node.semantic.intent}
                                </Badge>
                              )}
                              {node.float_markers && Object.keys(node.float_markers).length > 0 && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex items-center gap-1 ${getMarkerColor(node.float_markers)}`}
                                >
                                  {getMarkerIcon(node.float_markers)}
                                  {Object.keys(node.float_markers)[0]}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < messages.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Node Inspector */}
      {selectedNode && (
        <div className="w-80 ml-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono text-sm">
                <Zap className="h-4 w-4" />
                FloatNode Inspector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const node = floatNodes.find(n => n.id === selectedNode);
                if (!node) return <div>Node not found</div>;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-mono text-sm font-medium">Type</h4>
                      <Badge variant="outline">{node.type}</Badge>
                    </div>
                    
                    {node.semantic && (
                      <div>
                        <h4 className="font-mono text-sm font-medium mb-2">Semantic</h4>
                        <div className="space-y-2">
                          {node.semantic.intent && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Intent:</span>
                              <Badge className={getIntentColor(node.semantic.intent)}>
                                {node.semantic.intent}
                              </Badge>
                            </div>
                          )}
                          {node.semantic.certainty && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Certainty:</span>
                              <span className="text-sm font-mono">
                                {(node.semantic.certainty * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {node.content.processed && (
                      <div>
                        <h4 className="font-mono text-sm font-medium mb-2">Processed</h4>
                        <p className="text-sm text-muted-foreground">
                          {node.content.processed}
                        </p>
                      </div>
                    )}
                    
                    {node.float_markers && Object.keys(node.float_markers).length > 0 && (
                      <div>
                        <h4 className="font-mono text-sm font-medium mb-2">Markers</h4>
                        <div className="space-y-1">
                          {Object.entries(node.float_markers).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground capitalize">
                                {key}:
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getMarkerColor({ [key]: value })}`}
                              >
                                {value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-mono text-sm font-medium mb-2">Position</h4>
                      <div className="text-sm font-mono space-y-1">
                        <div>Index: {node.position.index}</div>
                        <div>Depth: {node.position.depth}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}