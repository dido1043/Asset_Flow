import type { UserDto } from "@/app/lib/types";

import type { KnownOrganization } from "./types";

export function dedupeById<T extends { id?: number | null }>(items: T[]) {
  const seen = new Set<number>();

  return items.filter((item) => {
    if (typeof item.id !== "number") {
      return true;
    }

    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function ensureUserIncluded(users: UserDto[], currentUser: UserDto) {
  return dedupeById([currentUser, ...users]);
}

export function syncSelectedItem<T extends { id?: number | null }>(items: T[], previous: T | null) {
  if (typeof previous?.id !== "number") {
    return null;
  }

  return items.find((item) => item.id === previous.id) ?? null;
}

export function buildOrganizationPlaceholder(
  organizationId: number,
  organizationName: string,
  memberCount: number,
  leaderId?: number | null,
  leaderName?: string | null,
): KnownOrganization {
  return {
    id: organizationId,
    organizationName,
    leaderId: leaderId ?? null,
    leaderName: leaderName ?? null,
    memberCount,
  };
}
