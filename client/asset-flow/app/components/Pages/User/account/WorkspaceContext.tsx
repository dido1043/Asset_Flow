"use client";

import React from "react";

import { useAccountWorkspace, type AccountWorkspaceState } from "./useAccountWorkspace";

const WorkspaceContext = React.createContext<AccountWorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const workspace = useAccountWorkspace();

  return <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const workspace = React.useContext(WorkspaceContext);

  if (!workspace) {
    throw new Error("useWorkspaceContext must be used inside WorkspaceProvider.");
  }

  return workspace;
}
