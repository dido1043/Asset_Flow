import type { ReactNode } from "react";

import { WorkspaceShell } from "@/app/components/Pages/User/account/WorkspaceShell";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
