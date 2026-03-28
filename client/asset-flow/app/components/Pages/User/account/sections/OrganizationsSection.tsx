import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

export function OrganizationsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const {
    allOrganizations,
    becomeLeaderForm,
    canCreateOrganizations,
    canManageOrganizationMembers,
    feedbackByKey,
    handleBecomeLeader,
    handleCreateOrganization,
    handleJoinOrganization,
    handleLoadOrganizationInventory,
    handleLookupOrganization,
    inventoryOrgId,
    isLeader,
    joinOrganizationForm,
    leaderOptions,
    leaderOrganization,
    organizationCreateForm,
    organizationInventory,
    organizationLookupLeaderId,
    organizationOptions,
    pendingByKey,
    populateProductForm,
    setBecomeLeaderForm,
    setInventoryOrgId,
    setJoinOrganizationForm,
    setOrganizationCreateForm,
    setOrganizationLookupLeaderId,
    userOptions,
    users,
  } = workspace;

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
              <p className="text-sm font-semibold text-slate-900">{t("organizations.joinOrganization")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
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
                    options={userOptions}
                    placeholder={t("users.selectTeammate")}
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
                  {t("organizations.joinOrganization")}
                </Button>
              </div>
            </form>
          ) : null}

          {canManageOrganizationMembers ? (
            <form onSubmit={handleBecomeLeader} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{t("organizations.becomeLeader")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="leader-user-id"
                    label={t("organizations.leader")}
                    value={becomeLeaderForm.userId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={userOptions}
                    placeholder={t("organizations.selectWhoBecomesLeader")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-user-id">{t("users.teammateReference")}</Label>
                    <Input
                      id="leader-user-id"
                      type="number"
                      value={becomeLeaderForm.userId}
                      onChange={(event) =>
                        setBecomeLeaderForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="leader-organization-id"
                    label={t("common.company")}
                    value={becomeLeaderForm.organizationId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder={t("registerForm.selectCompany")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-organization-id">{t("products.companyReference")}</Label>
                    <Input
                      id="leader-organization-id"
                      type="number"
                      value={becomeLeaderForm.organizationId}
                      onChange={(event) =>
                        setBecomeLeaderForm((previous) => ({
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
                  {t("organizations.promoteLeader")}
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
                    {users.filter((user) => user.organizationId === leaderOrganization.id).length}
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
