import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, SectionCard } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { getRoleBadgeClass } from "../utils";

export function ProfileSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const { bootstrapping, currentUser, feedbackByKey, getOrganizationName, handleProfileUpdate, handleSignOut } =
    workspace;
  const { pendingByKey, profileForm, session, setProfileForm, handleWorkspaceRefresh, workspaceScopeLabel } =
    workspace;

  return (
    <SectionCard
      id="profile"
      title={t("profile.title")}
      description={t("profile.description")}
      actions={
        <>
          <Button
            variant="outline"
            className="bg-transparent disabled:bg-transparent"
            onClick={handleWorkspaceRefresh}
            disabled={Boolean(pendingByKey.workspace || bootstrapping)}
          >
            {pendingByKey.workspace || bootstrapping ? t("common.refreshing") : t("workspace.shell.refreshWorkspace")}
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            {t("common.signOut")}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.profile} />
          <form onSubmit={handleProfileUpdate} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="profile-full-name">{t("profile.fullName")}</Label>
              <Input
                id="profile-full-name"
                value={profileForm.fullName}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, fullName: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="profile-email">{t("profile.email")}</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, email: event.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="profile-role">{t("profile.role")}</Label>
              <div
                id="profile-role"
                className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900"
              >
                {getRoleLabel(currentUser?.role || session?.role, t)}
              </div>
              <p className="mt-2 text-xs text-slate-500">{t("profile.roleLocked")}</p>
            </div>

            <div>
              <Label htmlFor="profile-age">{t("profile.age")}</Label>
              <Input
                id="profile-age"
                type="number"
                min={0}
                value={profileForm.age}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, age: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="profile-password">{t("profile.newPassword")}</Label>
              <Input
                id="profile-password"
                type="password"
                value={profileForm.password}
                placeholder={t("profile.passwordPlaceholder")}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, password: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={Boolean(pendingByKey.profile)}>
                {pendingByKey.profile ? t("common.saving") : t("profile.save")}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t("profile.currentAccount")}</p>
                <p className="text-sm text-slate-500">{t("profile.currentAccountDescription")}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                  currentUser?.role,
                )}`}
              >
                {getRoleLabel(currentUser?.role || session?.role, t)}
              </span>
            </div>
            {currentUser ? (
              <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>{t("profile.fullName")}</dt>
                  <dd className="break-words text-right font-semibold text-slate-900">{currentUser.fullName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("profile.email")}</dt>
                  <dd className="font-semibold text-slate-900">{currentUser.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("profile.company")}</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(currentUser.organizationId)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("profile.assignments")}</dt>
                  <dd className="font-semibold text-slate-900">{currentUser.assignmentIds?.length ?? 0}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState
                title={t("profile.loadingTitle")}
                description={t("profile.loadingDescription")}
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{t("profile.safetyTitle")}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>{t("profile.safetyPointOne")}</li>
              <li>{t("profile.safetyPointTwo")}</li>
              <li>{t("profile.safetyPointThree")}</li>
              <li>{t("profile.safetyPointFour")}</li>
              <li>{t("profile.safetyPointFive", { scope: workspaceScopeLabel })}</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
