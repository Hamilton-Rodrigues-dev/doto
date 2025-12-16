import { Lead, NotaLead, EtapaFunil } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";

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

  /* =========================
     COLUNAS DO DATATABLE
     (API NATIVA DO COMPONENTE)
  ========================== */
  const columns: Column<Lead>[] = [
    {
      key: "nomeLead",
      label: "Nome",
      sortable: true,
      render: (lead) => (
        <span className="font-medium">{lead.nomeLead}</span>
      ),
    },
    {
      key: "empresa",
      label: "Segmento",
      sortable: true,
      render: (lead) => (
        <span className="text-muted-foreground">{lead.empresa}</span>
      ),
    },
    {
      key: "telefone",
      label: "Telefone",
      render: (lead) => (
        <span className="text-muted-foreground">{lead.telefone}</span>
      ),
    },
    {
      key: "etapaFunil",
      label: "Etapa",
      render: (lead) => {
        const etapa = getEtapaInfo(lead);
        return (
          <Badge className={badgeClasses(lead)}>
            {etapa?.label || lead.etapaFunil}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted/30  border-border">
        <h3 className="font-semibold">
          Listagem de Leads{" "}
          <span className="text-muted-foreground">
            Total {leadsFiltrados.length}
          </span>
        </h3>
      </div>

      {/* DataTable */}
      <DataTable
        data={leadsFiltrados}
        columns={columns}
        onRowClick={onLeadClick}
        minWidth="auto"
        headerClassName="bg-blue-100"
        headerTextClassName="text-blue-700"
      />
    </div>
  );
}
