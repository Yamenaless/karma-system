import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-purple-100 to-violet-100 text-purple-900",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md",
        outline: "text-foreground border-2 border-purple-300 bg-white hover:border-purple-500 hover:bg-purple-50",
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

