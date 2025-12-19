import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import type {
  Evento,
  EventoCompleto,
  AgendamentoFormData,
} from "@/types/agendamento";

/* -----------------------------------------
 * MOCK INICIAL
 * -------------------------------------- */

const eventosIniciais: EventoCompleto[] = [
  {
    id: 1,
    titulo: "Kelvis Borges",
    data: new Date(2026, 0, 5),
    horarioInicio: "09:00",
    horarioFim: "10:00",
    paciente: "Kelvis Borges",
    cor: "#3B82F6",
    isPessoal: false,
    metadata: {
      local: "Clínica XPTO",
      paciente: "Kelvis Borges",
      diaEvento: "2026-01-05",
      horarioInicio: "09:00",
      horarioFim: "10:00",
      descricao: "Retorno",
      categoria: "Consulta",
      cor: "#3B82F6",
      valor: "300",
      previsaoPagamento: "2026-01-05",
      anotacao: "",
      tarefa: "",
    },
  },
];

const diasSemana = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const horariosDisponiveis = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
});

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

export default function Agendamentos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"Mês" | "Semana" | "Dia">("Mês");

  const [eventos, setEventos] = useState<EventoCompleto[]>(eventosIniciais);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPessoal, setIsPessoal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] =
    useState<AgendamentoFormData>(initialFormData);

  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  /* -----------------------------------------
   * HELPERS DE CALENDÁRIO
   * -------------------------------------- */

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      date: Date;
    }> = [];

    const prevMonth = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const getEventosForDay = (date: Date) => {
    return eventos.filter(
      (e) =>
        e.data.getDate() === date.getDate() &&
        e.data.getMonth() === date.getMonth() &&
        e.data.getFullYear() === date.getFullYear()
    );
  };

  /* -----------------------------------------
   * NAVEGAÇÃO DO CALENDÁRIO
   * -------------------------------------- */

  const handlePrevPeriod = () => {
    if (viewMode === "Mês") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (viewMode === "Semana") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "Mês") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (viewMode === "Semana") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSincronizar = () => {
    toast({
      title: "Sincronização",
      description:
        "Funcionalidade preparada para integração com Google Agenda. Em breve!",
    });
  };

  /* -----------------------------------------
   * FORM / MODAL
   * -------------------------------------- */

  const resetForm = () => {
    setFormData(initialFormData);
    setIsPessoal(false);
    setEditingId(null);
    setHasChanges(false);
  };

  const openModal = (date?: Date, time?: string) => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      diaEvento: date ? date.toISOString().split("T")[0] : "",
      horarioInicio: time || "",
    }));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
      return;
    }

    setIsModalOpen(false);
    resetForm();
  };

  const updateFormData = (field: keyof AgendamentoFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const editExistingEvent = (evento: EventoCompleto) => {
    setEditingId(evento.id);
    setIsPessoal(evento.isPessoal);

    if (!evento.isPessoal && evento.metadata) {
      setFormData(evento.metadata);
    } else {
      setFormData({
        ...initialFormData,
        descricao: evento.titulo,
        diaEvento: evento.data.toISOString().split("T")[0],
        horarioInicio: evento.horarioInicio,
        horarioFim: evento.horarioFim,
        cor: evento.cor,
      });
    }

    setHasChanges(false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!isPessoal && !formData.paciente) {
      toast({
        title: "Erro",
        description: "Preencha o nome do paciente",
        variant: "destructive",
      });
      return;
    }

    const baseEvento: EventoCompleto = {
      id: editingId ?? eventos.length + 1,
      titulo: isPessoal ? formData.descricao : formData.paciente,
      data: new Date(formData.diaEvento || new Date()),
      horarioInicio: formData.horarioInicio,
      horarioFim: formData.horarioFim,
      paciente: isPessoal ? undefined : formData.paciente,
      cor: formData.cor,
      isPessoal,
      metadata: isPessoal ? undefined : { ...formData },
    };

    if (editingId) {
      setEventos((prev) =>
        prev.map((e) => (e.id === editingId ? baseEvento : e))
      );
    } else {
      setEventos((prev) => [...prev, baseEvento]);
    }

    setIsModalOpen(false);
    resetForm();

    toast({
      title: "Sucesso",
      description: editingId
        ? "Agendamento atualizado!"
        : "Agendamento criado!",
    });
  };

  const handleDelete = () => {
    if (editingId) {
      setEventos((prev) => prev.filter((e) => e.id !== editingId));
      setShowDeleteConfirm(false);
      setIsModalOpen(false);
      resetForm();

      toast({
        title: "Sucesso",
        description: "Agendamento excluído!",
      });
    }
  };

  /* -----------------------------------------
   * RENDER
   * -------------------------------------- */

  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays(currentDate);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Calendário"
        breadcrumb="Calendário"
        searchPlaceholder="Buscar evento ou compromisso"
        actions={
          <Button
            className="gap-2 w-full lg:w-auto"
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        }
      />

      <div className="pt-8 px-8 ">
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex flex-col space-y-2 lg:flex-row items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              {viewMode === "Dia"
                ? currentDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : `${
                    monthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
            </h2>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex items-center border border-border rounded-lg w-full md:w-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-1 md:flex-initial"
                  onClick={handlePrevPeriod}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 md:flex-initial"
                  onClick={handleToday}
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-1 md:flex-initial"
                  onClick={handleNextPeriod}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Select
                value={viewMode}
                onValueChange={(v) =>
                  setViewMode(v as "Mês" | "Semana" | "Dia")
                }
              >
                <SelectTrigger className="w-full sm:w-32 bg-primary text-[#ffffff]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mês">Mês</SelectItem>
                  <SelectItem value="Semana">Semana</SelectItem>
                  <SelectItem value="Dia">Dia</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
                onClick={handleSincronizar}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            {viewMode === "Mês" && (
              <>
                <div className="grid grid-cols-7 mb-2">
                  {diasSemana.map((dia) => (
                    <div
                      key={dia}
                      className="text-center py-3 text-sm font-semibold text-muted-foreground"
                    >
                      {/* telas menores: Seg */}
                      <span className="inline lg:hidden">
                        {dia.slice(0, 3)}
                      </span>
                      {/* telas maiores (lg+): Segunda */}
                      <span className="hidden lg:inline">{dia}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 border-l border-t border-border">
                  {days.map((day, index) => {
                    const dayEventos = getEventosForDay(day.date);
                    return (
                      <div
                        key={index}
                        onClick={() => openModal(day.date)}
                        className={cn(
                          "min-h-[100px] p-2 border-r border-b border-border transition-colors cursor-pointer",
                          !day.isCurrentMonth && "bg-muted/30",
                          day.isCurrentMonth && "bg-card hover:bg-muted/50"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium",
                            day.isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {day.day}
                        </span>

                        <div className="mt-1 space-y-1">
                          {dayEventos.slice(0, 2).map((evento) => (
                            <div
                              key={evento.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                editExistingEvent(evento);
                              }}
                              className="text-xs px-2 py-1 rounded text-white truncate"
                              style={{ backgroundColor: evento.cor }}
                            >
                              {evento.horarioInicio} - {evento.titulo}
                            </div>
                          ))}

                          {dayEventos.length > 2 && (
                            <div className="text-xs text-muted-foreground px-2">
                              +{dayEventos.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "Semana" && (
              <div className="overflow-auto">
                <div className="grid grid-cols-8 min-w-[800px]">
                  <div className="border-r border-border" />
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className="text-center py-3 border-r border-border"
                    >
                      <div className="text-sm font-semibold text-muted-foreground">
                        {/* telas menores: Seg */}
                        <span className="inline lg:hidden">
                          {diasSemana[index].slice(0, 3)}
                        </span>
                        {/* telas maiores: Segunda */}
                        <span className="hidden lg:inline">
                          {diasSemana[index]}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-8 min-w-[800px] border-t border-border">
                  {horariosDisponiveis.slice(0, 24).map((horario, hIndex) => (
                    <div key={`row-${hIndex}`} className="contents">
                      <div className="text-xs text-muted-foreground p-2 border-r border-b border-border text-center">
                        {horario}
                      </div>
                      {weekDays.map((day, dIndex) => (
                        <div
                          key={`cell-${hIndex}-${dIndex}`}
                          onClick={() => openModal(day, horario)}
                          className="min-h-[40px] border-r border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "Dia" && (
              <div>
                {horariosDisponiveis.map((horario, index) => {
                  const eventoNoHorario = eventos.find(
                    (e) =>
                      e.data.toDateString() === currentDate.toDateString() &&
                      e.horarioInicio === horario
                  );
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center  p-0 rounded-lg transition-colors cursor-pointer",
                        eventoNoHorario ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        if (eventoNoHorario) {
                          editExistingEvent(eventoNoHorario);
                        } else {
                          openModal(currentDate, horario);
                        }
                      }}
                    >
                      <span className="text-sm font-medium text-muted-foreground w-16">
                        {horario}
                      </span>
                      {eventoNoHorario ? (
                        <div
                          className="flex-1 px-3 rounded text-white text-sm"
                          style={{ backgroundColor: eventoNoHorario.cor }}
                        >
                          {eventoNoHorario.titulo}
                        </div>
                      ) : (
                        <div className="flex-1 h-10 border border-solid border-border rounded" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-primary">
              {isPessoal ? "Novo compromisso" : "Novo agendamento"}
            </DialogTitle>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => updateFormData("cor", e.target.value)}
                      className="border-0 h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="Descrição da anotação"
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

          <DialogFooter className="flex !justify-between w-full">
            {editingId && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
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
          setIsModalOpen(false);
          resetForm();
        }}
      />
    </AppLayout>
  );
}
