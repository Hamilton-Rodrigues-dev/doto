import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Evento, AgendamentoFormData } from "@/types/agendamento";

const initialFormData: AgendamentoFormData = {
  local: "",
  paciente: "",
  diaEvento: "",
  horarioInicio: "",
  horarioFim: "",
  descricao: "",
  categoria: "",
  cor: "#FF8C42",
  valor: "",
  previsaoPagamento: "",
  anotacao: "",
  tarefa: "",
};

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: Evento;
  defaultPessoal?: boolean;
  onSave?: (evento: Evento) => void;
  onDelete?: (id: number) => void;
}

export function AgendamentoModal({
  open,
  onOpenChange,
  evento,
  defaultPessoal = false,
  onSave,
  onDelete,
}: AgendamentoModalProps) {
  const [isPessoal, setIsPessoal] = useState(defaultPessoal);
  const [formData, setFormData] =
    useState<AgendamentoFormData>(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (evento) {
        setFormData({
          local: "",
          paciente: evento.paciente || "",
          diaEvento: evento.data.toISOString().split("T")[0],
          horarioInicio: evento.horarioInicio,
          horarioFim: evento.horarioFim,
          descricao: evento.titulo,
          categoria: "",
          cor: evento.cor,
          valor: "",
          previsaoPagamento: "",
          anotacao: "",
          tarefa: "",
        });
        setIsPessoal(evento.isPessoal);
      } else {
        setFormData(initialFormData);
        setIsPessoal(defaultPessoal);
      }
      setHasChanges(false);
    }
  }, [open, evento, defaultPessoal]);

  const updateFormData = (field: keyof AgendamentoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSave = () => {
    if (!formData.paciente && !isPessoal) {
      toast({
        title: "Erro",
        description: "Preencha o nome do paciente",
        variant: "destructive",
      });
      return;
    }

    const newEvento: Evento = {
      id: evento?.id || Date.now(),
      titulo: isPessoal ? formData.descricao : formData.paciente,
      data: new Date(formData.diaEvento || new Date()),
      horarioInicio: formData.horarioInicio,
      horarioFim: formData.horarioFim,
      paciente: formData.paciente,
      cor: formData.cor,
      isPessoal,
    };

    onSave?.(newEvento);
    onOpenChange(false);
    setHasChanges(false);

    toast({
      title: "Sucesso",
      description: evento ? "Agendamento atualizado!" : "Agendamento criado!",
    });
  };

  const handleDelete = () => {
    if (evento && onDelete) {
      onDelete(evento.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
      toast({
        title: "Sucesso",
        description: "Agendamento excluído!",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg [&_[data-radix-dialog-close]]:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-primary">
              {isPessoal ? "Novo compromisso" : "Novo agendamento"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {evento && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Compromisso Pessoal</Label>
              <Switch
                checked={isPessoal}
                onCheckedChange={(v) => {
                  setIsPessoal(v);
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Local</Label>
              <Input
                value={formData.local}
                onChange={(e) => updateFormData("local", e.target.value)}
                className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
              />
            </div>

            <div className="space-y-2">
              <Label>{isPessoal ? "Nome do evento" : "Nome do Paciente"}</Label>
              <Input
                value={formData.paciente}
                onChange={(e) => updateFormData("paciente", e.target.value)}
                className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
              />
            </div>

            <div className="space-y-2">
              <Label>Dia do evento</Label>
              <Input
                type="date"
                value={formData.diaEvento}
                onChange={(e) => updateFormData("diaEvento", e.target.value)}
                className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário início</Label>
                <Input
                  type="time"
                  value={formData.horarioInicio}
                  onChange={(e) =>
                    updateFormData("horarioInicio", e.target.value)
                  }
                  className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                />
              </div>
              <div className="space-y-2">
                <Label>Horário final</Label>
                <Input
                  type="time"
                  value={formData.horarioFim}
                  onChange={(e) => updateFormData("horarioFim", e.target.value)}
                  className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição do evento</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => updateFormData("descricao", e.target.value)}
                className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
              />
            </div>

            {!isPessoal && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria do evento</Label>
                    <Input
                      value={formData.categoria}
                      onChange={(e) =>
                        updateFormData("categoria", e.target.value)
                      }
                      className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>

                    <label className="flex items-center gap-4 cursor-pointer w-fit">
                      <span
                        className="w-7 h-7 rounded-full border shadow-sm inline-block"
                        style={{ backgroundColor: formData.cor }}
                      />

                      <input
                        type="color"
                        value={formData.cor}
                        onChange={(e) => updateFormData("cor", e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor a receber</Label>
                    <Input
                      value={formData.valor}
                      onChange={(e) => updateFormData("valor", e.target.value)}
                      className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Previsão de pagamento</Label>
                    <Input
                      type="date"
                      value={formData.previsaoPagamento}
                      onChange={(e) =>
                        updateFormData("previsaoPagamento", e.target.value)
                      }
                      className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Anotações (opcional)</Label>
                  <Textarea
                    value={formData.anotacao}
                    onChange={(e) => updateFormData("anotacao", e.target.value)}
                    placeholder="Descrição da Anotação"
                    className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0 resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Tarefas (opcional)</Label>
                  <Input
                    value={formData.tarefa}
                    onChange={(e) => updateFormData("tarefa", e.target.value)}
                    placeholder="Descrição da tarefa"
                    className="border-0 border-b border-border rounded-none focus-visible:ring-0 px-0"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir agendamento"
        description="Tem certeza que quer excluir? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Descartar alterações"
        description="Os dados não foram salvos, deseja mesmo sair?"
        confirmText="Sair"
        onConfirm={() => {
          setShowExitConfirm(false);
          onOpenChange(false);
          setHasChanges(false);
        }}
      />
    </>
  );
}
