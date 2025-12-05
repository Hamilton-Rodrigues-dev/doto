import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IntegrationCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  isActive: boolean;
  onActivate: () => void;
}

export function IntegrationCard({
  icon: Icon,
  name,
  description,
  isActive,
  onActivate,
}: IntegrationCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 bg-white border rounded-xl",
        "hover:shadow-lg",
        isActive
          ? "border-green-500/50 shadow-md bg-green-50/30"
          : "border-border hover:border-primary/20"
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
              isActive
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            )}
          >
            <Icon className="w-8 h-8" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <Button
            variant={isActive ? "outline" : "default"}
            size="sm"
            className={cn(
              "w-full",
              isActive
                ? "border-green-500 text-green-700 hover:bg-green-50"
                : "bg-primary hover:bg-primary/90"
            )}
            onClick={onActivate}
          >
            {isActive ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Ativado
              </>
            ) : (
              "Ativar Integração"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

