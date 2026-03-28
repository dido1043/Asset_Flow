"use client";

import * as React from "react";

import { cn } from "../utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "mt-2 min-h-28 w-full rounded-2xl border bg-white/75 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200",
          "placeholder:text-slate-400 hover:border-slate-300",
          "focus:bg-white focus:ring-2",
          hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-slate-200/90 focus:border-indigo-500 focus:ring-indigo-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
