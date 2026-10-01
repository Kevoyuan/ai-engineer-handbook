import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Interior Timeline — a hairline rail with a square 5px-radius ink node per
 * entry, seated on the rail with a bezel-coloured punch-out. The node is ink
 * with the thumb shadow, never accent: an entry that already happened is a
 * fact, not live state. Times are metadata, so they run mono.
 */

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, items, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn("relative space-y-6 border-l border-border pl-6", className)}
      {...props}
    >
      {items.map((item) => (
        <li key={item.title} className="relative">
          <span className="absolute -left-[31px] top-0.5 size-[13px] rounded-[5px] bg-primary shadow-[0_0_0_3px_var(--background),var(--shadow-thumb)]" />
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
              {item.title}
            </p>
            {item.description ? (
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}
            {item.time ? (
              <p className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                {item.time}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  ),
);
Timeline.displayName = "Timeline";

export { Timeline };
