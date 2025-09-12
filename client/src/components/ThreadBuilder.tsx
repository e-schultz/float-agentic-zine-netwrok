import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Network, Plus, ArrowUp, ArrowDown, Trash2, Link, Lightbulb } from "lucide-react";
import type { FloatNode } from "@shared/schema";

interface Thread {
  id: string;
  title: string;
  nodeIds: string[];
  weight: number;
}

interface ThreadBuilderProps {
  floatNodes?: FloatNode[];
  onThreadsChange?: (threads: Thread[]) => void;
}

// Mock float nodes for demonstration
const mockFloatNodes: FloatNode[] = [
  {
    id: "node1",
    type: "message",
    role: "human",
    content: {
      raw: "Digital information processing reveals hidden patterns",
      processed: "Core insight about pattern recognition",
    },
    semantic: {
      intent: "reflection",
      certainty: 0.9,
    },
    float_markers: {
      highlight: "pattern recognition",
    },
    position: { index: 0, depth: 0 },
  },
  {
    id: "node2",
    type: "message", 
    role: "assistant",
    content: {
      raw: "The layered nature of dialogue creates emergent meaning",
      processed: "Response about emergent properties",
    },
    semantic: {
      intent: "statement",
      certainty: 0.8,
    },
    float_markers: {
      bridge: "emergent meaning",
    },
    position: { index: 1, depth: 0 },
  },
  {
    id: "node3",
    type: "message",
    role: "human", 
    content: {
      raw: "Transformation through processing scattered thoughts",
      processed: "Insight about cognitive transformation",
    },
    semantic: {
      intent: "reflection",
      certainty: 0.85,
    },
    float_markers: {
      eureka: "cognitive transformation",
    },
    position: { index: 2, depth: 0 },
  },
];

export function ThreadBuilder({ floatNodes = mockFloatNodes, onThreadsChange }: ThreadBuilderProps) {
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "thread1",
      title: "Information Processing Patterns",
      nodeIds: ["node1", "node2"],
      weight: 0.8,
    },
    {
      id: "thread2", 
      title: "Cognitive Transformation",
      nodeIds: ["node3"],
      weight: 0.7,
    },
  ]);
  
  const [selectedThread, setSelectedThread] = useState<string | null>("thread1");
  const [unassignedNodes] = useState<string[]>([]);

  const createThread = () => {
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: "New Thread",
      nodeIds: [],
      weight: 0.5,
    };
    const updatedThreads = [...threads, newThread];
    setThreads(updatedThreads);
    setSelectedThread(newThread.id);
    onThreadsChange?.(updatedThreads);
  };

  const updateThread = (id: string, updates: Partial<Thread>) => {
    const updatedThreads = threads.map(thread =>
      thread.id === id ? { ...thread, ...updates } : thread
    );
    setThreads(updatedThreads);
    onThreadsChange?.(updatedThreads);
  };

  const deleteThread = (id: string) => {
    const updatedThreads = threads.filter(thread => thread.id !== id);
    setThreads(updatedThreads);
    if (selectedThread === id) {
      setSelectedThread(updatedThreads[0]?.id || null);
    }
    onThreadsChange?.(updatedThreads);
  };

  const moveNodeToThread = (nodeId: string, threadId: string) => {
    const updatedThreads = threads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          nodeIds: [...thread.nodeIds, nodeId],
        };
      } else {
        return {
          ...thread,
          nodeIds: thread.nodeIds.filter(id => id !== nodeId),
        };
      }
    });
    setThreads(updatedThreads);
    onThreadsChange?.(updatedThreads);
  };

  const removeNodeFromThread = (nodeId: string, threadId: string) => {
    const updatedThreads = threads.map(thread =>
      thread.id === threadId
        ? { ...thread, nodeIds: thread.nodeIds.filter(id => id !== nodeId) }
        : thread
    );
    setThreads(updatedThreads);
    onThreadsChange?.(updatedThreads);
  };

  const moveThreadUp = (threadId: string) => {
    const index = threads.findIndex(t => t.id === threadId);
    if (index > 0) {
      const newThreads = [...threads];
      [newThreads[index], newThreads[index - 1]] = [newThreads[index - 1], newThreads[index]];
      setThreads(newThreads);
      onThreadsChange?.(newThreads);
    }
  };

  const moveThreadDown = (threadId: string) => {
    const index = threads.findIndex(t => t.id === threadId);
    if (index < threads.length - 1) {
      const newThreads = [...threads];
      [newThreads[index], newThreads[index + 1]] = [newThreads[index + 1], newThreads[index]];
      setThreads(newThreads);
      onThreadsChange?.(newThreads);
    }
  };

  const getNodeById = (id: string) => floatNodes.find(node => node.id === id);

  const getMarkerIcon = (markers?: FloatNode['float_markers']) => {
    if (!markers) return null;
    if (markers.highlight) return <Lightbulb className="h-3 w-3" />;
    if (markers.bridge) return <Link className="h-3 w-3" />;
    return null;
  };

  const selectedThreadData = threads.find(t => t.id === selectedThread);

  return (
    <div className="h-full flex gap-4">
      {/* Thread List */}
      <div className="w-80">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-mono text-sm">
              <Network className="h-5 w-5" />
              Threads
            </CardTitle>
            <Button 
              size="sm" 
              onClick={createThread}
              data-testid="button-create-thread"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] px-6 pb-6">
              <div className="space-y-2">
                {threads.map((thread, index) => (
                  <Card
                    key={thread.id}
                    className={`p-3 cursor-pointer hover-elevate ${
                      selectedThread === thread.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedThread(thread.id)}
                    data-testid={`thread-card-${index}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-mono text-sm font-medium leading-tight">
                          {thread.title}
                        </h4>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveThreadUp(thread.id);
                            }}
                            data-testid={`button-move-up-${index}`}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveThreadDown(thread.id);
                            }}
                            data-testid={`button-move-down-${index}`}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteThread(thread.id);
                            }}
                            data-testid={`button-delete-thread-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {thread.nodeIds.length} nodes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(thread.weight * 100).toFixed(0)}% weight
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Thread Editor */}
      <div className="flex-1">
        {selectedThreadData ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-mono text-sm">
                Edit Thread: {selectedThreadData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium font-mono mb-2 block">
                  Thread Title
                </label>
                <Input
                  value={selectedThreadData.title}
                  onChange={(e) => updateThread(selectedThreadData.id, { title: e.target.value })}
                  className="font-mono"
                  data-testid="input-thread-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium font-mono mb-2 block">
                  Nodes in Thread ({selectedThreadData.nodeIds.length})
                </label>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  {selectedThreadData.nodeIds.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No nodes in this thread. Add nodes from the available pool.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedThreadData.nodeIds.map((nodeId, index) => {
                        const node = getNodeById(nodeId);
                        if (!node) return null;
                        
                        return (
                          <Card key={nodeId} className="p-3">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {node.type}
                                  </Badge>
                                  {node.semantic?.intent && (
                                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400">
                                      {node.semantic.intent}
                                    </Badge>
                                  )}
                                  {node.float_markers && Object.keys(node.float_markers).length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex items-center gap-1 bg-yellow-500/10 text-yellow-400"
                                    >
                                      {getMarkerIcon(node.float_markers)}
                                      {Object.keys(node.float_markers)[0]}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {node.content.processed || node.content.raw}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => removeNodeFromThread(nodeId, selectedThreadData.id)}
                                data-testid={`button-remove-node-${index}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Available Nodes */}
              {unassignedNodes.length > 0 && (
                <div>
                  <label className="text-sm font-medium font-mono mb-2 block">
                    Available Nodes
                  </label>
                  <ScrollArea className="h-32 border rounded-md p-4">
                    <div className="space-y-2">
                      {unassignedNodes.map(nodeId => {
                        const node = getNodeById(nodeId);
                        if (!node) return null;
                        
                        return (
                          <div
                            key={nodeId}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => moveNodeToThread(nodeId, selectedThreadData.id)}
                          >
                            <span className="text-sm truncate">
                              {node.content.processed || node.content.raw}
                            </span>
                            <Button size="sm" variant="ghost">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a thread to edit</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}