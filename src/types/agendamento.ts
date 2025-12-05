export interface AgendamentoFormData {
  local: string;
  paciente: string;
  diaEvento: string;
  horarioInicio: string;
  horarioFim: string;
  descricao: string;
  categoria: string;
  cor: string;
  valor: string;
  previsaoPagamento: string;
  anotacao: string;
  tarefa: string;
}

export interface Evento {
  id: number;
  titulo: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  paciente?: string;               
  cor: string;
  isPessoal: boolean;
  metadata?: AgendamentoFormData;  
}

export interface EventoCompleto extends Evento {
  metadata?: AgendamentoFormData;
}
