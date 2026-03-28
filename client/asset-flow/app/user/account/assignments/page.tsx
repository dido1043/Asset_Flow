"use client";

import { AssignmentsSection } from "@/app/components/Pages/User/account/sections/AssignmentsSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function AssignmentsWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#assignments">
      <AssignmentsSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
