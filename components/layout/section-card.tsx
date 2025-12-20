import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCardProps {
  title?: string
  description?: string
  children: ReactNode
  action?: ReactNode
  className?: string
  headerClassName?: string
}

export function SectionCard({ 
  title, 
  description, 
  children, 
  action,
  className,
  headerClassName 
}: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-4", headerClassName)}>
          <div className="space-y-1.5">
            {title && (
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
            )}
            {description && (
              <p className="text-sm text-purple-600/70">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !action && "pt-6")}>
        {children}
      </CardContent>
    </Card>
  )
}


