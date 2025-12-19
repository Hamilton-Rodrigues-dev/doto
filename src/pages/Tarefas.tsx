import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Filter, Trash2, LayoutGrid, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TIPOS_TAREFA, STATUS_TAREFA } from "@/constants";
import type {
  Tarefa,
  TarefaFormData,
  FiltroTarefas,
  StatusTarefa,
} from "@/types/tarefa";
import { TarefasKanban } from "@/components/TarefasKanban";
import { STATUS_STYLE } from "@/lib/status-style";

const tarefasData: Tarefa[] = [
  {
    id: 1,
    nome: "João",
    tarefa: "Enviar lista de suplementos",
    dataEntrega: "22/10/25",
    dtConsulta: "16/10/25",
    status: "Não iniciado",
  },
  {
    id: 2,
    nome: "Ana",
    tarefa: "Enviar prescrição",
    dataEntrega: "22/10/25",
    dtConsulta: "12/10/25",
    status: "Paralisado",
  },
];

const initialFormData: TarefaFormData = {
  nome: "",
  tarefa: "",
  dataEntrega: "",
  dtConsulta: "",
  status: "Não iniciado",
};

const initialFiltros: FiltroTarefas = {
  descricao: "",
  tarefasRealizadas: false,
  tarefasPendentes: false,
  dataInicial: "",
  dataFinal: "",
};

export default function Tarefas() {
  const [tarefas, setTarefas] = useState(tarefasData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [originalFormData, setOriginalFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filtros, setFiltros] = useState({
    descricao: "",
    tarefasRealizadas: false,
    tarefasPendentes: false,
    dataInicial: "",
    dataFinal: "",
  });
  type TaskViewMode = "table" | "kanban";

  const [viewMode, setViewMode] = useState<TaskViewMode>("table");

  const [filtrosAtivos, setFiltrosAtivos] = useState(initialFiltros);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalFormData);

  // Apply search and filters
  const filteredTarefas = tarefas.filter((t) => {
    // Search filter
    const matchesSearch =
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tarefa.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Type filter
    if (filtrosAtivos.descricao) {
      const termo = filtrosAtivos.descricao.toLowerCase();
      if (!t.tarefa.toLowerCase().includes(termo)) return false;
    }

    // Status filters
    if (filtrosAtivos.tarefasRealizadas && t.status !== "Finalizado")
      return false;
    if (filtrosAtivos.tarefasPendentes && t.status !== "Não iniciado")
      return false;

    return true;
  });

  const handleOpenModal = (tarefa?: Tarefa) => {
    if (tarefa) {
      const data: TarefaFormData = {
        nome: tarefa.nome,
        tarefa: tarefa.tarefa,
        dataEntrega: tarefa.dataEntrega,
        dtConsulta: tarefa.dtConsulta,
        status: tarefa.status,
      };
      setFormData(data);
      setOriginalFormData(data);
      setEditingId(tarefa.id);
    } else {
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setOriginalFormData(initialFormData);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.tarefa) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setTarefas(
        tarefas.map((t) => (t.id === editingId ? { ...t, ...formData } : t))
      );
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
    } else {
      const newTarefa: Tarefa = {
        id: tarefas.length + 1,
        ...formData,
      };
      setTarefas([...tarefas, newTarefa]);
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (editingId) {
      setTarefas(tarefas.filter((t) => t.id !== editingId));
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });
      setShowDeleteConfirm(false);
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleRowClick = (tarefa: Tarefa) => {
    handleOpenModal(tarefa);
  };

  const handleApplyFilter = () => {
    setFiltrosAtivos(filtros);
    setIsFilterModalOpen(false);
    toast({
      title: "Filtros aplicados",
      description: "A listagem foi atualizada com os filtros selecionados.",
    });
  };

  const handleClearFilter = () => {
    setFiltros(initialFiltros);
    setFiltrosAtivos(initialFiltros);
    setIsFilterModalOpen(false);
  };

  const columns: Column<Tarefa>[] = [
    { key: "nome", label: "Nome", sortable: true },
    { key: "tarefa", label: "Tarefa", sortable: true },
    { key: "dataEntrega", label: "Data de Entrega", sortable: true },
    { key: "dtConsulta", label: "Dt.Consulta", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => (
        <span
          className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
        ${STATUS_STYLE[item.status].badge}
      `}
        >
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Tarefas"
        breadcrumb="Tarefas"
        searchPlaceholder="Buscar tarefas"
        onSearch={setSearchTerm}
        actions={
          <div className="flex w-full gap-2 flex-row">
            <Button
              variant="outline"
              className="w-full lg:w-auto flex items-center justify-center"
              onClick={() =>
                setViewMode((prev) => (prev === "table" ? "kanban" : "table"))
              }
            >
              {viewMode === "table" ? (
                <LayoutGrid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
            </Button>

            <Button
              className="gap-2 w-full lg:w-auto"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-4 h-4" />
              Nova tarefa
            </Button>
          </div>
        }
      />

      <div className="pt-4 md:p-8">
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          {/* header + botão Filtrar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Listagem de tarefas
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full md:w-auto"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
          </div>

          {viewMode === "table" && (
            <DataTable
              data={filteredTarefas}
              columns={columns}
              onRowClick={handleRowClick}
              minWidth="auto"
              headerClassName="bg-blue-100" // fundo
              headerTextClassName="text-blue-700" // texto + ícone
            />
          )}
        </div>

        {viewMode === "kanban" && (
          <div className="mt-6">
            <TarefasKanban
              tarefas={filteredTarefas}
              onUpdateTarefas={setTarefas}
              onTaskClick={handleRowClick}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onAddTask={(status) => handleOpenModal({ status } as any)}
            />
          </div>
        )}
      </div>

      {/* Modal Nova/Editar Tarefa */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-primary">
              {editingId ? "Editar Tarefa" : "Nova Tarefa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Paciente *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Nome do paciente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarefa">Descrição da Tarefa *</Label>
              <Textarea
                id="tarefa"
                value={formData.tarefa}
                onChange={(e) =>
                  setFormData({ ...formData, tarefa: e.target.value })
                }
                placeholder="Descreva a tarefa..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataEntrega">Data de Entrega</Label>
                <Input
                  id="dataEntrega"
                  type="date"
                  value={formData.dataEntrega}
                  onChange={(e) =>
                    setFormData({ ...formData, dataEntrega: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dtConsulta">Data da Consulta</Label>
                <Input
                  id="dtConsulta"
                  type="date"
                  value={formData.dtConsulta}
                  onChange={(e) =>
                    setFormData({ ...formData, dtConsulta: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as StatusTarefa })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_TAREFA.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex !justify-between items-center">
            {editingId && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Filtro */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Filtrar Tarefas</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição da Tarefa</Label>
              <Input
                placeholder="Buscar por descrição..."
                value={filtros.descricao}
                onChange={(e) =>
                  setFiltros({ ...filtros, descricao: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Tarefas realizadas</Label>
              <Switch
                checked={filtros.tarefasRealizadas}
                onCheckedChange={(v) =>
                  setFiltros({
                    ...filtros,
                    tarefasRealizadas: v,
                    tarefasPendentes: v ? false : filtros.tarefasPendentes,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Tarefas em pendência</Label>
              <Switch
                checked={filtros.tarefasPendentes}
                onCheckedChange={(v) =>
                  setFiltros({
                    ...filtros,
                    tarefasPendentes: v,
                    tarefasRealizadas: v ? false : filtros.tarefasRealizadas,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filtros.dataInicial}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataInicial: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filtros.dataFinal}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataFinal: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilter}>
              Limpar filtro
            </Button>
            <Button onClick={handleApplyFilter}>Filtrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Tarefa"
        description="Tem certeza que quer excluir esta tarefa? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Confirm Exit Dialog */}
      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Dados não salvos"
        description="Os dados não foram salvos, deseja mesmo sair?"
        confirmText="Sair"
        cancelText="Continuar editando"
        onConfirm={handleConfirmExit}
      />
    </AppLayout>
  );
}
