import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { IntegrationCard } from "@/components/agentes/IntegrationCard";
import {
  Calendar,
  MessageSquare,
  ShoppingCart,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentes } from "@/contexts/AgentesContext";
import { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Volume2,
  Calendar,
  MessageSquare,
  ShoppingCart,
};

export default function Integracoes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIntegracoes, toggleIntegracao, getAgente } = useAgentes();

  if (!id) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/agentes")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="text-center text-muted-foreground">
            Agente não encontrado
          </div>
        </div>
      </AppLayout>
    );
  }

  const agente = getAgente(id);
  const integracoes = getIntegracoes(id);

  const handleBack = () => {
    navigate(`/dashboard/agentes/${id}`);
  };

  const handleToggle = (integracaoId: string) => {
    toggleIntegracao(id, integracaoId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
            <p className="text-muted-foreground mt-1">
              {agente
                ? `Conecte "${agente.name}" a outros serviços para expandir suas capacidades.`
                : "Conecte seu agente a outros serviços para expandir suas capacidades."}
            </p>
          </div>
        </div>

        {/* Integrations Grid */}
        {integracoes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma integração disponível
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integracoes.map((integracao) => {
              const IconComponent = iconMap[integracao.icon] || Volume2;
              return (
                <IntegrationCard
                  key={integracao.id}
                  icon={IconComponent}
                  name={integracao.name}
                  description={integracao.description}
                  isActive={integracao.isActive}
                  onActivate={() => handleToggle(integracao.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
