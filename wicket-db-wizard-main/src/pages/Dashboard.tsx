import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Activity, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [stats, setStats] = useState({ players: 0, teams: 0, matches: 0, awards: 0 });
  const [topScorers, setTopScorers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [playersRes, teamsRes, matchesRes, awardsRes] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("awards").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        players: playersRes.count || 0,
        teams: teamsRes.count || 0,
        matches: matchesRes.count || 0,
        awards: awardsRes.count || 0,
      });

      // Query top scorers manually
      const { data: scorersData } = await supabase
        .from("performance")
        .select("player_id, runs, players(player_name)")
        .order("runs", { ascending: false })
        .limit(10);
      
      if (scorersData) {
        const aggregated = scorersData.reduce((acc: any, curr: any) => {
          const name = curr.players?.player_name || "Unknown";
          if (!acc[name]) acc[name] = { player_name: name, total_runs: 0 };
          acc[name].total_runs += curr.runs || 0;
          return acc;
        }, {});
        setTopScorers(Object.values(aggregated).slice(0, 5));
      }

      const { data: matchesData } = await supabase
        .from("match_performance_summary")
        .select("*")
        .limit(10);
      if (matchesData) setRecentMatches(matchesData);
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const statCards = [
    { title: "Total Players", value: stats.players, icon: Users, color: "text-primary" },
    { title: "Total Teams", value: stats.teams, icon: TrendingUp, color: "text-secondary" },
    { title: "Total Matches", value: stats.matches, icon: Activity, color: "text-accent" },
    { title: "Total Awards", value: stats.awards, icon: Trophy, color: "text-primary" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Cricket Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive database management system showcasing SQL operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <DataTable data={topScorers} title="Top Run Scorers" />
          <DataTable data={recentMatches} title="Recent Match Performances" />
        </div>
      </div>
    </Layout>
  );
}
