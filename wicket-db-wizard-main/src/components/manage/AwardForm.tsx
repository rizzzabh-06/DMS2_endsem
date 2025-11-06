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

export const AwardForm = () => {
  const [formData, setFormData] = useState({
    player_id: "",
    match_id: "",
    award_name: "",
  });
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [awards, setAwards] = useState([]);
  const [executedSql, setExecutedSql] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [playersRes, matchesRes, awardsRes] = await Promise.all([
      supabase.from("players").select("*"),
      supabase.from("matches").select("*"),
      supabase.from("awards").select("*"),
    ]);
    if (playersRes.data) setPlayers(playersRes.data);
    if (matchesRes.data) setMatches(matchesRes.data);
    if (awardsRes.data) setAwards(awardsRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sql = `INSERT INTO awards (player_id, match_id, award_name) VALUES (${formData.player_id}, ${formData.match_id}, '${formData.award_name}');`;
    setExecutedSql(sql);

    const { error } = await supabase.from("awards").insert({
      player_id: parseInt(formData.player_id),
      match_id: parseInt(formData.match_id),
      award_name: formData.award_name,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("sql_logs").insert({ sql_text: sql, operation_type: "INSERT" });
    toast({ title: "Success", description: "Award added successfully" });
    setFormData({ player_id: "", match_id: "", award_name: "" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Award</CardTitle>
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
            <div className="space-y-2">
              <Label htmlFor="award_name">Award Name *</Label>
              <Select value={formData.award_name} onValueChange={(v) => setFormData({ ...formData, award_name: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select award" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Player of the Match">Player of the Match</SelectItem>
                  <SelectItem value="Best Bowler">Best Bowler</SelectItem>
                  <SelectItem value="Best Batsman">Best Batsman</SelectItem>
                  <SelectItem value="Best Fielder">Best Fielder</SelectItem>
                  <SelectItem value="Man of the Series">Man of the Series</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Award
              </Button>
              <Button type="button" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {executedSql && <SqlDisplay sql={executedSql} />}
      <DataTable data={awards} title="All Awards" />
    </div>
  );
};
