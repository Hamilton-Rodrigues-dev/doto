import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, LayoutGrid, List, Info } from "lucide-react";
import {
  mockLeads,
  mockNotas,
  Lead,
  NotaLead,
  CalendarEvent,
  EtapaFunil,
  Pipeline,
  getCurrentTimestamp,
} from "@/lib/mockData";
import LeadsKanban from "@/components/LeadsKanban";
import LeadsLista from "@/components/LeadsLista";
import LeadDetailModal from "@/components/LeadDetailModal";
import { toast } from "sonner";

interface LeadsViewProps {
  pipelines: Pipeline[];
  etapas: EtapaFunil[];
}

export default function LeadsView({ pipelines, etapas }: LeadsViewProps) {
  const [pipelineSelecionado, setPipelineSelecionado] = useState<string>(
    pipelines[0]?.id ?? ""
  );
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState<"kanban" | "lista">(
    "kanban"
  );
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [notas, setNotas] = useState<NotaLead[]>(mockNotas);
  const [modalOpen, setModalOpen] = useState(false);
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] =
    useState<Partial<CalendarEvent> | null>(null);

  useEffect(() => {
    if (!pipelineSelecionado && pipelines[0]) {
      setPipelineSelecionado(pipelines[0].id);
    } else if (
      pipelineSelecionado &&
      !pipelines.find((p) => p.id === pipelineSelecionado) &&
      pipelines[0]
    ) {
      setPipelineSelecionado(pipelines[0].id);
    }
  }, [pipelineSelecionado, pipelines]);

  const etapasDoPipeline = useMemo(
    () => etapas.filter((etapa) => etapa.pipelineId === pipelineSelecionado),
    [etapas, pipelineSelecionado]
  );

  const leadsDoPipeline = useMemo(
    () => leads.filter((lead) => lead.pipelineId === pipelineSelecionado),
    [leads, pipelineSelecionado]
  );

  const primeiraEtapaId = useMemo(() => {
    return (
      [...etapasDoPipeline].sort((a, b) => a.ordem - b.ordem)[0]?.id || "novo"
    );
  }, [etapasDoPipeline]);

  const handlePipelineChange = (pipelineId: string) => {
    setPipelineSelecionado(pipelineId);
    setLeadSelecionado(null);
    setModalOpen(false);
    setCalendarModalOpen(false);
    setEventoSelecionado(null);
  };

  const handleNovaLead = (etapaId?: string) => {
    const etapaDestino = etapaId || primeiraEtapaId;

    const novoLead: Lead = {
      id: Date.now().toString(),
      nomeLead: "",
      telefone: "",
      email: "",
      empresa: "",
      pipelineId: pipelineSelecionado,
      etapaFunil: etapaDestino,
      responsavel: "Agência Brakeel",
      valorVenda: 0,
      valorMensal: 0,
      criadoEm: getCurrentTimestamp(),
      atualizadoEm: getCurrentTimestamp(),
      tags: [],
    };

    setLeadSelecionado(novoLead);
    setModalOpen(true);
  };

  const handleUpdatePipelineLeads = (pipelineLeads: Lead[]) => {
    setLeads((prev) => {
      const outrosLeads = prev.filter(
        (lead) => lead.pipelineId !== pipelineSelecionado
      );
      return [...outrosLeads, ...pipelineLeads];
    });
  };

  const handleSaveLead = (lead: Lead) => {
    const leadAtual = lead.pipelineId ? lead : { ...lead, pipelineId: pipelineSelecionado };
    const leadExiste = leads.find((l) => l.id === leadAtual.id);

    if (leadExiste) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadAtual.id
            ? { ...leadAtual, atualizadoEm: getCurrentTimestamp() }
            : l
        )
      );
      toast.success("Lead atualizado com sucesso!");
    } else {
      setLeads((prev) => [leadAtual, ...prev]);
      toast.success("Lead criado com sucesso!");
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setNotas((prev) => prev.filter((n) => n.leadId !== id));
    toast.success("Lead excluído com sucesso!");
  };

  const handleAddNota = (nota: Omit<NotaLead, "id" | "criadoEm">) => {
    const novaNota: NotaLead = {
      ...nota,
      id: Date.now().toString(),
      criadoEm: getCurrentTimestamp(),
    };
    setNotas((prev) => [...prev, novaNota]);
    toast.success("Nota adicionada com sucesso!");
  };

  const handleCreateTask = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    setEventoSelecionado({
      tipo: "tarefa",
      leadId: leadId,
      nomeLead: lead?.nomeLead,
    });
    setModalOpen(false);
    setCalendarModalOpen(true);
  };

  const handleCreateMeeting = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    setEventoSelecionado({
      tipo: "reuniao",
      leadId: leadId,
      nomeLead: lead?.nomeLead,
    });
    setModalOpen(false);
    setCalendarModalOpen(true);
  };

  const handleSaveCalendarEvent = (eventData: Partial<CalendarEvent>) => {
    const eventoId = eventData.id || Date.now().toString();

    if (eventData.leadId) {
      const nota: NotaLead = {
        id: Date.now().toString() + "_nota",
        leadId: eventData.leadId,
        texto: `${eventData.tipo === "tarefa" ? "Tarefa" : "Reunião"}: ${
          eventData.titulo
        }`,
        autor: "Agência Brakeel",
        criadoEm: getCurrentTimestamp(),
        tipo: eventData.tipo as "tarefa" | "reuniao",
        calendarioEventoId: eventoId,
      };
      setNotas((prev) => [...prev, nota]);
    }

    toast.success(
      `${
        eventData.tipo === "tarefa" ? "Tarefa" : "Reunião"
      } criada e adicionada ao calendário!`
    );
    setCalendarModalOpen(false);
    setModalOpen(true);
  };

  const handleNovaLeadPadrao = () => {
    if (!etapasDoPipeline.length) {
      toast.info("Adicione etapas na aba Pipelines antes de criar leads.");
      return;
    }
    handleNovaLead(primeiraEtapaId);
  };

  const handleOnAddEtapa = () => {
    toast.info("Gerencie etapas na aba Pipelines.");
  };

  return (
    <div className="space-y-6">
    <div className="flex lg:flex-row flex-col items-center space-y-6 lg:justify-between w-full">
  <div className="relative w-full lg:w-[420px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
    <Input
      placeholder="Buscar leads..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      className="pl-10 h-12 bg-card"
    />
  </div>
  <div className="flex w-full lg:w-auto gap-4">
    <Select value={pipelineSelecionado} onValueChange={handlePipelineChange}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Selecione o pipeline" />
      </SelectTrigger>
      <SelectContent>
        {pipelines.map((pipeline) => (
          <SelectItem key={pipeline.id} value={pipeline.id}>
            {pipeline.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
   <div className="flex gap-1">
     <Button
      variant={visualizacao === "kanban" ? "default" : "outline"}
      size="icon"
      onClick={() => setVisualizacao("kanban")}
    >
      <LayoutGrid className="w-5 h-5" />
    </Button>
    <Button
      variant={visualizacao === "lista" ? "default" : "outline"}
      size="icon"
      onClick={() => setVisualizacao("lista")}
    >
      <List className="w-5 h-5" />
    </Button>
   </div>
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">

          <Button
            size="lg"
            onClick={handleNovaLeadPadrao}
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Lead
          </Button>
        </div>
  </div>
</div>


      {!etapasDoPipeline.length && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-muted-foreground">
          <Info className="w-4 h-4" />
          <p className="text-sm">
            Nenhuma etapa encontrada para este pipeline. Configure etapas na aba Pipelines.
          </p>
        </div>
      )}

      {/* Content */}
      {visualizacao === "kanban" ? (
        <LeadsKanban
          busca={busca}
          leads={leadsDoPipeline}
          notas={notas}
          onLeadClick={(lead) => {
            setLeadSelecionado(lead);
            setModalOpen(true);
          }}
          onUpdateLeads={handleUpdatePipelineLeads}
          etapas={etapasDoPipeline}
          onAddEtapa={handleOnAddEtapa}
          onAddLead={handleNovaLead}
        />
      ) : (
        <LeadsLista
          busca={busca}
          leads={leadsDoPipeline}
          notas={notas}
          etapas={etapasDoPipeline}
          onLeadClick={(lead) => {
            setLeadSelecionado(lead);
            setModalOpen(true);
          }}
        />
      )}

      <LeadDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLead}
        onDelete={handleDeleteLead}
        lead={leadSelecionado}
        notas={notas}
        onAddNota={handleAddNota}
        onCreateTask={handleCreateTask}
        onCreateMeeting={handleCreateMeeting}
        etapas={etapasDoPipeline}
      />

    
    </div>
  );
}
