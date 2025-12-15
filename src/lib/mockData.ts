// Tipos usados em Leads
export interface Pipeline {
  id: string;
  nome: string;
  descricao?: string;
}

export interface EtapaFunil {
  id: string;
  pipelineId: string;
  label: string;
  cor: string;
  borderColor: string;
  textColor: string;
  ordem: number;
}

export interface Lead {
  id: string;
  nomeLead: string;
  telefone: string;
  email: string;
  empresa: string;
  pipelineId: string;
  etapaFunil: string;
  responsavel: string;
  valorVenda: number;
  valorMensal: number;
  criadoEm: string;
  atualizadoEm?: string;
  tags?: string[];
}

export interface NotaLead {
  id: string;
  leadId: string;
  texto: string;
  autor: string;
  criadoEm: string;
  tipo: "nota" | "movimentacao" | "tarefa" | "reuniao";
  calendarioEventoId?: string;
}

export interface CalendarEvent {
  id: string;
  tipo: "tarefa" | "nota" | "reuniao";
  titulo: string;
  descricao?: string;
  leadId?: string;
  nomeLead?: string;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  status?: "pendente" | "concluida";
  prioridade?: "baixa" | "media" | "alta";
  criadoEm: string;
}

// Mocks mínimos
export const mockPipelines: Pipeline[] = [
  { id: "vendas", nome: "Vendas", descricao: "Funil comercial principal" },
  { id: "parcerias", nome: "Parcerias", descricao: "Funil de alianças" },
];

export const mockEtapasFunil: EtapaFunil[] = [
  { id: "novo", pipelineId: "vendas", label: "Contato Inicial", cor: "bg-emerald-100", borderColor: "border-emerald-300", textColor: "text-emerald-700", ordem: 1 },
  { id: "contato", pipelineId: "vendas", label: "Diagnóstico", cor: "bg-red-100", borderColor: "border-red-300", textColor: "text-red-700", ordem: 2 },
  { id: "proposta", pipelineId: "vendas", label: "Apresentação", cor: "bg-blue-100", borderColor: "border-blue-300", textColor: "text-blue-700", ordem: 3 },
  { id: "novo", pipelineId: "parcerias", label: "Prospectando", cor: "bg-orange-100", borderColor: "border-orange-300", textColor: "text-orange-700", ordem: 1 },
  { id: "contato", pipelineId: "parcerias", label: "Validação", cor: "bg-indigo-100", borderColor: "border-indigo-300", textColor: "text-indigo-700", ordem: 2 },
  { id: "proposta", pipelineId: "parcerias", label: "Contrato", cor: "bg-sky-100", borderColor: "border-sky-300", textColor: "text-sky-700", ordem: 3 },
];

export const mockLeads: Lead[] = [
  { id: "1", nomeLead: "Dr. João Pafuncio", telefone: "67 9999-9999", email: "joao@clinica.com", empresa: "Clínica Coração", pipelineId: "vendas", etapaFunil: "novo", responsavel: "Equipe Vendas", valorVenda: 2000, valorMensal: 600, criadoEm: "2025-09-17", tags: ["Refazer Contato"] },
  { id: "2", nomeLead: "Dra. Giovanna Massalli", telefone: "67 99142-6269", email: "giovanna@endocrino.com", empresa: "Endocrinologia Avançada", pipelineId: "vendas", etapaFunil: "contato", responsavel: "Equipe Vendas", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-17", tags: ["Morno"] },
  { id: "3", nomeLead: "Cintia Peters", telefone: "67 99142-6269", email: "cintia@eventos.com", empresa: "Cerimonialista Peters", pipelineId: "vendas", etapaFunil: "contato", responsavel: "Equipe Vendas", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-17", tags: ["Hot"] },
  { id: "4", nomeLead: "Diógenes", telefone: "67 99264-0107", email: "diogenes@multi.com", empresa: "Multitarefa Ltda", pipelineId: "vendas", etapaFunil: "proposta", responsavel: "Equipe Vendas", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-17", tags: ["Frio"] },
  { id: "5", nomeLead: "Dra. Luana Recalde", telefone: "67 99123-4567", email: "luana@estetica.com", empresa: "Estética Recalde", pipelineId: "vendas", etapaFunil: "novo", responsavel: "Equipe Vendas", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-15", tags: [] },
  { id: "6", nomeLead: "Clínica Horizonte", telefone: "11 99888-7777", email: "contato@horizonte.com", empresa: "Clínica Horizonte", pipelineId: "parcerias", etapaFunil: "novo", responsavel: "Equipe Parcerias", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-20", tags: ["Parceria"] },
  { id: "7", nomeLead: "HealthLabs", telefone: "11 99700-1234", email: "parcerias@healthlabs.com", empresa: "HealthLabs", pipelineId: "parcerias", etapaFunil: "contato", responsavel: "Equipe Parcerias", valorVenda: 0, valorMensal: 0, criadoEm: "2025-09-22", tags: ["Em validação"] },
];

export const mockNotas: NotaLead[] = [
  { id: "1", leadId: "1", texto: "Lead criado e adicionado ao funil", autor: "Sistema", criadoEm: "2025-09-17T10:00:00", tipo: "movimentacao" },
  { id: "2", leadId: "1", texto: "Primeiro contato por telefone. Cliente demonstrou interesse.", autor: "Equipe", criadoEm: "2025-09-18T14:30:00", tipo: "nota" },
];

// Utilitário
export const getCurrentTimestamp = () => new Date().toISOString();
export interface EtiquetaPersonalizada {
  id: string;
  nome: string;
  cor: string;
}
export interface CampoPersonalizado {
  id: string;
  nome: string;
  tipo: "texto" | "numero" | "data" | "selecao";
  opcoes?: string[];
}