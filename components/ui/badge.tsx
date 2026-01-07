import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-md",
        secondary:
          "border-black bg-gray-100 text-black",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow-md",
        success:
          "border-success bg-success text-success-foreground shadow-md",
        warning:
          "border-warning bg-warning text-warning-foreground shadow-md",
        info:
          "border-info bg-info text-info-foreground shadow-md",
        outline: "text-primary border-2 border-primary bg-white hover:bg-primary/10",
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

