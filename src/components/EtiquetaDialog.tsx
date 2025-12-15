import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EtiquetaPersonalizada } from "@/lib/mockData";
import { toast } from "sonner";

interface EtiquetaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (etiqueta: EtiquetaPersonalizada) => void;
  etiqueta?: EtiquetaPersonalizada | null;
}

const coresDisponiveis = [
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Amarelo', valor: '#eab308' },
  { nome: 'Verde', valor: '#22c55e' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Roxo', valor: '#a855f7' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Cinza', valor: '#6b7280' },
];

export default function EtiquetaDialog({ open, onClose, onSave, etiqueta }: EtiquetaDialogProps) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3b82f6');

  useEffect(() => {
    if (etiqueta) {
      setNome(etiqueta.nome);
      setCor(etiqueta.cor);
    } else {
      setNome('');
      setCor('#3b82f6');
    }
  }, [etiqueta, open]);

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome da etiqueta é obrigatório");
      return;
    }

    onSave({
      id: etiqueta?.id || Date.now().toString(),
      nome: nome.trim(),
      cor,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {etiqueta ? 'Editar Etiqueta' : 'Nova Etiqueta'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Nome da Etiqueta</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cliente VIP, Urgente..."
              maxLength={30}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {coresDisponiveis.map((c) => (
                <button
                  key={c.valor}
                  onClick={() => setCor(c.valor)}
                  className={`h-12 rounded-md border-2 transition-all ${
                    cor === c.valor ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.valor }}
                  title={c.nome}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">Preview:</span>
            <Badge style={{ backgroundColor: cor, color: 'white' }}>
              {nome || 'Etiqueta'}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!nome.trim()}>
            {etiqueta ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
