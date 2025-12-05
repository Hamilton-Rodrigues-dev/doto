import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Filter, AlertTriangle, Check, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PROTOCOLOS } from "@/constants";
import type { Paciente, PacienteFormData, FiltroPacientes } from "@/types/paciente";

const pacientesData: Paciente[] = [
  { id: 1, nome: "Ana Souza", email: "ana.souza22@gmail.com", telefone: "(11) 91234-5678", ultimaConsulta: "22/10/25", pendencia: true },
  { id: 2, nome: "Joao Martins", email: "joao.martins89@hotmail.com", telefone: "(11) 99876-5432", ultimaConsulta: "21/10/25", pendencia: false },
  { id: 3, nome: "Camila Borges", email: "camila.borges@outlook.com", telefone: "(11) 98765-4321", ultimaConsulta: "16/10/25", pendencia: false },
  { id: 4, nome: "Lucas Fernandes", email: "lucas.fernandes.dev@gmail.com", telefone: "(11) 99654-3210", ultimaConsulta: "14/10/25", pendencia: false },
];

const initialFiltros: FiltroPacientes = {
  protocolo: "",
  somentePendencia: false,
  primeiraConsulta: false,
  dataInicial: "",
  dataFinal: "",
};

type SectionKey = "dados" | "observacoes";

type PacienteDraft = PacienteFormData & {
  id?: number;
  ultimaConsulta?: string;
  pendencia?: boolean;
  protocolo?: string;
  primeiraConsulta?: boolean;
};

const novoDraft = (): PacienteDraft => ({
  id: undefined,
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  dataNascimento: "",
  endereco: "",
  observacoes: "",
  ultimaConsulta: "",
  pendencia: false,
  protocolo: "",
  primeiraConsulta: false,
});

const mapPacienteToDraft = (paciente: Paciente): PacienteDraft => ({
  id: paciente.id,
  nome: paciente.nome,
  email: paciente.email,
  telefone: paciente.telefone,
  cpf: paciente.cpf || "",
  dataNascimento: paciente.dataNascimento || "",
  endereco: paciente.endereco || "",
  observacoes: paciente.observacoes || "",
  ultimaConsulta: paciente.ultimaConsulta,
  pendencia: paciente.pendencia,
  protocolo: paciente.protocolo,
  primeiraConsulta: paciente.primeiraConsulta,
});

export default function Pacientes() {
  const [pacientes, setPacientes] = useState(pacientesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosAtivos, setFiltrosAtivos] = useState(initialFiltros);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [draftPaciente, setDraftPaciente] = useState<PacienteDraft | null>(null);
  const [editingSections, setEditingSections] = useState<Record<SectionKey, boolean>>({
    dados: false,
    observacoes: false,
  });
  const [pendingCancelSection, setPendingCancelSection] = useState<SectionKey | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredPacientes = useMemo(() => {
    return pacientes.filter((p) => {
      const matchesSearch =
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (filtrosAtivos.somentePendencia && !p.pendencia) return false;

      return true;
    });
  }, [pacientes, searchTerm, filtrosAtivos]);

  const handleOpenProntuario = (paciente?: Paciente) => {
    if (paciente) {
      setSelectedPaciente(paciente);
      setDraftPaciente(mapPacienteToDraft(paciente));
      setEditingSections({ dados: false, observacoes: false });
    } else {
      setSelectedPaciente(null);
      setDraftPaciente(novoDraft());
      setEditingSections({ dados: true, observacoes: true });
    }
    setIsProntuarioOpen(true);
  };

  const hasEditing = Object.values(editingSections).some(Boolean);

  const handleCloseProntuario = () => {
    if (hasEditing) {
      setShowExitConfirm(true);
      return;
    }
    setIsProntuarioOpen(false);
    setSelectedPaciente(null);
    setDraftPaciente(null);
  };

  const handleToggleEdit = (section: SectionKey, enable: boolean) => {
    setEditingSections((prev) => ({ ...prev, [section]: enable }));
  };

  const handleCancelSection = (section: SectionKey) => {
    setPendingCancelSection(section);
  };

  const confirmCancelSection = () => {
    if (!pendingCancelSection) return;
    if (selectedPaciente && draftPaciente) {
      const base = mapPacienteToDraft(selectedPaciente);
      setDraftPaciente({ ...draftPaciente, ...base });
    } else {
      setDraftPaciente(novoDraft());
    }
    setEditingSections((prev) => ({ ...prev, [pendingCancelSection]: false }));
    setPendingCancelSection(null);
  };

  const handleSaveSection = (section: SectionKey) => {
    if (!draftPaciente) return;

    if (section === "dados") {
      if (!draftPaciente.nome || !draftPaciente.telefone) {
        toast({
          title: "Erro",
          description: "Nome e telefone sao obrigatorios.",
          variant: "destructive",
        });
        return;
      }

      if (selectedPaciente) {
        const updated: Paciente = {
          ...selectedPaciente,
          nome: draftPaciente.nome,
          email: draftPaciente.email,
          telefone: draftPaciente.telefone,
          cpf: draftPaciente.cpf,
          dataNascimento: draftPaciente.dataNascimento,
          endereco: draftPaciente.endereco,
          observacoes: draftPaciente.observacoes,
        };
        setPacientes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSelectedPaciente(updated);
        setDraftPaciente(mapPacienteToDraft(updated));
        toast({ title: "Sucesso", description: "Dados do paciente atualizados." });
      } else {
        const newPaciente: Paciente = {
          id: pacientes.length + 1,
          nome: draftPaciente.nome,
          email: draftPaciente.email,
          telefone: draftPaciente.telefone,
          ultimaConsulta: draftPaciente.ultimaConsulta || new Date().toLocaleDateString("pt-BR"),
          pendencia: draftPaciente.pendencia ?? false,
          cpf: draftPaciente.cpf,
          dataNascimento: draftPaciente.dataNascimento,
          endereco: draftPaciente.endereco,
          observacoes: draftPaciente.observacoes,
        };
        setPacientes((prev) => [...prev, newPaciente]);
        setSelectedPaciente(newPaciente);
        setDraftPaciente(mapPacienteToDraft(newPaciente));
        toast({ title: "Sucesso", description: "Paciente adicionado." });
      }
      setEditingSections((prev) => ({ ...prev, dados: false }));
      return;
    }

    if (section === "observacoes") {
      if (!selectedPaciente) {
        toast({
          title: "Erro",
          description: "Salve os dados do paciente antes de adicionar observacoes.",
          variant: "destructive",
        });
        return;
      }
      const updated: Paciente = {
        ...selectedPaciente,
        observacoes: draftPaciente.observacoes,
      };
      setPacientes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPaciente(updated);
      setDraftPaciente(mapPacienteToDraft(updated));
      setEditingSections((prev) => ({ ...prev, observacoes: false }));
      toast({ title: "Sucesso", description: "Observacoes atualizadas." });
    }
  };

  const handleApplyFilter = () => {
    setFiltrosAtivos(filtros);
    setIsFilterModalOpen(false);
    toast({
      title: "Filtros aplicados",
      description: "A listagem foi atualizada com os filtros selecionados.",
    });
  };

  const handleClearFilter = () => {
    setFiltros(initialFiltros);
    setFiltrosAtivos(initialFiltros);
    setIsFilterModalOpen(false);
  };

  const columns: Column<Paciente>[] = [
    { key: "nome", label: "Nome", sortable: true },
    { key: "email", label: "E-mail", sortable: true },
    { key: "telefone", label: "Numero de Telefone", sortable: true },
    { key: "ultimaConsulta", label: "Ultima consulta", sortable: true },
    {
      key: "pendencia",
      label: "Pendencia",
      sortable: true,
      render: (item) =>
        item.pendencia ? (
          <AlertTriangle className="w-5 h-5 text-warning" />
        ) : (
          <Check className="w-5 h-5 text-success" />
        ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Pacientes"
        breadcrumb="Pacientes"
        searchPlaceholder="Buscar pacientes"
        onSearch={setSearchTerm}
        actions={
          <Button className="gap-2 w-full lg:w-auto" onClick={() => handleOpenProntuario()}>
            <Plus className="w-4 h-4" />
            Novo paciente
          </Button>
        }
      />

      <div className="pt-8">
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4  border-border">
            <h2 className="text-lg font-semibold text-foreground">Listagem de pacientes</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
          </div>

          <DataTable data={filteredPacientes} columns={columns} onRowClick={handleOpenProntuario} />
        </div>
      </div>

      {/* Modal Prontuario */}
      <Dialog open={isProntuarioOpen} onOpenChange={(open) => (open ? setIsProntuarioOpen(true) : handleCloseProntuario())}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-primary">Prontuario do Paciente</DialogTitle>
            {selectedPaciente && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </DialogHeader>

          {draftPaciente ? (
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-muted/20 rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Dados do Paciente</h3>
                    <p className="text-xs text-muted-foreground">Nome e telefone sao obrigatorios</p>
                  </div>
                  {!editingSections.dados && (
                    <Button variant="outline" size="sm" onClick={() => handleToggleEdit("dados", true)}>
                      Editar
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {editingSections.dados ? (
                    <>
                      <div className="space-y-1">
                        <Label>Nome *</Label>
                        <Input
                          value={draftPaciente.nome}
                          onChange={(e) => setDraftPaciente({ ...draftPaciente, nome: e.target.value })}
                          placeholder="Nome do paciente"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Telefone *</Label>
                        <Input
                          value={draftPaciente.telefone}
                          onChange={(e) => setDraftPaciente({ ...draftPaciente, telefone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>E-mail</Label>
                        <Input
                          value={draftPaciente.email}
                          onChange={(e) => setDraftPaciente({ ...draftPaciente, email: e.target.value })}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>CPF</Label>
                          <Input
                            value={draftPaciente.cpf}
                            onChange={(e) => setDraftPaciente({ ...draftPaciente, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Data de nascimento</Label>
                          <Input
                            type="date"
                            value={draftPaciente.dataNascimento}
                            onChange={(e) => setDraftPaciente({ ...draftPaciente, dataNascimento: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Endereco</Label>
                        <Input
                          value={draftPaciente.endereco}
                          onChange={(e) => setDraftPaciente({ ...draftPaciente, endereco: e.target.value })}
                          placeholder="Rua, numero, cidade"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Nome:</span>{" "}
                        {draftPaciente.nome || "--"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Telefone:</span>{" "}
                        {draftPaciente.telefone || "--"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">E-mail:</span>{" "}
                        {draftPaciente.email || "--"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">CPF:</span>{" "}
                        {draftPaciente.cpf || "--"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Data de nascimento:</span>{" "}
                        {draftPaciente.dataNascimento || "--"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Endereco:</span>{" "}
                        {draftPaciente.endereco || "--"}
                      </p>
                      {draftPaciente.ultimaConsulta && (
                        <p>
                          <span className="font-semibold text-foreground">Ultima consulta:</span>{" "}
                          {draftPaciente.ultimaConsulta}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {editingSections.dados && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => handleCancelSection("dados")}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleSaveSection("dados")}>Salvar alteracoes</Button>
                  </div>
                )}
              </div>

              <div className="bg-muted/20 rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Observacoes / Historico</h3>
                  {!editingSections.observacoes && (
                    <Button variant="outline" size="sm" onClick={() => handleToggleEdit("observacoes", true)}>
                      Editar
                    </Button>
                  )}
                </div>

                {editingSections.observacoes ? (
                  <Textarea
                    value={draftPaciente.observacoes}
                    onChange={(e) => setDraftPaciente({ ...draftPaciente, observacoes: e.target.value })}
                    rows={10}
                    placeholder="Adicione observacoes importantes ou historico do paciente..."
                  />
                ) : (
                  <div className="min-h-[200px] border border-dashed border-border rounded-lg p-3 bg-card text-sm text-muted-foreground">
                    {draftPaciente.observacoes ? draftPaciente.observacoes : "Nenhuma observacao adicionada."}
                  </div>
                )}

                {editingSections.observacoes && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => handleCancelSection("observacoes")}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleSaveSection("observacoes")}>Salvar alteracoes</Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Nenhum paciente selecionado</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Filtro */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Filtrar Pacientes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Protocolo</Label>
              <Select value={filtros.protocolo} onValueChange={(v) => setFiltros({ ...filtros, protocolo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o protocolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PROTOCOLOS.map((protocolo) => (
                    <SelectItem className="cursor-pointer" key={protocolo} value={protocolo}>
                      {protocolo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Somente com pendencia</Label>
              <Switch
                checked={filtros.somentePendencia}
                onCheckedChange={(v) => setFiltros({ ...filtros, somentePendencia: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label className="font-medium">Primeira consulta</Label>
              <Switch
                checked={filtros.primeiraConsulta}
                onCheckedChange={(v) => setFiltros({ ...filtros, primeiraConsulta: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filtros.dataInicial}
                  onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filtros.dataFinal}
                  onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilter}>
              Limpar filtro
            </Button>
            <Button onClick={handleApplyFilter}>Filtrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm exit from prontuario */}
      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Dados nao salvos"
        description="Os dados nao foram salvos, deseja mesmo sair?"
        confirmText="Sair"
        cancelText="Continuar editando"
        onConfirm={() => {
          setShowExitConfirm(false);
          setIsProntuarioOpen(false);
          setSelectedPaciente(null);
          setDraftPaciente(null);
          setEditingSections({ dados: false, observacoes: false });
        }}
      />

      {/* Confirm delete patient */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir Paciente"
        description="Tem certeza que quer excluir este paciente? Esta acao nao pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedPaciente) {
            setPacientes((prev) => prev.filter((p) => p.id !== selectedPaciente.id));
          }
          setShowDeleteConfirm(false);
          setIsProntuarioOpen(false);
          setSelectedPaciente(null);
          setDraftPaciente(null);
          setEditingSections({ dados: false, observacoes: false });
        }}
        variant="destructive"
      />

      {/* Confirm cancel section */}
      <ConfirmDialog
        open={pendingCancelSection !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCancelSection(null);
        }}
        title="Os dados nao foram salvos"
        description="Tem certeza que quer sair sem salvar esta secao?"
        confirmText="Sair sem salvar"
        cancelText="Continuar editando"
        onConfirm={() => {
          confirmCancelSection();
        }}
      />
    </AppLayout>
  );
}
