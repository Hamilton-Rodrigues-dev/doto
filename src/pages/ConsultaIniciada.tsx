import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useConsultas } from "@/contexts/ConsultasContext";
import { PROTOCOLOS } from "@/constants";
import { 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Pause,
  Play,
  Square,
  Upload,
  X,
  FileText
} from "lucide-react";

const pacienteData = {
  id: 1,
  nome: "Kelvis Borges",
  idade: 34,
  telefone: "(11) 91234-5678",
  email: "kelvis.borges@email.com",
  convenio: "Unimed",
  dataNascimento: "15/03/1990",
  endereco: "Rua das Flores, 123 - São Paulo, SP",
};

const historicoConsultas = [
  { data: "15/09/25", protocolo: "Emagrecimento", observacao: "Paciente relatou melhora" },
  { data: "01/08/25", protocolo: "Suplementação", observacao: "Iniciou protocolo vitamínico" },
];

const pendencias = [
  { id: 1, texto: "Enviar exames de sangue", concluida: false },
  { id: 2, texto: "Agendar retorno em 30 dias", concluida: false },
];

export default function ConsultaIniciada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { finalizarConsulta } = useConsultas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [protocolo, setProtocolo] = useState("");
  const [localAtendimento, setLocalAtendimento] = useState<"Presencial" | "Teleconsulta">("Presencial");
  const [comoSeSentindo, setComoSeSentindo] = useState("");
  const [sentiuAlteracao, setSentiuAlteracao] = useState("");
  const [temDuvidas, setTemDuvidas] = useState("");
  const [medidas, setMedidas] = useState("");
  const [anotacoes, setAnotacoes] = useState("");
  const [novaPendencia, setNovaPendencia] = useState("");
  const [listaPendencias, setListaPendencias] = useState(pendencias);
  const [examesAnexados, setExamesAnexados] = useState<File[]>([]);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasUnsavedChanges = () => {
    return (
      protocolo !== "" ||
      comoSeSentindo !== "" ||
      sentiuAlteracao !== "" ||
      temDuvidas !== "" ||
      medidas !== "" ||
      anotacoes !== "" ||
      examesAnexados.length > 0 ||
      listaPendencias.some((p) => p.concluida) ||
      timer > 0
    );
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowExitDialog(true);
    } else {
      navigate("/consultas");
    }
  };

  const handleAddPendencia = () => {
    if (novaPendencia.trim()) {
      setListaPendencias([
        ...listaPendencias,
        { id: Date.now(), texto: novaPendencia, concluida: false }
      ]);
      setNovaPendencia("");
    }
  };

  const togglePendencia = (id: number) => {
    setListaPendencias(listaPendencias.map(p => 
      p.id === id ? { ...p, concluida: !p.concluida } : p
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setExamesAnexados(prev => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExame = (index: number) => {
    setExamesAnexados(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizarConsulta = () => {
    if (id) {
      finalizarConsulta(Number(id));
    }
    toast({
      title: "Consulta finalizada",
      description: "A consulta foi salva com sucesso.",
    });
    navigate("/consultas");
  };

  return (
    <AppLayout>
      {/* Sticky Timer for Mobile/Tablet */}
      <div className="lg:hidden sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Tempo:</p>
            <p className="text-xl font-bold text-primary">{formatTime(timer)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={() => { setTimer(0); setIsRunning(false); }}
            >
              <Square className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Consultas</span>
            <span className="text-muted-foreground">&gt;</span>
            <span className="text-primary font-medium">Consultas iniciadas</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1fr] gap-6">
          {/* Coluna 1: Dados do Paciente */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">Dados do Paciente</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-primary font-bold text-xl">KB</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{pacienteData.nome}</h3>
                <p className="text-sm text-muted-foreground">{pacienteData.idade} anos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{pacienteData.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{pacienteData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{pacienteData.dataNascimento}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">{pacienteData.endereco}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">Convênio</p>
              <p className="font-medium text-foreground">{pacienteData.convenio}</p>
            </div>
          </div>

          {/* Coluna 2: Consulta Atual */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Consulta atual</h2>
              <span className="text-sm font-medium text-primary">{localAtendimento}</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Local de Atendimento</Label>
                <Select value={localAtendimento} onValueChange={(v) => setLocalAtendimento(v as "Presencial" | "Teleconsulta")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Teleconsulta">Teleconsulta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Protocolo</Label>
                <Select value={protocolo} onValueChange={setProtocolo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROTOCOLOS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Como está se sentindo?</Label>
                <Textarea
                  value={comoSeSentindo}
                  onChange={(e) => setComoSeSentindo(e.target.value)}
                  placeholder="Descreva como o paciente está se sentindo..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Sentiu alguma alteração?</Label>
                <Textarea
                  value={sentiuAlteracao}
                  onChange={(e) => setSentiuAlteracao(e.target.value)}
                  placeholder="Descreva alterações percebidas..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Tem dúvidas?</Label>
                <Textarea
                  value={temDuvidas}
                  onChange={(e) => setTemDuvidas(e.target.value)}
                  placeholder="Registre as dúvidas do paciente..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Medidas</Label>
                <Textarea
                  value={medidas}
                  onChange={(e) => setMedidas(e.target.value)}
                  placeholder="Peso, altura, IMC, circunferências..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações da consulta</Label>
                <Textarea
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  placeholder="Adicione observações sobre a consulta..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">Histórico do paciente</h3>
              <div className="space-y-3">
                {historicoConsultas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>
                ) : (
                  historicoConsultas.map((consulta, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{consulta.protocolo}</span>
                        <span className="text-xs text-muted-foreground">{consulta.data}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{consulta.observacao}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Coluna 3: Timer + Tabs */}
          <div className="space-y-6">
            {/* Timer - Hidden on mobile/tablet */}
            <div className="hidden lg:block bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Tempo de consulta</p>
                <p className="text-4xl font-bold text-primary mb-4">{formatTime(timer)}</p>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => { setTimer(0); setIsRunning(false); }}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <Tabs defaultValue="pendencias" className="w-full">
                <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="pendencias"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Pendências
                  </TabsTrigger>
                  <TabsTrigger 
                    value="exames"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Exames
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pendencias" className="p-4 m-0">
                  <div className="space-y-3">
                    {listaPendencias.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma pendência registrada</p>
                    ) : (
                      listaPendencias.map((pendencia) => (
                        <div key={pendencia.id} className="flex items-center gap-3">
                          <Checkbox 
                            checked={pendencia.concluida}
                            onCheckedChange={() => togglePendencia(pendencia.id)}
                          />
                          <span className={pendencia.concluida ? "text-muted-foreground line-through" : "text-foreground"}>
                            {pendencia.texto}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Input
                      value={novaPendencia}
                      onChange={(e) => setNovaPendencia(e.target.value)}
                      placeholder="Adicionar pendência..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPendencia()}
                    />
                    <Button size="icon" onClick={handleAddPendencia}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="exames" className="p-4 m-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                  />
                  
                  {examesAnexados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum exame anexado</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {examesAnexados.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveExame(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="mt-2 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Anexar exame
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => setShowFinalizarDialog(true)}>
                Finalizar Consulta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação - Finalizar */}
      <ConfirmDialog
        open={showFinalizarDialog}
        onOpenChange={setShowFinalizarDialog}
        title="Finalizar consulta"
        description="Não vai precisar fazer mais nenhuma alteração?"
        confirmText="Salvar"
        cancelText="Cancelar"
        onConfirm={handleFinalizarConsulta}
      />

      {/* Dialog de Confirmação - Sair sem salvar */}
      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Deseja realmente sair sem salvar?"
        confirmText="Sair sem salvar"
        cancelText="Continuar editando"
        onConfirm={() => navigate("/consultas")}
        variant="destructive"
      />
    </AppLayout>
  );
}
