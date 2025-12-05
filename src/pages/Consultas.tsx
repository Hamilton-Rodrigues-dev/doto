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

const initialFiltros: FiltroConsultas = {
  statusConsulta: "",
  statusPagamento: "",
  localAtendimento: "",
  retorno: null,
  dataInicial: "",
  dataFinal: "",
};

const locaisAtendimento = ["Presencial", "Teleconsulta"];

export default function Consultas() {
  const navigate = useNavigate();
  const { getConsultaAtual, getConsultasARealizar, getConsultasRealizadas } = useConsultas();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosAtivos, setFiltrosAtivos] = useState(initialFiltros);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortConfigs, setSortConfigs] = useState<{
    atual: SortConfig | null;
    aRealizar: SortConfig | null;
    realizadas: SortConfig | null;
  }>({
    atual: null,
    aRealizar: null,
    realizadas: null,
  });

  const consultaAtual = getConsultaAtual();
  const consultasARealizarRaw = getConsultasARealizar();
  const consultasRealizadasRaw = getConsultasRealizadas();
  
  // Apply filters
  const applyFilters = (data: Consulta[]) => {
    return data.filter(c => {
      if (filtrosAtivos.statusConsulta && c.statusConsulta !== filtrosAtivos.statusConsulta) return false;
      if (filtrosAtivos.statusPagamento && c.statusPagamento !== filtrosAtivos.statusPagamento) return false;
      if (filtrosAtivos.localAtendimento && c.localAtendimento !== filtrosAtivos.localAtendimento) return false;
      if (filtrosAtivos.retorno !== null && c.retorno !== filtrosAtivos.retorno) return false;
      return true;
    });
  };

  const consultasARealizar = applyFilters(consultasARealizarRaw);
  const consultasRealizadas = applyFilters(consultasRealizadasRaw);

  const handleIniciarConsulta = (consulta: Consulta) => {
    navigate(`/consultas/iniciada/${consulta.id}`);
  };

  const handleRowClick = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsEditModalOpen(true);
  };

  const handleSort = (table: "atual" | "aRealizar" | "realizadas", key: SortKey) => {
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

  const sortData = (data: Consulta[], config: SortConfig | null) => {
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

  const sortedConsultasARealizar = useMemo(
    () => sortData(consultasARealizar, sortConfigs.aRealizar),
    [consultasARealizar, sortConfigs.aRealizar]
  );

  const sortedConsultasRealizadas = useMemo(
    () => sortData(consultasRealizadas, sortConfigs.realizadas),
    [consultasRealizadas, sortConfigs.realizadas]
  );

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
    setFiltros(initialFiltros);
    setFiltrosAtivos(initialFiltros);
    setIsFilterModalOpen(false);
  };

  // Define sortable columns with their indices
  const sortableColumns: { key: SortKey; label: string; index: number }[] = [
    { key: "paciente", label: "Paciente", index: 0 },
    { key: "data", label: "Data", index: 1 },
    { key: "retorno", label: "Retorno", index: 2 },
    { key: "statusPagamento", label: "Status de pagamento", index: 3 },
    { key: "statusConsulta", label: "Status da consulta", index: 4 },
    { key: "localAtendimento", label: "Local de atendimento", index: 5 },
  ];

  const SortIcon = ({ tableKey, columnKey, columnIndex }: { tableKey: "atual" | "aRealizar" | "realizadas"; columnKey: SortKey; columnIndex: number }) => {
    const config = sortConfigs[tableKey];
    const isActive = config?.key === columnKey;
    
    // Show icon only if: it's active OR (no sort active AND it's first column)
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

  const TableHeaders = ({ tableKey, showActionColumn = true }: { tableKey: "atual" | "aRealizar" | "realizadas"; showActionColumn?: boolean }) => (
    <TableHeader>
      <TableRow className="bg-[#dbeafe] text-[#0b68f7] rounded-t-xl border border-[#cfe0ff] overflow-hidden">
        {sortableColumns.map((col) => (
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
        {showActionColumn && <TableHead className="text-[#0b68f7] font-semibold text-xs tracking-wider bg-transparent border-none"></TableHead>}
      </TableRow>
    </TableHeader>
  );

  const ConsultaRow = ({ consulta, showAction = false, onClick, showActionColumn = true }: { consulta: Consulta; showAction?: boolean; onClick?: () => void; showActionColumn?: boolean }) => (
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

      <div className="pt-8 space-y-6">
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center space-y-2 justify-between px-8 py-3 border-border">
            <h2 className="text-lg font-semibold text-muted-foreground">Consulta desse momento</h2>
            {consultaAtual && (
              <Button size="sm" className="gap-2 w-full lg:w-auto" onClick={() => handleIniciarConsulta(consultaAtual)}>
                <Play className="w-3 h-3" />
                Iniciar consulta
              </Button>
            )}
          </div>
          {consultaAtual ? (
            <Table className="overflow-x-auto w-full">
              <TableHeaders tableKey="atual" showActionColumn={false} />
              <TableBody>
                <ConsultaRow consulta={consultaAtual} showAction={false} showActionColumn={false} />
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <CalendarX className="w-8 h-8" />
                <p>Nenhuma consulta no dia de hoje</p>
              </div>
            </div>
          )}
        </div>

        {/* Consultas a ser realizada */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-border">
            <h2 className="text-lg font-semibold text-foreground">Consulta a ser realizada</h2>
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
          <Table className="min-w-[780px]">
            <TableHeaders tableKey="aRealizar" />
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

        {/* Consultas já realizadas */}
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 border-border">
            <h2 className="text-lg font-semibold text-foreground">Consultas já realizadas</h2>
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
          <Table className="min-w-[780px]">
            <TableHeaders tableKey="realizadas" />
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
                  {locaisAtendimento.map((local) => (
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
