import React, { createContext, useContext, useEffect, useState } from 'react';

// NOVO: Interface de perfil do usuário
interface UserProfile {
  email: string;
  tipo: "admin" | "agente";
  nome: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (credentials: { email: string; senha: string }) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOVO: Credenciais hardcoded
const CREDENTIALS = {
  admin: {
    email: "admin@email.com.br",
    senha: "123456789",
    nome: "Administrador",
    tipo: "admin" as const,
  },
  agente: {
    email: "agente@email.com.br",
    senha: "123456789",
    nome: "Agente de Campo",
    tipo: "agente" as const,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // NOVO: Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (credentials: { email: string; senha: string }): boolean => {
    const { email, senha } = credentials;

    // Validar credenciais hardcoded
    if (email === CREDENTIALS.admin.email && senha === CREDENTIALS.admin.senha) {
      const userData = {
        email: CREDENTIALS.admin.email,
        tipo: CREDENTIALS.admin.tipo,
        nome: CREDENTIALS.admin.nome,
      };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return true;
    }

    if (email === CREDENTIALS.agente.email && senha === CREDENTIALS.agente.senha) {
      const userData = {
        email: CREDENTIALS.agente.email,
        tipo: CREDENTIALS.agente.tipo,
        nome: CREDENTIALS.agente.nome,
      };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
