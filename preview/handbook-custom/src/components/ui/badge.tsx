import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Interior Badge — a 6px-radius chip, never a pill. A chip on a light surface
 * is filled, not outlined: a 1px outline on a white chip sitting on a white
 * field is invisible. Counts and ids inside a chip run mono with
 * tabular-nums.
 */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5",
    "text-[11.5px] font-medium leading-[16px] whitespace-nowrap",
    "transition-colors duration-150",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-[var(--shadow-row)]",
        outline: "border border-border bg-card text-foreground",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive/10 text-destructive",
        success: "bg-success/10 text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
