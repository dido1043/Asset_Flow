import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";
import { formatDateTime } from "../utils";

export function AssignmentsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { locale, t } = useTranslations();
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const {
    assignmentForm,
    assignmentLookupId,
    assignmentOptions,
    canManageAssignments,
    currentAssignments,
    employeeOptions,
    feedbackByKey,
    getProductName,
    getUserName,
    handleCreateAssignment,
    handleDeleteAssignment,
    handleLoadAllAssignments,
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
    userAssignments,
  } = workspace;
  const deferredAssignmentSearch = useDeferredValue(assignmentSearch);
  const filteredCollections = useMemo(() => {
    const query = deferredAssignmentSearch.trim().toLowerCase();

    if (!query) {
      return {
        filteredCurrentAssignments: currentAssignments,
        filteredProductAssignments: productAssignments,
        filteredUserAssignments: userAssignments,
      };
    }

    const matchesAssignment = (assignment: (typeof currentAssignments)[number]) =>
      [
        getUserName(assignment.employeeId),
        getProductName(assignment.productId),
        formatDateTime(assignment.dateAssigned, locale, t("common.notSet")),
        formatDateTime(assignment.dateReturned, locale, t("common.open")),
      ]
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(query));

    return {
      filteredCurrentAssignments: currentAssignments.filter(matchesAssignment),
      filteredProductAssignments: productAssignments.filter(matchesAssignment),
      filteredUserAssignments: userAssignments.filter(matchesAssignment),
    };
  }, [
    currentAssignments,
    deferredAssignmentSearch,
    getProductName,
    getUserName,
    locale,
    productAssignments,
    t,
    userAssignments,
  ]);
  const filteredResultCount =
    filteredCollections.filteredCurrentAssignments.length +
    filteredCollections.filteredProductAssignments.length +
    filteredCollections.filteredUserAssignments.length;
  const hasAssignmentCollections = currentAssignments.length > 0 || productAssignments.length > 0 || userAssignments.length > 0;

  return (
    <SectionCard
      id="assignments"
      title={t("assignments.title")}
      description={
        canManageAssignments
          ? isLeader
            ? t("assignments.descriptionLeader")
            : t("assignments.descriptionAdmin")
          : t("assignments.descriptionEmployee")
      }
      actions={
        <Button variant="outline" onClick={handleLoadAllAssignments} disabled={Boolean(pendingByKey.assignments)}>
          {pendingByKey.assignments ? t("common.loading") : isEmployee ? t("assignments.refreshMyAssignments") : t("assignments.reloadAssignments")}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.assignments} />

          {canManageAssignments ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{t("assignments.createOrUpdate")}</p>
              <FieldHint>{t("assignments.formHint")}</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {assignmentOptions.length > 0 ? (
                  <SelectField
                    id="assignment-id"
                    label={t("assignments.assignmentForUpdate")}
                    value={assignmentForm.id}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({ ...previous, id: value }))
                    }
                    options={assignmentOptions}
                    placeholder={t("assignments.selectAssignment")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-id">{t("assignments.assignmentReferenceForUpdate")}</Label>
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
                    label={t("common.teammate")}
                    value={assignmentForm.employeeId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        employeeId: value,
                      }))
                    }
                    options={employeeOptions}
                    placeholder={t("users.selectTeammate")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-employee-id">{t("users.teammateReference")}</Label>
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
                    label={t("common.asset")}
                    value={assignmentForm.productId}
                    onChange={(value) =>
                      setAssignmentForm((previous) => ({
                        ...previous,
                        productId: value,
                      }))
                    }
                    options={productOptions}
                    placeholder={t("products.selectAsset")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="assignment-product-id">{t("products.assetReference")}</Label>
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
                  <Label htmlFor="assignment-date-assigned">{t("assignments.dateAssigned")}</Label>
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
                  <Label htmlFor="assignment-date-returned">{t("assignments.dateReturned")}</Label>
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
                  {t("assignments.createAssignment")}
                </Button>
                <Button variant="secondary" onClick={handleUpdateAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  {t("assignments.updateAssignment")}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title={t("assignments.readOnlyTitle")}
              description={t("assignments.readOnlyDescription")}
            />
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("assignments.readFilterDelete")}</p>
            <div className="mt-4">
              {assignmentOptions.length > 0 ? (
                <SelectField
                  id="assignment-lookup-id"
                  label={t("common.assignment")}
                  value={assignmentLookupId}
                  onChange={setAssignmentLookupId}
                  options={assignmentOptions}
                  placeholder={t("assignments.selectAssignment")}
                />
              ) : (
                <div>
                  <Label htmlFor="assignment-lookup-id">{t("assignments.assignmentReference")}</Label>
                  <Input
                    id="assignment-lookup-id"
                    type="number"
                    value={assignmentLookupId}
                    onChange={(event) => setAssignmentLookupId(event.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLookupAssignment} disabled={Boolean(pendingByKey.assignments)}>
                {t("products.loadDetails")}
              </Button>
              {canManageAssignments ? (
                <Button variant="danger" onClick={handleDeleteAssignment} disabled={Boolean(pendingByKey.assignments)}>
                  {t("assignments.deleteAssignment")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <Label htmlFor="assignment-search">{t("common.search")}</Label>
            <Input
              id="assignment-search"
              value={assignmentSearch}
              onChange={(event) => setAssignmentSearch(event.target.value)}
              placeholder={t("assignments.quickFilterPlaceholder")}
            />
            <p className="mt-2 text-xs text-slate-500">
              {t("assignments.resultsLabel", { count: filteredResultCount })}
            </p>
          </div>

          {selectedAssignment ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("assignments.assignmentLabel", { id: selectedAssignment.id ?? "" })}</p>
                  <p className="text-sm text-slate-500">
                    {getUserName(selectedAssignment.employeeId)} • {getProductName(selectedAssignment.productId)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedAssignment.dateReturned ? t("common.closed") : t("common.current")}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>{t("assignments.assigned")}</dt>
                  <dd className="font-semibold text-slate-900">{formatDateTime(selectedAssignment.dateAssigned, locale, t("common.notSet"))}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("assignments.returned")}</dt>
                  <dd className="font-semibold text-slate-900">{formatDateTime(selectedAssignment.dateReturned, locale, t("common.open"))}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" onClick={() => populateAssignmentForm(selectedAssignment)}>
                  {t("products.editInForm")}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title={t("assignments.noSelectedTitle")}
              description={t("assignments.noSelectedDescription")}
            />
          )}

          {assignmentSearch.trim() && hasAssignmentCollections && filteredResultCount === 0 ? (
            <EmptyState
              title={t("assignments.noMatchesTitle")}
              description={t("assignments.noMatchesDescription")}
            />
          ) : null}

          {filteredCollections.filteredUserAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{isEmployee ? t("assignments.myHistory") : t("assignments.byUser")}</p>
              <div className="mt-4 grid gap-3">
                {filteredCollections.filteredUserAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {t("assignments.assignmentLabel", { id: assignment.id ?? "" })} • {getProductName(assignment.productId)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {t("assignments.assigned")} {formatDateTime(assignment.dateAssigned, locale, t("common.notSet"))}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                        {t("assignments.useInForm")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {filteredCollections.filteredProductAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("assignments.byProduct")}</p>
              <div className="mt-4 grid gap-3">
                {filteredCollections.filteredProductAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {t("assignments.assignmentLabel", { id: assignment.id ?? "" })} • {getUserName(assignment.employeeId)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {t("assignments.returned")} {formatDateTime(assignment.dateReturned, locale, t("common.open"))}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                        {t("assignments.useInForm")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {currentAssignments.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("assignments.currentlyAssigned")}</p>
              {filteredCollections.filteredCurrentAssignments.length > 0 ? (
                <div className="mt-4 grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
                  {filteredCollections.filteredCurrentAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {t("assignments.assignmentLabel", { id: assignment.id ?? "" })} • {getProductName(assignment.productId)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {getUserName(assignment.employeeId)} •{" "}
                        {formatDateTime(assignment.dateAssigned, locale, t("common.notSet"))}
                      </p>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateAssignmentForm(assignment)}>
                          {t("assignments.useInForm")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title={t("assignments.noMatchesTitle")}
                    description={t("assignments.noMatchesDescription")}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={t("assignments.noActiveTitle")}
              description={t("assignments.noActiveDescription")}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
