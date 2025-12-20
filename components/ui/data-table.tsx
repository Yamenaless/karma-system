import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DataTableProps {
  headers: Array<{ label: string; align?: "left" | "right" | "center"; className?: string }>
  children: ReactNode
  className?: string
  emptyMessage?: string
}

export function DataTable({ headers, children, className, emptyMessage }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-blue-200 bg-white", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50 border-b-2 border-blue-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  "px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wider",
                  header.align === "right" && "text-right",
                  header.align === "center" && "text-center",
                  header.className
                )}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100">
          {children}
        </tbody>
      </table>
      {emptyMessage && (
        <div className="p-12 text-center">
          <p className="text-blue-600/60 text-sm font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

interface DataTableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function DataTableRow({ children, className, onClick }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "transition-all duration-200",
        "hover:bg-blue-50/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface DataTableCellProps {
  children: ReactNode
  align?: "left" | "right" | "center"
  className?: string
}

export function DataTableCell({ children, align = "left", className }: DataTableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-4 text-sm",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className
      )}
    >
      {children}
    </td>
  )
}


