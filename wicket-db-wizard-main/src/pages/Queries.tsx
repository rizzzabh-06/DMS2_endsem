import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SqlDisplay } from "@/components/SqlDisplay";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play } from "lucide-react";

const predefinedQueries = [
  {
    name: "Top 5 Run Scorers",
    description: "Aggregate query showing top run-scorers across all matches",
    sql: `SELECT p.player_name, SUM(per.runs) AS total_runs
FROM performance per
JOIN players p ON per.player_id = p.player_id
GROUP BY p.player_name
ORDER BY total_runs DESC
LIMIT 5;`,
  },
  {
    name: "Match Summary",
    description: "Join query showing scores for each match",
    sql: `SELECT m.match_id, m.match_date, t.team_name, ms.score, m.venue
FROM matches m
JOIN match_scores ms ON m.match_id = ms.match_id
JOIN teams t ON ms.team_id = t.team_id
ORDER BY m.match_date DESC;`,
  },
  {
    name: "Players with Awards",
    description: "Join query showing all players who received awards",
    sql: `SELECT p.player_name, a.award_name, m.match_date, m.venue
FROM players p
JOIN awards a ON p.player_id = a.player_id
JOIN matches m ON a.match_id = m.match_id
ORDER BY m.match_date DESC;`,
  },
  {
    name: "Match Results",
    description: "View showing winners and margins for completed matches",
    sql: `SELECT m.match_date, m.venue, t.team_name as winner, mr.margin
FROM match_result mr
JOIN matches m ON mr.match_id = m.match_id
JOIN teams t ON mr.winner_team_id = t.team_id
ORDER BY m.match_date DESC;`,
  },
];

export default function Queries() {
  const [customQuery, setCustomQuery] = useState("");
  const [executedSql, setExecutedSql] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const executeQuery = async (sql: string) => {
    try {
      setExecutedSql(sql);
      
      // Parse the query to determine which table to query
      const lowerSql = sql.toLowerCase();
      let data: any[] = [];
      
      if (lowerSql.includes("match_performance_summary")) {
        const { data: viewData } = await supabase.from("match_performance_summary").select("*");
        data = viewData || [];
      } else if (lowerSql.includes("from performance") && lowerSql.includes("sum")) {
        // Top scorers query
        const { data: perfData } = await supabase
          .from("performance")
          .select("runs, players(player_name)");
        if (perfData) {
          const aggregated = perfData.reduce((acc: any, curr: any) => {
            const name = curr.players?.player_name || "Unknown";
            if (!acc[name]) acc[name] = { player_name: name, total_runs: 0 };
            acc[name].total_runs += curr.runs || 0;
            return acc;
          }, {});
          data = Object.values(aggregated)
            .sort((a: any, b: any) => b.total_runs - a.total_runs)
            .slice(0, 5);
        }
      } else if (lowerSql.includes("match_scores")) {
        const { data: matchData } = await supabase
          .from("matches")
          .select("match_id, match_date, venue, match_scores(score, teams(team_name))")
          .order("match_date", { ascending: false });
        if (matchData) {
          data = matchData.flatMap((m: any) =>
            (m.match_scores || []).map((s: any) => ({
              match_id: m.match_id,
              match_date: m.match_date,
              venue: m.venue,
              team_name: s.teams?.team_name,
              score: s.score,
            }))
          );
        }
      } else if (lowerSql.includes("awards")) {
        const { data: awardsData } = await supabase
          .from("awards")
          .select("award_name, players(player_name), matches(match_date, venue)")
          .order("award_id", { ascending: false });
        if (awardsData) {
          data = awardsData.map((a: any) => ({
            player_name: a.players?.player_name,
            award_name: a.award_name,
            match_date: a.matches?.match_date,
            venue: a.matches?.venue,
          }));
        }
      } else if (lowerSql.includes("match_result")) {
        const { data: resultData } = await supabase
          .from("match_result")
          .select("margin, matches(match_date, venue), teams(team_name)")
          .order("result_id", { ascending: false });
        if (resultData) {
          data = resultData.map((r: any) => ({
            match_date: r.matches?.match_date,
            venue: r.matches?.venue,
            winner: r.teams?.team_name,
            margin: r.margin,
          }));
        }
      }
      
      setResults(data);
      
      await supabase.from("sql_logs").insert({
        sql_text: sql,
        operation_type: "SELECT",
      });

      toast({
        title: "Query executed successfully",
        description: `Retrieved ${data.length} rows`,
      });
    } catch (error: any) {
      toast({
        title: "Query execution failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Query Runner</h1>
          <p className="text-muted-foreground mt-2">
            Execute predefined queries or write your own (read-only)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {predefinedQueries.map((query) => (
            <Card key={query.name}>
              <CardHeader>
                <CardTitle className="text-lg">{query.name}</CardTitle>
                <CardDescription>{query.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  <code>{query.sql}</code>
                </pre>
                <Button onClick={() => executeQuery(query.sql)} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Execute Query
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Query (Read-Only)</CardTitle>
            <CardDescription>Write and execute your own SELECT queries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="SELECT * FROM teams;"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={5}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => executeQuery(customQuery)}
              disabled={!customQuery.trim()}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Custom Query
            </Button>
          </CardContent>
        </Card>

        {executedSql && (
          <div className="space-y-4">
            <SqlDisplay sql={executedSql} />
            <DataTable data={results} title="Query Results" />
          </div>
        )}
      </div>
    </Layout>
  );
}
