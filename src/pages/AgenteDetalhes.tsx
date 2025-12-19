import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Plug, Edit, Trash2, Save, X } from "lucide-react";
import { useAgentes } from "@/contexts/AgentesContext";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import type { AgenteFormData } from "@/types/agente";

const modelosDisponiveis = [
  "GPT-4.1 Mini",
  "GPT-4 Turbo",
  "GPT-4",
  "GPT-3.5 Turbo",
  "Claude 3 Opus",
  "Claude 3 Sonnet",
];

export default function AgenteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAgente, updateAgente, deleteAgente } = useAgentes();
  const agente = id ? getAgente(id) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<AgenteFormData>({
    name: agente?.name || "",
    model: agente?.model || "",
    description: agente?.description || "",
  });

  if (!agente) {
    return (
      <AppLayout>
        <PageHeader
          title="Detalhes do Agente"
          breadcrumb="Agentes > Detalhes do Agente"
        />
        <div className="pt-8 px-8">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Agente não encontrado
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleIntegracoes = () => {
    navigate(`/dashboard/agentes/${id}/integracoes`);
  };

  const handleEdit = () => {
    setFormData({
      name: agente.name,
      model: agente.model,
      description: agente.description,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: agente.name,
      model: agente.model,
      description: agente.description,
    });
  };

  const handleSave = () => {
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

    if (id) {
      updateAgente(id, formData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteAgente(id);
      navigate("/dashboard/agentes");
    }
  };

  const initials = agente.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout>
      <PageHeader
        title="Detalhes do Agente"
        breadcrumb="Agentes > Detalhes do Agente"
        actions={
          !isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="pt-8 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Agente</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Edite as informações do agente abaixo"
                  : "Visualize as informações do agente"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome do Agente <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
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
                        <SelectValue />
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
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-foreground mb-2">
                        {agente.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-purple-200"
                      >
                        {agente.model}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {agente.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-xs text-muted-foreground">Criado em</Label>
                      <p className="text-sm font-medium">
                        {new Date(agente.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Última atualização</Label>
                      <p className="text-sm font-medium">
                        {new Date(agente.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleIntegracoes}
                className="w-full gap-2"
                variant="outline"
              >
                <Plug className="w-4 h-4" />
                Gerenciar Integrações
              </Button>
              <Button variant="outline" className="w-full gap-2" disabled>
                <Settings className="w-4 h-4" />
                Configurações Avançadas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Agente"
        description="Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita e todas as integrações associadas serão removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
