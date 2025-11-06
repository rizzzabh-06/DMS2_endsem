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

export const PlayerForm = () => {
  const [formData, setFormData] = useState({
    player_name: "",
    dob: "",
    team_id: "",
    role: "",
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState([]);
  const [executedSql, setExecutedSql] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [teamsRes, playersRes] = await Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
    ]);
    if (teamsRes.data) setTeams(teamsRes.data);
    if (playersRes.data) setPlayers(playersRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sql = `INSERT INTO players (player_name, dob, team_id, role) VALUES ('${formData.player_name}', '${formData.dob}', ${formData.team_id}, '${formData.role}');`;
    setExecutedSql(sql);

    const { error } = await supabase.from("players").insert({
      ...formData,
      team_id: parseInt(formData.team_id),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("sql_logs").insert({ sql_text: sql, operation_type: "INSERT" });
    toast({ title: "Success", description: "Player added successfully" });
    setFormData({ player_name: "", dob: "", team_id: "", role: "" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player_name">Player Name *</Label>
              <Input
                id="player_name"
                value={formData.player_name}
                onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={formData.team_id} onValueChange={(v) => setFormData({ ...formData, team_id: v })}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Batsman">Batsman</SelectItem>
                  <SelectItem value="Bowler">Bowler</SelectItem>
                  <SelectItem value="All-rounder">All-rounder</SelectItem>
                  <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
              <Button type="button" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {executedSql && <SqlDisplay sql={executedSql} />}
      <DataTable data={players} title="All Players" />
    </div>
  );
};
