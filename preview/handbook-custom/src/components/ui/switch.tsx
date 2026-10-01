"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/*
 * Interior Switch — a slot with a key in it, not a pill. The track is a
 * recessed well at 6px radius; the thumb is a 4px-radius cap with a bottom
 * lip. On, the track takes the primary Button's flat ink fill and thumb
 * shadow, so the two controls read as one material. Focus is the outside
 * line, inverted accent on the ink track.
 */

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-[6px] p-[3px]",
      "bg-secondary shadow-[var(--shadow-well)]",
      "transition-[background-color,box-shadow] duration-150",
      "focus-visible:outline-none focus-visible:shadow-[var(--shadow-well),0_0_0_1.5px_var(--ring)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:shadow-[var(--shadow-thumb)]",
      "data-[state=checked]:focus-visible:shadow-[var(--shadow-thumb),0_0_0_1.5px_var(--ring-inverted)]",
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-[4px] bg-card",
        "shadow-[var(--shadow-cap)]",
        "transition-transform duration-150",
        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
