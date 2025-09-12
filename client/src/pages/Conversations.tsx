import { ConversationReader } from "@/components/ConversationReader";
import { CommandPalette } from "@/components/CommandPalette";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search } from "lucide-react";

export default function Conversations() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold">Conversation Reader</h1>
          <p className="text-muted-foreground">
            View and analyze conversation streams with FloatAST parsing
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCommandPaletteOpen(true)}
            data-testid="button-open-command-palette"
          >
            <Search className="h-4 w-4 mr-2" />
            Commands (⌘K)
          </Button>
          <Button data-testid="button-upload-conversation">
            <Upload className="h-4 w-4 mr-2" />
            Import Conversation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Active Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ConversationReader conversation="Sample conversation data" />
        </CardContent>
      </Card>

      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </div>
  );
}