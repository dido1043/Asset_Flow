"use client";

import { UsersSection } from "@/app/components/Pages/User/account/sections/UsersSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function UsersWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#users">
      <UsersSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
