export type StatusTarefa = "A Realizar" | "Realizada";

export interface Tarefa {
  id: number;
  nome: string;
  tarefa: string;
  dataEntrega: string;
  dtConsulta: string;
  status: StatusTarefa;
}

export interface TarefaFormData {
  nome: string;
  tarefa: string;
  dataEntrega: string;
  dtConsulta: string;
  status: StatusTarefa;
}

export interface FiltroTarefas {
  descricao: string;
  tarefasRealizadas: boolean;
  tarefasPendentes: boolean;
  dataInicial: string;
  dataFinal: string;
}
