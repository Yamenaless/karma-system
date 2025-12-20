import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  stats?: Array<{ label: string; value: string | number; icon?: ReactNode }>
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  action, 
  stats,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-6 mb-8", className)}>
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-purple-700/70 text-base lg:text-lg font-medium">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/50 to-violet-50/30 p-5 border border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-600/80">{stat.label}</p>
                  <p className="text-2xl font-bold text-purple-900">{stat.value}</p>
                </div>
                {stat.icon && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


