import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandPalette } from "@/components/CommandPalette";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pages
import Home from "@/pages/Home";
import Conversations from "@/pages/Conversations";
import Threads from "@/pages/Threads";
import Zines from "@/pages/Zines";
import AST from "@/pages/AST";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/threads" component={Threads} />
      <Route path="/zines" component={Zines} />
      <Route path="/ast" component={AST} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcuts
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

  // Custom sidebar width for terminal aesthetic
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="font-mono text-sm text-muted-foreground">
                    Agentic Zine Network
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCommandPaletteOpen(true)}
                    data-testid="button-command-palette-global"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline font-mono">⌘K</span>
                  </Button>
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-6 py-6">
                  <Router />
                </div>
              </main>
            </div>
          </div>
          <CommandPalette 
            open={commandPaletteOpen} 
            onOpenChange={setCommandPaletteOpen} 
          />
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}