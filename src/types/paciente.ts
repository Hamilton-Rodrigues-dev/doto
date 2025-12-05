export interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ultimaConsulta: string;
  pendencia: boolean;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  observacoes?: string;
  protocolo?: string;
  primeiraConsulta?: boolean;
}

export interface PacienteFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  observacoes: string;
}

export interface FiltroPacientes {
  protocolo: string;
  somentePendencia: boolean;
  primeiraConsulta: boolean;
  dataInicial: string;
  dataFinal: string;
}
