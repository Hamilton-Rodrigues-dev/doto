import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "success" | "danger" | "warning";
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  variant = "default",
  className 
}: KPICardProps) {
  const isPositive = trend && trend > 0;
  const variantStyles = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
  };

  return (
    <div className={cn(
      "bg-card rounded-xl p-5 shadow-card border border-border",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F6FAFF] text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className={cn("text-lg sm:text-xl md:text-lg lg:text-xl xl:text-2xl text-center font-bold truncate self-center", variantStyles[variant])}>
          {value}
        </p>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? "+" : ""}{trend}%
            </span>
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}