import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  breadcrumb, 
  searchPlaceholder,
  onSearch,
  actions 
}: PageHeaderProps) {
  return (
    <div className=" bg-card border-b border-border px-10 py-6">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-muted-foreground">Menu Principal</span>
          <span className="text-muted-foreground">&gt;</span>
          <span className="text-primary">{breadcrumb}</span>
        </div>
      )}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full flex flex-col lg:flex-row items-center gap-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {searchPlaceholder && (
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 bg-muted border-0"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 w-full lg:w-auto">{actions}</div>}
      </div>
    </div>
  );
}
