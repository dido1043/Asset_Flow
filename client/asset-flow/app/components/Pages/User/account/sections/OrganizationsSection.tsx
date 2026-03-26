import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

export function OrganizationsSection({ workspace }: { workspace: AccountWorkspaceState }) {
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
      title="Organizations"
      description={
        isLeader
          ? "Review your company and its inventory without leaving your own organization scope."
          : "Work with leader lookup, organization creation, member joins, leadership transfer, and inventory."
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.organizations} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              {isLeader ? "Load your company" : "Find a company by leader"}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {isLeader ? (
                  <p className="text-sm text-slate-600">
                    Your organization view is locked to the company linked to your account.
                  </p>
                ) : leaderOptions.length > 0 ? (
                  <SelectField
                    id="organization-leader-id"
                    label="Leader"
                    value={organizationLookupLeaderId}
                    onChange={setOrganizationLookupLeaderId}
                    options={leaderOptions}
                    placeholder="Select a leader"
                  />
                ) : (
                  <>
                    <Label htmlFor="organization-leader-id">Leader reference</Label>
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
                  {isLeader ? "Load my company" : "Load organization"}
                </Button>
              </div>
            </div>
          </div>

          {canCreateOrganizations ? (
            <form onSubmit={handleCreateOrganization} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create organization</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {leaderOptions.length > 0 ? (
                  <SelectField
                    id="create-organization-leader-id"
                    label="Leader"
                    value={organizationCreateForm.leaderId}
                    onChange={(value) =>
                      setOrganizationCreateForm((previous) => ({
                        ...previous,
                        leaderId: value,
                      }))
                    }
                    options={leaderOptions}
                    placeholder="Select who leads this company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="create-organization-leader-id">Leader reference</Label>
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
                  <Label htmlFor="create-organization-name">Company name</Label>
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
                  Create organization
                </Button>
              </div>
            </form>
          ) : null}

          {canManageOrganizationMembers ? (
            <form onSubmit={handleJoinOrganization} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Join organization</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="join-user-id"
                    label="Teammate"
                    value={joinOrganizationForm.userId}
                    onChange={(value) =>
                      setJoinOrganizationForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={userOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-user-id">Teammate reference</Label>
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
                    label="Company"
                    value={joinOrganizationForm.organizationId}
                    onChange={(value) =>
                      setJoinOrganizationForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="join-organization-id">Company reference</Label>
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
                  Join organization
                </Button>
              </div>
            </form>
          ) : null}

          {canManageOrganizationMembers ? (
            <form onSubmit={handleBecomeLeader} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Become leader</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="leader-user-id"
                    label="New leader"
                    value={becomeLeaderForm.userId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        userId: value,
                      }))
                    }
                    options={userOptions}
                    placeholder="Select who becomes leader"
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-user-id">Teammate reference</Label>
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
                    label="Company"
                    value={becomeLeaderForm.organizationId}
                    onChange={(value) =>
                      setBecomeLeaderForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="leader-organization-id">Company reference</Label>
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
                  Promote to leader
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Selected company</p>
            {leaderOrganization ? (
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Name</dt>
                  <dd className="font-semibold text-slate-900">{leaderOrganization.organizationName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Leader</dt>
                  <dd className="font-semibold text-slate-900">
                    {allOrganizations.find((organization) => organization.id === leaderOrganization.id)?.leaderName ||
                      "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Members</dt>
                  <dd className="font-semibold text-slate-900">
                    {users.filter((user) => user.organizationId === leaderOrganization.id).length}
                  </dd>
                </div>
              </dl>
            ) : (
              <EmptyState
                title="No organization selected"
                description="Use the leader lookup or company creation form to load one here."
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Inventory by company</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="inventory-organization-id"
                    label="Company"
                    value={inventoryOrgId}
                    onChange={setInventoryOrgId}
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <>
                    <Label htmlFor="inventory-organization-id">Company reference</Label>
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
                  Load inventory
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
                      In stock
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Asset tag: {product.assetTag}</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => populateProductForm(product)}>
                      Use in product form
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No inventory loaded"
              description="Load products by company to see them listed here."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
