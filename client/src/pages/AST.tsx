import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Database, FileJson, Eye, Download } from "lucide-react";
import type { FloatAST } from "@shared/schema";

export default function AST() {
  // todo: remove mock functionality
  const [mockFloatAST] = useState<Partial<FloatAST>>({
    id: "float_20250912_abc123",
    version: "1.0",
    type: "conversation",
    temporal: {
      created: "2025-09-12T10:00:00Z",
      modified: "2025-09-12T10:30:00Z",
      duration: 1800,
    },
    metadata: {
      source: "claude",
      mode: "analysis",
      personas: ["Alice", "Claude"],
      tags: ["consciousness", "patterns", "dialogue"],
      domain: "concept",
    },
    patterns: {
      ctx_markers: 5,
      float_dispatches: 3,
      ritual_invocations: 0,
      bridge_creates: 2,
      persona_switches: 8,
    },
    transforms: {
      preferred_output: "thread_reader",
      depth_level: 2,
    },
  });

  const [viewMode, setViewMode] = useState<"overview" | "raw">("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold">FloatAST Explorer</h1>
          <p className="text-muted-foreground">
            Inspect and analyze FloatAST data structures
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            onClick={() => setViewMode("overview")}
            data-testid="button-overview-mode"
          >
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewMode === "raw" ? "default" : "outline"}
            onClick={() => setViewMode("raw")}
            data-testid="button-raw-mode"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Raw JSON
          </Button>
          <Button variant="outline" data-testid="button-export-ast">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {viewMode === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-mono">
                <Database className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-mono">ID:</span>
                  <div className="font-mono break-all">{mockFloatAST.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono">Version:</span>
                  <div className="font-mono">{mockFloatAST.version}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono">Type:</span>
                  <Badge variant="outline">{mockFloatAST.type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono">Source:</span>
                  <Badge variant="outline">{mockFloatAST.metadata?.source}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-muted-foreground font-mono text-sm">Personas:</span>
                <div className="flex gap-1 mt-1">
                  {mockFloatAST.metadata?.personas?.map(persona => (
                    <Badge key={persona} className="bg-blue-500/10 text-blue-400">
                      {persona}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground font-mono text-sm">Tags:</span>
                <div className="flex gap-1 mt-1">
                  {mockFloatAST.metadata?.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temporal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Temporal Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Created:</span>
                  <span className="font-mono">
                    {mockFloatAST.temporal?.created && 
                      new Date(mockFloatAST.temporal.created).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Modified:</span>
                  <span className="font-mono">
                    {mockFloatAST.temporal?.modified && 
                      new Date(mockFloatAST.temporal.modified).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Duration:</span>
                  <span className="font-mono">
                    {mockFloatAST.temporal?.duration && 
                      `${Math.floor(mockFloatAST.temporal.duration / 60)}m ${mockFloatAST.temporal.duration % 60}s`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pattern Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Pattern Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Context Markers:</span>
                  <Badge variant="outline" className="font-mono">
                    {mockFloatAST.patterns?.ctx_markers}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Dispatches:</span>
                  <Badge variant="outline" className="font-mono">
                    {mockFloatAST.patterns?.float_dispatches}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Bridges:</span>
                  <Badge variant="outline" className="font-mono">
                    {mockFloatAST.patterns?.bridge_creates}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-mono">Persona Switches:</span>
                  <Badge variant="outline" className="font-mono">
                    {mockFloatAST.patterns?.persona_switches}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transform Config */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Transform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">Preferred Output:</span>
                <Badge className="bg-purple-500/10 text-purple-400">
                  {mockFloatAST.transforms?.preferred_output}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono">Depth Level:</span>
                <Badge variant="outline" className="font-mono">
                  {mockFloatAST.transforms?.depth_level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Raw FloatAST JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <pre className="text-xs font-mono bg-muted/50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(mockFloatAST, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}