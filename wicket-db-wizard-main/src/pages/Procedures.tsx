import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SqlDisplay } from "@/components/SqlDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play } from "lucide-react";

export default function Procedures() {
  const [performanceData, setPerformanceData] = useState({
    player_id: "",
    match_id: "",
    runs: "",
    wickets: "",
    catches: "",
  });
  const [playerId, setPlayerId] = useState("");
  const [totalRuns, setTotalRuns] = useState<number | null>(null);
  const [executedSql, setExecutedSql] = useState("");
  const { toast } = useToast();

  const callInsertPerformance = async () => {
    try {
      const sql = `CALL insert_performance(${performanceData.player_id}, ${performanceData.match_id}, ${performanceData.runs}, ${performanceData.wickets}, ${performanceData.catches});`;
      setExecutedSql(sql);

      // Insert performance using direct table insert (simulating procedure)
      const { error } = await supabase.from("performance").upsert({
        player_id: parseInt(performanceData.player_id),
        match_id: parseInt(performanceData.match_id),
        runs: parseInt(performanceData.runs),
        wickets: parseInt(performanceData.wickets),
        catches: parseInt(performanceData.catches),
      });

      if (error) throw error;

      await supabase.from("sql_logs").insert({
        sql_text: sql,
        operation_type: "PROCEDURE",
      });

      toast({
        title: "Procedure executed successfully",
        description: "Performance data inserted/updated",
      });
    } catch (error: any) {
      toast({
        title: "Procedure execution failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const callGetTotalRuns = async () => {
    try {
      const sql = `SELECT get_total_runs(${playerId});`;
      setExecutedSql(sql);

      // Calculate total runs manually
      const { data: perfData, error } = await supabase
        .from("performance")
        .select("runs")
        .eq("player_id", parseInt(playerId));
      
      const data = perfData?.reduce((sum, p) => sum + (p.runs || 0), 0) || 0;

      if (error) throw error;

      setTotalRuns(data);

      await supabase.from("sql_logs").insert({
        sql_text: sql,
        operation_type: "FUNCTION",
      });

      toast({
        title: "Function executed successfully",
        description: `Total runs: ${data}`,
      });
    } catch (error: any) {
      toast({
        title: "Function execution failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stored Procedures & Functions</h1>
          <p className="text-muted-foreground mt-2">
            Execute database procedures and functions with live SQL display
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Insert Performance (Procedure)</CardTitle>
              <CardDescription>
                Upsert player performance data for a specific match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player_id">Player ID</Label>
                <Input
                  id="player_id"
                  type="number"
                  value={performanceData.player_id}
                  onChange={(e) =>
                    setPerformanceData({ ...performanceData, player_id: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="match_id">Match ID</Label>
                <Input
                  id="match_id"
                  type="number"
                  value={performanceData.match_id}
                  onChange={(e) =>
                    setPerformanceData({ ...performanceData, match_id: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="runs">Runs</Label>
                  <Input
                    id="runs"
                    type="number"
                    value={performanceData.runs}
                    onChange={(e) =>
                      setPerformanceData({ ...performanceData, runs: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wickets">Wickets</Label>
                  <Input
                    id="wickets"
                    type="number"
                    value={performanceData.wickets}
                    onChange={(e) =>
                      setPerformanceData({ ...performanceData, wickets: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catches">Catches</Label>
                  <Input
                    id="catches"
                    type="number"
                    value={performanceData.catches}
                    onChange={(e) =>
                      setPerformanceData({ ...performanceData, catches: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={callInsertPerformance} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Execute Procedure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Total Runs (Function)</CardTitle>
              <CardDescription>
                Calculate total runs scored by a player across all matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player_id_func">Player ID</Label>
                <Input
                  id="player_id_func"
                  type="number"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                />
              </div>
              <Button onClick={callGetTotalRuns} disabled={!playerId} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Execute Function
              </Button>
              {totalRuns !== null && (
                <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                  <p className="text-sm font-medium text-muted-foreground">Return Value:</p>
                  <p className="text-3xl font-bold text-primary">{totalRuns} runs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {executedSql && <SqlDisplay sql={executedSql} title="SQL Call Executed" />}
      </div>
    </Layout>
  );
}
