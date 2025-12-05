import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedTypes?: ("admin" | "agente")[];
}

// NOVO: Componente de proteção de rotas
export function ProtectedRoute({ children, allowedTypes }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar tipo de usuário se especificado
  if (allowedTypes && user && !allowedTypes.includes(user.tipo)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
