// src/lib/status-style.ts
import type { StatusTarefa } from "@/types/tarefa";

export const STATUS_STYLE: Record<
  StatusTarefa,
  { badge: string }
> = {
  "Não iniciado": {
    badge: "bg-slate-100 text-slate-800",
  },
  "Em andamento": {
    badge: "bg-emerald-100 text-emerald-800",
  },
  Paralisado: {
    badge: "bg-red-100 text-red-800",
  },
  Finalizado: {
    badge: "bg-blue-100 text-blue-800",
  },
};
