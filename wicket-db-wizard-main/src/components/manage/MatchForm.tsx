import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SqlDisplay } from "@/components/SqlDisplay";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";

export const MatchForm = () => {
  const [formData, setFormData] = useState({ match_date: "", venue: "" });
  const [matches, setMatches] = useState([]);
  const [executedSql, setExecutedSql] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const { data } = await supabase.from("matches").select("*").order("match_date", { ascending: false });
    if (data) setMatches(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sql = `INSERT INTO matches (match_date, venue) VALUES ('${formData.match_date}', '${formData.venue}');`;
    setExecutedSql(sql);

    const { error } = await supabase.from("matches").insert(formData);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("sql_logs").insert({ sql_text: sql, operation_type: "INSERT" });
    toast({ title: "Success", description: "Match added successfully" });
    setFormData({ match_date: "", venue: "" });
    loadMatches();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Match</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match_date">Match Date *</Label>
              <Input
                id="match_date"
                type="date"
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add Match
              </Button>
              <Button type="button" variant="outline" onClick={loadMatches}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {executedSql && <SqlDisplay sql={executedSql} />}
      <DataTable data={matches} title="All Matches" />
    </div>
  );
};
