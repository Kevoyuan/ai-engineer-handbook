"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

/*
 * Interior DataTable — the Table seated in a lifted panel, with click-to-sort
 * headers. Numeric (right-aligned) columns run mono with tabular-nums so the
 * digits line up. Sort buttons take the inset focus shape — a row of cells
 * has no room outside itself.
 */

export interface Column<T> {
  key: keyof T & string;
  header: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  rows: T[];
}

/** A row's cell values: primitives the table can sort and print. */
type DataTableCell = string | number | boolean | null | undefined

/** Narrows a cell to a number, so two of them sort numerically. */
function isNumberCell<TCell>(cell: TCell | number): cell is number {
  return typeof cell === "number"
}

function DataTable<T extends Record<string, DataTableCell>>({
  className,
  columns,
  rows,
  ...props
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      // Numbers compare numerically; anything else falls back to text order,
      // so a column of 2, 10, 100 does not sort as 10, 100, 2.
      if (isNumberCell(left) && isNumberCell(right)) {
        return sort.direction === "asc" ? left - right : right - left;
      }
      return sort.direction === "asc"
        ? String(left ?? "").localeCompare(String(right ?? ""))
        : String(right ?? "").localeCompare(String(left ?? ""));
    });
  }, [rows, sort]);

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] bg-card shadow-[var(--shadow-lift)]",
        className,
      )}
      {...props}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.align === "right" ? "text-right" : undefined}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-[5px] uppercase",
                    "transition-[background-color,color,box-shadow] duration-150",
                    "hover:text-foreground",
                    "focus-visible:outline-none focus-visible:bg-ring/[0.06] focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]",
                  )}
                >
                  {column.header}
                  {sort?.key === column.key ? (
                    sort.direction === "asc" ? (
                      <ChevronUp className="size-3" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="size-3" strokeWidth={1.5} />
                    )
                  ) : null}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={
                    column.align === "right"
                      ? "text-right font-mono text-[12.5px] tabular-nums"
                      : undefined
                  }
                >
                  {column.render ? column.render(row) : String(row[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
DataTable.displayName = "DataTable";

export { DataTable };
