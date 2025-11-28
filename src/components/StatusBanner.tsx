import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBannerProps {
  status: "normal" | "warning" | "critical";
  message: string;
}

export const StatusBanner = ({ status, message }: StatusBannerProps) => {
  const statusConfig = {
    normal: {
      icon: CheckCircle2,
      className: "bg-success/10 border-success/30 text-success",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-warning/10 border-warning/30 text-warning",
    },
    critical: {
      icon: AlertCircle,
      className: "bg-destructive/10 border-destructive/30 text-destructive",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-xl border-2 flex items-center gap-3", config.className)}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
};
