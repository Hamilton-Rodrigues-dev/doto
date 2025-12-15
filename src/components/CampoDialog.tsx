import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CampoPersonalizado } from "@/lib/mockData";
import { toast } from "sonner";

interface CampoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (campo: CampoPersonalizado) => void;
  campo?: CampoPersonalizado | null;
}

export default function CampoDialog({ open, onClose, onSave, campo }: CampoDialogProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'texto' | 'numero' | 'data' | 'selecao'>('texto');
  const [opcoes, setOpcoes] = useState('');

  useEffect(() => {
    if (campo) {
      setNome(campo.nome);
      setTipo(campo.tipo);
      setOpcoes(campo.opcoes?.join('\n') || '');
    } else {
      setNome('');
      setTipo('texto');
      setOpcoes('');
    }
  }, [campo, open]);

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }

    if (tipo === 'selecao' && !opcoes.trim()) {
      toast.error("Adicione pelo menos uma opção para campo de seleção");
      return;
    }

    const novoCampo: CampoPersonalizado = {
      id: campo?.id || Date.now().toString(),
      nome: nome.trim(),
      tipo,
    };

    if (tipo === 'selecao') {
      novoCampo.opcoes = opcoes
        .split('\n')
        .map(o => o.trim())
        .filter(o => o.length > 0);
    }

    onSave(novoCampo);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {campo ? 'Editar Campo' : 'Novo Campo Personalizado'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Nome do Campo</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Orçamento Disponível, Data de Nascimento..."
              maxLength={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Tipo do Campo</Label>
            <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="texto">Texto</SelectItem>
                <SelectItem value="numero">Número</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="selecao">Seleção (Dropdown)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === 'selecao' && (
            <div>
              <Label>Opções (uma por linha)</Label>
              <Textarea
                value={opcoes}
                onChange={(e) => setOpcoes(e.target.value)}
                placeholder="Pequeno&#10;Médio&#10;Grande"
                rows={5}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite uma opção por linha
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!nome.trim()}>
            {campo ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
