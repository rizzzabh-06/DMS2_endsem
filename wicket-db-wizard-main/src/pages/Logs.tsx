import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Code, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("sql_logs")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(20);

    if (data) setLogs(data);
  };

  const getOperationColor = (op: string) => {
    const colors: Record<string, string> = {
      SELECT: "bg-secondary",
      INSERT: "bg-primary",
      UPDATE: "bg-accent",
      DELETE: "bg-destructive",
      PROCEDURE: "bg-primary",
      FUNCTION: "bg-secondary",
    };
    return colors[op] || "bg-muted";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SQL Execution Logs</h1>
          <p className="text-muted-foreground mt-2">
            History of all SQL operations executed in the system (last 20)
          </p>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.log_id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">Log #{log.log_id}</span>
                  {log.operation_type && (
                    <Badge className={getOperationColor(log.operation_type)}>
                      {log.operation_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(log.executed_at).toLocaleString()}
                </div>
              </div>
              <pre className="bg-[hsl(var(--code-bg))] text-[hsl(var(--code-foreground))] p-3 rounded-md overflow-x-auto text-sm">
                <code>{log.sql_text}</code>
              </pre>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
