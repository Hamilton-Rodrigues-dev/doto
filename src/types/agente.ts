export interface Agente {
  id: string;
  name: string;
  model: string;
  description: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Integracao {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  agentId: string;
  config?: Record<string, any>;
}

export interface AgenteFormData {
  name: string;
  model: string;
  description: string;
}

