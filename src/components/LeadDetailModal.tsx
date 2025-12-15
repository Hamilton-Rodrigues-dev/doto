import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Lead,
  NotaLead,
  EtiquetaPersonalizada,
  CampoPersonalizado,
  EtapaFunil,
} from "@/lib/mockData";
import {
  ChevronLeft,
  Plus,
  Mic,
  Trash2,
  Calendar,
  CheckSquare,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import EtiquetaDialog from "@/components/EtiquetaDialog";
import CampoDialog from "@/components/CampoDialog";

interface LeadDetailModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  lead: Lead | null;
  notas: NotaLead[];
  onAddNota: (nota: Omit<NotaLead, "id" | "criadoEm">) => void;
  onCreateTask?: (leadId: string) => void;
  onCreateMeeting?: (leadId: string) => void;
  etapas: EtapaFunil[];
}

export default function LeadDetailModal({
  open,
  onClose,
  onSave,
  onDelete,
  lead,
  notas,
  onAddNota,
  onCreateTask,
  onCreateMeeting,
  etapas,
}: LeadDetailModalProps) {
  const [formData, setFormData] = useState<Lead | null>(null);
  const [novaNota, setNovaNota] = useState("");
  const [tipoNota, setTipoNota] = useState<"nota" | "tarefa" | "reuniao">(
    "nota"
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [etiquetas, setEtiquetas] = useState<EtiquetaPersonalizada[]>([]);
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);
  const [showEtiquetaDialog, setShowEtiquetaDialog] = useState(false);
  const [showCampoDialog, setShowCampoDialog] = useState(false);
  const [etiquetaEditando, setEtiquetaEditando] =
    useState<EtiquetaPersonalizada | null>(null);
  const [campoEditando, setCampoEditando] = useState<CampoPersonalizado | null>(
    null
  );

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
    }
  }, [lead, open]);

  if (!formData) return null;

  const handleSave = () => {
    if (!formData.nomeLead.trim()) {
      toast.error("Nome do lead é obrigatório");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && formData.id) {
      onDelete(formData.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  const handleAddNota = () => {
    if (!novaNota.trim()) return;

    if (tipoNota === "tarefa" && onCreateTask) {
      onCreateTask(formData.id);
      return;
    }

    if (tipoNota === "reuniao" && onCreateMeeting) {
      onCreateMeeting(formData.id);
      return;
    }

    onAddNota({
      leadId: formData.id,
      texto: novaNota,
      autor: "Agência Brakeel",
      tipo: tipoNota,
    });

    setNovaNota("");
  };

  const leadNotas = notas.filter((n) => n.leadId === formData.id);

  const handleSaveEtiqueta = (etiqueta: EtiquetaPersonalizada) => {
    if (etiquetaEditando) {
      setEtiquetas((prev) =>
        prev.map((e) => (e.id === etiqueta.id ? etiqueta : e))
      );
      toast.success("Etiqueta atualizada!");
    } else {
      setEtiquetas((prev) => [...prev, etiqueta]);
      toast.success("Etiqueta adicionada!");
    }
    setShowEtiquetaDialog(false);
    setEtiquetaEditando(null);
  };

  const handleDeleteEtiqueta = (id: string) => {
    setEtiquetas((prev) => prev.filter((e) => e.id !== id));
    toast.success("Etiqueta removida!");
  };

  const handleSaveCampo = (campo: CampoPersonalizado) => {
    if (campoEditando) {
      setCampos((prev) => prev.map((c) => (c.id === campo.id ? campo : c)));
      toast.success("Campo atualizado!");
    } else {
      setCampos((prev) => [...prev, campo]);
      toast.success("Campo adicionado!");
    }
    setShowCampoDialog(false);
    setCampoEditando(null);
  };

  const handleDeleteCampo = (id: string) => {
    setCampos((prev) => prev.filter((c) => c.id !== id));
    toast.success("Campo removido!");
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "nota":
        return "bg-red-500";
      case "reuniao":
        return "bg-green-500";
      case "tarefa":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "nota":
        return "Nota";
      case "reuniao":
        return "Reunião";
      case "tarefa":
        return "Tarefa";
      default:
        return tipo;
    }
  };

  const formatarTelefone = (valor: string) => {
    // Remove tudo que não for número
    const apenasNumeros = valor.replace(/\D/g, "");

    // Aplica a máscara conforme o tamanho
    if (apenasNumeros.length <= 10) {
      // Formato (67) 9999-9999
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
    } else {
      // Formato (67) 99999-9999
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-auto">
          <div className="flex flex-col lg:flex-row h-full overflow-auto">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Dados */}
              <div className="p-6 border-b flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {formData.nomeLead || "Novo Lead"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Funil de Vendas
                    </Label>
                    <Select
                      value={formData.etapaFunil}
                      onValueChange={(v) =>
                        setFormData({ ...formData, etapaFunil: v })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {etapas
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((etapa) => (
                            <SelectItem key={etapa.id} value={etapa.id}>
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded ${etapa.cor} ${etapa.textColor}`}
                              >
                                {etapa.label}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap  justify-between gap-4 text-sm">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground">
                        Usuário responsável
                      </Label>
                      <p className="font-medium">{formData.responsavel}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Venda</Label>
                      <Input
                        type="number"
                        value={formData.valorVenda}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valorVenda: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Recorrência
                      </Label>
                      <Input
                        type="number"
                        value={formData.valorMensal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valorMensal: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="principal" className="flex-1 flex flex-col">
                <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b px-6">
                  <TabsTrigger value="principal">Principal</TabsTrigger>
                  <TabsTrigger value="briefing">
                    Briefing de Prospecção
                  </TabsTrigger>
                  <TabsTrigger value="config">Configurações</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="principal" className="p-6 space-y-4 mt-0">
                    <div className="space-y-4">
                      <div>
                        <Label>Nome do Lead</Label>
                        <Input
                          value={formData.nomeLead}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomeLead: e.target.value,
                            })
                          }
                          placeholder="Nome do Lead"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tel. comercial</Label>
                          <Input
                            placeholder="(67) 99999-9999"
                            value={formData.telefone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                telefone: formatarTelefone(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>E-mail comercial</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Empresa</Label>
                        <Input
                          value={formData.empresa}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              empresa: e.target.value,
                            })
                          }
                          placeholder="Nome da empresa"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Posição</Label>
                          <Input placeholder="Ex: CEO, Gerente" />
                        </div>
                        <div>
                          <Label>Especialidade</Label>
                          <Input placeholder="Ex: Marketing, Vendas" />
                        </div>
                      </div>

                      <div>
                        <Label>Endereço</Label>
                        <Input placeholder="Endereço completo" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Site</Label>
                          <Input placeholder="www.exemplo.com" />
                        </div>
                        <div>
                          <Label>Instagram</Label>
                          <Input placeholder="@usuario" />
                        </div>
                      </div>

                      <div>
                        <Label>Nicho</Label>
                        <Input placeholder="Segmento de atuação" />
                      </div>

                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar empresa
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="briefing" className="p-6 mt-0">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Informações adicionais sobre a prospecção do lead.
                      </p>
                      <Textarea
                        placeholder="Adicione informações sobre o briefing..."
                        rows={10}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="p-6 mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">
                          Etiquetas Personalizadas
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Crie etiquetas personalizadas para organizar seus
                          leads.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setEtiquetaEditando(null);
                            setShowEtiquetaDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Nova Etiqueta
                        </Button>
                        {etiquetas.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {etiquetas.map((etiqueta) => (
                              <div
                                key={etiqueta.id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: etiqueta.cor }}
                                  />
                                  <span>{etiqueta.nome}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteEtiqueta(etiqueta.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">
                          Campos Personalizados
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Adicione campos customizados ao formulário do lead.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setCampoEditando(null);
                            setShowCampoDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Novo Campo
                        </Button>
                        {campos.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {campos.map((campo) => (
                              <div
                                key={campo.id}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div>
                                  <span className="font-medium">
                                    {campo.nome}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({campo.tipo})
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCampo(campo.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Footer */}
              <div className="p-6 border-t flex-shrink-0 flex justify-between gap-2">
                <div>
                  {lead?.id && onDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Lead
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>Salvar</Button>
                </div>
              </div>
            </div>

            {/* Histórico */}
            <div className="lg:w-96 border-l bg-muted/20 flex flex-col w-full h-full">
              {/* Header fixo */}
              <div className="p-4 border-b bg-primary/5 flex-shrink-0">
                <div className="flex flex-col items-start justify-between mb-2">
                  <span className="text-sm font-medium">Adição do Lead</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(formData.criadoEm), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              {/* Corpo com scroll e rodapé fixo */}
              <div className="flex flex-col flex-1 min-h-0">
                {/* Lista de notas (no topo, com scroll interno) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {leadNotas.map((nota) => (
                    <div
                      key={nota.id}
                      className="bg-card p-3 rounded-lg border text-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">{nota.autor}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(nota.criadoEm), "dd/MM HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{nota.texto}</p>
                      <Badge
                        variant="outline"
                        className={`mt-2 text-xs ${getTipoColor(
                          nota.tipo
                        )} text-white border-0`}
                      >
                        {getTipoLabel(nota.tipo)}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Rodapé fixo no bottom */}
                <div className="p-4 border-t flex-shrink-0 space-y-2 bg-card/60 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant={tipoNota === "nota" ? "default" : "outline"}
                      className={
                        tipoNota === "nota"
                          ? "flex-1 bg-red-500 hover:bg-red-600"
                          : "flex-1"
                      }
                      onClick={() => setTipoNota("nota")}
                    >
                      Notas
                    </Button>
                    <Button
                      size="sm"
                      variant={tipoNota === "tarefa" ? "default" : "outline"}
                      className={
                        tipoNota === "tarefa"
                          ? "flex-1 bg-blue-500 hover:bg-blue-600"
                          : "flex-1"
                      }
                      onClick={() => setTipoNota("tarefa")}
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Tarefa
                    </Button>
                    <Button
                      size="sm"
                      variant={tipoNota === "reuniao" ? "default" : "outline"}
                      className={
                        tipoNota === "reuniao"
                          ? "flex-1 bg-green-500 hover:bg-green-600"
                          : "flex-1"
                      }
                      onClick={() => setTipoNota("reuniao")}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Reunião
                    </Button>
                  </div>

                  {tipoNota === "nota" ? (
                    <>
                      <div className="flex gap-2">
                        <Textarea
                          value={novaNota}
                          onChange={(e) => setNovaNota(e.target.value)}
                          placeholder="Escreva uma nota..."
                          rows={2}
                          className="flex-1"
                        />
                        <Button size="icon" variant="outline">
                          <Mic className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleAddNota}
                        className="w-full"
                        disabled={!novaNota.trim()}
                      >
                        Adicionar
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {tipoNota === "tarefa"
                          ? "Clique para criar uma tarefa no calendário"
                          : "Clique para agendar uma reunião no calendário"}
                      </p>
                      <Button onClick={handleAddNota} className="w-full">
                        {tipoNota === "tarefa"
                          ? "Criar Tarefa"
                          : "Agendar Reunião"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser
              desfeita e removerá todas as notas e histórico associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EtiquetaDialog
        open={showEtiquetaDialog}
        onClose={() => {
          setShowEtiquetaDialog(false);
          setEtiquetaEditando(null);
        }}
        onSave={handleSaveEtiqueta}
        etiqueta={etiquetaEditando}
      />

      <CampoDialog
        open={showCampoDialog}
        onClose={() => {
          setShowCampoDialog(false);
          setCampoEditando(null);
        }}
        onSave={handleSaveCampo}
        campo={campoEditando}
      />
    </>
  );
}
