"use client";

import * as React from "react";

import { cn } from "../utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "mt-2 w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition",
          "placeholder:text-slate-400",
          "focus:bg-white focus:ring-2",
          hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-slate-200 focus:border-brand-500 focus:ring-brand-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

