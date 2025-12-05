import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  avatar: string;
  name: string;
  model: string;
  description: string;
  onClick: () => void;
}

export function AgentCard({ avatar, name, model, description, onClick }: AgentCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:border-primary/20",
        "bg-white border border-border rounded-xl"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">{name}</h3>
              <Badge
                variant="outline"
                className="mt-1 text-xs bg-blue-50 text-blue-700 border-purple-200"
              >
                {model}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:border-primary group-hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

