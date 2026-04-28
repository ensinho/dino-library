import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-medium tracking-[-0.01em] ring-offset-background transition-[transform,background-color,color,box-shadow] duration-300 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        // Primary = ink-on-canvas (warm bone). Quiet but commanding.
        default: "bg-foreground text-background hover:bg-foreground/90 shadow-ring",
        // Jade accent — reserve for the single CTA per section.
        accent:  "bg-jade text-background hover:bg-jade/90 shadow-amber",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Ring-only outline (Awwwards-style). No fill.
        outline: "bg-transparent text-foreground ring-1 ring-inset ring-foreground/15 hover:ring-foreground/30 hover:bg-foreground/[0.04]",
        // Quiet secondary surface
        secondary: "bg-surface-2 text-foreground ring-1 ring-inset ring-foreground/8 hover:bg-surface-3",
        // Ghost = no chrome until hover
        ghost: "text-foreground/80 hover:text-foreground hover:bg-foreground/[0.04]",
        // Editorial inline link with jade underline
        link: "text-jade underline-offset-4 decoration-jade/40 hover:decoration-jade hover:underline rounded-none px-0",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base",
        icon: "h-11 w-11",
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
