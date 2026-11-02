import type { ReactNode } from "react";

export interface Column<T> {
  key:        string;
  header:     string;
  width?:     string;
  render?:    (row: T) => ReactNode;
}

export interface DataTableProps<T extends object> {
  columns:    Column<T>[];
  rows:       T[];
  emptyText?: string;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  emptyText = "Sin datos",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`table-wrap ${className}`}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row)
                      : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
