"use client";

import { AiSection } from "@/app/components/Pages/User/account/sections/AiSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function AiWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#ai-tools">
      <AiSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
