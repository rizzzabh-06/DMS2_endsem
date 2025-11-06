import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SqlDisplay } from "@/components/SqlDisplay";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, Zap } from "lucide-react";

export default function Triggers() {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matchId, setMatchId] = useState("");
  const [score1, setScore1] = useState({ teamId: "", score: "" });
  const [score2, setScore2] = useState({ teamId: "", score: "" });
  const [executedSql, setExecutedSql] = useState("");
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    subscribeToResults();
  }, []);

  const loadData = async () => {
    const [matchesRes, teamsRes] = await Promise.all([
      supabase.from("matches").select("*").order("match_date", { ascending: false }),
      supabase.from("teams").select("*"),
    ]);

    if (matchesRes.data) setMatches(matchesRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);
  };

  const subscribeToResults = () => {
    const channel = supabase
      .channel("match_result_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_result",
        },
        async () => {
          await loadMatchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMatchResults = async () => {
    const { data } = await supabase
      .from("match_result")
      .select(`
        *,
        matches(match_date, venue),
        teams(team_name)
      `)
      .order("result_id", { ascending: false })
      .limit(10);

    if (data) {
      const formatted = data.map((r: any) => ({
        match_id: r.match_id,
        date: r.matches?.match_date,
        venue: r.matches?.venue,
        winner: r.teams?.team_name,
        margin: r.margin,
      }));
      setMatchResults(formatted);
    }
  };

  const insertScores = async () => {
    try {
      if (!matchId || !score1.teamId || !score1.score || !score2.teamId || !score2.score) {
        toast({
          title: "Validation error",
          description: "Please fill all fields",
          variant: "destructive",
        });
        return;
      }

      const sql = `INSERT INTO match_scores (match_id, team_id, score) VALUES
(${matchId}, ${score1.teamId}, ${score1.score}),
(${matchId}, ${score2.teamId}, ${score2.score});`;

      setExecutedSql(sql);

      const { error: error1 } = await supabase.from("match_scores").insert({
        match_id: parseInt(matchId),
        team_id: parseInt(score1.teamId),
        score: parseInt(score1.score),
      });

      const { error: error2 } = await supabase.from("match_scores").insert({
        match_id: parseInt(matchId),
        team_id: parseInt(score2.teamId),
        score: parseInt(score2.score),
      });

      if (error1 || error2) throw error1 || error2;

      await supabase.from("sql_logs").insert({
        sql_text: sql,
        operation_type: "INSERT",
      });

      await loadMatchResults();

      toast({
        title: "Trigger executed successfully",
        description: "Scores inserted and match_result automatically updated!",
      });

      setScore1({ teamId: "", score: "" });
      setScore2({ teamId: "", score: "" });
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMatchResults();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Triggers</h1>
          <p className="text-muted-foreground mt-2">
            Demonstrate automatic match result calculation using database triggers
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Trigger Demo: Auto-Calculate Match Results</CardTitle>
            </div>
            <CardDescription>
              When you insert scores for both teams, the trigger automatically calculates the winner
              and margin, then inserts/updates the match_result table
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Match</Label>
              <Select value={matchId} onValueChange={setMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a match" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.match_id} value={match.match_id.toString()}>
                      Match {match.match_id} - {match.match_date} ({match.venue})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team 1</Label>
                <Select value={score1.teamId} onValueChange={(v) => setScore1({ ...score1, teamId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id.toString()}>
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Score"
                  value={score1.score}
                  onChange={(e) => setScore1({ ...score1, score: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Team 2</Label>
                <Select value={score2.teamId} onValueChange={(v) => setScore2({ ...score2, teamId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id.toString()}>
                        {team.team_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Score"
                  value={score2.score}
                  onChange={(e) => setScore2({ ...score2, score: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={insertScores} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Insert Scores & Trigger Result Calculation
            </Button>
          </CardContent>
        </Card>

        {executedSql && <SqlDisplay sql={executedSql} title="SQL Executed (Trigger Fired)" />}

        <DataTable data={matchResults} title="Auto-Generated Match Results (Live Updates)" />
      </div>
    </Layout>
  );
}
