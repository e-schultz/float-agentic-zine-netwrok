import { useState, useEffect } from "react";
import { Search, Terminal, FileText, Zap, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const executeCommand = (command: Command) => {
    console.log(`Executing command: ${command.title}`);
    onOpenChange(false);
    setSearch("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0" data-testid="dialog-command-palette">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-mono">Command Palette</DialogTitle>
        </DialogHeader>
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
                  data-testid={`button-command-${command.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {command.icon}
                    <div className="flex-1 text-left">
                      <div className="font-mono font-medium">{command.title}</div>
                      <div className="text-sm text-muted-foreground">
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
                      <Badge variant="outline" className="text-xs font-mono">
                        {command.shortcut}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}