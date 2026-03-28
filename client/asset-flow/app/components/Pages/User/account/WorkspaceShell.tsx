"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/app/components/shared/ui/Button";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { FeedbackMessage, StatCard } from "./shared";
import { WorkspaceProvider, useWorkspaceContext } from "./WorkspaceContext";

function WorkspaceShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslations();
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
  const currentSectionLabel = currentSection ? t(currentSection.label) : t("workspace.shell.overviewFallback");
  const currentSectionHelper = currentSection ? t(currentSection.helper) : t("workspace.shell.currentPageFallback");

  if (!sessionChecked) {
    return (
      <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="px-6 py-10 text-center sm:px-8">
          <p className="text-base font-semibold text-slate-900">{t("workspace.shell.checkingTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("workspace.shell.checkingDescription")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="px-6 py-10 text-center sm:px-8">
          <p className="text-base font-semibold text-slate-900">{t("workspace.shell.redirectTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("workspace.shell.redirectDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.34),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_32%)]" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:px-10">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
                {t("workspace.shell.heroBadge")}
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                {workspaceScopeLabel}
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                {visibleSections.length}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("workspace.shell.heroTitle", { page: currentSectionLabel })}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              {t("workspace.shell.heroDescription", { scope: workspaceScopeLabel })}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              {visibleSections.map((section) => {
                const active = pathname === section.path;

                return (
                  <Link
                    key={section.path}
                    href={section.path}
                    className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                      active
                        ? "border-white/20 bg-white text-slate-950"
                        : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {t(section.label)}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {t("workspace.shell.signedIn")}
                </p>
                <p className="mt-3 break-words text-lg font-semibold text-white">
                  {currentUser?.fullName || t("common.activeTeammate")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {getRoleLabel(currentUser?.role || session.role, t)}
                  </span>
                  <span className="text-sm text-slate-300">
                    {getOrganizationName(currentUser?.organizationId ?? null)}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {t("workspace.shell.currentPage")}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{currentSectionLabel}</p>
                <p className="mt-2 text-sm text-slate-300">{currentSectionHelper}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label={t("common.users")} value={users.length} hint={t("workspace.shell.statsUsersHint")} />
            <StatCard
              label={t("common.products")}
              value={products.length}
              hint={t("workspace.shell.statsProductsHint")}
            />
            <StatCard
              label={t("common.assignments")}
              value={assignments.length}
              hint={t("workspace.shell.statsAssignmentsHint")}
            />
            <StatCard
              label={t("workspace.overview.myAssignments")}
              value={myAssignmentsCount}
              hint={t("workspace.shell.statsMyAssignmentsHint")}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {t("workspace.shell.workspacePages")}
            </p>
            <p className="mt-2 text-sm text-slate-600">{t("workspace.shell.workspacePagesDescription")}</p>

            <nav className="mt-5 space-y-2">
              {visibleSections.map((section) => {
                const sectionKey = section.href.replace("#", "");
                const active = pathname === section.path;

                return (
                  <Link
                    key={section.path}
                    href={section.path}
                    className={`flex items-center justify-between rounded-3xl border px-4 py-3 text-sm transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span>
                      <span className={`block font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                        {t(section.label)}
                      </span>
                      <span className={`block text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {t(section.helper)}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        active ? "bg-white/10 text-white" : "bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {workspaceSectionBadges[sectionKey] ?? t("common.open")}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {t("workspace.shell.quickActions")}
            </p>
            <p className="mt-3 break-words text-lg font-semibold leading-tight">
              {currentUser?.fullName || t("common.activeTeammate")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {getRoleLabel(currentUser?.role || session.role, t)}
              </span>
              <span className="text-slate-300">{workspaceScopeLabel}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={handleWorkspaceRefresh}
                disabled={Boolean(pendingByKey.workspace || bootstrapping)}
              >
                {pendingByKey.workspace || bootstrapping
                  ? t("common.refreshing")
                  : t("workspace.shell.refreshWorkspace")}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={handleSignOut}
              >
                {t("common.signOut")}
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">{t("workspace.shell.quickFacts")}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>{t("common.role")}</span>
                <span className="text-right font-semibold text-slate-900">
                  {getRoleLabel(currentUser?.role || session.role, t)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t("workspace.shell.companiesKnown")}</span>
                <span className="font-semibold text-slate-900">{allOrganizations.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t("workspace.shell.sessionStorage")}</span>
                <span className="text-right font-semibold text-slate-900">{t("common.currentTabOnly")}</span>
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
      <main className="page-enter min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <WorkspaceShellInner>{children}</WorkspaceShellInner>
        </div>
      </main>
    </WorkspaceProvider>
  );
}
