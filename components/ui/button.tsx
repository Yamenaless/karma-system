import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-purple-700 hover:via-violet-700 hover:to-fuchsia-700 transition-all duration-300",
        destructive:
          "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
        outline:
          "border-2 border-purple-300 bg-background hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 shadow-sm hover:shadow-md transition-all duration-300",
        secondary:
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:scale-105 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300",
        ghost: "hover:bg-purple-50 hover:text-purple-700 transition-all duration-300",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700 transition-all duration-300",
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

