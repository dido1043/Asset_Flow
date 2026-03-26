import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, SectionCard } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatRoleLabel, getRoleBadgeClass } from "../utils";

export function ProfileSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { bootstrapping, currentUser, feedbackByKey, getOrganizationName, handleProfileUpdate, handleSignOut } =
    workspace;
  const { pendingByKey, profileForm, session, setProfileForm, handleWorkspaceRefresh, workspaceScopeLabel } =
    workspace;

  return (
    <SectionCard
      id="profile"
      title="Profile"
      description="Manage your account details and keep your active session under control."
      actions={
        <>
          <Button
            variant="outline"
            onClick={handleWorkspaceRefresh}
            disabled={Boolean(pendingByKey.workspace || bootstrapping)}
          >
            {pendingByKey.workspace || bootstrapping ? "Refreshing..." : "Refresh workspace"}
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.profile} />
          <form onSubmit={handleProfileUpdate} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="profile-full-name">Full name</Label>
              <Input
                id="profile-full-name"
                value={profileForm.fullName}
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, fullName: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="profile-email">Email</Label>
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
              <Label htmlFor="profile-role">Role</Label>
              <div
                id="profile-role"
                className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900"
              >
                {formatRoleLabel(currentUser?.role || session?.role)}
              </div>
              <p className="mt-2 text-xs text-slate-500">Role changes are locked here for security.</p>
            </div>

            <div>
              <Label htmlFor="profile-age">Age</Label>
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
              <Label htmlFor="profile-password">New password</Label>
              <Input
                id="profile-password"
                type="password"
                value={profileForm.password}
                placeholder="Leave blank to keep the current password"
                onChange={(event) =>
                  setProfileForm((previous) => ({ ...previous, password: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={Boolean(pendingByKey.profile)}>
                {pendingByKey.profile ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Current account</p>
                <p className="text-sm text-slate-500">Live workspace details for the signed-in teammate.</p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                  currentUser?.role,
                )}`}
              >
                {formatRoleLabel(currentUser?.role || session?.role)}
              </span>
            </div>
            {currentUser ? (
              <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Full name</dt>
                  <dd className="break-words text-right font-semibold text-slate-900">{currentUser.fullName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Email</dt>
                  <dd className="font-semibold text-slate-900">{currentUser.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Company</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(currentUser.organizationId)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Assignments</dt>
                  <dd className="font-semibold text-slate-900">{currentUser.assignmentIds?.length ?? 0}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState
                title="Loading account"
                description="Your current profile will appear here after the workspace finishes loading."
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Workspace safety</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Signed-in access is required before the workspace loads.</li>
              <li>Expired or invalid sessions are cleared automatically.</li>
              <li>Names are shown instead of internal references wherever records are available.</li>
              <li>Backend route details stay hidden from the workspace UI.</li>
              <li>Your current visibility scope is {workspaceScopeLabel.toLowerCase()}.</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
