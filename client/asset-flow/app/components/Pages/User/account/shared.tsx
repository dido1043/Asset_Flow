import React from "react";

import { Label } from "@/app/components/shared/ui/Label";

import type { Feedback, SelectOption } from "./types";
import { selectClassName } from "./utils";

type SectionCardProps = {
  id: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hint?: React.ReactNode;
  className?: string;
};

export function SectionCard({ id, title, description, actions, children, className }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`.trim()}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}

export function FeedbackMessage({ feedback }: { feedback?: Feedback | null }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.tone === "success"
          ? "rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          : "rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
      }
    >
      {feedback.message}
    </div>
  );
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{hint}</p>
    </div>
  );
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-slate-500">{children}</p>;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  className,
}: SelectFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
