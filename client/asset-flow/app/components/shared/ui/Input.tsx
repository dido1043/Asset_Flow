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
          "mt-2 min-h-11 w-full rounded-2xl border bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200",
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

Input.displayName = "Input";
