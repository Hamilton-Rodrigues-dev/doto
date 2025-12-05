import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import arrowDownUpIcon from "@/assets/arrow-down-up.svg";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  minWidth?: number | string;
}

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
  minWidth,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const resolvedMinWidth =
    typeof minWidth === "number" ? `${minWidth}px` : minWidth || "720px";

  // Find index of first sortable column
  const firstSortableIndex = columns.findIndex((col) => col.sortable);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc"
          ? { key, direction: "desc" }
          : { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key];
      const bValue = (b as Record<string, unknown>)[sortConfig.key];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Handle dates (DD/MM/YY format)
      const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (dateRegex.test(aValue) && dateRegex.test(bValue)) {
          const [aDay, aMonth, aYear] = aValue.split("/").map(Number);
          const [bDay, bMonth, bYear] = bValue.split("/").map(Number);
          const aDate = new Date(2000 + aYear, aMonth - 1, aDay);
          const bDate = new Date(2000 + bYear, bMonth - 1, bDay);
          return sortConfig.direction === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortConfig.direction === "asc"
          ? aValue === bValue
            ? 0
            : aValue
            ? -1
            : 1
          : aValue === bValue
          ? 0
          : aValue
          ? 1
          : -1;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr, "pt-BR");
      }
      return bStr.localeCompare(aStr, "pt-BR");
    });
  }, [data, sortConfig]);

  const shouldShowSortIcon = (column: Column<T>, index: number): boolean => {
    if (!column.sortable) return false;

    if (sortConfig) {
      return sortConfig.key === column.key;
    }

    return index === firstSortableIndex;
  };

  return (
    <div
      className={cn(
        "bg-card w-full rounded-xl shadow-card border border-border overflow-x-auto lg:overflow-hidden",
        className
      )}
    >
      <div className="relative w-full overflow-x-auto">
        <Table className="w-full" style={{ minWidth: resolvedMinWidth }}>
          <TableHeader>
            <TableRow className="bg-[#dbeafe] text-[#0b68f7] [&>th:first-child]:rounded-tl-xl [&>th:last-child]:rounded-tr-xl rounded-t-xl overflow-hidden">
              {columns.map((column, index) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    "text-[#0b68f7] text-xs tracking-wider",
                    column.sortable &&
                      "cursor-pointer select-none  transition-colors",
                    column.className
                  )}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}

                    <div className="w-4 h-4 flex items-center justify-center">
                      {shouldShowSortIcon(column, index) && (
                        <ArrowUpDown
                          className={cn(
                            "w-4 h-4 text-[#0b68f7]",
                            sortConfig?.key === column.key &&
                              sortConfig.direction === "desc" &&
                              "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    className={column.className}
                  >
                    {column.render
                      ? column.render(item)
                      : ((item as Record<string, unknown>)[
                          column.key
                        ] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
