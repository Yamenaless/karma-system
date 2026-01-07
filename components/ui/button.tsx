import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90 border border-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:opacity-90 border border-destructive",
        success:
          "bg-success text-success-foreground shadow-md hover:shadow-lg hover:opacity-90 border border-success",
        warning:
          "bg-warning text-warning-foreground shadow-md hover:shadow-lg hover:opacity-90 border border-warning",
        info:
          "bg-info text-info-foreground shadow-md hover:shadow-lg hover:opacity-90 border border-info",
        outline:
          "border-2 border-primary bg-white text-primary hover:bg-primary/10 hover:border-primary shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-gray-200 border border-black shadow-sm hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-primary text-black",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

