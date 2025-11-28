import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: "normal" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
}

export const SensorCard = ({ title, value, unit, icon: Icon, status, trend }: SensorCardProps) => {
  const statusColors = {
    normal: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  return (
    <Card className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 border-2 bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", statusColors[status])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-2xl opacity-50">{trendIcons[trend]}</span>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-lg text-muted-foreground">{unit}</span>
      </div>
    </Card>
  );
};
