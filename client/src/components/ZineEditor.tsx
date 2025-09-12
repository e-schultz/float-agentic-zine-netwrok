import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Eye, Edit3, Save, Plus, Trash2 } from "lucide-react";
import type { FloatAST } from "@shared/schema";

interface ZineSection {
  id: string;
  title: string;
  content: string;
  nodeIds: string[];
}

interface ZineEditorProps {
  floatAst?: FloatAST;
  onSave?: (zine: { title: string; sections: ZineSection[] }) => void;
}

export function ZineEditor({ floatAst, onSave }: ZineEditorProps) {
  const [title, setTitle] = useState("Untitled Zine");
  const [sections, setSections] = useState<ZineSection[]>([
    {
      id: "intro",
      title: "Introduction",
      content: "Welcome to this exploration of consciousness and conversation...",
      nodeIds: ["node1"],
    },
    {
      id: "analysis",
      title: "Pattern Analysis",
      content: "Through our dialogue, several key themes emerged...",
      nodeIds: ["node2"],
    },
  ]);
  const [previewMode, setPreviewMode] = useState(false);

  const addSection = () => {
    const newSection: ZineSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      content: "Begin writing here...",
      nodeIds: [],
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<ZineSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSave = () => {
    onSave?.({ title, sections });
    console.log("Zine saved:", { title, sections });
  };

  if (previewMode) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-mono">
            <Eye className="h-5 w-5" />
            Zine Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(false)}
              data-testid="button-edit-mode"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleSave} data-testid="button-save-zine">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <h1 className="font-mono text-3xl mb-8">{title}</h1>
              
              {sections.map((section, index) => (
                <section key={section.id} className="mb-8">
                  <h2 className="font-mono text-xl mb-4">{section.title}</h2>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </div>
                  {index < sections.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </section>
              ))}
              
              <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground">
                <p>Generated from FloatAST conversation analysis</p>
                <p>Created with Agentic Zine Network</p>
              </footer>
            </article>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-mono">
          <FileText className="h-5 w-5" />
          Zine Editor
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
            data-testid="button-preview-mode"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} data-testid="button-save-zine">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Editor */}
        <div>
          <label className="text-sm font-medium font-mono mb-2 block">
            Zine Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-mono text-lg"
            data-testid="input-zine-title"
          />
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium font-mono">Sections</label>
            <Button 
              size="sm" 
              onClick={addSection}
              data-testid="button-add-section"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {sections.map((section, index) => (
                <Card key={section.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="font-mono font-medium"
                        placeholder="Section title"
                        data-testid={`input-section-title-${index}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSection(section.id)}
                        data-testid={`button-remove-section-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={6}
                      className="resize-none"
                      placeholder="Write your section content here..."
                      data-testid={`textarea-section-content-${index}`}
                    />
                    
                    {section.nodeIds.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          Linked nodes:
                        </span>
                        {section.nodeIds.map(nodeId => (
                          <Badge key={nodeId} variant="outline" className="text-xs">
                            {nodeId}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}