import { ThreadBuilder } from "@/components/ThreadBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Threads() {
  const handleThreadsChange = (threads: any[]) => {
    console.log("Threads updated:", threads);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold">Thread Builder</h1>
        <p className="text-muted-foreground">
          Organize FloatAST nodes into cohesive thematic threads
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Thread Organization</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ThreadBuilder onThreadsChange={handleThreadsChange} />
        </CardContent>
      </Card>
    </div>
  );
}