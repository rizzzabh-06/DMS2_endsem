import { Card } from "@/components/ui/card";
import { Code } from "lucide-react";

interface SqlDisplayProps {
  sql: string;
  title?: string;
}

export const SqlDisplay = ({ sql, title = "SQL Executed" }: SqlDisplayProps) => {
  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex items-center gap-2 mb-3">
        <Code className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <pre className="bg-[hsl(var(--code-bg))] text-[hsl(var(--code-foreground))] p-4 rounded-md overflow-x-auto text-sm">
        <code>{sql}</code>
      </pre>
    </Card>
  );
};
