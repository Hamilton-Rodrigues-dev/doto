import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AgentCard } from "@/components/agentes/AgentCard";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import { useAgentes } from "@/contexts/AgentesContext";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Agentes() {
  const navigate = useNavigate();
  const { agentes } = useAgentes();

  const handleCreateAgent = () => {
    navigate("/dashboard/agentes/novo");
  };

  const handleManageAgent = (agentId: string) => {
    navigate(`/dashboard/agentes/${agentId}`);
  };

  return (
    <AppLayout>
      
      <div className="space-y-6">
        {/* Header */}
       <PageHeader
  title="Agentes"
  breadcrumb="Agentes"
  actions={
    <Button onClick={handleCreateAgent} className="gap-2 w-full sm:w-auto">
      <Plus className="w-4 h-4" />
      Criar agente
    </Button>
  }
/>

<p className="text-muted-foreground mt-1 px-8 ">
  Crie, treine e gerencie seus agentes de IA
</p>


        {/* Content */}
        {agentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 ">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <Bot className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Vamos criar seu primeiro agente?
            </h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Nenhum agente foi cadastrado ainda.
            </p>
            <Button onClick={handleCreateAgent} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Criar agente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 ">
            {agentes.map((agent) => (
              <AgentCard
                key={agent.id}
                avatar={agent.avatar || ""}
                name={agent.name}
                model={agent.model}
                description={agent.description}
                onClick={() => handleManageAgent(agent.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

