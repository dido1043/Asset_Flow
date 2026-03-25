import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatRoleLabel, getRoleBadgeClass } from "../utils";

export function UsersSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const {
    deleteUserId,
    feedbackByKey,
    getOrganizationName,
    handleDeleteUser,
    handleLoadUsers,
    handleLookupUser,
    pendingByKey,
    selectedUser,
    setDeleteUserId,
    setSelectedUser,
    setUserLookupId,
    userLookupId,
    userOptions,
    users,
  } = workspace;

  return (
    <SectionCard
      id="users"
      title="Users"
      description="Browse teammates, inspect account details, and remove access when needed."
      actions={
        <Button variant="outline" onClick={handleLoadUsers} disabled={Boolean(pendingByKey.users)}>
          {pendingByKey.users ? "Loading..." : "Reload users"}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.users} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Choose a teammate</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="user-lookup-id"
                    label="User"
                    value={userLookupId}
                    onChange={setUserLookupId}
                    options={userOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <>
                    <Label htmlFor="user-lookup-id">Teammate reference</Label>
                    <Input
                      id="user-lookup-id"
                      type="number"
                      value={userLookupId}
                      onChange={(event) => setUserLookupId(event.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="flex items-end">
                <Button className="whitespace-nowrap" onClick={handleLookupUser} disabled={Boolean(pendingByKey.users)}>
                  Load user
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Remove a user</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                {userOptions.length > 0 ? (
                  <SelectField
                    id="delete-user-id"
                    label="User to remove"
                    value={deleteUserId}
                    onChange={setDeleteUserId}
                    options={userOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <>
                    <Label htmlFor="delete-user-id">Teammate reference</Label>
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
                  Delete user
                </Button>
              </div>
            </div>
          </div>

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
                  {formatRoleLabel(selectedUser.role)}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Age</dt>
                  <dd className="font-semibold text-slate-900">{selectedUser.age ?? "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Company</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(selectedUser.organizationId)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Assignments</dt>
                  <dd className="font-semibold text-slate-900">{selectedUser.assignmentIds?.length ?? 0}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <EmptyState
              title="No user selected"
              description="Choose a teammate from the selector to inspect their details here."
            />
          )}
        </div>

        <div>
          {users.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                      {formatRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>Company: {getOrganizationName(user.organizationId)}</p>
                    <p>Assignments: {user.assignmentIds?.length ?? 0}</p>
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
                      Use in panel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No users loaded"
              description="Use the reload button or the workspace refresh action to fetch the user list."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
