"use client";

import { ProtocolsSection } from "@/app/components/Pages/User/account/sections/ProtocolsSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function ProtocolsWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#protocols">
      <ProtocolsSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
