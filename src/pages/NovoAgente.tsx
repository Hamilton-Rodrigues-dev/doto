import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useAgentes } from "@/contexts/AgentesContext";
import { toast } from "@/hooks/use-toast";

const modelosDisponiveis = [
  "GPT-4.1 Mini",
  "GPT-4 Turbo",
  "GPT-4",
  "GPT-3.5 Turbo",
  "Claude 3 Opus",
  "Claude 3 Sonnet",
];

export default function NovoAgente() {
  const navigate = useNavigate();
  const { createAgente } = useAgentes();
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate("/dashboard/agentes");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do agente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.model) {
      toast({
        title: "Erro",
        description: "Selecione um modelo para o agente.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "A descrição do agente é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newId = createAgente(formData);
      navigate(`/dashboard/agentes/${newId}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Agente</h1>
            <p className="text-muted-foreground mt-1">
              Configure um novo agente de IA para seu sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações do Agente</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar um novo agente de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome do Agente <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Assistente de Atendimento"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Modelo de IA <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model: value })
                  }
                  required
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelosDisponiveis.map((modelo) => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva as funcionalidades e o propósito deste agente..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Descreva de forma clara o que este agente faz e para que serve.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Agente"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
