import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { getRoleBadgeClass } from "../utils";

export function UsersSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const [userSearch, setUserSearch] = useState("");
  const {
    canDeleteUsers,
    deleteUserId,
    feedbackByKey,
    getOrganizationName,
    handleDeleteUser,
    handleLoadUsers,
    handleLookupUser,
    isAdmin,
    isLeader,
    pendingByKey,
    selectedUser,
    setDeleteUserId,
    setSelectedUser,
    setUserLookupId,
    userLookupId,
    userOptions,
    users,
  } = workspace;
  const deferredUserSearch = useDeferredValue(userSearch);
  const filteredUsers = useMemo(() => {
    const query = deferredUserSearch.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        getOrganizationName(user.organizationId),
        getRoleLabel(user.role, t),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [deferredUserSearch, getOrganizationName, t, users]);

  return (
    <SectionCard
      id="users"
      title={t("users.title")}
      description={
        isLeader
          ? t("users.descriptionLeader")
          : t("users.descriptionAdmin")
      }
      actions={
        <Button variant="outline" onClick={handleLoadUsers} disabled={Boolean(pendingByKey.users)}>
          {pendingByKey.users ? t("common.loading") : isLeader ? t("users.reloadTeammates") : t("users.reloadUsers")}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.users} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("users.chooseTeammate")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="user-lookup-id"
                    label={t("common.user")}
                    value={userLookupId}
                    onChange={setUserLookupId}
                    options={userOptions}
                    placeholder={t("users.selectTeammate")}
                  />
                ) : isAdmin ? (
                  <>
                    <Label htmlFor="user-lookup-id">{t("users.teammateReference")}</Label>
                    <Input
                      id="user-lookup-id"
                      type="number"
                      value={userLookupId}
                      onChange={(event) => setUserLookupId(event.target.value)}
                    />
                  </>
                ) : (
                  <EmptyState
                    title={t("users.noTeammatesTitle")}
                    description={t("users.noTeammatesDescription")}
                  />
                )}
              </div>
              <div className="flex items-end">
                <Button className="whitespace-nowrap" onClick={handleLookupUser} disabled={Boolean(pendingByKey.users)}>
                  {t("users.loadUser")}
                </Button>
              </div>
            </div>
          </div>

          {canDeleteUsers ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{t("users.removeUser")}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  {userOptions.length > 0 ? (
                    <SelectField
                      id="delete-user-id"
                      label={t("users.userToRemove")}
                      value={deleteUserId}
                      onChange={setDeleteUserId}
                      options={userOptions}
                      placeholder={t("users.selectTeammate")}
                    />
                  ) : (
                    <>
                      <Label htmlFor="delete-user-id">{t("users.teammateReference")}</Label>
                      <Input
                        id="delete-user-id"
                        type="number"
                        value={deleteUserId}
                        onChange={(event) => setDeleteUserId(event.target.value)}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-end">
                  <Button variant="danger" onClick={handleDeleteUser} disabled={Boolean(pendingByKey.users)}>
                    {t("users.deleteUser")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {selectedUser ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-slate-900">{selectedUser.fullName}</p>
                  <p className="break-all text-sm text-slate-500">{selectedUser.email}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                    selectedUser.role,
                  )} shrink-0 self-start whitespace-nowrap`}
                >
                  {getRoleLabel(selectedUser.role, t)}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>{t("common.age")}</dt>
                  <dd className="font-semibold text-slate-900">{selectedUser.age ?? t("common.notSet")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("common.company")}</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(selectedUser.organizationId)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("common.assignments")}</dt>
                  <dd className="font-semibold text-slate-900">{selectedUser.assignmentIds?.length ?? 0}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <EmptyState
              title={t("users.noUserSelectedTitle")}
              description={t("users.noUserSelectedDescription")}
            />
          )}
        </div>

        <div>
          {users.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <Label htmlFor="user-search">{t("common.search")}</Label>
                <Input
                  id="user-search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder={t("users.quickFilterPlaceholder")}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {t("users.resultsLabel", { count: filteredUsers.length })}
                </p>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">{user.fullName}</p>
                          <p className="break-all text-sm text-slate-500">{user.email}</p>
                        </div>
                        <span
                          className={`inline-flex max-w-full self-start rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                            user.role,
                          )} whitespace-nowrap`}
                        >
                          {getRoleLabel(user.role, t)}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>{t("users.companyPrefix", { company: getOrganizationName(user.organizationId) })}</p>
                        <p>{t("users.assignmentsPrefix", { count: user.assignmentIds?.length ?? 0 })}</p>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserLookupId(user.id?.toString() ?? "");
                            setDeleteUserId(user.id?.toString() ?? "");
                          }}
                        >
                          {t("users.useInPanel")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t("users.noMatchesTitle")}
                  description={t("users.noMatchesDescription")}
                />
              )}
            </div>
          ) : (
            <EmptyState
              title={t("users.noUsersLoadedTitle")}
              description={
                isLeader
                  ? t("users.noUsersLoadedDescriptionLeader")
                  : t("users.noUsersLoadedDescriptionAdmin")
              }
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
