export type TipoLancamento = "Entrada" | "Despesa";
export type StatusPagamento = "Pago" | "Pendente";

export interface Lancamento {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  data: string;
  formaPagamento: string;
  status: StatusPagamento;
  tipo: TipoLancamento;
}

export interface LancamentoFormData {
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  formaPagamento: string;
  status: StatusPagamento;
  tipo: TipoLancamento;
}
