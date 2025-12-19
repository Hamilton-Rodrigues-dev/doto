/* eslint-disable @typescript-eslint/no-unused-vars */
import { Lead, NotaLead, EtapaFunil } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useDragScroll } from "@/hooks/use-drag-scroll";

interface LeadsKanbanProps {
  busca: string;
  leads: Lead[];
  notas: NotaLead[];
  etapas: EtapaFunil[];
  onLeadClick: (lead: Lead) => void;
  onUpdateLeads: (leads: Lead[]) => void;
  onAddEtapa: () => void;
  onAddLead: (etapaId: string) => void;
}

export default function LeadsKanban({
  busca,
  leads,
  notas,
  etapas,
  onLeadClick,
  onUpdateLeads,
  onAddEtapa,
  onAddLead,
}: LeadsKanbanProps) {
  const dragScroll = useDragScroll();

  const leadsFiltrados = (leads || []).filter(
    (lead) =>
      lead.nomeLead.toLowerCase().includes(busca.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(busca.toLowerCase())
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novaEtapa = destination.droppableId;
    const updatedLeads = (leads || []).map((lead) =>
      lead.id === draggableId ? { ...lead, etapaFunil: novaEtapa } : lead
    );
    onUpdateLeads(updatedLeads);

    const etapaLabel = etapas.find((e) => e.id === novaEtapa)?.label || novaEtapa;
    toast.success(`Lead movido para ${etapaLabel}`);
  };

  const getLeadsPorEtapa = (etapaId: string) =>
    leadsFiltrados.filter((lead) => lead.etapaFunil === etapaId);

  const calcularTotal = (leadsEtapa: Lead[]) =>
    leadsEtapa.reduce((sum, lead) => sum + lead.valorVenda, 0);

  const etapasOrdenadas = [...etapas].sort((a, b) => a.ordem - b.ordem);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* DESKTOP → scroll horizontal com drag scroll */}
      <div
        ref={dragScroll.ref}
        onMouseDown={dragScroll.onMouseDown}
        onMouseLeave={dragScroll.onMouseLeave}
        onMouseUp={dragScroll.onMouseUp}
        onMouseMove={dragScroll.onMouseMove}
        className={`hidden md:flex gap-6 overflow-x-hidden pb-4 select-none ${
          dragScroll.isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {etapasOrdenadas.map((etapa) => {
          const leadsEtapa = getLeadsPorEtapa(etapa.id);
          const total = calcularTotal(leadsEtapa);

          return (
            <div key={etapa.id} className="flex-shrink-0 w-[320px] space-y-4">
              {/* Cabeçalho */}
              <div className={`${etapa.cor} ${etapa.borderColor} ${etapa.textColor} border-2 rounded-lg p-4`}>
                <h3 className="font-semibold">{etapa.label}</h3>
                <p className="text-sm mt-1">
                  {leadsEtapa.length} leads: R$ {total.toFixed(2)}
                </p>
              </div>

              {/* Leads */}
              <Droppable droppableId={etapa.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] rounded-lg p-3 transition-colors ${
                      snapshot.isDraggingOver ? "bg-muted" : ""
                    }`}
                  >
                    {leadsEtapa.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            data-drag-item
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onLeadClick(lead)}
                            className={`p-4 cursor-pointer transition-shadow ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : "hover:shadow-md"
                            }`}
                          >
                            <h4 className="font-medium text-sm mb-2">{lead.nomeLead}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{lead.telefone}</p>

                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="text-muted-foreground">Venda: </span>
                                <span className="font-medium">R$ {lead.valorVenda.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mensal: </span>
                                <span className="font-medium">R$ {lead.valorMensal.toFixed(2)}</span>
                              </div>
                            </div>

                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {lead.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {lead.valorVenda === 0 && (
                              <p className="text-xs text-red-500 mt-2">Sem tarefa</p>
                            )}
                          </Card>
                        )}
                      </Draggable>
                    ))}

                    {/* Botão adicionar lead */}
                    <Card
                      onClick={() => onAddLead(etapa.id)}
                      className="h-[80px] border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition"
                    >
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </Card>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}

   
      </div>

      {/* MOBILE → colunas empilhadas verticalmente */}
      <div className="block md:hidden space-y-6">
        {etapasOrdenadas.map((etapa) => {
          const leadsEtapa = getLeadsPorEtapa(etapa.id);
          const total = calcularTotal(leadsEtapa);

          return (
            <div key={etapa.id} className="space-y-3">
              {/* Cabeçalho da etapa */}
              <div className={`${etapa.cor} ${etapa.borderColor} ${etapa.textColor} border-2 rounded-lg p-3`}>
                <h3 className="font-semibold">{etapa.label}</h3>
                <p className="text-sm mt-1">
                  {leadsEtapa.length} leads: R$ {total.toFixed(2)}
                </p>
              </div>

              {/* Lista vertical dos leads */}
              <div className="space-y-5 !mb-14">
                {leadsEtapa.map((lead) => (
                  <Card
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="p-4 border border-border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{lead.nomeLead}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.criadoEm).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{lead.telefone}</p>

                    <div className="flex justify-between text-xs mt-2">
                      <p>
                        Venda: <span className="font-medium">R$ {lead.valorVenda.toFixed(2)}</span>
                      </p>
                      <p>
                        Mensal: <span className="font-medium">R$ {lead.valorMensal.toFixed(2)}</span>
                      </p>
                    </div>

                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lead.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {lead.valorVenda === 0 && (
                      <p className="text-xs text-red-500 mt-2">Sem tarefa</p>
                    )}
                  </Card>
                ))}

                {/* Botão adicionar lead */}
                <Card
                  onClick={() => onAddLead(etapa.id)}
                  className="h-[70px] border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition"
                >
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </Card>
              </div>
            </div>
          );
        })}

        {/* Adicionar nova etapa */}
    
      </div>
    </DragDropContext>
  );
}
