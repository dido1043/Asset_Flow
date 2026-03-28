"use client";

import { EmptyState } from "./shared";
import { useWorkspaceContext } from "./WorkspaceContext";

export function WorkspaceRouteGuard({
  sectionHref,
  children,
}: {
  sectionHref: string;
  children: React.ReactNode;
}) {
  const { visibleSections, workspaceScopeLabel } = useWorkspaceContext();
  const allowed = visibleSections.some((section) => section.href === sectionHref);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <EmptyState
        title="This page is not available for your role"
        description={`Your current workspace is limited to ${workspaceScopeLabel.toLowerCase()}, so this tool stays hidden here.`}
      />
    </div>
  );
}
