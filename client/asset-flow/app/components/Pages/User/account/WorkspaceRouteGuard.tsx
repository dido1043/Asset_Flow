"use client";

import { useTranslations } from "@/app/lib/i18n";

import { EmptyState } from "./shared";
import { useWorkspaceContext } from "./WorkspaceContext";

export function WorkspaceRouteGuard({
  sectionHref,
  children,
}: {
  sectionHref: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  const { visibleSections, workspaceScopeLabel } = useWorkspaceContext();
  const allowed = visibleSections.some((section) => section.href === sectionHref);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <EmptyState
        title={t("workspace.guard.title")}
        description={t("workspace.guard.description", { scope: workspaceScopeLabel })}
      />
    </div>
  );
}
