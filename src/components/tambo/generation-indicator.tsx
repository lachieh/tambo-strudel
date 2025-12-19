"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface GenerationIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isGenerating: boolean;
}

type Hint = {
  message: string;
  href: string;
};

// Static list; not expected to change at runtime.
const HINTS: Hint[] = [
  {
    message: "Strudel LM is open source — check it out!",
    href: "https://github.com/tambo-ai/strudellm",
  },
  {
    message: "Want to build apps like Strudel LM? Check out Tambo",
    href: "https://github.com/tambo-ai/tambo",
  },
  {
    message: "Have an issue? Open a GitHub issue",
    href: "https://github.com/tambo-ai/strudellm/issues",
  },
];

const INITIAL_HINT_DELAY_MS = 3000;
const HINT_ROTATION_MS = 3500;
const DOTS_TICK_MS = 450;

export function GenerationIndicator({
  isGenerating,
  className,
  ...props
}: GenerationIndicatorProps) {
  const [showHints, setShowHints] = React.useState(false);
  const [dotCount, setDotCount] = React.useState(0);
  const [hintIndex, setHintIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isGenerating) {
      setShowHints(false);
      setDotCount(0);
      setHintIndex(0);
      return;
    }

    setShowHints(false);
    setDotCount(0);
    setHintIndex(0);

    if (HINTS.length === 0) return;

    const timeout = window.setTimeout(() => {
      setShowHints(true);
    }, INITIAL_HINT_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isGenerating]);

  React.useEffect(() => {
    if (!isGenerating || showHints) return;

    const interval = window.setInterval(() => {
      // 0–3 dots: "", ".", "..", "..."
      setDotCount((prev) => (prev + 1) % 4);
    }, DOTS_TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isGenerating, showHints]);

  React.useEffect(() => {
    if (!isGenerating || !showHints || HINTS.length === 0) return;

    const interval = window.setInterval(() => {
      setHintIndex((prev) => (prev + 1) % HINTS.length);
    }, HINT_ROTATION_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isGenerating, showHints]);

  const hint = HINTS.length > 0 ? HINTS[hintIndex] : null;
  const dots = ".".repeat(dotCount);

  return (
    <div
      className={cn(
        "h-6 min-w-0 flex items-center text-xs text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {!isGenerating ? null : showHints && hint ? (
        <a
          className="underline underline-offset-4 hover:text-foreground truncate"
          href={hint.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {hint.message}
        </a>
      ) : (
        <span className="truncate">{`Generating${dots}`}</span>
      )}
    </div>
  );
}
