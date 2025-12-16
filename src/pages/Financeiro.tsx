import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/ui/kpi-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Plus, 
  Filter,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/utils/formatters";
import { FORMAS_PAGAMENTO, STATUS_PAGAMENTO, TIPOS_LANCAMENTO } from "@/constants";
import type { Lancamento, LancamentoFormData, TipoLancamento, StatusPagamento } from "@/types/financeiro";
import { cn } from "@/lib/utils";

const lancamentosData: Lancamento[] = [
  { id: 1, nome: "Brakeel", descricao: "Pagamento da recorrência", valor: 1000, data: "20/11/25", formaPagamento: "Pix", status: "Pago", tipo: "Despesa" },
  { id: 2, nome: "Carlos", descricao: "Protocolo de Emagrecimento", valor: 500, data: "17/11/25", formaPagamento: "Cartão de débito", status: "Pago", tipo: "Entrada" },
  { id: 3, nome: "Jorge", descricao: "Protocolo de Emagrecimento", valor: 500, data: "16/11/25", formaPagamento: "Cartão de crédito", status: "Pago", tipo: "Entrada" },
  { id: 4, nome: "João", descricao: "Protocolo de Emagrecimento", valor: 500, data: "15/11/25", formaPagamento: "Dinheiro", status: "Pago", tipo: "Entrada" },
  { id: 5, nome: "Katia", descricao: "Protocolo de Emagrecimento", valor: 500, data: "15/11/25", formaPagamento: "Pix", status: "Pendente", tipo: "Entrada" },
];

const initialFormData: LancamentoFormData = {
  nome: "",
  descricao: "",
  valor: "",
  data: "",
  formaPagamento: "Pix",
  status: "Pendente",
  tipo: "Entrada",
};

interface FiltroFinanceiro {
  tipoFinanca: "all" | "Despesa" | "Entrada";
  pendencia: boolean;
  dataInicial: string;
  dataFinal: string;
  tipoPagamento: string;
  valorInicial: string;
  valorFinal: string;
}

const initialFiltros: FiltroFinanceiro = {
  tipoFinanca: "all",
  pendencia: false,
  dataInicial: "",
  dataFinal: "",
  tipoPagamento: "all",
  valorInicial: "",
  valorFinal: "",
};

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState(lancamentosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [originalFormData, setOriginalFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filtros, setFiltros] = useState<FiltroFinanceiro>(initialFiltros);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroFinanceiro>(initialFiltros);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-").map(Number);
      if ([day, month, year].some((v) => Number.isNaN(v))) return null;
      return new Date(year, month - 1, day);
    }
    const [day, month, year] = dateStr.split("/").map(Number);
    if ([day, month, year].some((v) => Number.isNaN(v))) return null;
    return new Date(2000 + year, month - 1, day);
  };

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const simplify = (value: string) =>
    normalize(value).replace(/[^a-z0-9]/g, "");

  const filteredLancamentos = lancamentos.filter((l) => {
    const matchesSearch =
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filtrosAtivos.tipoFinanca !== "all" && l.tipo !== filtrosAtivos.tipoFinanca) {
      return false;
    }

    if (filtrosAtivos.pendencia && l.status !== "Pendente") {
      return false;
    }

    if (filtrosAtivos.tipoPagamento !== "all") {
      if (!simplify(l.formaPagamento).includes(simplify(filtrosAtivos.tipoPagamento))) return false;
    }

    const dataLancamento = parseDate(l.data);
    const dataInicial = parseDate(filtrosAtivos.dataInicial);
    const dataFinal = parseDate(filtrosAtivos.dataFinal);

    if (dataInicial && dataLancamento && dataLancamento < dataInicial) return false;
    if (dataFinal && dataLancamento && dataLancamento > dataFinal) return false;

    const valorInicial = filtrosAtivos.valorInicial ? parseFloat(filtrosAtivos.valorInicial) : null;
    const valorFinal = filtrosAtivos.valorFinal ? parseFloat(filtrosAtivos.valorFinal) : null;

    if (valorInicial !== null && l.valor < valorInicial) return false;
    if (valorFinal !== null && l.valor > valorFinal) return false;

    return true;
  });

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);

  // KPI Calculations - Correct logic
  const totalEntradas = lancamentos
    .filter(l => l.tipo === "Entrada")
    .reduce((acc, l) => acc + l.valor, 0);
  
  const totalDespesas = lancamentos
    .filter(l => l.tipo === "Despesa")
    .reduce((acc, l) => acc + l.valor, 0);
  
  const fluxoCaixa = totalEntradas - totalDespesas;
  
  const totalPagos = lancamentos.filter(l => l.status === "Pago").length;
  const totalPendentes = lancamentos.filter(l => l.status === "Pendente").length;

  const handleOpenModal = (lancamento?: Lancamento) => {
    if (lancamento) {
      const data: LancamentoFormData = {
        nome: lancamento.nome,
        descricao: lancamento.descricao,
        valor: lancamento.valor.toString(),
        data: lancamento.data,
        formaPagamento: lancamento.formaPagamento,
        status: lancamento.status,
        tipo: lancamento.tipo,
      };
      setFormData(data);
      setOriginalFormData(data);
      setEditingId(lancamento.id);
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
    if (!formData.nome || !formData.valor) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setLancamentos(lancamentos.map(l => 
        l.id === editingId 
          ? { 
              ...l, 
              nome: formData.nome,
              descricao: formData.descricao,
              valor: parseFloat(formData.valor),
              data: formData.data || l.data,
              formaPagamento: formData.formaPagamento,
              status: formData.status,
              tipo: formData.tipo,
            }
          : l
      ));
      toast({
        title: "Sucesso",
        description: "Lançamento atualizado com sucesso!",
      });
    } else {
      const newLancamento: Lancamento = {
        id: lancamentos.length + 1,
        nome: formData.nome,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data || new Date().toLocaleDateString("pt-BR"),
        formaPagamento: formData.formaPagamento,
        status: formData.status,
        tipo: formData.tipo,
      };
      setLancamentos([...lancamentos, newLancamento]);
      toast({
        title: "Sucesso",
        description: "Lançamento adicionado com sucesso!",
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (editingId) {
      setLancamentos(lancamentos.filter(l => l.id !== editingId));
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso!",
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

  const handleRowClick = (lancamento: Lancamento) => {
    handleOpenModal(lancamento);
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

  const columns: Column<Lancamento>[] = [
    { key: "nome", label: "Nome", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { 
      key: "valor", 
      label: "Valor",
      sortable: true,
      render: (item) => (
        <span className={cn(
          "font-semibold",
          item.tipo === "Entrada" ? "text-success" : "text-destructive"
        )}>
          {formatCurrency(item.valor)}
        </span>
      )
    },
    { key: "data", label: "Data", sortable: true },
    { key: "formaPagamento", label: "Forma de pagamento", sortable: true },
    { 
      key: "status", 
      label: "Status do pagamento",
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status === "Pago" ? "success" : "warning"}>
          {item.status}
        </StatusBadge>
      )
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Financeiro"
        breadcrumb="Financeiro"
        searchPlaceholder="Buscar financeiro"
        onSearch={setSearchTerm}
        actions={
          <Button className="gap-2 w-full lg:w-auto" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </Button>
        }
      />

      <div className="pt-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <KPICard
            title="Fluxo de caixa"
            value={formatCurrency(fluxoCaixa)}
            icon={<Wallet className="w-5 h-5 text-secondary" />}
            variant={fluxoCaixa >= 0 ? "success" : "danger"}
          />
          <KPICard
            title="Entradas"
            value={formatCurrency(totalEntradas)}
            icon={<TrendingUp className="w-5 h-5 text-secondary" />}
            variant="success"
          />
          <KPICard
            title="Despesas"
            value={formatCurrency(totalDespesas)}
            icon={<TrendingDown className="w-5 h-5 text-secondary" />}
            variant="danger"
          />
          <KPICard
            title="Pagos"
            value={totalPagos.toString()}
            icon={<Receipt className="w-5 h-5 text-secondary" />}
          />
          <KPICard
            title="Faltam pagar"
            value={totalPendentes.toString()}
            icon={<Clock className="w-5 h-5 text-secondary" />}
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4  border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Listagem financeira
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
          </div>

          <DataTable 
            data={filteredLancamentos} 
            columns={columns} 
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-primary">
              {editingId ? "Editar Lançamento" : "Novo Lançamento"}
            </DialogTitle>
           
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoLancamento })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_LANCAMENTO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Paciente *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do paciente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do lançamento"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select 
                  value={formData.formaPagamento} 
                  onValueChange={(v) => setFormData({ ...formData, formaPagamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((forma) => (
                      <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as StatusPagamento })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_PAGAMENTO.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
      <DialogFooter className=" items-center flex !justify-between">
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
       <div className="flex gap-4">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Filtrar Financeiro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de finança</Label>
              <Select
                value={filtros.tipoFinanca}
                onValueChange={(v) =>
                  setFiltros({ ...filtros, tipoFinanca: v as FiltroFinanceiro["tipoFinanca"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Despesa">Despesas</SelectItem>
                  <SelectItem value="Entrada">Entradas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Somente pendências</Label>
              <Switch
                checked={filtros.pendencia}
                onCheckedChange={(v) => setFiltros({ ...filtros, pendencia: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de pagamento</Label>
              <Select
                value={filtros.tipoPagamento}
                onValueChange={(v) => setFiltros({ ...filtros, tipoPagamento: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="cartao de credito">Cartão de crédito</SelectItem>
                  <SelectItem value="cartao de debito">Cartão de débito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filtros.dataInicial}
                  onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filtros.dataFinal}
                  onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor inicial (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={filtros.valorInicial}
                  onChange={(e) => setFiltros({ ...filtros, valorInicial: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor final (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={filtros.valorFinal}
                  onChange={(e) => setFiltros({ ...filtros, valorFinal: e.target.value })}
                  placeholder="0,00"
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
        title="Excluir Lançamento"
        description="Tem certeza que quer excluir este lançamento? Esta ação não pode ser desfeita."
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
