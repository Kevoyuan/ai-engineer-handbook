import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Interior Notification — a floating panel for something that arrived rather
 * than something you opened. Unread is live state, so its mark is the accent:
 * a small 2px-radius square, never a pulsing dot. Time runs mono, because it
 * is metadata.
 */

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
  onDismiss?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    { className, title, description, time, unread, onDismiss, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative flex gap-3 rounded-[11px] bg-card p-4",
        "shadow-[var(--shadow-float-popover)]",
        className,
      )}
      {...props}
    >
      {unread ? (
        <span
          aria-label="Unread"
          className="mt-[6px] size-[7px] shrink-0 rounded-[2px] bg-ring"
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[13px] font-medium leading-snug tracking-[-0.01em] text-foreground">
          {title}
        </p>
        {description ? (
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {time ? (
          <p className="pt-1 font-mono text-[10.5px] tabular-nums text-muted-foreground">
            {time}
          </p>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground",
            "transition-[background-color,color] duration-150",
            "hover:bg-secondary hover:text-foreground",
            "focus-visible:outline-none focus-visible:bg-ring/[0.06] focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]",
          )}
        >
          <X className="size-3.5" strokeWidth={1.5} />
        </button>
      ) : null}
    </div>
  ),
);
Notification.displayName = "Notification";

export { Notification };
