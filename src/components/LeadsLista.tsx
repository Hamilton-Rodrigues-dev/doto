import { Lead, NotaLead, EtapaFunil } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

interface LeadsListaProps {
  busca: string;
  leads: Lead[];
  notas: NotaLead[];
  etapas: EtapaFunil[];
  onLeadClick: (lead: Lead) => void;
}

export default function LeadsLista({
  busca,
  leads,
  notas: _notas,
  etapas,
  onLeadClick,
}: LeadsListaProps) {
  const leadsFiltrados = (leads || []).filter(
    (lead) =>
      lead.nomeLead.toLowerCase().includes(busca.toLowerCase()) ||
      lead.empresa.toLowerCase().includes(busca.toLowerCase())
  );

  const getEtapaInfo = (lead: Lead) =>
    etapas.find((etapa) => etapa.id === lead.etapaFunil);

  const badgeClasses = (lead: Lead) => {
    const etapa = getEtapaInfo(lead);
    const baseBg = etapa?.cor || "bg-primary/90";
    const text = etapa?.textColor || "text-white";
    const border = etapa?.borderColor ? `${etapa.borderColor} border` : "";
    return `${baseBg} ${text} ${border}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 bg-muted/30 border-b border-border">
        <h3 className="font-semibold">
          Listagem de Leads{" "}
          <span className="text-muted-foreground">
            Total {leadsFiltrados.length}
          </span>
        </h3>
      </div>

      {/* --- VISUAL DESKTOP --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left p-4 font-semibold text-sm">Nome</th>
              <th className="text-left p-4 font-semibold text-sm">Segmento</th>
              <th className="text-left p-4 font-semibold text-sm">Telefone</th>
              <th className="text-left p-4 font-semibold text-sm">Etapa</th>
            </tr>
          </thead>
          <tbody>
            {leadsFiltrados.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="p-4 font-medium">{lead.nomeLead}</td>
                <td className="p-4 text-muted-foreground">{lead.empresa}</td>
                <td className="p-4 text-muted-foreground">{lead.telefone}</td>
                <td className="p-4">
                  <Badge className={badgeClasses(lead)}>
                    {getEtapaInfo(lead)?.label || lead.etapaFunil}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISUAL MOBILE (cards verticais) --- */}
      <div className="block md:hidden p-4 space-y-4">
        {leadsFiltrados.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onLeadClick(lead)}
            className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-2 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <p className="font-semibold">{lead.nomeLead}</p>
                <p className="text-sm text-muted-foreground">{lead.telefone}</p>
                <p className="text-sm text-muted-foreground">{lead.empresa}</p>
              </div>
            </div>

            <Badge
              className={`${badgeClasses(
                lead
              )} text-sm w-full justify-center py-2 mt-2`}
            >
              {getEtapaInfo(lead)?.label || lead.etapaFunil}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
