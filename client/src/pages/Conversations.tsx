import { ConversationReader } from "@/components/ConversationReader";
import { CommandPalette } from "@/components/CommandPalette";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Search, Plus, FileText } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConversationSchema, type Conversation } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Form schema for creating conversations
const conversationFormSchema = insertConversationSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type ConversationFormData = z.infer<typeof conversationFormSchema>;

export default function Conversations() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch conversations from API
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
  });

  // Get selected conversation
  const { data: selectedConversation } = useQuery({
    queryKey: ["/api/conversations", selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return null;
      const response = await fetch(`/api/conversations/${selectedConversationId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation");
      return response.json() as Promise<Conversation>;
    },
    enabled: !!selectedConversationId,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: ConversationFormData) => {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setUploadDialogOpen(false);
      toast({ title: "Success", description: "Conversation uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to upload conversation" });
    },
  });

  // Form for creating conversations
  const form = useForm<ConversationFormData>({
    resolver: zodResolver(conversationFormSchema),
    defaultValues: {
      title: "",
      content: "",
      userId: null, // In a real app, this would come from authentication
    },
  });

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

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const onSubmit = (data: ConversationFormData) => {
    createConversationMutation.mutate(data);
  };

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
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-conversation">
                <Upload className="h-4 w-4 mr-2" />
                Import Conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-mono">Import Conversation</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter conversation title" {...field} data-testid="input-conversation-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your conversation content here...\n\nUser: Hello\nAssistant: Hi there! How can I help?"
                            className="min-h-[300px] font-mono text-sm"
                            {...field}
                            data-testid="textarea-conversation-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createConversationMutation.isPending}
                      data-testid="button-submit-conversation"
                    >
                      {createConversationMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Conversation List */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm">Conversations ({conversations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversationsLoading ? (
                <div className="text-muted-foreground text-sm">Loading conversations...</div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    data-testid={`button-conversation-${conversation.id}`}
                  >
                    <div className="flex flex-col items-start">
                      <div className="font-mono text-sm font-medium truncate w-full">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(conversation.createdAt || '').toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No conversations yet
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => setUploadDialogOpen(true)}
                    data-testid="button-upload-first-conversation"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Conversation */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm">
                {selectedConversation ? selectedConversation.title : "Select a Conversation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedConversation ? (
                <ConversationReader 
                  conversation={selectedConversation.content} 
                  conversationId={selectedConversation.id}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Select a conversation to view its content
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </div>
  );
}