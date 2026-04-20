import type { Role } from "@/app/lib/types";

import type { WorkspaceSection } from "./types";

export const roleOptions: Role[] = ["LEADER", "EMPLOYEE"];

export const selectClassName =
  "mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200";

export const workspaceSections: WorkspaceSection[] = [
  { href: "#overview", path: "/user/account", label: "workspace.sections.overview.label", helper: "workspace.sections.overview.helper" },
  { href: "#profile", path: "/user/account/profile", label: "workspace.sections.profile.label", helper: "workspace.sections.profile.helper" },
  { href: "#users", path: "/user/account/users", label: "workspace.sections.users.label", helper: "workspace.sections.users.helper" },
  { href: "#organizations", path: "/user/account/organizations", label: "workspace.sections.organizations.label", helper: "workspace.sections.organizations.helper" },
  { href: "#products", path: "/user/account/products", label: "workspace.sections.products.label", helper: "workspace.sections.products.helper" },
  { href: "#assignments", path: "/user/account/assignments", label: "workspace.sections.assignments.label", helper: "workspace.sections.assignments.helper" },
  { href: "#protocols", path: "/user/account/protocols", label: "workspace.sections.protocols.label", helper: "workspace.sections.protocols.helper" },
  { href: "#ai-tools", path: "/user/account/ai", label: "workspace.sections.ai.label", helper: "workspace.sections.ai.helper" },
];

export function getWorkspaceSections(role?: string | null) {
  if (role === "EMPLOYEE") {
    return workspaceSections.filter(
      (section) => !["#users", "#organizations"].includes(section.href),
    );
  }

  return workspaceSections;
}

export function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRequiredNumber(value: string, message: string) {
  const parsed = parseOptionalNumber(value);
  if (parsed === null) {
    throw new Error(message);
  }

  return parsed;
}

export function requireText(value: string, message: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(message);
  }

  return trimmed;
}

export function toIsoDateTime(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function toLocalDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60_000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function formatDateTime(value?: string | null, locale?: string, emptyLabel = "Open") {
  if (!value) {
    return emptyLabel;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(locale);
}

export function formatDuration(duration?: number | null, unavailableLabel = "N/A") {
  if (duration === null || duration === undefined) {
    return unavailableLabel;
  }

  if (duration >= 1_000_000) {
    return `${(duration / 1_000_000).toFixed(1)} ms`;
  }

  return `${duration} ns`;
}

export function getRoleBadgeClass(role?: string | null) {
  if (role === "ADMIN") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (role === "LEADER") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-indigo-50 text-indigo-600";
}

export function formatRoleLabel(role?: string | null) {
  if (!role) {
    return "Unknown";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
