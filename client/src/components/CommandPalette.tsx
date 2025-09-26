import { useState, useEffect } from "react";
import { Search, Terminal, FileText, Zap, Database, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  shortcut: string;
  category: "parse" | "query" | "create" | "system";
}

const commands: Command[] = [
  {
    id: "sift",
    title: "/sift",
    description: "Extract fragments from conversation",
    icon: <Search className="h-4 w-4" />,
    shortcut: "⌘S",
    category: "parse",
  },
  {
    id: "bind",
    title: "/bind",
    description: "Cluster fragments into threads",
    icon: <Zap className="h-4 w-4" />,
    shortcut: "⌘B",
    category: "query",
  },
  {
    id: "render",
    title: "/render",
    description: "Generate zine from FloatAST",
    icon: <FileText className="h-4 w-4" />,
    shortcut: "⌘R",
    category: "create",
  },
  {
    id: "ast",
    title: "/ast",
    description: "View FloatAST structure",
    icon: <Database className="h-4 w-4" />,
    shortcut: "⌘A",
    category: "system",
  },
  {
    id: "terminal",
    title: "/terminal",
    description: "Open system terminal",
    icon: <Terminal className="h-4 w-4" />,
    shortcut: "⌘T",
    category: "system",
  },
];

interface Fragment {
  text: string;
  relevance: string;
  keywords: string[];
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConversationId?: string;
  currentFloatAstId?: string;
}

export function CommandPalette({ open, onOpenChange, currentConversationId, currentFloatAstId }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<"commands" | "sift" | "bind">("commands");
  const [siftQuery, setSiftQuery] = useState("");
  const [extractedFragments, setExtractedFragments] = useState<Fragment[]>([]);
  const { toast } = useToast();

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    }
  };

  // AI Fragment extraction mutation
  const extractFragmentsMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!currentFloatAstId) throw new Error("No FloatAST available");
      const response = await fetch(`/api/float-asts/${currentFloatAstId}/extract-fragments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, maxFragments: 10 }),
      });
      if (!response.ok) throw new Error("Failed to extract fragments");
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedFragments(data.fragments || []);
      toast({
        title: "Success",
        description: `Extracted ${data.fragments?.length || 0} fragments`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extract fragments",
      });
    },
  });

  const executeCommand = (command: Command) => {
    if (command.id === "sift") {
      if (!currentFloatAstId) {
        toast({
          title: "Error",
          description: "No conversation parsed yet. Please parse a conversation first.",
        });
        return;
      }
      setMode("sift");
      setSearch("");
      return;
    }
    
    if (command.id === "bind") {
      if (extractedFragments.length === 0) {
        toast({
          title: "Error", 
          description: "No fragments available. Use /sift to extract fragments first.",
        });
        return;
      }
      setMode("bind");
      setSearch("");
      return;
    }
    
    // Handle other commands
    console.log(`Executing command: ${command.title}`);
    onOpenChange(false);
    setSearch("");
    resetState();
  };
  
  const resetState = () => {
    setMode("commands");
    setSiftQuery("");
    setExtractedFragments([]);
  };
  
  const handleSiftSubmit = () => {
    if (siftQuery.trim()) {
      extractFragmentsMutation.mutate(siftQuery.trim());
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => resetState(), 200); // Reset after dialog animation
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "parse":
        return "bg-blue-500/10 text-blue-400";
      case "query":
        return "bg-purple-500/10 text-purple-400";
      case "create":
        return "bg-green-500/10 text-green-400";
      case "system":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderCommandsList = () => (
    <>
      <div className="px-6">
        <Input
          placeholder="Type a command or search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-mono"
          data-testid="input-command-search"
          autoFocus
        />
      </div>
      <div className="max-h-80 overflow-y-auto px-6 pb-6">
        {filteredCommands.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No commands found
          </div>
        ) : (
          <div className="space-y-1 mt-4">
            {filteredCommands.map((command, index) => (
              <Button
                key={command.id}
                variant={index === selectedIndex ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-auto p-3"
                onClick={() => executeCommand(command)}
                data-testid={`command-${command.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {command.icon}
                  <div className="flex-1 text-left">
                    <div className="font-mono text-sm">{command.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(command.category)}`}
                    >
                      {command.category}
                    </Badge>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">
                      {command.shortcut}
                    </kbd>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderSiftMode = () => (
    <>
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("commands")}
            data-testid="button-back-to-commands"
          >
            ← Back to Commands
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium font-mono">Fragment Query</label>
          <Textarea
            placeholder="Describe what fragments you want to extract...\n\nExample: 'technical discussions about AI' or 'creative insights about writing'"
            value={siftQuery}
            onChange={(e) => setSiftQuery(e.target.value)}
            className="font-mono text-sm min-h-[100px]"
            data-testid="textarea-sift-query"
            autoFocus
          />
        </div>
        <Button
          onClick={handleSiftSubmit}
          disabled={!siftQuery.trim() || extractFragmentsMutation.isPending}
          className="w-full"
          data-testid="button-extract-fragments"
        >
          {extractFragmentsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Fragments...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Extract Fragments
            </>
          )}
        </Button>
      </div>
      
      {extractedFragments.length > 0 && (
        <div className="px-6 pb-6">
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h3 className="font-mono text-sm font-medium">Extracted Fragments ({extractedFragments.length})</h3>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {extractedFragments.map((fragment, index) => (
                  <Card key={index} className="p-3">
                    <CardContent className="p-0 space-y-2">
                      <div className="text-sm">{fragment.text}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {fragment.category}
                        </Badge>
                        <span>{fragment.relevance}</span>
                      </div>
                      {fragment.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {fragment.keywords.map((keyword, kIndex) => (
                            <Badge key={kIndex} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("bind")}
                className="flex-1"
                data-testid="button-proceed-to-bind"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Proceed to /bind
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderBindMode = () => (
    <>
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("sift")}
            data-testid="button-back-to-sift"
          >
            ← Back to Fragments
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-medium">Thread Builder</h3>
          <p className="text-sm text-muted-foreground">
            Organize extracted fragments into coherent threads
          </p>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {extractedFragments.length} fragments available for threading
          </div>
          <Button
            variant="outline"
            className="w-full"
            data-testid="button-create-thread"
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto-Generate Threads
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0" data-testid="dialog-command-palette">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-mono">
            {mode === "commands" && "Command Palette"}
            {mode === "sift" && "/sift - Extract Fragments"}
            {mode === "bind" && "/bind - Create Threads"}
          </DialogTitle>
        </DialogHeader>
        {mode === "commands" && renderCommandsList()}
        {mode === "sift" && renderSiftMode()}
        {mode === "bind" && renderBindMode()}
      </DialogContent>
    </Dialog>
  );
}