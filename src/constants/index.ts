// Protocolos disponíveis
export const PROTOCOLOS = [
  "Suplementação",
  "Emagrecimento",
  "Reposição hormonal",
  "Acompanhamento",
] as const;

// Tipos de tarefa
export const TIPOS_TAREFA = [
  "Enviar prescrição",
  "Retorno de ligação",
  "Acompanhamento",
  "Análise de exames",
] as const;

// Formas de pagamento
export const FORMAS_PAGAMENTO = [
  "Pix",
  "Dinheiro",
  "Cartão de débito",
  "Cartão de crédito",
] as const;

// Status de pagamento
export const STATUS_PAGAMENTO = ["Pago", "Pendente"] as const;

// Tipos de lançamento
export const TIPOS_LANCAMENTO = ["Entrada", "Despesa"] as const;

// Status de tarefa
export const STATUS_TAREFA = ["Não iniciado", "Em andamento", "Paralisado", "Finalizado"] as const;
