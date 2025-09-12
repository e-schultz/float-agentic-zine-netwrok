import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  FileText, 
  Network, 
  TrendingUp, 
  Clock, 
  Zap,
  Plus,
  ArrowRight,
  Bot
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  conversations: number;
  fragments: number;
  threads: number;
  zines: number;
  parsingActive: boolean;
}

interface RecentActivity {
  id: string;
  type: "conversation" | "thread" | "zine" | "fragment";
  title: string;
  timestamp: string;
  status: "processing" | "completed" | "draft";
}

export function Dashboard() {
  // todo: remove mock functionality
  const [stats] = useState<DashboardStats>({
    conversations: 23,
    fragments: 127,
    threads: 18,
    zines: 8,
    parsingActive: true,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "conversation",
      title: "Digital Consciousness Exploration",
      timestamp: "2 minutes ago",
      status: "processing",
    },
    {
      id: "2", 
      type: "zine",
      title: "Patterns in Dialogue",
      timestamp: "1 hour ago",
      status: "completed",
    },
    {
      id: "3",
      type: "thread",
      title: "Information Processing Insights",
      timestamp: "3 hours ago",
      status: "completed",
    },
    {
      id: "4",
      type: "fragment",
      title: "Emergent meaning through conversation",
      timestamp: "5 hours ago",
      status: "completed",
    },
  ]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-4 w-4" />;
      case "thread":
        return <Network className="h-4 w-4" />;
      case "zine":
        return <FileText className="h-4 w-4" />;
      case "fragment":
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500/10 text-yellow-400";
      case "completed":
        return "bg-green-500/10 text-green-400";
      case "draft":
        return "bg-blue-500/10 text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-mono font-bold mb-2">
            Welcome to Agentic Zine Network
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Transform conversations into structured publications using AI-powered FloatAST parsing
          </p>
          <div className="flex gap-3">
            <Button asChild data-testid="button-new-conversation">
              <Link href="/conversations">
                <Plus className="h-4 w-4 mr-2" />
                Start Conversation
              </Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-explore-zines">
              <Link href="/zines">
                <FileText className="h-4 w-4 mr-2" />
                Explore Zines
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-opacity="0.02"><circle cx="3" cy="3" r="3"/></g></svg>')}")`,
        }} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium">
              Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.conversations}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium">
              Fragments
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.fragments}</div>
            <p className="text-xs text-muted-foreground">
              +15 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium">
              Threads
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.threads}</div>
            <p className="text-xs text-muted-foreground">
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono font-medium">
              Published Zines
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.zines}</div>
            <p className="text-xs text-muted-foreground">
              +1 this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono">
              <Bot className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">FloatAST Parser</span>
              <Badge className={stats.parsingActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}>
                {stats.parsingActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-mono">Processing Queue</span>
                <span className="font-mono">3/10</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-mono">Storage Used</span>
                <span className="font-mono">2.3/10 GB</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>

            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-mono text-sm font-medium">Recent Operations</h4>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fragment extraction</span>
                  <span className="text-green-400">✓ Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thread clustering</span>
                  <span className="text-yellow-400">⟳ Processing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zine generation</span>
                  <span className="text-muted-foreground">⋯ Queued</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-mono">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/activity">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="/conversations">
                <div className="text-left">
                  <div className="font-mono font-medium">Import Conversation</div>
                  <div className="text-sm text-muted-foreground">
                    Upload chat logs or text files
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="/threads">
                <div className="text-left">
                  <div className="font-mono font-medium">Build Thread</div>
                  <div className="text-sm text-muted-foreground">
                    Organize fragments into themes
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="/zines">
                <div className="text-left">
                  <div className="font-mono font-medium">Create Zine</div>
                  <div className="text-sm text-muted-foreground">
                    Transform threads into publications
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}