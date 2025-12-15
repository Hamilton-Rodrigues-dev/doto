import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pipeline, EtapaFunil } from "@/lib/mockData";
import { Pencil, Plus, Workflow } from "lucide-react";
import PipelineStagesManager from "@/features/crm/pipelines/PipelineStagesManager";

interface PipelinesViewProps {
  pipelines: Pipeline[];
  etapas: EtapaFunil[];
  onUpdatePipelines: (pipelines: Pipeline[]) => void;
  onUpdateEtapas: (etapas: EtapaFunil[]) => void;
}

export default function PipelinesView({
  pipelines,
  etapas,
  onUpdatePipelines,
  onUpdateEtapas,
}: PipelinesViewProps) {
  const [novoPipeline, setNovoPipeline] = useState({ nome: "", descricao: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicao, setEdicao] = useState({ nome: "", descricao: "" });
  const [pipelineSelecionado, setPipelineSelecionado] = useState<Pipeline | null>(null);

  const resetForm = () => setNovoPipeline({ nome: "", descricao: "" });

  const handleAddPipeline = () => {
    const nome = novoPipeline.nome.trim();
    if (!nome) return;

    const novo: Pipeline = {
      id: `pipeline_${Date.now()}`,
      nome,
      descricao: novoPipeline.descricao.trim(),
    };
    onUpdatePipelines([...pipelines, novo]);
    resetForm();
  };

  const startEdit = (pipeline: Pipeline) => {
    setEditandoId(pipeline.id);
    setEdicao({ nome: pipeline.nome, descricao: pipeline.descricao || "" });
  };

  const handleSaveEdit = (id: string) => {
    const nome = edicao.nome.trim();
    if (!nome) return;

    onUpdatePipelines(
      pipelines.map((pipeline) =>
        pipeline.id === id
          ? { ...pipeline, nome, descricao: edicao.descricao.trim() }
          : pipeline
      )
    );
    setEditandoId(null);
    setEdicao({ nome: "", descricao: "" });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setEdicao({ nome: "", descricao: "" });
  };

  const handleOpenStages = (pipeline: Pipeline) => {
    setPipelineSelecionado(pipeline);
  };

  const handleSaveStages = (updated: EtapaFunil[]) => {
    const etapasOutras = etapas.filter(
      (etapa) => etapa.pipelineId !== pipelineSelecionado?.id
    );
    onUpdateEtapas([...etapasOutras, ...updated]);
    setPipelineSelecionado(null);
  };

  const etapasDoPipelineSelecionado = useMemo(
    () =>
      etapas.filter((etapa) => etapa.pipelineId === pipelineSelecionado?.id),
    [etapas, pipelineSelecionado]
  );

  return (
    <div className="space-y-6">


      <Card>
        <CardHeader>
          <CardTitle>Pipelines existentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipelines.map((pipeline) => {
            const estaEditando = editandoId === pipeline.id;
            return (
              <div
                key={pipeline.id}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                {estaEditando ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Nome
                      </label>
                      <Input
                        value={edicao.nome}
                        onChange={(e) =>
                          setEdicao((prev) => ({ ...prev, nome: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        Descrição
                      </label>
                      <Textarea
                        value={edicao.descricao}
                        onChange={(e) =>
                          setEdicao((prev) => ({
                            ...prev,
                            descricao: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleSaveEdit(pipeline.id)}
                        disabled={!edicao.nome.trim()}
                      >
                        Salvar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{pipeline.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {pipeline.descricao || "Sem descrição"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(pipeline)}
                          aria-label="Editar pipeline"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                    
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Etapas</p>
                        <p className="text-xs text-muted-foreground">
                          Gerencie as etapas deste funil.
                        </p>
                      </div>
                     <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStages(pipeline)}
                          className="gap-2"
                        >
                          <Workflow className="w-4 h-4" />
                          Gerenciar etapas
                        </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novo pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nome</label>
            <Input
              placeholder="Ex: Vendas, Parcerias..."
              value={novoPipeline.nome}
              onChange={(e) =>
                setNovoPipeline((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Descrição</label>
            <Textarea
              placeholder="Breve descrição do funil"
              value={novoPipeline.descricao}
              onChange={(e) =>
                setNovoPipeline((prev) => ({
                  ...prev,
                  descricao: e.target.value,
                }))
              }
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={handleAddPipeline}
            disabled={!novoPipeline.nome.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar pipeline
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!pipelineSelecionado} onOpenChange={() => setPipelineSelecionado(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar etapas • {pipelineSelecionado?.nome || "Pipeline"}
            </DialogTitle>
          </DialogHeader>
          {pipelineSelecionado && (
            <PipelineStagesManager
              pipeline={pipelineSelecionado}
              stages={etapasDoPipelineSelecionado}
              onSave={handleSaveStages}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
