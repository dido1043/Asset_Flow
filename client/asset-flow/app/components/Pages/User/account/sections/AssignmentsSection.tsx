import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatDateTime } from "../utils";

export function AssignmentsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const {
    assignmentForm,
    assignmentLookupId,
    assignmentOptions,
    assignmentProductId,
    assignmentUserId,
    canManageAssignments,
    currentAssignments,
    employeeOptions,
    feedbackByKey,
    getProductName,
    getUserName,
    handleCreateAssignment,
    handleDeleteAssignment,
    handleLoadAllAssignments,
    handleLoadAssignmentsByProduct,
    handleLoadAssignmentsByUser,
    handleLoadCurrentAssignments,
    handleLookupAssignment,
    handleUpdateAssignment,
    isEmployee,
    isLeader,
    pendingByKey,
    populateAssignmentForm,
    productAssignments,
    productOptions,
    selectedAssignment,
    setAssignmentForm,
    setAssignmentLookupId,
    setAssignmentProductId,
    setAssignmentUserId,
    userAssignments,
    userOptions,
  } = workspace;

  return (
    <SectionCard
      id="assignments"
      title="Assignments"
      description={
        canManageAssignments
          ? isLeader
            ? "Track issued equipment inside your company, update returns, and review assignment history."
            : "Track issued equipment, update returns, and review assignment history."
          : "Review assignment history and currently issued assets that belong to your account."
      }
      actions={
        <Button variant="outline" onClick={handleLoadAllAssignments} disabled={Boolean(pendingByKey.assignments)}>
          {pendingByKey.assignments ? "Loading..." : isEmployee ? "Refresh my assignments" : "Reload assignments"}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.assignments} />

          {canManageAssignments ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create or update assignment</p>
              <FieldHint>Choose a teammate and asset by name whenever those records are already loaded.</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {assignmentOptions.length > 0 ? (
                  <SelectField
                    id="assignment-id"
                    label="Assignment for update"
                    value={assignmentForm.id}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({ ...previous, id: value }))
                    }
                    options={assignmentOptions}
                    placeholder="Select an assignment"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-id">Assignment reference for update</Label>
                    <Input
                      id="assignment-id"
                      type="number"
                      value={assignmentForm.id}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({ ...previous, id: event.target.value }))
                      }
                    />
                  </div>
                )}
                {employeeOptions.length > 0 ? (
                  <SelectField
                    id="assignment-employee-id"
                    label="Teammate"
                    value={assignmentForm.employeeId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        employeeId: value,
                      }))
                    }
                    options={employeeOptions}
                    placeholder="Select a teammate"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-employee-id">Teammate reference</Label>
                    <Input
                      id="assignment-employee-id"
                      type="number"
                      value={assignmentForm.employeeId}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          employeeId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {productOptions.length > 0 ? (
                  <SelectField
                    id="assignment-product-id"
                    label="Asset"
                    value={assignmentForm.productId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        productId: value,
                      }))
                    }
                    options={productOptions}
                    placeholder="Select an asset"
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-product-id">Asset reference</Label>
                    <Input
                      id="assignment-product-id"
                      type="number"
                      value={assignmentForm.productId}
                      onChange={(event) =>
                        setAssignmentForm((previous) => ({
                          ...previous,
                          productId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="assignment-date-assigned">Date assigned</Label>
                  <Input
                    id="assignment-date-assigned"
                    type="datetime-local"
                    value={assignmentForm.dateAssigned}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        dateAssigned: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="assignment-date-returned">Date returned</Label>
                  <Input
                    id="assignment-date-returned"
                    type="datetime-local"
                    value={assignmentForm.dateReturned}
                    onChange={(event) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        dateReturned: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleCreateAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Create assignment
                </Button>
                <Button variant="secondary" onClick={handleUpdateAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Update assignment
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Read-only assignment view"
              description="Your role can review assignment history here, but assignment changes stay with company leaders and admins."
            />
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Read, filter, and delete</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {assignmentOptions.length > 0 ? (
                <SelectField
                  id="assignment-lookup-id"
                  label="Assignment"
                  value={assignmentLookupId}
                  onChange={setAssignmentLookupId}
                  options={assignmentOptions}
                  placeholder="Select an assignment"
                />
              ) : (
                <div>
                  <Label htmlFor="assignment-lookup-id">Assignment reference</Label>
                  <Input
                    id="assignment-lookup-id"
                    type="number"
                    value={assignmentLookupId}
                    onChange={(event) => setAssignmentLookupId(event.target.value)}
                  />
                </div>
              )}
              {userOptions.length > 0 ? (
                <SelectField
                  id="assignment-user-filter"
                  label="Teammate"
                  value={assignmentUserId}
                  onChange={setAssignmentUserId}
                  options={userOptions}
                  placeholder="Select a teammate"
                />
              ) : (
                <div>
                  <Label htmlFor="assignment-user-filter">Teammate reference</Label>
                  <Input
                    id="assignment-user-filter"
                    type="number"
                    value={assignmentUserId}
                    onChange={(event) => setAssignmentUserId(event.target.value)}
                  />
                </div>
              )}
              {productOptions.length > 0 ? (
                <SelectField
                  id="assignment-product-filter"
                  label="Asset"
                  value={assignmentProductId}
                  onChange={setAssignmentProductId}
                  options={productOptions}
                  placeholder="Select an asset"
                  className="sm:col-span-2"
                />
              ) : (
                <div className="sm:col-span-2">
                  <Label htmlFor="assignment-product-filter">Asset reference</Label>
                  <Input
                    id="assignment-product-filter"
                    type="number"
                    value={assignmentProductId}
                    onChange={(event) => setAssignmentProductId(event.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLookupAssignment} disabled={Boolean(pendingByKey.assignments)}>
                Load details
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadAssignmentsByUser}
                disabled={Boolean(pendingByKey.assignments)}
              >
                Load by teammate
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadAssignmentsByProduct}
                disabled={Boolean(pendingByKey.assignments)}
              >
                Load by asset
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadCurrentAssignments}
                disabled={Boolean(pendingByKey.assignments)}
              >
                Load current
              </Button>
              {canManageAssignments ? (
                <Button variant="danger" onClick={handleDeleteAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  Delete assignment
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {selectedAssignment ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Assignment #{selectedAssignment.id}</p>
                  <p className="text-sm text-slate-500">
                    {getUserName(selectedAssignment.employeeId)} • {getProductName(selectedAssignment.productId)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedAssignment.dateReturned ? "Closed" : "Current"}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Assigned</dt>
                  <dd className="font-semibold text-slate-900">{formatDateTime(selectedAssignment.dateAssigned)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Returned</dt>
                  <dd className="font-semibold text-slate-900">{formatDateTime(selectedAssignment.dateReturned)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" onClick={() => populateAssignmentForm(selectedAssignment)}>
                  Edit in form
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No selected assignment"
              description="Load or create an assignment to inspect it here."
            />
          )}

          {userAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{isEmployee ? "My assignment history" : "Assignments by user"}</p>
              <div className="mt-4 grid gap-3">
                {userAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      Assignment #{assignment.id} • {getProductName(assignment.productId)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Assigned {formatDateTime(assignment.dateAssigned)}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                        Use in form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {productAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Assignments by product</p>
              <div className="mt-4 grid gap-3">
                {productAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      Assignment #{assignment.id} • {getUserName(assignment.employeeId)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Returned {formatDateTime(assignment.dateReturned)}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                        Use in form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {currentAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Currently assigned</p>
              <div className="mt-4 grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
                {currentAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      Assignment #{assignment.id} • {getProductName(assignment.productId)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {getUserName(assignment.employeeId)} • {formatDateTime(assignment.dateAssigned)}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                        Use in form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active assignments"
              description="Use the current assignment action or create a new assignment to populate this area."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
