import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Tarefa, StatusTarefa } from "@/types/tarefa";
import { useDragScroll } from "@/hooks/use-drag-scroll";

type TaskStageId = StatusTarefa;

interface TaskStage {
  id: TaskStageId;
  label: string;
  cor: string;
  borderColor: string;
  textColor: string;
  ordem: number;
}

const TASK_STAGES: TaskStage[] = [
  {
    id: "Não iniciado",
    label: "Não iniciado",
    cor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-900",
    ordem: 1,
  },
  {
    id: "Em andamento",
    label: "Em andamento",
    cor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-900",
    ordem: 2,
  },
  {
    id: "Paralisado",
    label: "Paralisado",
    cor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    ordem: 3,
  },
  {
    id: "Finalizado",
    label: "Finalizado",
    cor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    ordem: 4,
  },
];

interface TasksKanbanProps {
  tarefas: Tarefa[];
  onUpdateTarefas: (tarefas: Tarefa[]) => void;
  onTaskClick: (tarefa: Tarefa) => void;
  onAddTask?: (status: StatusTarefa) => void;
}

export function TarefasKanban({
  tarefas,
  onUpdateTarefas,
  onTaskClick,
  onAddTask,
}: TasksKanbanProps) {
  const etapasOrdenadas = [...TASK_STAGES].sort((a, b) => a.ordem - b.ordem);

  const getPorStatus = (status: StatusTarefa) =>
    tarefas.filter((t) => t.status === status);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const novoStatus = destination.droppableId as StatusTarefa;

    const updated: Tarefa[] = tarefas.map((t) =>
      String(t.id) === draggableId ? { ...t, status: novoStatus } : t
    );

    onUpdateTarefas(updated);

    const label =
      TASK_STAGES.find((s) => s.id === novoStatus)?.label ?? novoStatus;

    toast({
      title: "Tarefa atualizada",
      description: `Movida para ${label}`,
    });
  };

  const dragScroll = useDragScroll();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="pt-2 md:pt-4 px-0 md:px-2 lg:px-4">
        <div
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseLeave={dragScroll.onMouseLeave}
          onMouseUp={dragScroll.onMouseUp}
          onMouseMove={dragScroll.onMouseMove}
          className={`
            flex flex-col gap-6 md:flex-row md:items-start
            md:overflow-x-auto md:pb-4 select-none no-scrollbar
            ${dragScroll.isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
        >
          {etapasOrdenadas.map((stage) => {
            const lista = getPorStatus(stage.id);

            return (
              <div
                key={stage.id}
                className="w-full flex-shrink-0 space-y-4 md:w-[320px]"
              >
                {/* Cabeçalho da coluna */}
                <div
                  className={`${stage.cor} ${stage.borderColor} ${stage.textColor} border rounded-lg px-4 py-3`}
                >
                  <h3 className="text-sm font-semibold">{stage.label}</h3>
                  <p className="mt-1 text-xs opacity-80">
                    {lista.length} tarefa{lista.length === 1 ? "" : "s"}
                  </p>
                </div>

                {/* Área droppable */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[260px] rounded-lg p-3 transition-colors ${
                        snapshot.isDraggingOver ? "bg-muted" : "bg-background"
                      }`}
                    >
                      {lista.map((tarefa, index) => (
                        <Draggable
                          key={String(tarefa.id)}
                          draggableId={String(tarefa.id)}
                          index={index}
                        >
                          {(prov, snap) => (
                            <Card
                              data-drag-item
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => onTaskClick(tarefa)}
                              className={`cursor-pointer p-4 transition-shadow ${
                                snap.isDragging
                                  ? "shadow-lg rotate-1"
                                  : "hover:shadow-md"
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {tarefa.nome}
                                </span>
                                {tarefa.dataEntrega && (
                                  <span className="text-xs text-muted-foreground">
                                    Entrega: {tarefa.dataEntrega}
                                  </span>
                                )}
                              </div>

                              <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                                {tarefa.tarefa}
                              </p>

                              {tarefa.dtConsulta && (
                                <p className="text-[11px] text-muted-foreground">
                                  Consulta: {tarefa.dtConsulta}
                                </p>
                              )}
                            </Card>
                          )}
                        </Draggable>
                      ))}

                      {onAddTask && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 w-full border-2 border-dashed"
                          onClick={() => onAddTask(stage.id)}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Nova tarefa
                        </Button>
                      )}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}
