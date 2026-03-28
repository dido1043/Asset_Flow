import type { OrganizationDto } from "@/app/lib/types";

export type Feedback = {
  tone: "success" | "error";
  message: string;
};

export type KnownOrganization = OrganizationDto & {
  leaderId: number | null;
  leaderName: string | null;
  memberCount: number;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type WorkspaceSection = {
  href: string;
  path: string;
  label: string;
  helper: string;
};
