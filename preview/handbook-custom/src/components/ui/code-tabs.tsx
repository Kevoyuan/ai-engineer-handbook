"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

/*
 * Interior CodeTabs — the code well with a segmented strip along its top
 * edge. The active tab is the pressed ink thumb (the segmented-control
 * material), a 6px-radius chip with the primary Button's fill and thumb
 * shadow; focus on it is the outside line in the inverted accent.
 */

export interface CodeTabsItem {
  label: string;
  code: string;
  language?: string;
  filename?: string;
}

export interface CodeTabsProps {
  tabs: CodeTabsItem[];
  defaultTab?: string;
  className?: string;
}

const CodeTabs = ({ tabs, defaultTab, className }: CodeTabsProps) => {
  const [active, setActive] = React.useState(defaultTab ?? tabs[0]?.label);
  const current = tabs.find((tab) => tab.label === active) ?? tabs[0];

  if (!current) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[11px] bg-secondary text-foreground",
        "shadow-[var(--shadow-well)]",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(tab.label)}
            className={cn(
              "rounded-[6px] px-3 py-1 text-[12px] font-medium",
              "transition-[background-color,color,box-shadow] duration-150",
              "focus-visible:outline-none",
              active === tab.label
                ? [
                    "bg-primary text-primary-foreground shadow-[var(--shadow-thumb)]",
                    "focus-visible:shadow-[var(--shadow-thumb),0_0_0_1.5px_var(--ring-inverted)]",
                  ].join(" ")
                : [
                    "text-muted-foreground hover:text-foreground",
                    "focus-visible:bg-ring/[0.06] focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]",
                  ].join(" "),
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        code={current.code}
        language={current.language}
        filename={current.filename}
        className="rounded-none shadow-none [&>div]:border-0 [&>div]:pt-1"
      />
    </div>
  );
};
CodeTabs.displayName = "CodeTabs";

export { CodeTabs };
