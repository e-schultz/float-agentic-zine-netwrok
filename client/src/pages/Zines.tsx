import { ZineEditor } from "@/components/ZineEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Zines() {
  const handleSave = (zine: { title: string; sections: any[] }) => {
    console.log("Zine saved:", zine);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold">Zine Editor</h1>
        <p className="text-muted-foreground">
          Transform threads into polished publications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono">Publication Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ZineEditor onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  );
}