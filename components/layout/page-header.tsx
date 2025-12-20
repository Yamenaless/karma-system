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
          <h1 className="text-3xl lg:text-4xl font-bold text-blue-900">
            {title}
          </h1>
          {description && (
            <p className="text-blue-700/70 text-base lg:text-lg font-medium">
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
              className="relative overflow-hidden rounded-lg bg-white p-5 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-600/80">{stat.label}</p>
                  <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                </div>
                {stat.icon && (
                  <div className="p-3 rounded-md bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform duration-200">
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


