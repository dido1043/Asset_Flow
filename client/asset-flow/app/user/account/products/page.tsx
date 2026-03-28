"use client";

import { ProductsSection } from "@/app/components/Pages/User/account/sections/ProductsSection";
import { WorkspaceRouteGuard } from "@/app/components/Pages/User/account/WorkspaceRouteGuard";
import { useWorkspaceContext } from "@/app/components/Pages/User/account/WorkspaceContext";

export default function ProductsWorkspacePage() {
  const workspace = useWorkspaceContext();

  return (
    <WorkspaceRouteGuard sectionHref="#products">
      <ProductsSection workspace={workspace} />
    </WorkspaceRouteGuard>
  );
}
