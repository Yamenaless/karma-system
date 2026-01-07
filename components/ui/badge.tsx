import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary text-white",
        secondary:
          "border-gray-200 bg-gray-100 text-gray-900",
        destructive:
          "border-destructive/20 bg-destructive text-white",
        success:
          "border-success/20 bg-success text-white",
        warning:
          "border-warning/20 bg-warning text-white",
        info:
          "border-info/20 bg-info text-white",
        outline: "text-primary border border-gray-300 bg-white hover:bg-gray-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

