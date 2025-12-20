import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-blue-700 text-white shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200",
        destructive:
          "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200",
        outline:
          "border-2 border-blue-300 bg-white hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200",
        secondary:
          "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200",
        ghost: "hover:bg-blue-50 hover:text-blue-700 transition-all duration-200",
        link: "text-blue-700 underline-offset-4 hover:underline hover:text-blue-800 transition-all duration-200",
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

