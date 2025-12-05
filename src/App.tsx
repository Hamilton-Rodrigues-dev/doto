import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConsultasProvider } from "@/contexts/ConsultasContext";
import { AgentesProvider } from "@/contexts/AgentesContext";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Consultas from "./pages/Consultas";
import ConsultaIniciada from "./pages/ConsultaIniciada";
import Agendamentos from "./pages/Agendamentos";
import Tarefas from "./pages/Tarefas";
import Financeiro from "./pages/Financeiro";
import Agentes from "./pages/Agentes";
import AgenteDetalhes from "./pages/AgenteDetalhes";
import NovoAgente from "./pages/NovoAgente";
import Integracoes from "./pages/Integracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConsultasProvider>
        <AgentesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/consultas/iniciada/:id" element={<ConsultaIniciada />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/dashboard/agentes" element={<Agentes />} />
            <Route path="/dashboard/agentes/novo" element={<NovoAgente />} />
            <Route path="/dashboard/agentes/:id" element={<AgenteDetalhes />} />
            <Route path="/dashboard/agentes/:id/integracoes" element={<Integracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AgentesProvider>
      </ConsultasProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
