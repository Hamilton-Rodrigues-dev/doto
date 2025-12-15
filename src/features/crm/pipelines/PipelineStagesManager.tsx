import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { EtapaFunil, Pipeline } from "@/lib/mockData";
import { Plus, Trash2 } from "lucide-react";

interface PipelineStagesManagerProps {
  pipeline: Pipeline;
  stages: EtapaFunil[];
  onSave: (stages: EtapaFunil[]) => void;
}

export default function PipelineStagesManager({
  pipeline,
  stages,
  onSave,
}: PipelineStagesManagerProps) {
  const [localStages, setLocalStages] = useState<EtapaFunil[]>(stages);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages, pipeline.id]);

  const orderedStages = useMemo(
    () => [...localStages].sort((a, b) => a.ordem - b.ordem),
    [localStages]
  );

  const handleNameChange = (id: string, value: string) => {
    setLocalStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, label: value } : stage
      )
    );
  };

  const handleDelete = (id: string) => {
    setLocalStages((prev) => prev.filter((stage) => stage.id !== id));
  };

  const handleAddStage = () => {
    const nextOrder =
      Math.max(0, ...localStages.map((stage) => stage.ordem)) + 1;
    const novaEtapa: EtapaFunil = {
      id: `etapa_${Date.now()}`,
      pipelineId: pipeline.id,
      label: "Nova etapa",
      cor: "bg-muted",
      borderColor: "border-border",
      textColor: "text-foreground",
      ordem: nextOrder,
    };
    setLocalStages((prev) => [...prev, novaEtapa]);
  };

  const handleSave = () => {
    onSave(localStages);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {orderedStages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 md:flex-row md:items-center"
            >
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Nome da etapa</p>
                <Input
                  value={stage.label}
                  onChange={(e) => handleNameChange(stage.id, e.target.value)}
                  placeholder="Nome da etapa"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(stage.id)}
                aria-label="Excluir etapa"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {orderedStages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Nenhuma etapa cadastrada. Adicione a primeira etapa deste funil.
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={handleAddStage} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar etapa
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!localStages.length}>
                Salvar etapas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
