import { createContext, useContext, useState, ReactNode } from "react";
import type { Agente, Integracao, AgenteFormData } from "@/types/agente";
import { toast } from "@/hooks/use-toast";

// Mock data inicial
const agentesIniciais: Agente[] = [
  {
    id: "1",
    name: "Assistente de Atendimento",
    model: "GPT-4.1 Mini",
    description: "Agente especializado em atendimento ao cliente, capaz de responder perguntas frequentes e agendar consultas.",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Consultor Médico",
    model: "GPT-4 Turbo",
    description: "Agente focado em fornecer informações médicas básicas e orientações sobre saúde.",
    createdAt: "2025-01-20T14:30:00Z",
    updatedAt: "2025-01-20T14:30:00Z",
  },
  {
    id: "3",
    name: "Agendador Inteligente",
    model: "GPT-4.1 Mini",
    description: "Especializado em gerenciar agendamentos, verificar disponibilidade e confirmar consultas.",
    createdAt: "2025-01-25T09:15:00Z",
    updatedAt: "2025-01-25T09:15:00Z",
  },
];

const integracoesDisponiveis = [
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Integração com ElevenLabs para síntese de voz e conversas naturais com áudio.",
    icon: "Volume2",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Conecte seu agente ao Google Calendar para gerenciar eventos e agendamentos automaticamente.",
    icon: "Calendar",
  }
];

interface AgentesContextType {
  agentes: Agente[];
  createAgente: (data: AgenteFormData) => string;
  updateAgente: (id: string, data: AgenteFormData) => void;
  deleteAgente: (id: string) => void;
  getAgente: (id: string) => Agente | undefined;
  getIntegracoes: (agentId: string) => Integracao[];
  toggleIntegracao: (agentId: string, integracaoId: string) => void;
  getIntegracoesDisponiveis: () => typeof integracoesDisponiveis;
}

const AgentesContext = createContext<AgentesContextType | undefined>(undefined);

export function AgentesProvider({ children }: { children: ReactNode }) {
  const [agentes, setAgentes] = useState<Agente[]>(agentesIniciais);
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);

  const createAgente = (data: AgenteFormData): string => {
    const newId = String(Date.now());
    const newAgente: Agente = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAgentes((prev) => [...prev, newAgente]);
    toast({
      title: "Sucesso",
      description: "Agente criado com sucesso!",
    });
    return newId;
  };

  const updateAgente = (id: string, data: AgenteFormData) => {
    setAgentes((prev) =>
      prev.map((agente) =>
        agente.id === id
          ? { ...agente, ...data, updatedAt: new Date().toISOString() }
          : agente
      )
    );
    toast({
      title: "Sucesso",
      description: "Agente atualizado com sucesso!",
    });
  };

  const deleteAgente = (id: string) => {
    setAgentes((prev) => prev.filter((agente) => agente.id !== id));
    setIntegracoes((prev) => prev.filter((int) => int.agentId !== id));
    toast({
      title: "Sucesso",
      description: "Agente deletado com sucesso!",
    });
  };

  const getAgente = (id: string): Agente | undefined => {
    return agentes.find((agente) => agente.id === id);
  };

  const getIntegracoes = (agentId: string): Integracao[] => {
    const agentIntegracoes = integracoes.filter((int) => int.agentId === agentId);
    
    // Retorna todas as integrações disponíveis, marcando como ativas as que já foram ativadas
    return integracoesDisponiveis.map((intDisponivel) => {
      const existing = agentIntegracoes.find((int) => int.id === intDisponivel.id);
      if (existing) {
        return existing;
      }
      // Retorna integração disponível mas não ativada
      return {
        id: intDisponivel.id,
        name: intDisponivel.name,
        description: intDisponivel.description,
        icon: intDisponivel.icon,
        isActive: false,
        agentId: agentId,
      };
    });
  };

  const toggleIntegracao = (agentId: string, integracaoId: string) => {
    setIntegracoes((prev) => {
      const existing = prev.find(
        (int) => int.agentId === agentId && int.id === integracaoId
      );

      if (existing) {
        // Atualiza o estado da integração existente
        const isActivating = !existing.isActive;
        
        // Mostra toast imediatamente
        toast({
          title: isActivating ? "Integração ativada" : "Integração desativada",
          description: isActivating
            ? "A integração foi ativada com sucesso."
            : "A integração foi desativada.",
        });
        
        return prev.map((int) =>
          int.agentId === agentId && int.id === integracaoId
            ? { ...int, isActive: !int.isActive }
            : int
        );
      } else {
        // Cria nova integração ativada
        const integracaoDisponivel = integracoesDisponiveis.find(
          (int) => int.id === integracaoId
        );
        if (integracaoDisponivel) {
          toast({
            title: "Integração ativada",
            description: "A integração foi ativada com sucesso.",
          });
          
          return [
            ...prev,
            {
              id: integracaoDisponivel.id,
              name: integracaoDisponivel.name,
              description: integracaoDisponivel.description,
              icon: integracaoDisponivel.icon,
              isActive: true,
              agentId: agentId,
            },
          ];
        }
        return prev;
      }
    });
  };

  const getIntegracoesDisponiveis = () => {
    return integracoesDisponiveis;
  };

  return (
    <AgentesContext.Provider
      value={{
        agentes,
        createAgente,
        updateAgente,
        deleteAgente,
        getAgente,
        getIntegracoes,
        toggleIntegracao,
        getIntegracoesDisponiveis,
      }}
    >
      {children}
    </AgentesContext.Provider>
  );
}

export function useAgentes() {
  const context = useContext(AgentesContext);
  if (!context) {
    throw new Error("useAgentes must be used within an AgentesProvider");
  }
  return context;
}

