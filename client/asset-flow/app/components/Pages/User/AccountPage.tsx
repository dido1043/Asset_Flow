"use client";

import Link from "next/link";

import { Button } from "@/app/components/shared/ui/Button";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { EmptyState, SectionCard } from "./account/shared";
import { useWorkspaceContext } from "./account/WorkspaceContext";

const AccountPage = () => {
  const { t } = useTranslations();
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
        title={t("workspace.overview.title")}
        description={t("workspace.overview.description")}
        actions={
          <Button variant="outline" onClick={handleWorkspaceRefresh} disabled={Boolean(pendingByKey.workspace)}>
            {pendingByKey.workspace ? t("common.refreshing") : t("workspace.overview.refreshOverview")}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t("workspace.overview.welcomeBack")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {currentUser?.fullName || t("common.activeTeammate")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                {t("workspace.overview.welcomeDescription")}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {getRoleLabel(currentUser?.role, t)}
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
                        <p className="break-words text-lg font-semibold text-slate-900">{t(section.label)}</p>
                        <span className="mt-3 inline-flex self-start whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-700">
                          {t("common.open")}
                        </span>
                        <p className="mt-2 max-w-xs text-sm text-slate-600">{t(section.helper)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("workspace.overview.noExtraPagesTitle")}
                description={t("workspace.overview.noExtraPagesDescription")}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("workspace.overview.snapshot")}</p>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>{t("workspace.overview.visibleUsers")}</dt>
                  <dd className="font-semibold text-slate-900">{users.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{t("workspace.overview.visibleProducts")}</dt>
                  <dd className="font-semibold text-slate-900">{products.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{t("workspace.overview.visibleAssignments")}</dt>
                  <dd className="font-semibold text-slate-900">{assignments.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{t("workspace.overview.myAssignments")}</dt>
                  <dd className="font-semibold text-slate-900">{myAssignmentsCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>{t("workspace.overview.knownCompanies")}</dt>
                  <dd className="font-semibold text-slate-900">{allOrganizations.length}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("workspace.overview.nextBestStep")}</p>
              <p className="mt-3 text-sm text-slate-600">
                {currentUser?.role === "ADMIN"
                  ? t("workspace.overview.nextStepAdmin")
                  : currentUser?.role === "LEADER"
                    ? t("workspace.overview.nextStepLeader")
                    : t("workspace.overview.nextStepEmployee")}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default AccountPage;
