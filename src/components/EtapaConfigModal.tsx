import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EtapaFunil } from "@/lib/mockData";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface EtapaConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (etapa: EtapaFunil) => void;
  etapa?: EtapaFunil | null;
  existingEtapas: EtapaFunil[];
  pipelineId: string;
}

const coresPreset = [
  { nome: 'Verde', bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700', hex: '#d1fae5' },
  { nome: 'Vermelho', bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', hex: '#fee2e2' },
  { nome: 'Azul', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', hex: '#dbeafe' },
  { nome: 'Amarelo', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', hex: '#fef3c7' },
  { nome: 'Roxo', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', hex: '#f3e8ff' },
  { nome: 'Rosa', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', hex: '#fce7f3' },
  { nome: 'Laranja', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', hex: '#ffedd5' },
  { nome: 'Ciano', bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700', hex: '#cffafe' },
];

export default function EtapaConfigModal({ 
  open, 
  onClose, 
  onSave, 
  etapa,
  existingEtapas,
  pipelineId,
}: EtapaConfigModalProps) {
  const [label, setLabel] = useState('');
  const [corSelecionada, setCorSelecionada] = useState(0);

  useEffect(() => {
    if (etapa) {
      setLabel(etapa.label);
      const corIndex = coresPreset.findIndex(c => c.bg === etapa.cor);
      setCorSelecionada(corIndex >= 0 ? corIndex : 0);
    } else {
      setLabel('');
      setCorSelecionada(0);
    }
  }, [etapa, open]);

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Nome da etapa é obrigatório");
      return;
    }

    const cor = coresPreset[corSelecionada];
    const ordem = etapa?.ordem || Math.max(0, ...existingEtapas.map(e => e.ordem)) + 1;

    onSave({
      id: etapa?.id || `etapa_${Date.now()}`,
      label: label.trim(),
      cor: cor.bg,
      borderColor: cor.border,
      textColor: cor.text,
      ordem,
      pipelineId,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {etapa ? 'Editar Etapa' : 'Nova Etapa do Funil'}
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova etapa ao seu funil de vendas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Nome da Etapa</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Negociação, Fechamento..."
              maxLength={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Cor da Etapa</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {coresPreset.map((cor, index) => (
                <button
                  key={index}
                  onClick={() => setCorSelecionada(index)}
                  className={`h-16 rounded-lg border-2 transition-all ${
                    corSelecionada === index 
                      ? 'border-primary scale-105 shadow-md' 
                      : 'border-border hover:scale-105'
                  } ${cor.bg}`}
                  title={cor.nome}
                >
                  {corSelecionada === index && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className={`${coresPreset[corSelecionada].bg} ${coresPreset[corSelecionada].border} ${coresPreset[corSelecionada].text} border-2 rounded-lg p-4`}>
              <h3 className="font-semibold">{label || 'Nome da Etapa'}</h3>
              <p className="text-sm mt-1">0 leads: R$ 0.00</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!label.trim()}>
            {etapa ? 'Atualizar' : 'Adicionar Etapa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
