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
    <div className={cn("overflow-x-auto rounded-xl border border-purple-200/50 bg-white/80 backdrop-blur-sm", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50 border-b-2 border-purple-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  "px-4 py-4 text-left text-sm font-bold text-purple-900 uppercase tracking-wider",
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
        <tbody className="divide-y divide-purple-100/50">
          {children}
        </tbody>
      </table>
      {emptyMessage && (
        <div className="p-12 text-center">
          <p className="text-purple-600/60 text-sm font-medium">{emptyMessage}</p>
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
        "hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-violet-50/50 hover:to-fuchsia-50/50",
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


