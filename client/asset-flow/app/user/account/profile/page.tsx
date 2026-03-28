"use client";

import { ProfileSection } from "@/app/components/Pages/User/account/sections/ProfileSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function ProfileWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#profile">
      <ProfileSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
