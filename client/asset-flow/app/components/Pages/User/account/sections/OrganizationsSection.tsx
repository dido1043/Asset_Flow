import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { getRoleBadgeClass } from "../utils";

export function OrganizationsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const {
    allOrganizations,
    canCreateOrganizations,
    canManageOrganizationMembers,
    feedbackByKey,
    handleCreateOrganization,
    handleJoinOrganization,
    handleLoadOrganizationInventory,
    handleLookupOrganization,
    inventoryOrgId,
    isLeader,
    joinOrganizationForm,
    joinOrganizationUserOptions,
    leaderOptions,
    leaderOrganization,
    organizationCreateForm,
    organizationInventory,
    organizationLookupLeaderId,
    organizationOptions,
    pendingByKey,
    populateProductForm,
    setInventoryOrgId,
    setJoinOrganizationForm,
    setOrganizationCreateForm,
    setOrganizationLookupLeaderId,
    users,
  } = workspace;
  const deferredEmployeeSearch = useDeferredValue(employeeSearch);
  const deferredRosterSearch = useDeferredValue(rosterSearch);
  const selectedOrganizationId = typeof leaderOrganization?.id === "number" ? leaderOrganization.id : null;
  const filteredJoinOrganizationUserOptions = useMemo(() => {
    if (!isLeader) {
      return joinOrganizationUserOptions;
    }

    const query = deferredEmployeeSearch.trim().toLowerCase();

    if (!query) {
      return joinOrganizationUserOptions;
    }

    return joinOrganizationUserOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [deferredEmployeeSearch, isLeader, joinOrganizationUserOptions]);
  const selectedOrganizationUsers = useMemo(() => {
    if (selectedOrganizationId === null) {
      return [];
    }

    const roleOrder = {
      LEADER: 0,
      ADMIN: 1,
      EMPLOYEE: 2,
    } as const;

    return users
      .filter((user) => user.organizationId === selectedOrganizationId)
      .sort((left, right) => {
        const roleDifference = roleOrder[left.role] - roleOrder[right.role];

        if (roleDifference !== 0) {
          return roleDifference;
        }

        return left.fullName.localeCompare(right.fullName);
      });
  }, [selectedOrganizationId, users]);
  const filteredOrganizationUsers = useMemo(() => {
    const query = deferredRosterSearch.trim().toLowerCase();

    if (!query) {
      return selectedOrganizationUsers;
    }

    return selectedOrganizationUsers.filter((user) =>
      [
        user.fullName,
        typeof user.id === "number" ? `${user.fullName}#${user.id}` : "",
        typeof user.id === "number" ? String(user.id) : "",
        user.email,
        getRoleLabel(user.role, t),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [deferredRosterSearch, selectedOrganizationUsers, t]);

  return (
    <SectionCard
      id="organizations"
      title={t("organizations.title")}
      description={
        isLeader
          ? t("organizations.descriptionLeader")
          : t("organizations.descriptionAdmin")
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.organizations} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {isLeader ? t("organizations.loadYourCompany") : t("organizations.findByLeader")}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {isLeader ? (
                  <p className="text-sm text-slate-600">
                    {t("organizations.lockedToCompany")}
                  </p>
                ) : leaderOptions.length > 0 ? (
                  <SelectField
                    id="organization-leader-id"
                    label={t("organizations.leader")}
                    value={organizationLookupLeaderId}
                    onChange={setOrganizationLookupLeaderId}
                    options={leaderOptions}
                    placeholder={t("organizations.selectLeader")}
                  />
                ) : (
                  <>
                    <Label htmlFor="organization-leader-id">{t("organizations.leaderReference")}</Label>
                    <Input
                      id="organization-leader-id"
                      type="number"
                      value={organizationLookupLeaderId}
                      onChange={(event) => setOrganizationLookupLeaderId(event.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="flex items-end">
                <Button onClick={handleLookupOrganization} disabled={Boolean(pendingByKey.organizations)}>
                  {isLeader ? t("organizations.loadMyCompany") : t("organizations.loadOrganization")}
                </Button>
              </div>
            </div>
          </div>

          {canCreateOrganizations ? (
            <form onSubmit={handleCreateOrganization} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{t("organizations.createOrganization")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {leaderOptions.length > 0 ? (
                  <SelectField
                    id="create-organization-leader-id"
                    label={t("organizations.leader")}
                    value={organizationCreateForm.leaderId}
                    onChange={(value) =>
                      setOrganizationCreateForm((previous) => ({
                        ...previous,
                        leaderId: value,
                      }))
                    }
                    options={leaderOptions}
                    placeholder={t("organizations.selectWhoLeads")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="create-organization-leader-id">{t("organizations.leaderReference")}</Label>
                    <Input
                      id="create-organization-leader-id"
                      type="number"
                      value={organizationCreateForm.leaderId}
                      onChange={(event) =>
                        setOrganizationCreateForm((previous) => ({
                          ...previous,
                          leaderId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="create-organization-name">{t("organizations.companyName")}</Label>
                  <Input
                    id="create-organization-name"
                    value={organizationCreateForm.organizationName}
                    onChange={(event) =>
                      setOrganizationCreateForm((previous) => ({
                        ...previous,
                        organizationName: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.organizations)}>
                  {t("organizations.createOrganization")}
                </Button>
              </div>
            </form>
          ) : null}

          {canManageOrganizationMembers ? (
            <form onSubmit={handleJoinOrganization} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                {isLeader ? t("organizations.hireEmployee") : t("organizations.joinOrganization")}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {joinOrganizationUserOptions.length > 0 ? (
                  <div className="space-y-4">
                    {isLeader ? (
                      <div>
                        <Label htmlFor="join-user-search">{t("common.search")}</Label>
                        <Input
                          id="join-user-search"
                          value={employeeSearch}
                          onChange={(event) => setEmployeeSearch(event.target.value)}
                          placeholder={t("organizations.employeeSearchPlaceholder")}
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          {t("organizations.hireResultsLabel", { count: filteredJoinOrganizationUserOptions.length })}
                        </p>
                      </div>
                    ) : null}
                    {filteredJoinOrganizationUserOptions.length > 0 ? (
                      <SelectField
                        id="join-user-id"
                        label={t("common.teammate")}
                        value={joinOrganizationForm.userId}
                        onChange={(value) =>
                          setJoinOrganizationForm((previous) => ({
                            ...previous,
                            userId: value,
                          }))
                        }
                        options={filteredJoinOrganizationUserOptions}
                        placeholder={isLeader ? t("organizations.selectEmployeeToHire") : t("users.selectTeammate")}
                      />
                    ) : (
                      <EmptyState
                        title={t("organizations.noHireMatchesTitle")}
                        description={t("organizations.noHireMatchesDescription")}
                      />
                    )}
                  </div>
                ) : isLeader ? (
                  <EmptyState
                    title={t("organizations.noHireCandidatesTitle")}
                    description={t("organizations.noHireCandidatesDescription")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-user-id">{t("users.teammateReference")}</Label>
                    <Input
                      id="join-user-id"
                      type="number"
                      value={joinOrganizationForm.userId}
                      onChange={(event) =>
                        setJoinOrganizationForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="join-organization-id"
                    label={t("common.company")}
                    value={joinOrganizationForm.organizationId}
                    onChange={(value) =>
                      setJoinOrganizationForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder={t("registerForm.selectCompany")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-organization-id">{t("products.companyReference")}</Label>
                    <Input
                      id="join-organization-id"
                      type="number"
                      value={joinOrganizationForm.organizationId}
                      onChange={(event) =>
                        setJoinOrganizationForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button type="submit" disabled={Boolean(pendingByKey.organizations)}>
                  {isLeader ? t("organizations.hireEmployee") : t("organizations.joinOrganization")}
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{t("organizations.selectedCompany")}</p>
            {leaderOrganization ? (
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>{t("organizations.name")}</dt>
                  <dd className="font-semibold text-slate-900">{leaderOrganization.organizationName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("organizations.leader")}</dt>
                  <dd className="font-semibold text-slate-900">
                    {allOrganizations.find((organization) => organization.id === leaderOrganization.id)?.leaderName ||
                      t("common.unknown")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("organizations.members")}</dt>
                  <dd className="font-semibold text-slate-900">
                    {selectedOrganizationUsers.length}
                  </dd>
                </div>
              </dl>
            ) : (
              <EmptyState
                title={t("organizations.noOrganizationSelectedTitle")}
                description={t("organizations.noOrganizationSelectedDescription")}
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("organizations.inventoryByCompany")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="inventory-organization-id"
                    label={t("common.company")}
                    value={inventoryOrgId}
                    onChange={setInventoryOrgId}
                    options={organizationOptions}
                    placeholder={t("registerForm.selectCompany")}
                  />
                ) : (
                  <>
                    <Label htmlFor="inventory-organization-id">{t("products.companyReference")}</Label>
                    <Input
                      id="inventory-organization-id"
                      type="number"
                      value={inventoryOrgId}
                      onChange={(event) => setInventoryOrgId(event.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="flex items-end">
                <Button onClick={handleLoadOrganizationInventory} disabled={Boolean(pendingByKey.organizations)}>
                  {t("organizations.loadInventory")}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("organizations.companyRoster")}</p>
            {leaderOrganization ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                  <Label htmlFor="organization-roster-search">{t("common.search")}</Label>
                  <Input
                    id="organization-roster-search"
                    value={rosterSearch}
                    onChange={(event) => setRosterSearch(event.target.value)}
                    placeholder={t("organizations.rosterSearchPlaceholder")}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {t("organizations.rosterResultsLabel", { count: filteredOrganizationUsers.length })}
                  </p>
                </div>

                {filteredOrganizationUsers.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredOrganizationUsers.map((user) => (
                      <div key={user.id ?? user.email} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-slate-900">
                              {typeof user.id === "number" ? `${user.fullName}#${user.id}` : user.fullName}
                            </p>
                            <p className="break-all text-sm text-slate-500">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                              user.role,
                            )}`}
                          >
                            {getRoleLabel(user.role, t)}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                          <p>
                            {t("common.age")}: {user.age ?? t("common.notSet")}
                          </p>
                          <p>{t("users.assignmentsPrefix", { count: user.assignmentIds?.length ?? 0 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedOrganizationUsers.length > 0 ? (
                  <EmptyState
                    title={t("organizations.noRosterMatchesTitle")}
                    description={t("organizations.noRosterMatchesDescription")}
                  />
                ) : (
                  <EmptyState
                    title={t("organizations.noRosterMembersTitle")}
                    description={t("organizations.noRosterMembersDescription")}
                  />
                )}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title={t("organizations.noOrganizationSelectedTitle")}
                  description={t("organizations.noOrganizationSelectedDescription")}
                />
              </div>
            )}
          </div>

          {organizationInventory.length > 0 ? (
            <div className="grid gap-4">
              {organizationInventory.map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {product.productBrand} {product.productModel}
                      </p>
                      <p className="text-sm text-slate-500">{product.productType}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {t("common.inStock")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{t("organizations.assetTag", { assetTag: product.assetTag })}</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => populateProductForm(product)}>
                      {t("organizations.useInProductForm")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("organizations.noInventoryLoadedTitle")}
              description={t("organizations.noInventoryLoadedDescription")}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
