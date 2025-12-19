import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useConsultas } from "@/contexts/ConsultasContext";
import { 
  Plus, 
  Filter, 
  Play,
  ExternalLink,
  CalendarX,
  ArrowUpDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AgendamentoModal } from "@/components/agendamento/AgendamentoModal";
import { toast } from "@/hooks/use-toast";
import type { Consulta, StatusConsulta, StatusPagamentoConsulta } from "@/types/consulta";
import type { Evento } from "@/types/agendamento";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type SortDirection = "asc" | "desc";
type SortKey = keyof Consulta;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface FiltroConsultas {
  statusConsulta: StatusConsulta | "";
  statusPagamento: StatusPagamentoConsulta | "";
  localAtendimento: string;
  retorno: boolean | null;
  dataInicial: string;
  dataFinal: string;
}

const TABS = {
  ATUAL: "atual",
  A_REALIZAR: "aRealizar",
  REALIZADAS: "realizadas",
} as const;

type TabKey = typeof TABS[keyof typeof TABS];

const TAB_LABELS: Record<TabKey, string> = {
  [TABS.ATUAL]: "Consulta desse momento",
  [TABS.A_REALIZAR]: "Consultas a realizar",
  [TABS.REALIZADAS]: "Consultas realizadas",
};

const SORTABLE_COLUMNS: { key: SortKey; label: string; index: number }[] = [
  { key: "paciente", label: "Paciente", index: 0 },
  { key: "data", label: "Data", index: 1 },
  { key: "retorno", label: "Retorno", index: 2 },
  { key: "statusPagamento", label: "Status de pagamento", index: 3 },
  { key: "statusConsulta", label: "Status da consulta", index: 4 },
  { key: "localAtendimento", label: "Local de atendimento", index: 5 },
];

const LOCAIS_ATENDIMENTO = ["Presencial", "Teleconsulta"];

const INITIAL_FILTROS: FiltroConsultas = {
  statusConsulta: "",
  statusPagamento: "",
  localAtendimento: "",
  retorno: null,
  dataInicial: "",
  dataFinal: "",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const applyFilters = (data: Consulta[], filtros: FiltroConsultas): Consulta[] => {
  return data.filter(c => {
    if (filtros.statusConsulta && c.statusConsulta !== filtros.statusConsulta) return false;
    if (filtros.statusPagamento && c.statusPagamento !== filtros.statusPagamento) return false;
    if (filtros.localAtendimento && c.localAtendimento !== filtros.localAtendimento) return false;
    if (filtros.retorno !== null && c.retorno !== filtros.retorno) return false;
    return true;
  });
};

const sortData = (data: Consulta[], config: SortConfig | null): Consulta[] => {
  if (!config) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[config.key];
    const bValue = b[config.key];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return config.direction === "asc" ? 1 : -1;
    if (bValue == null) return config.direction === "asc" ? -1 : 1;

    // Handle dates
    if (config.key === "data") {
      const [aDay, aMonth, aYear] = String(aValue).split("/").map(Number);
      const [bDay, bMonth, bYear] = String(bValue).split("/").map(Number);
      const aDate = new Date(2000 + aYear, aMonth - 1, aDay);
      const bDate = new Date(2000 + bYear, bMonth - 1, bDay);
      return config.direction === "asc" 
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle booleans
    if (typeof aValue === "boolean") {
      return config.direction === "asc"
        ? (aValue === bValue ? 0 : aValue ? -1 : 1)
        : (aValue === bValue ? 0 : aValue ? 1 : -1);
    }

    // Handle strings
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return config.direction === "asc" 
      ? aStr.localeCompare(bStr, "pt-BR")
      : bStr.localeCompare(aStr, "pt-BR");
  });
};

// ============================================================================
// COMPONENT: Consultas
// ============================================================================

export default function Consultas() {
  const navigate = useNavigate();
  const { getConsultaAtual, getConsultasARealizar, getConsultasRealizadas } = useConsultas();
  
  // State
  const [activeTab, setActiveTab] = useState<TabKey>(TABS.ATUAL);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtros, setFiltros] = useState(INITIAL_FILTROS);
  const [filtrosAtivos, setFiltrosAtivos] = useState(INITIAL_FILTROS);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortConfigs, setSortConfigs] = useState<Record<TabKey, SortConfig | null>>({
    [TABS.ATUAL]: null,
    [TABS.A_REALIZAR]: null,
    [TABS.REALIZADAS]: null,
  });

  // Data
  const consultaAtual = getConsultaAtual();
  const consultasARealizarRaw = getConsultasARealizar();
  const consultasRealizadasRaw = getConsultasRealizadas();
  
  const consultasARealizar = applyFilters(consultasARealizarRaw, filtrosAtivos);
  const consultasRealizadas = applyFilters(consultasRealizadasRaw, filtrosAtivos);

  const sortedConsultasARealizar = useMemo(
    () => sortData(consultasARealizar, sortConfigs[TABS.A_REALIZAR]),
    [consultasARealizar, sortConfigs]
  );

  const sortedConsultasRealizadas = useMemo(
    () => sortData(consultasRealizadas, sortConfigs[TABS.REALIZADAS]),
    [consultasRealizadas, sortConfigs]
  );

  // Handlers
  const handleIniciarConsulta = (consulta: Consulta) => {
    navigate(`/consultas/iniciada/${consulta.id}`);
  };

  const handleRowClick = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsEditModalOpen(true);
  };

  const handleSort = (table: TabKey, key: SortKey) => {
    setSortConfigs(prev => {
      const currentConfig = prev[table];
      if (currentConfig?.key === key) {
        return {
          ...prev,
          [table]: currentConfig.direction === "asc" 
            ? { key, direction: "desc" as SortDirection } 
            : { key, direction: "asc" as SortDirection }
        };
      }
      return {
        ...prev,
        [table]: { key, direction: "asc" as SortDirection }
      };
    });
  };

  const handleSaveAgendamento = (evento: Evento) => {
    setEventos([...eventos, evento]);
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
    setFiltros(INITIAL_FILTROS);
    setFiltrosAtivos(INITIAL_FILTROS);
    setIsFilterModalOpen(false);
  };

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  const SortIcon = ({ tableKey, columnKey, columnIndex }: { 
    tableKey: TabKey; 
    columnKey: SortKey; 
    columnIndex: number 
  }) => {
    const config = sortConfigs[tableKey];
    const isActive = config?.key === columnKey;
    const shouldShow = isActive || (!config && columnIndex === 0);
    
    if (!shouldShow) return null;
    
    return (
      <ArrowUpDown
        className={cn(
          "w-4 h-4 text-[#0b68f7] transition-transform cursor-pointer",
          isActive && config?.direction === "desc" && "rotate-180"
        )}
      />
    );
  };

  const TableHeaders = ({ 
    tableKey, 
    showActionColumn = true 
  }: { 
    tableKey: TabKey; 
    showActionColumn?: boolean;
  }) => (
    <TableHeader>
      <TableRow className="bg-[#dbeafe] text-[#0b68f7] rounded-t-xl border border-[#cfe0ff] overflow-hidden">
        {SORTABLE_COLUMNS.map((col) => (
          <TableHead 
            key={col.key}
            className="text-[#0b68f7] font-semibold text-xs tracking-wider cursor-pointer bg-transparent border-none"
            onClick={() => handleSort(tableKey, col.key)}
          >
            <div className="flex items-center gap-2">
              {col.label}
              <SortIcon tableKey={tableKey} columnKey={col.key} columnIndex={col.index} />
            </div>
          </TableHead>
        ))}
        {showActionColumn && (
          <TableHead className="text-[#0b68f7] font-semibold text-xs tracking-wider bg-transparent border-none"></TableHead>
        )}
      </TableRow>
    </TableHeader>
  );

  const ConsultaRow = ({ 
    consulta, 
    showAction = false, 
    onClick, 
    showActionColumn = true 
  }: { 
    consulta: Consulta; 
    showAction?: boolean; 
    onClick?: () => void; 
    showActionColumn?: boolean;
  }) => (
    <TableRow 
      className={cn("hover:bg-muted/50", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-primary font-semibold text-xs text-white">{consulta.avatar}</span>
          </div>
          <span className="font-medium">{consulta.paciente}</span>
        </div>
      </TableCell>
      <TableCell>{consulta.data} às {consulta.hora}</TableCell>
      <TableCell>{consulta.retorno ? "Sim" : "Não"}</TableCell>
      <TableCell>
        <StatusBadge status={consulta.statusPagamento === "Pago" ? "success" : "warning"}>
          {consulta.statusPagamento}
        </StatusBadge>
      </TableCell>
      <TableCell>
        <StatusBadge 
          status={
            consulta.statusConsulta === "Realizada" ? "success" : 
            consulta.statusConsulta === "Em andamento" ? "info" : "warning"
          }
        >
          {consulta.statusConsulta}
        </StatusBadge>
      </TableCell>
      <TableCell>{consulta.localAtendimento}</TableCell>
      {showActionColumn && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          {showAction ? (
            <Button size="sm" className="gap-2" onClick={() => handleIniciarConsulta(consulta)}>
              <Play className="w-3 h-3" />
              Iniciar consulta
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </TableCell>
      )}
    </TableRow>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <CalendarX className="w-8 h-8" />
          <p>{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AppLayout>
      <PageHeader
        title="Consultas"
        breadcrumb="Consultas"
        searchPlaceholder="Buscar consultas"
        onSearch={setSearchTerm}
        actions={
          <Button className="gap-2 w-full lg:w-auto" onClick={() => setIsAgendamentoModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova Consulta
          </Button>
        }
      />

      <div className="pt-8 px-8 ">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value={TABS.ATUAL} className="flex-1 lg:flex-none">
                {TAB_LABELS[TABS.ATUAL]}
              </TabsTrigger>
              <TabsTrigger value={TABS.A_REALIZAR} className="flex-1 lg:flex-none">
                {TAB_LABELS[TABS.A_REALIZAR]}
              </TabsTrigger>
              <TabsTrigger value={TABS.REALIZADAS} className="flex-1 lg:flex-none">
                {TAB_LABELS[TABS.REALIZADAS]}
              </TabsTrigger>
            </TabsList>

            {activeTab !== TABS.ATUAL && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 w-full lg:w-auto"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
            )}
          </div>

          {/* Tab: Consulta Atual */}
          <TabsContent value={TABS.ATUAL} className="mt-0">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              {consultaAtual ? (
                <>
                  <div className="flex flex-col lg:flex-row items-center space-y-2 justify-between px-8 py-3 border-b border-border">
                    <h2 className="text-lg font-semibold text-primary">
                      Consulta agendada para agora
                    </h2>
                    <Button 
                      size="sm" 
                      className="gap-2 w-full lg:w-auto" 
                      onClick={() => handleIniciarConsulta(consultaAtual)}
                    >
                      <Play className="w-3 h-3" />
                      Iniciar consulta
                    </Button>
                  </div>
                  <Table className="overflow-x-auto w-full ">
                    <TableHeaders tableKey={TABS.ATUAL} showActionColumn={false} />
                    <TableBody>
                      <ConsultaRow consulta={consultaAtual} showActionColumn={false} />
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <CalendarX className="w-12 h-12" />
                    <p className="text-lg font-medium">Nenhuma consulta agendada para agora</p>
                    <p className="text-sm">Você não possui consultas marcadas para este momento</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Consultas a Realizar */}
          <TabsContent value={TABS.A_REALIZAR} className="mt-0">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <Table className="min-w-[780px]">
                <TableHeaders tableKey={TABS.A_REALIZAR} />
                <TableBody>
                  {sortedConsultasARealizar.length === 0 ? (
                    <EmptyState message="Nenhuma consulta agendada" />
                  ) : (
                    sortedConsultasARealizar.map((consulta) => (
                      <ConsultaRow 
                        key={consulta.id} 
                        consulta={consulta} 
                        onClick={() => handleRowClick(consulta)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab: Consultas Realizadas */}
          <TabsContent value={TABS.REALIZADAS} className="mt-0">
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <Table className="min-w-[780px]">
                <TableHeaders tableKey={TABS.REALIZADAS} />
                <TableBody>
                  {sortedConsultasRealizadas.length === 0 ? (
                    <EmptyState message="Nenhuma consulta realizada" />
                  ) : (
                    sortedConsultasRealizadas.map((consulta) => (
                      <ConsultaRow 
                        key={consulta.id} 
                        consulta={consulta} 
                        onClick={() => handleRowClick(consulta)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Agendamento Modal */}
      <AgendamentoModal
        open={isAgendamentoModalOpen}
        onOpenChange={setIsAgendamentoModalOpen}
        defaultPessoal={false}
        onSave={handleSaveAgendamento}
      />

      {/* Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Filtrar Consultas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status da Consulta</Label>
              <Select 
                value={filtros.statusConsulta || "all"} 
                onValueChange={(v) => setFiltros({ ...filtros, statusConsulta: v === "all" ? "" : v as StatusConsulta })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="A realizar">A realizar</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Realizada">Realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status de Pagamento</Label>
              <Select 
                value={filtros.statusPagamento || "all"} 
                onValueChange={(v) => setFiltros({ ...filtros, statusPagamento: v === "all" ? "" : v as StatusPagamentoConsulta })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Local de Atendimento</Label>
              <Select 
                value={filtros.localAtendimento || "all"} 
                onValueChange={(v) => setFiltros({ ...filtros, localAtendimento: v === "all" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os locais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {LOCAIS_ATENDIMENTO.map((local) => (
                    <SelectItem key={local} value={local}>{local}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Somente retornos</Label>
              <Switch 
                checked={filtros.retorno === true} 
                onCheckedChange={(v) => setFiltros({ ...filtros, retorno: v ? true : null })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilter}>
              Limpar filtro
            </Button>
            <Button onClick={handleApplyFilter}>Filtrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Consulta Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes da Consulta</DialogTitle>
          </DialogHeader>
          
          {selectedConsulta ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-primary font-semibold">{selectedConsulta.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedConsulta.paciente}</p>
                  <p className="text-sm text-muted-foreground">{selectedConsulta.data} às {selectedConsulta.hora}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Local de Atendimento</Label>
                  <p className="font-medium">{selectedConsulta.localAtendimento}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Retorno</Label>
                  <p className="font-medium">{selectedConsulta.retorno ? "Sim" : "Não"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status da Consulta</Label>
                  <StatusBadge 
                    status={
                      selectedConsulta.statusConsulta === "Realizada" ? "success" : 
                      selectedConsulta.statusConsulta === "Em andamento" ? "info" : "warning"
                    }
                  >
                    {selectedConsulta.statusConsulta}
                  </StatusBadge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Status de Pagamento</Label>
                  <StatusBadge status={selectedConsulta.statusPagamento === "Pago" ? "success" : "warning"}>
                    {selectedConsulta.statusPagamento}
                  </StatusBadge>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma consulta selecionada
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Fechar
            </Button>
            {selectedConsulta?.statusConsulta === "A realizar" && (
              <Button onClick={() => {
                if (selectedConsulta) {
                  handleIniciarConsulta(selectedConsulta);
                }
              }}>
                Iniciar Consulta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}