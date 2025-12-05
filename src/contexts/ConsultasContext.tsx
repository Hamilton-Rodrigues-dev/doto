import { createContext, useContext, useState, ReactNode } from "react";
import type { Consulta } from "@/types/consulta";

// Initial mock data
const consultasIniciais: Consulta[] = [
  { id: 1, paciente: "Kelvis Borges", avatar: "KB", data: "28/11/25", hora: "09:00", retorno: true, statusPagamento: "Pago", statusConsulta: "Em andamento", localAtendimento: "Presencial" },
  { id: 2, paciente: "Ana Souza", avatar: "AS", data: "28/11/25", hora: "10:30", retorno: false, statusPagamento: "Pendente", statusConsulta: "A realizar", localAtendimento: "Teleconsulta" },
  { id: 3, paciente: "João Martins", avatar: "JM", data: "28/11/25", hora: "14:00", retorno: true, statusPagamento: "Pago", statusConsulta: "A realizar", localAtendimento: "Presencial" },
  { id: 4, paciente: "Maria Santos", avatar: "MS", data: "29/11/25", hora: "15:30", retorno: false, statusPagamento: "Pago", statusConsulta: "A realizar", localAtendimento: "Teleconsulta" },
  { id: 5, paciente: "Carlos Lima", avatar: "CL", data: "27/11/25", hora: "09:00", retorno: true, statusPagamento: "Pago", statusConsulta: "Realizada", localAtendimento: "Presencial" },
  { id: 6, paciente: "Fernanda Costa", avatar: "FC", data: "27/11/25", hora: "10:30", retorno: false, statusPagamento: "Pago", statusConsulta: "Realizada", localAtendimento: "Teleconsulta" },
];

interface ConsultasContextType {
  consultas: Consulta[];
  finalizarConsulta: (id: number) => void;
  getConsultaAtual: () => Consulta | undefined;
  getConsultasARealizar: () => Consulta[];
  getConsultasRealizadas: () => Consulta[];
}

const ConsultasContext = createContext<ConsultasContextType | undefined>(undefined);

// Helper function to check if a date string (dd/mm/yy) is today
const isToday = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  const consultaDate = new Date(2000 + year, month - 1, day);
  const today = new Date();
  return (
    consultaDate.getDate() === today.getDate() &&
    consultaDate.getMonth() === today.getMonth() &&
    consultaDate.getFullYear() === today.getFullYear()
  );
};

// Helper to parse time string to minutes for comparison
const parseTimeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export function ConsultasProvider({ children }: { children: ReactNode }) {
  const [consultas, setConsultas] = useState<Consulta[]>(consultasIniciais);

  const getConsultaAtual = () => {
    return consultas.find((c) => c.statusConsulta === "Em andamento");
  };

  const getConsultasARealizar = () => {
    return consultas.filter((c) => c.statusConsulta === "A realizar");
  };

  const getConsultasRealizadas = () => {
    return consultas.filter((c) => c.statusConsulta === "Realizada");
  };

  const finalizarConsulta = (id: number) => {
    setConsultas((prev) => {
      // 1. Find and update the current consultation to "Realizada"
      const updated = prev.map((c) =>
        c.id === id ? { ...c, statusConsulta: "Realizada" as const } : c
      );

      // 2. Find the next consultation for today that is "A realizar"
      const consultasHojeARealizar = updated
        .filter((c) => c.statusConsulta === "A realizar" && isToday(c.data))
        .sort((a, b) => parseTimeToMinutes(a.hora) - parseTimeToMinutes(b.hora));

      // 3. If there's a next consultation today, set it to "Em andamento"
      if (consultasHojeARealizar.length > 0) {
        const nextConsultaId = consultasHojeARealizar[0].id;
        return updated.map((c) =>
          c.id === nextConsultaId
            ? { ...c, statusConsulta: "Em andamento" as const }
            : c
        );
      }

      return updated;
    });
  };

  return (
    <ConsultasContext.Provider
      value={{
        consultas,
        finalizarConsulta,
        getConsultaAtual,
        getConsultasARealizar,
        getConsultasRealizadas,
      }}
    >
      {children}
    </ConsultasContext.Provider>
  );
}

export function useConsultas() {
  const context = useContext(ConsultasContext);
  if (!context) {
    throw new Error("useConsultas must be used within a ConsultasProvider");
  }
  return context;
}
