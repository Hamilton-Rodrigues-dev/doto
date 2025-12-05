export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return date.toLocaleDateString("pt-BR");
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function parseDateBR(dateStr: string): Date | null {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{2})$/;
  const match = dateStr.match(dateRegex);
  if (match) {
    const [, day, month, year] = match.map(Number);
    return new Date(2000 + year, month - 1, day);
  }
  return null;
}
