import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

export function ProtocolsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const {
    feedbackByKey,
    getOrganizationName,
    getUserName,
    handleCreateProtocol,
    handleLookupProtocol,
    organizationOptions,
    pendingByKey,
    protocolCreateForm,
    protocolLookupId,
    protocolUserOptions,
    selectedProtocol,
    selectedProtocolOrganizationId,
    setProtocolCreateForm,
    setProtocolLookupId,
  } = workspace;

  return (
    <SectionCard
      id="protocols"
      title="Protocols"
      description="Create and open handover protocols for teammates and companies."
    >
      <div className="space-y-5">
        <FeedbackMessage feedback={feedbackByKey.protocols} />

        <form onSubmit={handleCreateProtocol} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Create protocol</p>
          <FieldHint>Pick the company and teammate by name whenever those records are available.</FieldHint>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {organizationOptions.length > 0 ? (
              <SelectField
                id="protocol-organization-id"
                label="Company"
                value={protocolCreateForm.organizationId}
                onChange={(value) =>
                  setProtocolCreateForm((previous) => ({
                    ...previous,
                    organizationId: value,
                  }))
                }
                options={organizationOptions}
                placeholder="Select a company"
              />
            ) : (
              <div>
                <Label htmlFor="protocol-organization-id">Company reference</Label>
                <Input
                  id="protocol-organization-id"
                  type="number"
                  value={protocolCreateForm.organizationId}
                  onChange={(event) =>
                    setProtocolCreateForm((previous) => ({
                      ...previous,
                      organizationId: event.target.value,
                    }))
                  }
                />
              </div>
            )}
            {protocolUserOptions.length > 0 ? (
              <SelectField
                id="protocol-user-id"
                label={selectedProtocolOrganizationId == null ? "Teammate" : "Teammate in this company"}
                value={protocolCreateForm.userId}
                onChange={(value) =>
                  setProtocolCreateForm((previous) => ({
                    ...previous,
                    userId: value,
                  }))
                }
                options={protocolUserOptions}
                placeholder="Select a teammate"
              />
            ) : (
              <div>
                <Label htmlFor="protocol-user-id">Teammate reference</Label>
                <Input
                  id="protocol-user-id"
                  type="number"
                  value={protocolCreateForm.userId}
                  onChange={(event) =>
                    setProtocolCreateForm((previous) => ({
                      ...previous,
                      userId: event.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={Boolean(pendingByKey.protocols)}>
              Create protocol
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Open a saved protocol</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="protocol-lookup-id">Protocol reference</Label>
              <Input
                id="protocol-lookup-id"
                type="number"
                value={protocolLookupId}
                onChange={(event) => setProtocolLookupId(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleLookupProtocol} disabled={Boolean(pendingByKey.protocols)}>
                Load protocol
              </Button>
            </div>
          </div>
        </div>

        {selectedProtocol ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Generated protocol</p>
            <dl className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Teammate</dt>
                <dd className="font-semibold text-slate-900">{getUserName(selectedProtocol.employeeId)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Company</dt>
                <dd className="font-semibold text-slate-900">
                  {getOrganizationName(selectedProtocol.organizationId)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Protocol file</p>
              <p className="mt-2">The direct file address is hidden here for safety.</p>
              <div className="mt-4">
                <a
                  href={selectedProtocol.protocolUri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Open protocol
                </a>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No protocol selected"
            description="Create a protocol or load a saved one to open it from this panel."
          />
        )}
      </div>
    </SectionCard>
  );
}
