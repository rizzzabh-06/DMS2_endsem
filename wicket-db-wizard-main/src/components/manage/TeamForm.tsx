import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SqlDisplay } from "@/components/SqlDisplay";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export const TeamForm = () => {
  const [formData, setFormData] = useState({ team_name: "", coach: "", country: "" });
  const [executedSql, setExecutedSql] = useState("");
  const [teams, setTeams] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const { data } = await supabase.from("teams").select("*");
    if (data) setTeams(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sql = `INSERT INTO teams (team_name, coach, country) VALUES ('${formData.team_name}', '${formData.coach}', '${formData.country}');`;
    setExecutedSql(sql);

    const { error } = await supabase.from("teams").insert(formData);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("sql_logs").insert({ sql_text: sql, operation_type: "INSERT" });
    toast({ title: "Success", description: "Team added successfully" });
    setFormData({ team_name: "", coach: "", country: "" });
    loadTeams();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team_name">Team Name *</Label>
              <Input
                id="team_name"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach">Coach</Label>
              <Input
                id="coach"
                value={formData.coach}
                onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
              <Button type="button" variant="outline" onClick={loadTeams}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {executedSql && <SqlDisplay sql={executedSql} />}
      <DataTable data={teams} title="All Teams" />
    </div>
  );
};
