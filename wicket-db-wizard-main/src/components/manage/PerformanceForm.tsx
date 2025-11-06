import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SqlDisplay } from "@/components/SqlDisplay";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";

export const PerformanceForm = () => {
  const [formData, setFormData] = useState({
    player_id: "",
    match_id: "",
    runs: "0",
    wickets: "0",
    catches: "0",
  });
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [performances, setPerformances] = useState([]);
  const [executedSql, setExecutedSql] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [playersRes, matchesRes, perfRes] = await Promise.all([
      supabase.from("players").select("*"),
      supabase.from("matches").select("*"),
      supabase.from("performance").select("*"),
    ]);
    if (playersRes.data) setPlayers(playersRes.data);
    if (matchesRes.data) setMatches(matchesRes.data);
    if (perfRes.data) setPerformances(perfRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sql = `INSERT INTO performance (player_id, match_id, runs, wickets, catches) VALUES (${formData.player_id}, ${formData.match_id}, ${formData.runs}, ${formData.wickets}, ${formData.catches});`;
    setExecutedSql(sql);

    const { error } = await supabase.from("performance").insert({
      player_id: parseInt(formData.player_id),
      match_id: parseInt(formData.match_id),
      runs: parseInt(formData.runs),
      wickets: parseInt(formData.wickets),
      catches: parseInt(formData.catches),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("sql_logs").insert({ sql_text: sql, operation_type: "INSERT" });
    toast({ title: "Success", description: "Performance added successfully" });
    setFormData({ player_id: "", match_id: "", runs: "0", wickets: "0", catches: "0" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Player</Label>
              <Select value={formData.player_id} onValueChange={(v) => setFormData({ ...formData, player_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.player_id} value={p.player_id.toString()}>
                      {p.player_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Match</Label>
              <Select value={formData.match_id} onValueChange={(v) => setFormData({ ...formData, match_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select match" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.match_id} value={m.match_id.toString()}>
                      Match {m.match_id} - {m.match_date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="runs">Runs</Label>
                <Input
                  id="runs"
                  type="number"
                  value={formData.runs}
                  onChange={(e) => setFormData({ ...formData, runs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wickets">Wickets</Label>
                <Input
                  id="wickets"
                  type="number"
                  value={formData.wickets}
                  onChange={(e) => setFormData({ ...formData, wickets: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catches">Catches</Label>
                <Input
                  id="catches"
                  type="number"
                  value={formData.catches}
                  onChange={(e) => setFormData({ ...formData, catches: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Performance
              </Button>
              <Button type="button" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {executedSql && <SqlDisplay sql={executedSql} />}
      <DataTable data={performances} title="All Performance Records" />
    </div>
  );
};
