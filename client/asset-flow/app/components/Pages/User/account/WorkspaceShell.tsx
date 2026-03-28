"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/app/components/shared/ui/Button";

import { FeedbackMessage, StatCard } from "./shared";
import { WorkspaceProvider, useWorkspaceContext } from "./WorkspaceContext";
import { formatRoleLabel } from "./utils";

function WorkspaceShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const workspace = useWorkspaceContext();
  const {
    allOrganizations,
    assignments,
    bootstrapError,
    bootstrapping,
    currentUser,
    feedbackByKey,
    getOrganizationName,
    handleSignOut,
    handleWorkspaceRefresh,
    myAssignmentsCount,
    pendingByKey,
    products,
    session,
    sessionChecked,
    users,
    visibleSections,
    workspaceScopeLabel,
    workspaceSectionBadges,
  } = workspace;

  const currentSection =
    visibleSections.find((section) => section.path === pathname) ??
    visibleSections.find((section) => section.path === "/user/account") ??
    null;

  if (!sessionChecked) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-10 text-center sm:px-8">
          <p className="text-base font-semibold text-slate-900">Checking your session...</p>
          <p className="mt-2 text-sm text-slate-500">Preparing your workspace pages.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-10 text-center sm:px-8">
          <p className="text-base font-semibold text-slate-900">Redirecting to sign in...</p>
          <p className="mt-2 text-sm text-slate-500">This workspace requires an active browser session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.25fr_0.85fr] lg:px-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
              Multi-page workspace
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {currentSection?.label || "Workspace"} built for faster daily work.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              Move through dedicated pages instead of one long dashboard. Your current access stays limited to{" "}
              {workspaceScopeLabel.toLowerCase()}.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              {visibleSections.map((section) => {
                const active = pathname === section.path;

                return (
                  <Link
                    key={section.path}
                    href={section.path}
                    className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                      active
                        ? "border-white/20 bg-white text-slate-900"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {section.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Signed in</p>
                <p className="mt-2 break-words font-semibold leading-tight text-white">
                  {currentUser?.fullName || "Active teammate"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {formatRoleLabel(currentUser?.role || session.role)}
                  </span>
                  <span className="text-sm text-slate-300">
                    {getOrganizationName(currentUser?.organizationId ?? null)}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Current page</p>
                <p className="mt-2 font-semibold text-white">{currentSection?.label || "Workspace overview"}</p>
                <p className="mt-1">{currentSection?.helper || "Choose a page from the left navigation."}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Users" value={users.length} hint="Visible teammates in your current scope" />
            <StatCard label="Products" value={products.length} hint="Assets available on your current pages" />
            <StatCard label="Assignments" value={assignments.length} hint="Assignment records currently loaded" />
            <StatCard label="My Assignments" value={myAssignmentsCount} hint="Assets linked to your own account" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Workspace Pages</p>
            <p className="mt-2 text-sm text-slate-600">Jump directly to the tool you need.</p>

            <nav className="mt-5 space-y-2">
              {visibleSections.map((section) => {
                const sectionKey = section.href.replace("#", "");
                const active = pathname === section.path;

                return (
                  <Link
                    key={section.path}
                    href={section.path}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      active
                        ? "border-indigo-200 bg-indigo-50"
                        : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <span>
                      <span className="block font-semibold text-slate-900">{section.label}</span>
                      <span className="block text-xs text-slate-500">{section.helper}</span>
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {workspaceSectionBadges[sectionKey] ?? "Open"}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Quick actions</p>
            <p className="mt-3 break-words text-lg font-semibold leading-tight">
              {currentUser?.fullName || "Active teammate"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {formatRoleLabel(currentUser?.role || session.role)}
              </span>
              <span className="text-slate-300">{workspaceScopeLabel}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={handleWorkspaceRefresh}
                disabled={Boolean(pendingByKey.workspace || bootstrapping)}
              >
                {pendingByKey.workspace || bootstrapping ? "Refreshing..." : "Refresh workspace"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Quick facts</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>Role</span>
                <span className="text-right font-semibold text-slate-900">
                  {formatRoleLabel(currentUser?.role || session.role)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Companies known</span>
                <span className="font-semibold text-slate-900">{allOrganizations.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Session storage</span>
                <span className="text-right font-semibold text-slate-900">Current tab only</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {bootstrapError ? <FeedbackMessage feedback={{ tone: "error", message: bootstrapError }} /> : null}
          {feedbackByKey.workspace ? <FeedbackMessage feedback={feedbackByKey.workspace} /> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <WorkspaceShellInner>{children}</WorkspaceShellInner>
        </div>
      </main>
    </WorkspaceProvider>
  );
}
