import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck, Users, UserCheck, Plus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const protocolosData = [
  { name: "Seg ", value: 5 },
  { name: "Ter", value: 45 },
  { name: "Quar", value: 13  },
  { name: "Qui", value: 10 },
  { name: "Sex", value: 12 },
  { name: "Sab", value: 3 },
  { name: "Dom", value: 1 },
];

const tarefasRecentes = [
  {
    id: 1,
    paciente: "Kelvis Borges",
    avatar: "KB",
    data: "22/10/25",
    tarefa: "Enviar lista de suplementos",
  },
  {
    id: 2,
    paciente: "Ana Souza",
    avatar: "AS",
    data: "22/10/25",
    tarefa: "Enviar prescrição",
  },
  {
    id: 3,
    paciente: "João Martins",
    avatar: "JM",
    data: "21/10/25",
    tarefa: "Agendar retorno",
  },
];

export default function Dashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="pt-8 px-8  animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, Doutor(a)
            </h1>
            <p className="text-muted-foreground capitalize">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select defaultValue="setembro">
              <SelectTrigger className="w-full sm:w-[160px] cursor-pointer bg-primary text-input">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem  value="janeiro">
                  Janeiro
                </SelectItem>
                <SelectItem  value="fevereiro">
                  Fevereiro
                </SelectItem>
                <SelectItem value="marco">
                  Março
                </SelectItem>
                <SelectItem value="abril">
                  Abril
                </SelectItem>
                <SelectItem value="maio">
                  Maio
                </SelectItem>
                <SelectItem value="junho">
                  Junho
                </SelectItem>
                <SelectItem value="julho">
                  Julho
                </SelectItem>
                <SelectItem value="agosto">
                  Agosto
                </SelectItem>
                <SelectItem value="setembro">
                  Setembro
                </SelectItem>
                <SelectItem value="outubro">
                  Outubro
                </SelectItem>
                <SelectItem value="novembro">
                  Novembro
                </SelectItem>
                <SelectItem value="dezembro">
                  Dezembro
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <KPICard
            title="Total de Agendamentos"
            value="146"
            icon={<Calendar className="w-5 h-5 text-color-text-primary" />}
          />
          <KPICard
            title="Agendamento de hoje"
            value="5"
            icon={<CalendarCheck className="w-5 h-5 text-color-text-primary" />}
          />
          <KPICard
            title="Total de pacientes no mês"
            value="60"
            icon={<Users className="w-5 h-5 text-color-text-primary" />}
          />
          <KPICard
            title="Pacientes com retorno"
            value="5"
            icon={<UserCheck className="w-5 h-5 text-color-text-primary" />}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Quantidade de atendimentos por dia da semana
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={protocolosData}
                layout="horizontal"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />

                <YAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Quantidade de atendimentos por dia da semana" 
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tarefas - 1 column */}
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Tarefas</h3>
              <Button
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => navigate("/tarefas")}
              >
                Ver todos
              </Button>
            </div>
            <div className="space-y-4">
              {tarefasRecentes.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F6FAFF] flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {tarefa.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tarefa.paciente}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {tarefa.data}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {tarefa.tarefa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
