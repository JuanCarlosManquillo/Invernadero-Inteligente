import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActuatorCardProps {
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  description: string;
}

export const ActuatorCard = ({ title, icon: Icon, isActive, description }: ActuatorCardProps) => {
  return (
    <Card className="p-5 shadow-soft hover:shadow-medium transition-all duration-300 border-2">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-all duration-500",
            isActive
              ? "bg-gradient-primary text-primary-foreground animate-pulse"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                isActive
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isActive ? "ACTIVO" : "INACTIVO"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
