export type StatusConsulta = "A realizar" | "Realizada" | "Em andamento";
export type StatusPagamentoConsulta = "Pago" | "Pendente";

export interface Consulta {
  id: number;
  paciente: string;
  avatar: string;
  data: string;
  hora: string;
  retorno: boolean;
  statusPagamento: StatusPagamentoConsulta;
  statusConsulta: StatusConsulta;
  localAtendimento: string;
}
