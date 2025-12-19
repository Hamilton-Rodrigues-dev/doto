import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo-Light.svg"; // ajuste o caminho se necessário

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Extrair a função 'login' do contexto!
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    // 1. CHAMADA REAL À FUNÇÃO DE LOGIN DO CONTEXTO
    const loginSuccess = login({ email, senha });

    if (loginSuccess) {
      // 2. SE SUCESSO, ATUALIZA O ESTADO NO CONTEXTO E NAVEGA
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      // 3. SE FALHA, MOSTRA ERRO
      toast.error("E-mail ou senha incorretos.");
    }
  };
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center
  bg-gradient-to-b from-[#0B68F7] via-[#001C46] to-[#000916] p-4"
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-4  ">
            <img
              src={logo}
              alt="Dotô IA Logo"
              className="h-16 w-auto mb-4 rounded-lg"
            />
            <h1 className="text-3xl text-muted font-bold text-center">
              Dotô IA
            </h1>
          </div>
          <p className="text-muted text-center mt-2">
            Gerencie sua clinica com inteligência
          </p>
        </div>

        {/* Form */}
        <div
          className="
            relative
            rounded-2xl
            shadow-2xl
            backdrop-blur-xl
            bg-white/10
            border border-white/20
          "
        >
          {/* Brilho sutil para efeito de vidro */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              rounded-2xl
              bg-gradient-to-br
              from-white/20
              to-transparent
            "
          />

          {/* Conteúdo */}
          <div className="relative z-10 p-6">
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha" className="text-muted-foreground">
          Senha
        </Label>
        <Input
          id="senha"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="h-12"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
      >
        Entrar
      </Button>

      <div className="text-center">
        <button
          type="button"
          className="text-sm text-accent hover:underline"
        >
          Esqueci minha senha
        </button>
      </div>
          </form>
          </div>
        </div>


        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Dôto. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
