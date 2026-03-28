"use client";

import { OrganizationsSection } from "@/app/components/Pages/User/account/sections/OrganizationsSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function OrganizationsWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#organizations">
      <OrganizationsSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
