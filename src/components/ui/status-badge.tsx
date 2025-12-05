import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "pending" | "default";

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {children}
    </span>
  );
}