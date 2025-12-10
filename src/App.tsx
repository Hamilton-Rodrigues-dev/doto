import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
            <TooltipProvider>
        <ConsultasProvider>
          <AgentesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              <Route path="/dashboard" element={<ProtectedRoute allowedTypes={["admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/pacientes" element={<ProtectedRoute allowedTypes={["admin"]}><Pacientes /></ProtectedRoute> } />
              <Route path="/consultas" element={<ProtectedRoute allowedTypes={["admin"]}><Consultas /></ProtectedRoute>} />
              <Route path="/consultas/iniciada/:id" element={<ProtectedRoute allowedTypes={["admin"]}><ConsultaIniciada /></ProtectedRoute>} />
              <Route path="/agendamentos" element={<ProtectedRoute allowedTypes={["admin"]}><Agendamentos /></ProtectedRoute>} />
              <Route path="/tarefas" element={<ProtectedRoute allowedTypes={["admin"]}><Tarefas /></ProtectedRoute>} />
              <Route path="/financeiro" element={<ProtectedRoute allowedTypes={["admin"]}><Financeiro /></ProtectedRoute>} />
              <Route path="/dashboard/agentes" element={<ProtectedRoute allowedTypes={["admin"]}><Agentes /></ProtectedRoute>} />
              <Route path="/dashboard/agentes/novo" element={<ProtectedRoute allowedTypes={["admin"]}><NovoAgente /></ProtectedRoute>} />
              <Route path="/dashboard/agentes/:id" element={<ProtectedRoute allowedTypes={["admin"]}><AgenteDetalhes /></ProtectedRoute>} />
              <Route path="/dashboard/agentes/:id/integracoes" element={<ProtectedRoute allowedTypes={["admin"]}><Integracoes /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </AgentesProvider>
        </ConsultasProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
