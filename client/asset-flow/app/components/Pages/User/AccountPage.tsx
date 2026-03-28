"use client";

import Link from "next/link";

import { Button } from "@/app/components/shared/ui/Button";

import { EmptyState, SectionCard } from "./account/shared";
import { useWorkspaceContext } from "./account/WorkspaceContext";
import { formatRoleLabel } from "./account/utils";

const AccountPage = () => {
  const {
    allOrganizations,
    assignments,
    currentUser,
    getOrganizationName,
    handleWorkspaceRefresh,
    myAssignmentsCount,
    pendingByKey,
    products,
    users,
    visibleSections,
    workspaceScopeLabel,
  } = useWorkspaceContext();

  const destinationSections = visibleSections.filter((section) => section.href !== "#overview");

  return (
    <div className="space-y-6">
      <SectionCard
        id="overview"
        title="Workspace Overview"
        description="Start from a cleaner home page, then open the exact tool you need."
        actions={
          <Button variant="outline" onClick={handleWorkspaceRefresh} disabled={Boolean(pendingByKey.workspace)}>
            {pendingByKey.workspace ? "Refreshing..." : "Refresh overview"}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {currentUser?.fullName || "Active teammate"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Your workspace is now split into simpler pages. Pick a destination below to move faster without scrolling
                through one giant dashboard.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {formatRoleLabel(currentUser?.role)}
                </span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {workspaceScopeLabel}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {getOrganizationName(currentUser?.organizationId ?? null)}
                </span>
              </div>
            </div>

            {destinationSections.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {destinationSections.map((section) => (
                  <Link
                    key={section.path}
                    href={section.path}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex min-h-36 flex-col gap-4">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-semibold text-slate-900">{section.label}</p>
                        <span className="mt-3 inline-flex self-start whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-700">
                          Open
                        </span>
                        <p className="mt-2 max-w-xs text-sm text-slate-600">{section.helper}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No extra pages available"
                description="Your current role only exposes the pages needed for your own work."
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Snapshot</p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Visible users</dt>
                  <dd className="font-semibold text-slate-900">{users.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Visible products</dt>
                  <dd className="font-semibold text-slate-900">{products.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Visible assignments</dt>
                  <dd className="font-semibold text-slate-900">{assignments.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>My assignments</dt>
                  <dd className="font-semibold text-slate-900">{myAssignmentsCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Known companies</dt>
                  <dd className="font-semibold text-slate-900">{allOrganizations.length}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Next best step</p>
              <p className="mt-3 text-sm text-slate-600">
                {currentUser?.role === "ADMIN"
                  ? "Review users or organizations first when you need full-platform changes."
                  : currentUser?.role === "LEADER"
                    ? "Start from users, products, or assignments to manage your company day to day."
                    : "Start from products or assignments to review the assets connected to your account."}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default AccountPage;
